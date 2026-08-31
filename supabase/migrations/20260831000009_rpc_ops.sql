-- Phase 0B.5: Delivery, Stock operations, Sales return, Reset

-- ============================================
-- post_delivery: ship delivery order, deduct stock, update fulfillment
-- ============================================
create or replace function public.post_delivery(
  p_workspace uuid,
  p_sale uuid,
  p_items jsonb -- [{ sale_item_id, qty }]
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_delivery_id uuid;
  v_number text;
  v_sale_type sale_type;
  v_warehouse uuid;
  v_item jsonb;
  v_sale_item_id uuid;
  v_qty numeric;
  v_conv numeric;
  v_stock_qty numeric;
  v_product uuid;
  v_old_qty numeric;
  v_avg_cost numeric;
  v_balance numeric;
  v_total_order numeric := 0;
  v_total_shipped numeric := 0;
  v_status fulfillment_status;
begin
  -- Validate sale
  select sale_type, warehouse_id into v_sale_type, v_warehouse
    from public.sales
    where id = p_sale and workspace_id = p_workspace;
  if v_sale_type is null then raise exception 'Sale not found'; end if;
  if v_sale_type <> 'DELIVERY'::sale_type then
    raise exception 'Hanya sale bertipe DELIVERY yang bisa di-deliver';
  end if;

  v_number := public.next_number(p_workspace, 'DLV');

  insert into public.deliveries(
    workspace_id, number, sale_id, delivery_date, status
  ) values (
    p_workspace, v_number, p_sale, now(), 'POSTED'
  ) returning id into v_delivery_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_sale_item_id := (v_item->>'sale_item_id')::uuid;
    v_qty := (v_item->>'qty')::numeric;

    select product_id, conversion_factor, stock_qty - delivered_qty, cost_snapshot
      into v_product, v_conv, v_stock_qty, v_avg_cost
      from public.sale_items
      where id = v_sale_item_id and sale_id = p_sale;
    if v_product is null then raise exception 'Sale item tidak valid'; end if;

    if v_qty > v_stock_qty then
      raise exception 'Qty delivery > > qty tersisa';
    end if;
    v_stock_qty := v_qty * v_conv;

    -- Deduct stock
    select qty into v_old_qty
      from public.stock_balances
      where workspace_id = p_workspace and product_id = v_product and warehouse_id = v_warehouse
      for update;
    if v_old_qty is null or v_old_qty < v_stock_qty then
      raise exception 'Stok tidak cukup untuk delivery';
    end if;
    v_balance := v_old_qty - v_stock_qty;

    insert into public.stock_balances(workspace_id, product_id, warehouse_id, qty, avg_cost, stock_value)
      values (p_workspace, v_product, v_warehouse, v_balance, v_avg_cost, v_balance * v_avg_cost)
      on conflict (workspace_id, product_id, warehouse_id)
      do update set qty = excluded.qty, stock_value = excluded.stock_value, updated_at = now();

    insert into public.inventory_movements(
      workspace_id, product_id, warehouse_id, movement_type,
      reference_type, reference_id,
      qty_delta_stock_unit, unit_cost, value_delta,
      balance_after, avg_cost_after, note
    ) values (
      p_workspace, v_product, v_warehouse, 'DELIVERY',
      'delivery', v_delivery_id,
      -v_stock_qty, v_avg_cost, -v_stock_qty * v_avg_cost,
      v_balance, v_avg_cost, 'Delivery ' || v_number
    );

    insert into public.delivery_items(delivery_id, sale_item_id, qty, stock_qty)
      values (v_delivery_id, v_sale_item_id, v_qty, v_stock_qty);

    update public.sale_items
      set delivered_qty = delivered_qty + v_qty
      where id = v_sale_item_id;
  end loop;

  -- Recalc fulfillment status
  select
    sum(stock_qty),
    sum(delivered_qty * conversion_factor)
    into v_total_order, v_total_shipped
    from public.sale_items
    where sale_id = p_sale;

  v_status := case
    when v_total_shipped <= 0 then 'NONE'::fulfillment_status
    when v_total_shipped >= v_total_order then 'FULL'::fulfillment_status
    else 'PARTIAL'::fulfillment_status
  end;

  update public.sales set fulfillment_status = v_status where id = p_sale;

  return jsonb_build_object(
    'delivery_id', v_delivery_id,
    'number', v_number,
    'fulfillment_status', v_status
  );
end;
$$;

-- ============================================
-- post_stock_transfer: TRANSFER_OUT source + TRANSFER_IN target
-- ============================================
create or replace function public.post_stock_transfer(
  p_workspace uuid,
  p_from_warehouse uuid,
  p_to_warehouse uuid,
  p_items jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_transfer_id uuid;
  v_number text;
  v_item jsonb;
  v_product uuid;
  v_qty numeric;
  v_stock_qty numeric := 0; -- stock_qty sama dengan qty karena input dalam stock unit
  v_old_qty numeric;
  v_avg_cost numeric;
  v_balance numeric;
begin
  if p_from_warehouse = p_to_warehouse then
    raise exception 'Source & target gudang harus beda';
  end if;

  v_number := public.next_number(p_workspace, 'TRF');

  insert into public.stock_transfers(
    workspace_id, number, from_warehouse_id, to_warehouse_id, created_by
  ) values (
    p_workspace, v_number, p_from_warehouse, p_to_warehouse, auth.uid()
  ) returning id into v_transfer_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_product := (v_item->>'product_id')::uuid;
    v_qty := (v_item->>'qty')::numeric;
    v_stock_qty := v_qty;

    select qty, avg_cost into v_old_qty, v_avg_cost
      from public.stock_balances
      where workspace_id = p_workspace and product_id = v_product and warehouse_id = p_from_warehouse
      for update;
    if v_old_qty is null or v_old_qty < v_stock_qty then
      raise exception 'Stok tidak cukup di source warehouse';
    end if;

    -- OUT
    v_balance := v_old_qty - v_stock_qty;
    insert into public.stock_balances(workspace_id, product_id, warehouse_id, qty, avg_cost, stock_value)
      values (p_workspace, v_product, p_from_warehouse, v_balance, v_avg_cost, v_balance * v_avg_cost)
      on conflict (workspace_id, product_id, warehouse_id)
      do update set qty = excluded.qty, stock_value = excluded.stock_value, updated_at = now();

    insert into public.inventory_movements(
      workspace_id, product_id, warehouse_id, movement_type,
      reference_type, reference_id,
      qty_delta_stock_unit, unit_cost, value_delta,
      balance_after, avg_cost_after, note
    ) values (
      p_workspace, v_product, p_from_warehouse, 'TRANSFER_OUT',
      'transfer', v_transfer_id,
      -v_stock_qty, v_avg_cost, -v_stock_qty * v_avg_cost,
      v_balance, v_avg_cost, 'Transfer ' || v_number
    );

    -- IN (same cost)
    select qty, avg_cost into v_old_qty, v_avg_cost
      from public.stock_balances
      where workspace_id = p_workspace and product_id = v_product and warehouse_id = p_to_warehouse
      for update;
    if v_old_qty is null then v_old_qty := 0; end if;
    v_balance := v_old_qty + v_stock_qty;

    insert into public.stock_balances(workspace_id, product_id, warehouse_id, qty, avg_cost, stock_value)
      values (p_workspace, v_product, p_to_warehouse, v_balance, v_avg_cost, v_balance * v_avg_cost)
      on conflict (workspace_id, product_id, warehouse_id)
      do update set qty = excluded.qty, stock_value = excluded.stock_value, updated_at = now();

    insert into public.inventory_movements(
      workspace_id, product_id, warehouse_id, movement_type,
      reference_type, reference_id,
      qty_delta_stock_unit, unit_cost, value_delta,
      balance_after, avg_cost_after, note
    ) values (
      p_workspace, v_product, p_to_warehouse, 'TRANSFER_IN',
      'transfer', v_transfer_id,
      v_stock_qty, v_avg_cost, v_stock_qty * v_avg_cost,
      v_balance, v_avg_cost, 'Transfer ' || v_number
    );

    insert into public.stock_transfer_items(transfer_id, product_id, qty, stock_qty)
      values (v_transfer_id, v_product, v_qty, v_stock_qty);
  end loop;

  return jsonb_build_object('transfer_id', v_transfer_id, 'number', v_number);
end;
$$;

-- ============================================
-- post_stock_adjustment
-- ============================================
create or replace function public.post_stock_adjustment(
  p_workspace uuid,
  p_warehouse uuid,
  p_reason text,
  p_items jsonb -- [{product_id, system_qty, physical_qty}]
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_adj_id uuid;
  v_number text;
  v_item jsonb;
  v_product uuid;
  v_system numeric;
  v_physical numeric;
  v_delta numeric;
  v_old_qty numeric;
  v_old_cost numeric;
  v_new_cost numeric;
  v_balance numeric;
begin
  v_number := public.next_number(p_workspace, 'ADJ');

  insert into public.stock_adjustments(
    workspace_id, number, warehouse_id, reason, created_by
  ) values (
    p_workspace, v_number, p_warehouse, p_reason, auth.uid()
  ) returning id into v_adj_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_product := (v_item->>'product_id')::uuid;
    v_system := (v_item->>'system_qty')::numeric;
    v_physical := (v_item->>'physical_qty')::numeric;
    v_delta := v_physical - v_system;

    select qty, avg_cost into v_old_qty, v_old_cost
      from public.stock_balances
      where workspace_id = p_workspace and product_id = v_product and warehouse_id = p_warehouse
      for update;
    if v_old_qty is null then v_old_qty := 0; v_old_cost := 0; end if;
    v_new_cost := v_old_cost;
    v_balance := v_physical;

    insert into public.stock_balances(workspace_id, product_id, warehouse_id, qty, avg_cost, stock_value)
      values (p_workspace, v_product, p_warehouse, v_balance, v_new_cost, v_balance * v_new_cost)
      on conflict (workspace_id, product_id, warehouse_id)
      do update set qty = excluded.qty, stock_value = excluded.stock_value, updated_at = now();

    insert into public.stock_adjustment_items(
      adjustment_id, product_id, system_qty, physical_qty, qty_delta, stock_qty,
      current_avg_cost, new_avg_cost, reason
    ) values (
      v_adj_id, v_product, v_system, v_physical, v_delta, v_delta,
      v_old_cost, v_new_cost, p_reason
    );

    insert into public.inventory_movements(
      workspace_id, product_id, warehouse_id, movement_type,
      reference_type, reference_id,
      qty_delta_stock_unit, unit_cost, value_delta,
      balance_after, avg_cost_after, note
    ) values (
      p_workspace, v_product, p_warehouse, 'ADJUSTMENT',
      'adjustment', v_adj_id,
      v_delta, v_new_cost, v_delta * v_new_cost,
      v_balance, v_new_cost, 'Adjustment ' || v_number
    );
  end loop;

  return jsonb_build_object('adjustment_id', v_adj_id, 'number', v_number);
end;
$$;

-- ============================================
-- reset_demo_workspace: drop business data, re-seed
-- ============================================
create or replace function public.reset_demo_workspace(p_workspace uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Verify membership
  if not exists (
    select 1 from public.workspace_members
    where workspace_id = p_workspace and user_id = auth.uid()
  ) then
    raise exception 'Akses ditolak';
  end if;

  -- Delete child tables first
  delete from public.delivery_items;
  delete from public.deliveries;
  delete from public.sale_items;
  delete from public.sales;
  delete from public.customer_payments;
  delete from public.sales_return_items;
  delete from public.sales_returns;
  delete from public.purchase_items;
  delete from public.purchases;
  delete from public.supplier_payments;
  delete from public.purchase_return_items;
  delete from public.purchase_returns;
  delete from public.stock_transfer_items;
  delete from public.stock_transfers;
  delete from public.stock_issue_items;
  delete from public.stock_issues;
  delete from public.repack_outputs;
  delete from public.repack_inputs;
  delete from public.repacks;
  delete from public.stock_adjustment_items;
  delete from public.stock_adjustments;
  delete from public.inventory_movements;
  delete from public.stock_balances;
  delete from public.cash_transactions;
  delete from public.product_prices;
  delete from public.product_units;
  delete from public.products;
  delete from public.categories;
  delete from public.brands;
  delete from public.units;
  delete from public.warehouses;
  delete from public.customers;
  delete from public.suppliers;
  delete from public.sales_people;
  delete from public.customer_groups;
  delete from public.workspace_counters;

  -- Re-seed
  perform public.seed_demo_workspace(p_workspace);
end;
$$;