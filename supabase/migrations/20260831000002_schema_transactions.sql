-- Phase 0A.2: Transactions tables (purchase, sale, delivery, returns)

-- ============================================
-- PURCHASE
-- ============================================
create type purchase_status as enum ('DRAFT', 'POSTED', 'PARTIAL', 'PAID', 'RETURNED_PARTIAL', 'RETURNED', 'CANCELLED');

create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  number text not null,
  supplier_id uuid not null references public.suppliers(id) on delete restrict,
  invoice_number text,
  purchase_date date not null default current_date,
  due_date date,
  warehouse_id uuid not null references public.warehouses(id) on delete restrict,
  subtotal numeric default 0,
  discount numeric default 0,
  total numeric default 0,
  paid_amount numeric default 0,
  outstanding_amount numeric default 0,
  status purchase_status default 'DRAFT',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (workspace_id, number)
);

create table if not exists public.purchase_items (
  id uuid primary key default gen_random_uuid(),
  purchase_id uuid not null references public.purchases(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  unit_id uuid not null references public.units(id) on delete restrict,
  qty numeric not null,
  conversion_factor numeric not null default 1,
  stock_qty numeric not null,
  unit_price numeric not null,
  subtotal numeric not null
);

create table if not exists public.purchase_returns (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  number text not null,
  purchase_id uuid references public.purchases(id) on delete set null,
  supplier_id uuid not null references public.suppliers(id) on delete restrict,
  return_date date not null default current_date,
  warehouse_id uuid not null references public.warehouses(id) on delete restrict,
  total numeric default 0,
  notes text,
  created_at timestamptz default now(),
  unique (workspace_id, number)
);

create table if not exists public.purchase_return_items (
  id uuid primary key default gen_random_uuid(),
  return_id uuid not null references public.purchase_returns(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  unit_id uuid not null references public.units(id) on delete restrict,
  qty numeric not null,
  conversion_factor numeric not null default 1,
  stock_qty numeric not null,
  unit_price numeric not null,
  subtotal numeric not null
);

create table if not exists public.supplier_payments (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  number text not null,
  supplier_id uuid not null references public.suppliers(id) on delete restrict,
  purchase_id uuid references public.purchases(id) on delete set null,
  payment_date date not null default current_date,
  amount numeric not null,
  payment_method text,
  note text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  unique (workspace_id, number)
);

-- ============================================
-- SALES
-- ============================================
create type sale_type as enum ('POS', 'DIRECT', 'DELIVERY');
create type payment_status as enum ('UNPAID', 'PARTIAL', 'PAID');
create type fulfillment_status as enum ('NONE', 'PARTIAL', 'FULL');
create type sale_status as enum ('DRAFT', 'POSTED', 'CANCELLED', 'RETURNED_PARTIAL', 'RETURNED');

create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  number text not null,
  sale_type sale_type not null,
  customer_id uuid references public.customers(id) on delete set null,
  customer_group_id uuid references public.customer_groups(id) on delete set null,
  salesman_id uuid references public.sales_people(id) on delete set null,
  warehouse_id uuid not null references public.warehouses(id) on delete restrict,
  sale_date timestamptz not null default now(),
  subtotal numeric default 0,
  discount numeric default 0,
  total numeric default 0,
  paid_amount numeric default 0,
  outstanding_amount numeric default 0,
  payment_status payment_status default 'UNPAID',
  fulfillment_status fulfillment_status default 'NONE',
  status sale_status default 'DRAFT',
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  unique (workspace_id, number)
);

create table if not exists public.sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references public.sales(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  unit_id uuid not null references public.units(id) on delete restrict,
  qty numeric not null,
  conversion_factor numeric not null default 1,
  stock_qty numeric not null,
  unit_price numeric not null,
  subtotal numeric not null,
  cost_snapshot numeric default 0,
  cogs_total numeric default 0,
  delivered_qty numeric default 0
);

create index if not exists idx_sales_workspace_date on public.sales(workspace_id, sale_date desc);
create index if not exists idx_sale_items_sale on public.sale_items(sale_id);

create table if not exists public.sales_returns (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  number text not null,
  sale_id uuid references public.sales(id) on delete set null,
  customer_id uuid references public.customers(id) on delete set null,
  return_date date not null default current_date,
  warehouse_id uuid not null references public.warehouses(id) on delete restrict,
  total numeric default 0,
  notes text,
  created_at timestamptz default now(),
  unique (workspace_id, number)
);

create table if not exists public.sales_return_items (
  id uuid primary key default gen_random_uuid(),
  return_id uuid not null references public.sales_returns(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  unit_id uuid not null references public.units(id) on delete restrict,
  qty numeric not null,
  conversion_factor numeric not null default 1,
  stock_qty numeric not null,
  unit_price numeric not null,
  subtotal numeric not null
);

create table if not exists public.customer_payments (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  number text not null,
  customer_id uuid not null references public.customers(id) on delete restrict,
  sale_id uuid references public.sales(id) on delete set null,
  payment_date date not null default current_date,
  amount numeric not null,
  payment_method text,
  note text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  unique (workspace_id, number)
);

-- ============================================
-- DELIVERY
-- ============================================
create table if not exists public.deliveries (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  number text not null,
  sale_id uuid not null references public.sales(id) on delete cascade,
  delivery_date timestamptz not null default now(),
  status text default 'POSTED',
  address text,
  note text,
  created_at timestamptz default now(),
  unique (workspace_id, number)
);

create table if not exists public.delivery_items (
  id uuid primary key default gen_random_uuid(),
  delivery_id uuid not null references public.deliveries(id) on delete cascade,
  sale_item_id uuid not null references public.sale_items(id) on delete cascade,
  qty numeric not null,
  stock_qty numeric not null
);