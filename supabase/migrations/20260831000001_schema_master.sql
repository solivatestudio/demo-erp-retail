-- Phase 0A: Workspace, Auth, Master Data tables
-- Run via Supabase SQL Editor

-- ============================================
-- WORKSPACE
-- ============================================
create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  business_name text not null,
  phone text,
  address text,
  city text,
  logo_url text,
  demo_mode boolean default false,
  owner_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text,
  role text default 'owner',
  created_at timestamptz default now(),
  unique (workspace_id, user_id)
);

-- ============================================
-- MASTER DATA
-- ============================================
create table if not exists public.customer_groups (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  code text not null,
  name text not null,
  created_at timestamptz default now(),
  unique (workspace_id, code)
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  code text not null,
  name text not null,
  phone text,
  address text,
  city text,
  customer_group_id uuid references public.customer_groups(id) on delete set null,
  credit_limit numeric default 0,
  active boolean default true,
  created_at timestamptz default now(),
  unique (workspace_id, code)
);

create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  code text not null,
  name text not null,
  phone text,
  address text,
  city text,
  payment_term_days int default 0,
  active boolean default true,
  created_at timestamptz default now(),
  unique (workspace_id, code)
);

create table if not exists public.sales_people (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  code text not null,
  name text not null,
  phone text,
  address text,
  active boolean default true,
  created_at timestamptz default now(),
  unique (workspace_id, code)
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  parent_id uuid references public.categories(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  created_at timestamptz default now(),
  unique (workspace_id, name)
);

create table if not exists public.units (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  code text not null,
  name text not null,
  created_at timestamptz default now(),
  unique (workspace_id, code)
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  code text not null,
  name text not null,
  category_id uuid references public.categories(id) on delete set null,
  brand_id uuid references public.brands(id) on delete set null,
  stock_unit_id uuid references public.units(id) on delete set null,
  barcode text,
  current_avg_cost numeric default 0,
  active boolean default true,
  created_at timestamptz default now(),
  unique (workspace_id, code)
);

create table if not exists public.product_units (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  unit_id uuid not null references public.units(id) on delete restrict,
  conversion_to_stock_unit numeric not null,
  unique (product_id, unit_id)
);

create table if not exists public.product_prices (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  customer_group_id uuid references public.customer_groups(id) on delete cascade,
  unit_id uuid not null references public.units(id) on delete restrict,
  min_qty numeric default 1,
  price numeric not null,
  created_at timestamptz default now()
);

create table if not exists public.warehouses (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  code text not null,
  name text not null,
  location text,
  description text,
  active boolean default true,
  created_at timestamptz default now(),
  unique (workspace_id, code)
);

-- ============================================
-- INVENTORY LEDGER
-- ============================================
create table if not exists public.stock_balances (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  warehouse_id uuid not null references public.warehouses(id) on delete cascade,
  qty numeric default 0,
  avg_cost numeric default 0,
  stock_value numeric default 0,
  updated_at timestamptz default now(),
  unique (workspace_id, product_id, warehouse_id)
);

create table if not exists public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  warehouse_id uuid not null references public.warehouses(id) on delete restrict,
  movement_type text not null,
  reference_type text,
  reference_id uuid,
  qty_delta_stock_unit numeric not null,
  unit_cost numeric default 0,
  value_delta numeric default 0,
  balance_after numeric,
  avg_cost_after numeric,
  note text,
  posted_at timestamptz default now(),
  posted_by uuid references auth.users(id) on delete set null
);

create index if not exists idx_movements_workspace_posted on public.inventory_movements(workspace_id, posted_at desc);
create index if not exists idx_movements_product on public.inventory_movements(workspace_id, product_id, posted_at desc);
create index if not exists idx_movements_warehouse on public.inventory_movements(workspace_id, warehouse_id, posted_at desc);
create index if not exists idx_movements_ref on public.inventory_movements(reference_type, reference_id);

-- ============================================
-- NUMBERING COUNTERS
-- ============================================
create table if not exists public.workspace_counters (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  prefix text not null,
  last_number int default 0,
  unique (workspace_id, prefix)
);