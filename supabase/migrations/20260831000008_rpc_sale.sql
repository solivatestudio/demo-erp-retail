-- Phase 0B.4: post_sale + record_customer_payment

-- ============================================
-- Resolve price: given product + customer_group + unit + qty → unit_price (per selected UOM)
-- ============================================
create or replace function public.resolve_sale_price(
  p_workspace uuid,
  p_product uuid,
  p_customer_group uuid,
  p_unit uuid,
  p_qty numeric
)
returns numeric
language plpgsql
stable
as $$
declare
  v_price numeric;
  v_conv numeric := 1;
begin
  -- Get conversion to stock unit
  select coalesce(pu.conversion_to_stock_unit, 1) into v_conv
    from public.product_units pu
    where pu.product_id = p_product and pu.unit_id = p_unit
    limit 1;

  -- Priority 1: customer group + unit + min_qty
  select pp.price into v_price
    from public.product_prices pp
    where pp.workspace_id = p_workspace
      and pp.product_id = p_product
      and (pp.customer_group_id = p_customer_group or pp.customer_group_id is null)
      and pp.unit_id = p_unit
      and p_qty >= pp.min_qty
    order by pp.customer_group_id nulls last, pp.min_qty desc
    limit 1;

  if v_price is null then
    raise exception 'Harga tidak ditemukan untuk produk/unit tsb';
  end if;

  return v_price * v_conv;
end;
$$;

-- ============================================
-- post_sale: posting a sale (POS / DIRECT / DELIVERY)
-- ============================================
create or replace function public.post_sale(
  p_workspace uuid,
  p_sale_type text, -- 'POS' | 'DIRECT' | 'DELIVERY'
  p_customer uuid,
  p_salesman uuid,
  p_warehouse uuid,
  p_items jsonb, -- [{product_id, unit_id, qty}]
  p_paid numeric default 0,
  p_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sale_id uuid;
  v_number text;
  v_item jsonb;
  v_product uuid;
  v_unit uuid;
  v_qty numeric;
  v_conv numeric;
  v_stock_qty numeric;
  v_unit_price numeric;
  v_subtotal numeric := 0;
  v_total numeric;
  v_customer_group uuid;
  v_old_qty numeric;
  v_old_cost numeric;
  v_balance numeric;
  v_avg_cost numeric;
  v_payment payment_status;
  v_fulfillment fulfillment_status;
  v_sale_type_enum sale_type;
begin
  -- Validate inputs
  if p_sale_type not in ('POS','DIRECT','DELIVERY') then
    raise exception 'Tipe penjualan tidak valid';
  end if;
  v_sale_type_enum := p_sale_type::sale_type;

  -- Lookup customer group
  select customer_group_id into v_customer_group
    from public.customers
    where id = p_customer and workspace_id = p_workspace;
  if v_customer_group is null and p_customer is not null then
    raise exception 'Customer tidak ditemukan';
  end if;

  v_number := public.next_number(p_workspace, v_sale_type);

  insert into public.sales(
    workspace_id, number, sale_type, customer_id, customer_group_id,
    salesman_id, warehouse_id, sale_date,
    total, paid_amount, outstanding_amount,
    payment_status, fulfillment_status, status, notes, created_by
  ) values (
    p_workspace, v_number, v_sale_type_enum, p_customer, v_customer_group,
    p_salesman, p_warehouse, now(),
    0, p_paid, 0,
    'UNPAID', 'NONE', 'POSTED', p_notes, auth.uid()
  ) returning id into v_sale_id;

  -- Process items
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_product := (v_item->>'product_id')::uuid;
    v_unit := (v_item->>'unit_id')::uuid;
    v_qty := (v_item->>'qty')::numeric;

    -- Get conversion
    select conversion_to_stock_unit into v_conv
      from public.product_units
      where product_id = v_product and unit_id = v_unit;
    if v_conv is null then raise exception 'Konversi UOM tidak ditemukan'; end if;
    v_stock_qty := v_qty * v_conv;

    -- Resolve price (per UOM qty, multiply by stock_qty for total)
    v_unit_price := public.resolve_sale_price(p_workspace, v_product, v_customer_group, v_unit, v_qty);
    v_subtotal := v_subtotal + v_unit_price;

    -- Deduct stock only for POS / DIRECT (DELIVERY deducts when delivery is posted)
    if v_sale_type_enum in ('POS'::sale_type, 'DIRECT'::sale_type) then
      select qty, avg_cost into v_old_qty, v_old_cost
        from public.stock_balances
        where workspace_id = p_workspace and product_id = v_product and warehouse_id = p_warehouse
        for update;
      if v_old_qty is null or v_old_qty < v_stock_qty then
        raise exception 'Stok tidak cukup untuk produk %', v_product;
      end if;
      v_balance := v_old_qty - v_stock_qty;
      v_avg_cost := v_old_cost; -- avg cost unchanged on sale

      insert into public.stock_balances(workspace_id, product_id, warehouse_id, qty, avg_cost, stock_value)
        values (p_workspace, v_product, p_warehouse, v_balance, v_avg_cost, v_balance * v_avg_cost)
        on conflict (workspace_id, product_id, warehouse_id)
        do update set qty = excluded.qty, stock_value = excluded.stock_value, updated_at = now();

      insert into public.inventory_movements(
        workspace_id, product_id, warehouse_id, movement_type,
        reference_type, reference_id,
        qty_delta_stock_unit, unit_cost, value_delta,
        balance_after, avg_cost_after, note
      ) values (
        p_workspace, v_product, p_warehouse, 'SALE',
        'sale', v_sale_id,
        -v_stock_qty, v_avg_cost, -v_stock_qty * v_avg_cost,
        v_balance, v_avg_cost, 'Sale ' || v_number
      );
    end if;

    insert into public.sale_items(
      sale_id, product_id, unit_id, qty, conversion_factor, stock_qty,
      unit_price, subtotal, cost_snapshot, cogs_total
    ) values (
      v_sale_id, v_product, v_unit, v_qty, v_conv, v_stock_qty,
      v_unit_price, v_unit_price, v_avg_cost, v_stock_qty * v_avg_cost
    );
  end loop;

  -- Update sale total + payment status
  v_total := v_subtotal;
  update public.sales
    set subtotal = v_total,
        total = v_total,
        outstanding_amount = v_total - p_paid,
        payment_status = case
          when p_paid <= 0 then 'UNPAID'::payment_status
          when p_paid >= v_total then 'PAID'::payment_status
          else 'PARTIAL'::payment_status
        end,
        fulfillment_status = case
          when v_sale_type_enum = 'DELIVERY'::sale_type then 'NONE'::fulfillment_status
          else 'FULL'::fulfillment_status
        end
    where id = v_sale_id;

  -- Auto cash IN if POS + cash paid
  if v_sale_type_enum = 'POS'::sale_type and p_paid > 0 then
    insert into public.cash_transactions(
      workspace_id, number, type, transaction_date, category,
      amount, payment_method, reference_type, reference_id, note, created_by
    ) values (
      p_workspace, public.next_number(p_workspace, 'CASH'),
      'IN', current_date, 'Penjualan POS',
      p_paid, 'CASH', 'sale', v_sale_id, 'Auto: POS ' || v_number, auth.uid()
    );
  end if;

  return jsonb_build_object(
    'sale_id', v_sale_id,
    'number', v_number,
    'total', v_total,
    'paid', p_paid,
    'outstanding', v_total - p_paid
  );
end;
$$;

-- ============================================
-- record_customer_payment
-- ============================================
create or replace function public.record_customer_payment(
  p_workspace uuid,
  p_customer uuid,
  p_sale uuid,
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
  v_total numeric;
  v_new_paid numeric;
  v_status payment_status;
begin
  select total, paid_amount, outstanding_amount
    into v_total, v_paid, v_outstanding
    from public.sales
    where id = p_sale and workspace_id = p_workspace and customer_id = p_customer
    for update;

  if v_total is null then
    raise exception 'Sale not found';
  end if;
  if p_amount <= 0 then raise exception 'Jumlah bayar harus > 0'; end if;
  if p_amount > v_outstanding then
    raise exception 'Pembayaran melebihi sisa piutang %', v_outstanding;
  end if;

  v_new_paid := v_paid + p_amount;
  v_status := case
    when v_new_paid >= v_total then 'PAID'::payment_status
    else 'PARTIAL'::payment_status
  end;

  v_number := public.next_number(p_workspace, 'PAY-C');

  insert into public.customer_payments(
    workspace_id, number, customer_id, sale_id, payment_date,
    amount, payment_method, note, created_by
  ) values (
    p_workspace, v_number, p_customer, p_sale, current_date,
    p_amount, p_payment_method, p_note, auth.uid()
  ) returning id into v_payment_id;

  update public.sales
    set paid_amount = v_new_paid,
        outstanding_amount = v_total - v_new_paid,
        payment_status = v_status
    where id = p_sale;

  if p_payment_method in ('CASH', 'TUNAI') then
    insert into public.cash_transactions(
      workspace_id, number, type, transaction_date, category,
      amount, payment_method, reference_type, reference_id, note, created_by
    ) values (
      p_workspace, public.next_number(p_workspace, 'CASH'),
      'IN', current_date, 'Pelunasan Piutang',
      p_amount, p_payment_method, 'customer_payment', v_payment_id, p_note, auth.uid()
    );
  end if;

  return jsonb_build_object(
    'payment_id', v_payment_id,
    'number', v_number,
    'new_outstanding', v_total - v_new_paid,
    'status', v_status
  );
end;
$$;