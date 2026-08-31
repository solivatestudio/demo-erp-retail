-- Phase 0A.4: Row Level Security (RLS) per workspace
-- Strategy: each user belongs to workspaces via workspace_members.
-- Public tables block direct SELECT for anon; data fetched via SECURITY DEFINER RPCs.

-- Enable RLS on all tables
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.customer_groups enable row level security;
alter table public.customers enable row level security;
alter table public.suppliers enable row level security;
alter table public.sales_people enable row level security;
alter table public.categories enable row level security;
alter table public.brands enable row level security;
alter table public.units enable row level security;
alter table public.products enable row level security;
alter table public.product_units enable row level security;
alter table public.product_prices enable row level security;
alter table public.warehouses enable row level security;
alter table public.stock_balances enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.workspace_counters enable row level security;
alter table public.purchases enable row level security;
alter table public.purchase_items enable row level security;
alter table public.purchase_returns enable row level security;
alter table public.purchase_return_items enable row level security;
alter table public.supplier_payments enable row level security;
alter table public.sales enable row level security;
alter table public.sale_items enable row level security;
alter table public.sales_returns enable row level security;
alter table public.sales_return_items enable row level security;
alter table public.customer_payments enable row level security;
alter table public.deliveries enable row level security;
alter table public.delivery_items enable row level security;
alter table public.stock_transfers enable row level security;
alter table public.stock_transfer_items enable row level security;
alter table public.stock_issues enable row level security;
alter table public.stock_issue_items enable row level security;
alter table public.repacks enable row level security;
alter table public.repack_inputs enable row level security;
alter table public.repack_outputs enable row level security;
alter table public.stock_adjustments enable row level security;
alter table public.stock_adjustment_items enable row level security;
alter table public.cash_transactions enable row level security;

-- Helper: get user's accessible workspace_ids
create or replace function public.user_workspace_ids()
returns setof uuid
language sql
stable
as $$
  select workspace_id from public.workspace_members where user_id = auth.uid();
$$;

-- Policy template: members can SELECT their workspace data
do $$
declare
  t text;
  tables text[] := array[
    'customer_groups','customers','suppliers','sales_people','categories','brands','units',
    'products','product_units','product_prices','warehouses','stock_balances','inventory_movements',
    'workspace_counters','purchases','purchase_items','purchase_returns','purchase_return_items',
    'supplier_payments','sales','sale_items','sales_returns','sales_return_items','customer_payments',
    'deliveries','delivery_items','stock_transfers','stock_transfer_items','stock_issues',
    'stock_issue_items','repacks','repack_inputs','repack_outputs','stock_adjustments',
    'stock_adjustment_items','cash_transactions'
  ];
begin
  foreach t in array tables loop
    execute format('drop policy if exists "workspace_select" on public.%I', t);
    execute format('create policy "workspace_select" on public.%I for select using (workspace_id in (select public.user_workspace_ids()))', t);
  end loop;
end $$;

-- Workspaces: members can see their own workspaces
drop policy if exists "workspace_select_own" on public.workspaces;
create policy "workspace_select_own" on public.workspaces for select using (id in (select public.user_workspace_ids()));

drop policy if exists "workspace_members_select" on public.workspace_members;
create policy "workspace_members_select" on public.workspace_members for select using (workspace_id in (select public.user_workspace_ids()));

-- Anon user policy for demo: anyone authenticated can create workspace + view their own
drop policy if exists "workspace_insert" on public.workspaces;
create policy "workspace_insert" on public.workspaces for insert with check (auth.uid() is not null);

drop policy if exists "members_insert_own" on public.workspace_members;
create policy "members_insert_own" on public.workspace_members for insert with check (user_id = auth.uid());