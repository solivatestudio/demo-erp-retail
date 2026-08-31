-- Phase 0C: MVP fixes and missing demo RPCs

create or replace function public.sum_gross_profit(p_workspace uuid, p_from date, p_to date)
returns numeric
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(sum(si.subtotal - si.cogs_total), 0)
  from public.sale_items si
  join public.sales s on s.id = si.sale_id
  where s.workspace_id = p_workspace
    and s.status = 'POSTED'
    and s.sale_date::date between p_from and p_to;
$$;

create or replace function public.create_cash_transaction(
  p_workspace uuid,
  p_type text,
  p_category text,
  p_amount numeric,
  p_payment_method text default 'CASH',
  p_note text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_number text;
begin
  if p_type not in ('IN','OUT') then raise exception 'Tipe kas tidak valid'; end if;
  if p_amount <= 0 then raise exception 'Amount harus > 0'; end if;
  if not exists (select 1 from public.workspace_members where workspace_id = p_workspace and user_id = auth.uid()) then raise exception 'Akses ditolak'; end if;
  v_number := public.next_number(p_workspace, 'CASH');
  insert into public.cash_transactions(workspace_id, number, type, transaction_date, category, amount, payment_method, note, created_by)
  values (p_workspace, v_number, p_type::cash_type, current_date, p_category, p_amount, p_payment_method, p_note, auth.uid())
  returning id into v_id;
  return jsonb_build_object('cash_id', v_id, 'number', v_number);
end;
$$;

create or replace function public.post_stock_issue(
  p_workspace uuid,
  p_warehouse uuid,
  p_reason text,
  p_items jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid; v_number text; v_item jsonb; v_product uuid; v_qty numeric; v_old_qty numeric; v_cost numeric; v_balance numeric;
begin
  if not exists (select 1 from public.workspace_members where workspace_id = p_workspace and user_id = auth.uid()) then raise exception 'Akses ditolak'; end if;
  v_number := public.next_number(p_workspace, 'ISS');
  insert into public.stock_issues(workspace_id, number, warehouse_id, reason, notes, created_by)
  values (p_workspace, v_number, p_warehouse, coalesce(p_reason,'LAINNYA')::issue_reason, 'Demo issue stok', auth.uid()) returning id into v_id;
  for v_item in select * from jsonb_array_elements(p_items) loop
    v_product := (v_item->>'product_id')::uuid; v_qty := (v_item->>'qty')::numeric;
    select qty, avg_cost into v_old_qty, v_cost from public.stock_balances where workspace_id=p_workspace and product_id=v_product and warehouse_id=p_warehouse for update;
    if v_old_qty is null or v_old_qty < v_qty then raise exception 'Stok tidak cukup untuk pengeluaran barang'; end if;
    v_balance := v_old_qty - v_qty;
    update public.stock_balances set qty=v_balance, stock_value=v_balance*v_cost, updated_at=now() where workspace_id=p_workspace and product_id=v_product and warehouse_id=p_warehouse;
    insert into public.stock_issue_items(issue_id, product_id, qty, stock_qty, unit_cost, subtotal) values (v_id, v_product, v_qty, v_qty, v_cost, v_qty*v_cost);
    insert into public.inventory_movements(workspace_id, product_id, warehouse_id, movement_type, reference_type, reference_id, qty_delta_stock_unit, unit_cost, value_delta, balance_after, avg_cost_after, note)
    values (p_workspace, v_product, p_warehouse, 'STOCK_ISSUE', 'stock_issue', v_id, -v_qty, v_cost, -v_qty*v_cost, v_balance, v_cost, 'Issue ' || v_number);
  end loop;
  return jsonb_build_object('issue_id', v_id, 'number', v_number);
end;
$$;

create or replace function public.post_repack(
  p_workspace uuid,
  p_warehouse uuid,
  p_inputs jsonb,
  p_outputs jsonb,
  p_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid; v_number text; v_item jsonb; v_product uuid; v_qty numeric; v_old_qty numeric; v_cost numeric; v_balance numeric; v_total_value numeric := 0; v_alloc numeric; v_out_cost numeric;
begin
  if not exists (select 1 from public.workspace_members where workspace_id = p_workspace and user_id = auth.uid()) then raise exception 'Akses ditolak'; end if;
  select coalesce(sum((x->>'allocation_percent')::numeric), 0) into v_alloc from jsonb_array_elements(p_outputs) x;
  if round(v_alloc, 2) <> 100 then raise exception 'Total alokasi output repack harus 100%%'; end if;
  v_number := public.next_number(p_workspace, 'RPK');
  insert into public.repacks(workspace_id, number, notes, created_by) values (p_workspace, v_number, p_notes, auth.uid()) returning id into v_id;
  for v_item in select * from jsonb_array_elements(p_inputs) loop
    v_product := (v_item->>'product_id')::uuid; v_qty := (v_item->>'qty')::numeric;
    select qty, avg_cost into v_old_qty, v_cost from public.stock_balances where workspace_id=p_workspace and product_id=v_product and warehouse_id=p_warehouse for update;
    if v_old_qty is null or v_old_qty < v_qty then raise exception 'Stok input repack tidak cukup'; end if;
    v_balance := v_old_qty - v_qty; v_total_value := v_total_value + (v_qty * v_cost);
    update public.stock_balances set qty=v_balance, stock_value=v_balance*v_cost, updated_at=now() where workspace_id=p_workspace and product_id=v_product and warehouse_id=p_warehouse;
    insert into public.repack_inputs(repack_id, product_id, qty, stock_qty, value) values (v_id, v_product, v_qty, v_qty, v_qty*v_cost);
    insert into public.inventory_movements(workspace_id, product_id, warehouse_id, movement_type, reference_type, reference_id, qty_delta_stock_unit, unit_cost, value_delta, balance_after, avg_cost_after, note)
    values (p_workspace, v_product, p_warehouse, 'REPACK_OUT', 'repack', v_id, -v_qty, v_cost, -v_qty*v_cost, v_balance, v_cost, 'Repack out ' || v_number);
  end loop;
  for v_item in select * from jsonb_array_elements(p_outputs) loop
    v_product := (v_item->>'product_id')::uuid; v_qty := (v_item->>'qty')::numeric; v_alloc := (v_item->>'allocation_percent')::numeric;
    if v_qty <= 0 then raise exception 'Qty output repack harus > 0'; end if;
    v_out_cost := (v_total_value * v_alloc / 100) / v_qty;
    select qty into v_old_qty from public.stock_balances where workspace_id=p_workspace and product_id=v_product and warehouse_id=p_warehouse for update;
    v_balance := coalesce(v_old_qty,0) + v_qty;
    insert into public.stock_balances(workspace_id, product_id, warehouse_id, qty, avg_cost, stock_value)
    values (p_workspace, v_product, p_warehouse, v_balance, v_out_cost, v_balance*v_out_cost)
    on conflict (workspace_id, product_id, warehouse_id) do update set qty=excluded.qty, avg_cost=excluded.avg_cost, stock_value=excluded.stock_value, updated_at=now();
    update public.products set current_avg_cost=v_out_cost where id=v_product and workspace_id=p_workspace;
    insert into public.repack_outputs(repack_id, product_id, qty, stock_qty, value, allocation_percent) values (v_id, v_product, v_qty, v_qty, v_total_value*v_alloc/100, v_alloc);
    insert into public.inventory_movements(workspace_id, product_id, warehouse_id, movement_type, reference_type, reference_id, qty_delta_stock_unit, unit_cost, value_delta, balance_after, avg_cost_after, note)
    values (p_workspace, v_product, p_warehouse, 'REPACK_IN', 'repack', v_id, v_qty, v_out_cost, v_total_value*v_alloc/100, v_balance, v_out_cost, 'Repack in ' || v_number);
  end loop;
  return jsonb_build_object('repack_id', v_id, 'number', v_number);
end;
$$;

create or replace function public.post_purchase_return(p_workspace uuid, p_purchase uuid, p_items jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid; v_number text; v_supplier uuid; v_warehouse uuid; v_item jsonb; v_product uuid; v_unit uuid; v_qty numeric; v_conv numeric; v_stock_qty numeric; v_price numeric; v_total numeric := 0; v_old_qty numeric; v_cost numeric; v_balance numeric;
begin
  select supplier_id, warehouse_id into v_supplier, v_warehouse from public.purchases where id=p_purchase and workspace_id=p_workspace for update;
  if v_supplier is null then raise exception 'Purchase tidak ditemukan'; end if;
  v_number := public.next_number(p_workspace, 'RET-P');
  insert into public.purchase_returns(workspace_id, number, purchase_id, supplier_id, warehouse_id, notes) values (p_workspace, v_number, p_purchase, v_supplier, v_warehouse, 'Demo retur pembelian') returning id into v_id;
  for v_item in select * from jsonb_array_elements(p_items) loop
    v_product := (v_item->>'product_id')::uuid; v_unit := (v_item->>'unit_id')::uuid; v_qty := (v_item->>'qty')::numeric;
    select conversion_to_stock_unit into v_conv from public.product_units where product_id=v_product and unit_id=v_unit;
    select coalesce(avg(unit_price), 0) into v_price from public.purchase_items where purchase_id=p_purchase and product_id=v_product;
    v_stock_qty := v_qty * coalesce(v_conv,1); v_total := v_total + v_stock_qty * v_price;
    select qty, avg_cost into v_old_qty, v_cost from public.stock_balances where workspace_id=p_workspace and product_id=v_product and warehouse_id=v_warehouse for update;
    if v_old_qty is null or v_old_qty < v_stock_qty then raise exception 'Stok tidak cukup untuk retur pembelian'; end if;
    v_balance := v_old_qty - v_stock_qty;
    update public.stock_balances set qty=v_balance, stock_value=v_balance*v_cost, updated_at=now() where workspace_id=p_workspace and product_id=v_product and warehouse_id=v_warehouse;
    insert into public.purchase_return_items(return_id, product_id, unit_id, qty, conversion_factor, stock_qty, unit_price, subtotal) values (v_id, v_product, v_unit, v_qty, coalesce(v_conv,1), v_stock_qty, v_price, v_stock_qty*v_price);
    insert into public.inventory_movements(workspace_id, product_id, warehouse_id, movement_type, reference_type, reference_id, qty_delta_stock_unit, unit_cost, value_delta, balance_after, avg_cost_after, note) values (p_workspace, v_product, v_warehouse, 'PURCHASE_RETURN', 'purchase_return', v_id, -v_stock_qty, v_cost, -v_stock_qty*v_cost, v_balance, v_cost, 'Retur pembelian ' || v_number);
  end loop;
  update public.purchase_returns set total=v_total where id=v_id;
  update public.purchases set outstanding_amount=greatest(outstanding_amount-v_total,0), updated_at=now() where id=p_purchase;
  return jsonb_build_object('return_id', v_id, 'number', v_number, 'total', v_total);
end;
$$;

create or replace function public.post_sales_return(p_workspace uuid, p_sale uuid, p_items jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid; v_number text; v_customer uuid; v_warehouse uuid; v_item jsonb; v_sale_item uuid; v_product uuid; v_unit uuid; v_qty numeric; v_conv numeric; v_stock_qty numeric; v_price numeric; v_total numeric := 0; v_old_qty numeric; v_cost numeric; v_balance numeric;
begin
  select customer_id, warehouse_id into v_customer, v_warehouse from public.sales where id=p_sale and workspace_id=p_workspace for update;
  if v_warehouse is null then raise exception 'Sale tidak ditemukan'; end if;
  v_number := public.next_number(p_workspace, 'RET-S');
  insert into public.sales_returns(workspace_id, number, sale_id, customer_id, warehouse_id, notes) values (p_workspace, v_number, p_sale, v_customer, v_warehouse, 'Demo retur penjualan') returning id into v_id;
  for v_item in select * from jsonb_array_elements(p_items) loop
    v_sale_item := (v_item->>'sale_item_id')::uuid; v_qty := (v_item->>'qty')::numeric;
    select product_id, unit_id, conversion_factor, unit_price, cost_snapshot into v_product, v_unit, v_conv, v_price, v_cost from public.sale_items where id=v_sale_item and sale_id=p_sale;
    if v_product is null then raise exception 'Item sale tidak ditemukan'; end if;
    v_stock_qty := v_qty * v_conv; v_total := v_total + v_qty * v_price;
    select qty into v_old_qty from public.stock_balances where workspace_id=p_workspace and product_id=v_product and warehouse_id=v_warehouse for update;
    v_balance := coalesce(v_old_qty,0) + v_stock_qty;
    insert into public.stock_balances(workspace_id, product_id, warehouse_id, qty, avg_cost, stock_value)
    values (p_workspace, v_product, v_warehouse, v_balance, v_cost, v_balance*v_cost)
    on conflict (workspace_id, product_id, warehouse_id) do update set qty=excluded.qty, stock_value=excluded.stock_value, updated_at=now();
    insert into public.sales_return_items(return_id, product_id, unit_id, qty, conversion_factor, stock_qty, unit_price, subtotal) values (v_id, v_product, v_unit, v_qty, v_conv, v_stock_qty, v_price, v_qty*v_price);
    insert into public.inventory_movements(workspace_id, product_id, warehouse_id, movement_type, reference_type, reference_id, qty_delta_stock_unit, unit_cost, value_delta, balance_after, avg_cost_after, note) values (p_workspace, v_product, v_warehouse, 'SALE_RETURN', 'sales_return', v_id, v_stock_qty, v_cost, v_stock_qty*v_cost, v_balance, v_cost, 'Retur penjualan ' || v_number);
  end loop;
  update public.sales_returns set total=v_total where id=v_id;
  update public.sales set outstanding_amount=greatest(outstanding_amount-v_total,0), status='RETURNED_PARTIAL' where id=p_sale;
  return jsonb_build_object('return_id', v_id, 'number', v_number, 'total', v_total);
end;
$$;

create or replace function public.reset_demo_workspace(p_workspace uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.workspace_members where workspace_id = p_workspace and user_id = auth.uid()) then raise exception 'Akses ditolak'; end if;
  delete from public.delivery_items where delivery_id in (select id from public.deliveries where workspace_id=p_workspace);
  delete from public.deliveries where workspace_id=p_workspace;
  delete from public.sale_items where sale_id in (select id from public.sales where workspace_id=p_workspace);
  delete from public.customer_payments where workspace_id=p_workspace;
  delete from public.sales_return_items where return_id in (select id from public.sales_returns where workspace_id=p_workspace);
  delete from public.sales_returns where workspace_id=p_workspace;
  delete from public.sales where workspace_id=p_workspace;
  delete from public.purchase_items where purchase_id in (select id from public.purchases where workspace_id=p_workspace);
  delete from public.supplier_payments where workspace_id=p_workspace;
  delete from public.purchase_return_items where return_id in (select id from public.purchase_returns where workspace_id=p_workspace);
  delete from public.purchase_returns where workspace_id=p_workspace;
  delete from public.purchases where workspace_id=p_workspace;
  delete from public.stock_transfer_items where transfer_id in (select id from public.stock_transfers where workspace_id=p_workspace);
  delete from public.stock_transfers where workspace_id=p_workspace;
  delete from public.stock_issue_items where issue_id in (select id from public.stock_issues where workspace_id=p_workspace);
  delete from public.stock_issues where workspace_id=p_workspace;
  delete from public.repack_outputs where repack_id in (select id from public.repacks where workspace_id=p_workspace);
  delete from public.repack_inputs where repack_id in (select id from public.repacks where workspace_id=p_workspace);
  delete from public.repacks where workspace_id=p_workspace;
  delete from public.stock_adjustment_items where adjustment_id in (select id from public.stock_adjustments where workspace_id=p_workspace);
  delete from public.stock_adjustments where workspace_id=p_workspace;
  delete from public.inventory_movements where workspace_id=p_workspace;
  delete from public.stock_balances where workspace_id=p_workspace;
  delete from public.cash_transactions where workspace_id=p_workspace;
  delete from public.product_prices where workspace_id=p_workspace;
  delete from public.product_units where workspace_id=p_workspace;
  delete from public.products where workspace_id=p_workspace;
  delete from public.categories where workspace_id=p_workspace;
  delete from public.brands where workspace_id=p_workspace;
  delete from public.units where workspace_id=p_workspace;
  delete from public.warehouses where workspace_id=p_workspace;
  delete from public.customers where workspace_id=p_workspace;
  delete from public.suppliers where workspace_id=p_workspace;
  delete from public.sales_people where workspace_id=p_workspace;
  delete from public.customer_groups where workspace_id=p_workspace;
  delete from public.workspace_counters where workspace_id=p_workspace;
  perform public.seed_demo_workspace(p_workspace);
end;
$$;

do $$
declare
  t text;
  tables text[] := array['customers','suppliers','sales_people','categories','brands','units','warehouses'];
begin
  foreach t in array tables loop
    execute format('drop policy if exists "workspace_insert" on public.%I', t);
    execute format('create policy "workspace_insert" on public.%I for insert with check (workspace_id in (select public.user_workspace_ids()))', t);
    execute format('drop policy if exists "workspace_update" on public.%I', t);
    execute format('create policy "workspace_update" on public.%I for update using (workspace_id in (select public.user_workspace_ids())) with check (workspace_id in (select public.user_workspace_ids()))', t);
  end loop;
end $$;

create or replace function public.user_workspace_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select workspace_id from public.workspace_members where user_id = auth.uid();
$$;
