-- Phase 0A.3: Stock operations & cash tables

-- ============================================
-- STOCK OPERATIONS
-- ============================================
create table if not exists public.stock_transfers (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  number text not null,
  from_warehouse_id uuid not null references public.warehouses(id) on delete restrict,
  to_warehouse_id uuid not null references public.warehouses(id) on delete restrict,
  transfer_date timestamptz not null default now(),
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  unique (workspace_id, number)
);

create table if not exists public.stock_transfer_items (
  id uuid primary key default gen_random_uuid(),
  transfer_id uuid not null references public.stock_transfers(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  qty numeric not null,
  stock_qty numeric not null
);

create type issue_reason as enum ('RUSAK', 'SAMPLE', 'OPERASIONAL', 'HILANG', 'INTERNAL', 'LAINNYA');

create table if not exists public.stock_issues (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  number text not null,
  warehouse_id uuid not null references public.warehouses(id) on delete restrict,
  issue_date timestamptz not null default now(),
  reason issue_reason default 'LAINNYA',
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  unique (workspace_id, number)
);

create table if not exists public.stock_issue_items (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references public.stock_issues(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  qty numeric not null,
  stock_qty numeric not null,
  unit_cost numeric default 0,
  subtotal numeric default 0
);

create table if not exists public.repacks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  number text not null,
  repack_date timestamptz not null default now(),
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  unique (workspace_id, number)
);

create table if not exists public.repack_inputs (
  id uuid primary key default gen_random_uuid(),
  repack_id uuid not null references public.repacks(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  qty numeric not null,
  stock_qty numeric not null,
  value numeric default 0
);

create table if not exists public.repack_outputs (
  id uuid primary key default gen_random_uuid(),
  repack_id uuid not null references public.repacks(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  qty numeric not null,
  stock_qty numeric not null,
  value numeric default 0,
  allocation_percent numeric default 0
);

create table if not exists public.stock_adjustments (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  number text not null,
  warehouse_id uuid not null references public.warehouses(id) on delete restrict,
  adjustment_date timestamptz not null default now(),
  reason text,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  unique (workspace_id, number)
);

create table if not exists public.stock_adjustment_items (
  id uuid primary key default gen_random_uuid(),
  adjustment_id uuid not null references public.stock_adjustments(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  system_qty numeric not null,
  physical_qty numeric not null,
  qty_delta numeric not null,
  stock_qty numeric not null,
  current_avg_cost numeric default 0,
  new_avg_cost numeric,
  reason text
);

-- ============================================
-- CASH
-- ============================================
create type cash_type as enum ('IN', 'OUT');
create table if not exists public.cash_transactions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  number text not null,
  type cash_type not null,
  transaction_date date not null default current_date,
  category text,
  amount numeric not null,
  payment_method text,
  reference_type text,
  reference_id uuid,
  note text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  unique (workspace_id, number)
);

create index if not exists idx_cash_workspace_date on public.cash_transactions(workspace_id, transaction_date desc);