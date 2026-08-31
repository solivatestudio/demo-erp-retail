-- Phase 0B.3: Atomic RPC for purchase + purchase return + supplier payment

-- ============================================
-- post_purchase: posting purchase receipt, update stock, AP, ledger
-- ============================================
create or replace function public.post_purchase(
  p_workspace uuid,
  p_supplier uuid,
  p_invoice_number text,
  p_purchase_date date,
  p_due_date date,
  p_warehouse uuid,
  p_items jsonb, -- [{product_id, unit_id, qty, conversion_factor, unit_price}]
  p_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_purchase_id uuid;
  v_number text;
  v_subtotal numeric := 0;
  v_total numeric := 0;
  v_item jsonb;
  v_product uuid;
  v_unit uuid;
  v_qty numeric;
  v_conv numeric;
  v_stock_qty numeric;
  v_price numeric;
  v_subitem numeric;
  v_old_qty numeric;
  v_old_cost numeric;
  v_new_cost numeric;
  v_balance numeric;
begin
  -- Generate number
  v_number := public.next_number(p_workspace, 'PUR');

  -- Calculate subtotal from items
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_product := (v_item->>'product_id')::uuid;
    v_unit := (v_item->>'unit_id')::uuid;
    v_qty := (v_item->>'qty')::numeric;
    v_conv := (v_item->>'conversion_factor')::numeric;
    v_price := (v_item->>'unit_price')::numeric;
    v_subitem := v_qty * v_conv * v_price;
    v_subtotal := v_subtotal + v_subitem;
  end loop;
  v_total := v_subtotal;

  -- Insert purchase header
  insert into public.purchases(
    workspace_id, number, supplier_id, invoice_number,
    purchase_date, due_date, warehouse_id,
    subtotal, total, outstanding_amount, status, notes
  ) values (
    p_workspace, v_number, p_supplier, p_invoice_number,
    p_purchase_date, p_due_date, p_warehouse,
    v_subtotal, v_total, v_total, 'POSTED', p_notes
  ) returning id into v_purchase_id;

  -- Insert items + update stock + ledger
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_product := (v_item->>'product_id')::uuid;
    v_unit := (v_item->>'unit_id')::uuid;
    v_qty := (v_item->>'qty')::numeric;
    v_conv := (v_item->>'conversion_factor')::numeric;
    v_price := (v_item->>'unit_price')::numeric;
    v_stock_qty := v_qty * v_conv;
    v_subitem := v_stock_qty * v_price;

    insert into public.purchase_items(
      purchase_id, product_id, unit_id, qty, conversion_factor, stock_qty, unit_price, subtotal
    ) values (
      v_purchase_id, v_product, v_unit, v_qty, v_conv, v_stock_qty, v_price, v_subitem
    );

    -- Get current stock & cost for this product/warehouse
    select qty, avg_cost into v_old_qty, v_old_cost
      from public.stock_balances
      where workspace_id = p_workspace and product_id = v_product and warehouse_id = p_warehouse
      for update;

    if v_old_qty is null then v_old_qty := 0; v_old_cost := v_price; end if;

    -- Moving average
    if v_old_qty + v_stock_qty > 0 then
      v_new_cost := ((v_old_qty * v_old_cost) + (v_stock_qty * v_price)) / (v_old_qty + v_stock_qty);
    else
      v_new_cost := v_price;
    end if;
    v_balance := coalesce(v_old_qty, 0) + v_stock_qty;

    -- Upsert balance
    insert into public.stock_balances(workspace_id, product_id, warehouse_id, qty, avg_cost, stock_value)
      values (p_workspace, v_product, p_warehouse, v_balance, v_new_cost, v_balance * v_new_cost)
      on conflict (workspace_id, product_id, warehouse_id)
      do update set qty = excluded.qty, avg_cost = excluded.avg_cost,
                    stock_value = excluded.stock_value, updated_at = now();

    -- Update product's current_avg_cost (workspace-wide)
    update public.products set current_avg_cost = v_new_cost where id = v_product;

    -- Ledger
    insert into public.inventory_movements(
      workspace_id, product_id, warehouse_id, movement_type,
      reference_type, reference_id,
      qty_delta_stock_unit, unit_cost, value_delta,
      balance_after, avg_cost_after, note
    ) values (
      p_workspace, v_product, p_warehouse, 'PURCHASE',
      'purchase', v_purchase_id,
      v_stock_qty, v_price, v_stock_qty * v_price,
      v_balance, v_new_cost, 'Purchase ' || v_number
    );
  end loop;

  return jsonb_build_object(
    'purchase_id', v_purchase_id,
    'number', v_number,
    'total', v_total,
    'outstanding', v_total
  );
end;
$$;

-- ============================================
-- record_supplier_payment
-- ============================================
create or replace function public.record_supplier_payment(
  p_workspace uuid,
  p_supplier uuid,
  p_purchase uuid,
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
  v_payment_id uuid;
  v_number text;
  v_outstanding numeric;
  v_paid numeric;
  v_new_paid numeric;
  v_new_status payment_status;
  v_total numeric;
begin
  -- Validate purchase belongs to workspace & supplier
  select total, paid_amount, outstanding_amount
    into v_total, v_paid, v_outstanding
    from public.purchases
    where id = p_purchase and workspace_id = p_workspace and supplier_id = p_supplier
    for update;

  if v_total is null then
    raise exception 'Purchase not found';
  end if;

  if p_amount <= 0 then
    raise exception 'Jumlah bayar harus > 0';
  end if;

  if p_amount > v_outstanding then
    raise exception 'Pembayaran melebihi sisa hutang %', v_outstanding;
  end if;

  v_new_paid := v_paid + p_amount;
  if v_new_paid >= v_total then
    v_new_status := 'PAID';
  else
    v_new_status := 'PARTIAL';
  end if;

  v_number := public.next_number(p_workspace, 'PAY-S');

  insert into public.supplier_payments(
    workspace_id, number, supplier_id, purchase_id, payment_date,
    amount, payment_method, note, created_by
  ) values (
    p_workspace, v_number, p_supplier, p_purchase, current_date,
    p_amount, p_payment_method, p_note, auth.uid()
  ) returning id into v_payment_id;

  update public.purchases
    set paid_amount = v_new_paid,
        outstanding_amount = v_total - v_new_paid,
        status = v_new_status::text::purchase_status,
        updated_at = now()
    where id = p_purchase;

  -- Cash OUT (only if cash method)
  if p_payment_method in ('CASH', 'TUNAI') then
    insert into public.cash_transactions(
      workspace_id, number, type, transaction_date, category,
      amount, payment_method, reference_type, reference_id, note, created_by
    ) values (
      p_workspace, public.next_number(p_workspace, 'CASH'),
      'OUT', current_date, 'Pembayaran Hutang Supplier',
      p_amount, p_payment_method, 'supplier_payment', v_payment_id, p_note, auth.uid()
    );
  end if;

  return jsonb_build_object(
    'payment_id', v_payment_id,
    'number', v_number,
    'new_outstanding', v_total - v_new_paid,
    'status', v_new_status
  );
end;
$$;