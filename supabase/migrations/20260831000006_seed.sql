-- Phase 0B.2: Seed data for demo workspace (Berkah Plastik & Packaging)

create or replace function public.seed_demo_workspace(p_workspace uuid)
returns void
language plpgsql
as $$
declare
  -- categories
  v_cat_minuman uuid;
  v_cat_sembako uuid;
  v_cat_plastik uuid;
  v_cat_kemasan uuid;
  v_cat_perawatan uuid;
  -- brands
  v_brand_aqua uuid;
  v_brand_indofood uuid;
  v_brand_abc uuid;
  v_brand_lifebuoy uuid;
  -- units
  v_unit_pcs uuid;
  v_unit_dus uuid;
  v_unit_karton uuid;
  v_unit_pack uuid;
  v_unit_kg uuid;
  -- warehouses
  v_wh_toko uuid;
  v_wh_utama uuid;
  v_wh_cadangan uuid;
  -- groups
  v_grp_retail uuid;
  v_grp_grosir uuid;
  v_grp_dist uuid;
  -- product iteration
  v_i int;
  v_pid uuid;
  v_pcode text;
  v_pname text;
  v_pcat uuid;
  v_pbrand uuid;
  v_preta numeric;
  v_pws numeric;
  v_pconv int;
  v_pstock int;
begin
  -- ============================================
  -- Categories
  -- ============================================
  insert into public.categories(workspace_id, name) values (p_workspace, 'Minuman') returning id into v_cat_minuman;
  insert into public.categories(workspace_id, name) values (p_workspace, 'Sembako') returning id into v_cat_sembako;
  insert into public.categories(workspace_id, name) values (p_workspace, 'Plastik') returning id into v_cat_plastik;
  insert into public.categories(workspace_id, name) values (p_workspace, 'Kemasan') returning id into v_cat_kemasan;
  insert into public.categories(workspace_id, name) values (p_workspace, 'Perawatan') returning id into v_cat_perawatan;

  -- ============================================
  -- Brands
  -- ============================================
  insert into public.brands(workspace_id, name) values (p_workspace, 'Aqua') returning id into v_brand_aqua;
  insert into public.brands(workspace_id, name) values (p_workspace, 'Indofood') returning id into v_brand_indofood;
  insert into public.brands(workspace_id, name) values (p_workspace, 'ABC') returning id into v_brand_abc;
  insert into public.brands(workspace_id, name) values (p_workspace, 'Lifebuoy') returning id into v_brand_lifebuoy;

  -- ============================================
  -- Units
  -- ============================================
  insert into public.units(workspace_id, code, name) values (p_workspace, 'PCS', 'Pieces') returning id into v_unit_pcs;
  insert into public.units(workspace_id, code, name) values (p_workspace, 'DUS', 'Dus') returning id into v_unit_dus;
  insert into public.units(workspace_id, code, name) values (p_workspace, 'KARTON', 'Karton') returning id into v_unit_karton;
  insert into public.units(workspace_id, code, name) values (p_workspace, 'PACK', 'Pack') returning id into v_unit_pack;
  insert into public.units(workspace_id, code, name) values (p_workspace, 'KG', 'Kilogram') returning id into v_unit_kg;

  -- ============================================
  -- Warehouses
  -- ============================================
  insert into public.warehouses(workspace_id, code, name, location) values (p_workspace, 'WH-T01', 'Toko Utama', 'Lantai 1') returning id into v_wh_toko;
  insert into public.warehouses(workspace_id, code, name, location) values (p_workspace, 'WH-G01', 'Gudang Utama', 'Belakang') returning id into v_wh_utama;
  insert into public.warehouses(workspace_id, code, name, location) values (p_workspace, 'WH-G02', 'Gudang Cadangan', 'Lantai 2') returning id into v_wh_cadangan;

  -- ============================================
  -- Customer Groups
  -- ============================================
  insert into public.customer_groups(workspace_id, code, name) values (p_workspace, 'RETAIL', 'Retail') returning id into v_grp_retail;
  insert into public.customer_groups(workspace_id, code, name) values (p_workspace, 'GROSIR', 'Grosir') returning id into v_grp_grosir;
  insert into public.customer_groups(workspace_id, code, name) values (p_workspace, 'DIST', 'Distributor') returning id into v_grp_dist;

  -- ============================================
  -- Customers (8)
  -- ============================================
  insert into public.customers(workspace_id, code, name, phone, city, customer_group_id) values
    (p_workspace, 'CUST-0001', 'Toko Berkah Jaya', '0812-0001', 'Jakarta', v_grp_grosir),
    (p_workspace, 'CUST-0002', 'Warung Bu Sari', '0812-0002', 'Jakarta', v_grp_grosir),
    (p_workspace, 'CUST-0003', 'Pelanggan Umum', '-', '-', v_grp_retail),
    (p_workspace, 'CUST-0004', 'Minimarket Sejahtera', '0812-0004', 'Bandung', v_grp_grosir),
    (p_workspace, 'CUST-0005', 'Toko Kelontong Pak Budi', '0812-0005', 'Surabaya', v_grp_grosir),
    (p_workspace, 'CUST-0006', 'Distributor Sentosa', '0812-0006', 'Semarang', v_grp_dist),
    (p_workspace, 'CUST-0007', 'Ibu Aminah', '0812-0007', 'Jakarta', v_grp_retail),
    (p_workspace, 'CUST-0008', 'Toko Makmur', '0812-0008', 'Yogyakarta', v_grp_grosir);

  -- ============================================
  -- Suppliers (4)
  -- ============================================
  insert into public.suppliers(workspace_id, code, name, phone, city, payment_term_days) values
    (p_workspace, 'SUP-0001', 'PT Indofood Sukses Makmur', '021-1111', 'Jakarta', 30),
    (p_workspace, 'SUP-0002', 'CV Aqua Golden Mississippi', '021-2222', 'Jakarta', 14),
    (p_workspace, 'SUP-0003', 'PT Unilever Indonesia', '021-3333', 'Jakarta', 30),
    (p_workspace, 'SUP-0004', 'Distributor Nasional', '021-4444', 'Surabaya', 45);

  -- ============================================
  -- Sales People (3)
  -- ============================================
  insert into public.sales_people(workspace_id, code, name, phone) values
    (p_workspace, 'SP-0001', 'Andi Wijaya', '0813-0001'),
    (p_workspace, 'SP-0002', 'Siti Nurhaliza', '0813-0002'),
    (p_workspace, 'SP-0003', 'Budi Santoso', '0813-0003');

  -- ============================================
  -- Products (12) + UOM conversions + retail/wholesale prices
  -- Table: code | name | category_id | brand_id | retail | wholesale | dus_conv | opening_stock
  -- ============================================
  for v_i in 1..12 loop
    v_pcode := 'ITEM-' || lpad(v_i::text, 2, '0');

    if v_i = 1 then v_pname := 'Air Mineral 600ml'; v_pcat := v_cat_minuman; v_pbrand := v_brand_aqua;
      v_preta := 5000; v_pws := 4200; v_pconv := 24; v_pstock := 480;
    elsif v_i = 2 then v_pname := 'Air Mineral 1500ml'; v_pcat := v_cat_minuman; v_pbrand := v_brand_aqua;
      v_preta := 8000; v_pws := 7000; v_pconv := 12; v_pstock := 240;
    elsif v_i = 3 then v_pname := 'Teh Botol 350ml'; v_pcat := v_cat_minuman; v_pbrand := v_brand_abc;
      v_preta := 4500; v_pws := 3800; v_pconv := 24; v_pstock := 360;
    elsif v_i = 4 then v_pname := 'Kopi Sachet (renceng)'; v_pcat := v_cat_sembako; v_pbrand := v_brand_indofood;
      v_preta := 1500; v_pws := 1300; v_pconv := 50; v_pstock := 120;
    elsif v_i = 5 then v_pname := 'Gula Pasir 1kg'; v_pcat := v_cat_sembako; v_pbrand := v_brand_indofood;
      v_preta := 17500; v_pws := 16000; v_pconv := 20; v_pstock := 200;
    elsif v_i = 6 then v_pname := 'Minyak Goreng 1L'; v_pcat := v_cat_sembako; v_pbrand := v_brand_indofood;
      v_preta := 19000; v_pws := 17500; v_pconv := 12; v_pstock := 150;
    elsif v_i = 7 then v_pname := 'Beras Premium 5kg'; v_pcat := v_cat_sembako; v_pbrand := v_brand_indofood;
      v_preta := 72000; v_pws := 68000; v_pconv := 10; v_pstock := 80;
    elsif v_i = 8 then v_pname := 'Mie Instan Goreng'; v_pcat := v_cat_sembako; v_pbrand := v_brand_indofood;
      v_preta := 3500; v_pws := 3200; v_pconv := 40; v_pstock := 600;
    elsif v_i = 9 then v_pname := 'Susu UHT 1L'; v_pcat := v_cat_minuman; v_pbrand := v_brand_abc;
      v_preta := 18000; v_pws := 16500; v_pconv := 12; v_pstock := 96;
    elsif v_i = 10 then v_pname := 'Sabun Mandi Batang'; v_pcat := v_cat_perawatan; v_pbrand := v_brand_lifebuoy;
      v_preta := 5500; v_pws := 4800; v_pconv := 72; v_pstock := 300;
    elsif v_i = 11 then v_pname := 'Shampoo Sachet'; v_pcat := v_cat_perawatan; v_pbrand := v_brand_abc;
      v_preta := 1000; v_pws := 900; v_pconv := 100; v_pstock := 500;
    else v_pname := 'Detergen 800g'; v_pcat := v_cat_kemasan; v_pbrand := v_brand_indofood;
      v_preta := 24000; v_pws := 22000; v_pconv := 12; v_pstock := 140;
    end if;

    -- opening avg cost = 70% of retail (typical margin)
    insert into public.products(workspace_id, code, name, category_id, brand_id, stock_unit_id, current_avg_cost)
      values (p_workspace, v_pcode, v_pname, v_pcat, v_pbrand, v_unit_pcs, v_preta * 0.7)
      returning id into v_pid;

    -- UOM conversions
    insert into public.product_units(workspace_id, product_id, unit_id, conversion_to_stock_unit) values
      (p_workspace, v_pid, v_unit_pcs, 1),
      (p_workspace, v_pid, v_unit_dus, v_pconv),
      (p_workspace, v_pid, v_unit_karton, v_pconv * 2);

    -- Retail + Grosir prices (PCS-based, calculator will use conversion)
    insert into public.product_prices(workspace_id, product_id, customer_group_id, unit_id, min_qty, price) values
      (p_workspace, v_pid, v_grp_retail, v_unit_pcs, 1, v_preta),
      (p_workspace, v_pid, v_grp_grosir, v_unit_pcs, 1, v_pws),
      (p_workspace, v_pid, v_grp_dist, v_unit_pcs, 1, v_pws * 0.95);

    -- Opening stock: Toko Utama only, as OPENING movement
    insert into public.stock_balances(workspace_id, product_id, warehouse_id, qty, avg_cost, stock_value)
      values (p_workspace, v_pid, v_wh_toko, v_pstock, v_preta * 0.7, v_pstock * v_preta * 0.7);

    insert into public.inventory_movements(
      workspace_id, product_id, warehouse_id, movement_type,
      qty_delta_stock_unit, unit_cost, value_delta,
      balance_after, avg_cost_after, note
    ) values (
      p_workspace, v_pid, v_wh_toko, 'OPENING',
      v_pstock, v_preta * 0.7, v_pstock * v_preta * 0.7,
      v_pstock, v_preta * 0.7, 'Stok awal'
    );
  end loop;
end;
$$;