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
    if t = 'purchase_items' then
      execute 'create policy "workspace_select" on public.purchase_items for select using (exists (select 1 from public.purchases h where h.id = purchase_id and h.workspace_id in (select public.user_workspace_ids())))';
    elsif t = 'purchase_return_items' then
      execute 'create policy "workspace_select" on public.purchase_return_items for select using (exists (select 1 from public.purchase_returns h where h.id = return_id and h.workspace_id in (select public.user_workspace_ids())))';
    elsif t = 'sale_items' then
      execute 'create policy "workspace_select" on public.sale_items for select using (exists (select 1 from public.sales h where h.id = sale_id and h.workspace_id in (select public.user_workspace_ids())))';
    elsif t = 'sales_return_items' then
      execute 'create policy "workspace_select" on public.sales_return_items for select using (exists (select 1 from public.sales_returns h where h.id = return_id and h.workspace_id in (select public.user_workspace_ids())))';
    elsif t = 'delivery_items' then
      execute 'create policy "workspace_select" on public.delivery_items for select using (exists (select 1 from public.deliveries h where h.id = delivery_id and h.workspace_id in (select public.user_workspace_ids())))';
    elsif t = 'stock_transfer_items' then
      execute 'create policy "workspace_select" on public.stock_transfer_items for select using (exists (select 1 from public.stock_transfers h where h.id = transfer_id and h.workspace_id in (select public.user_workspace_ids())))';
    elsif t = 'stock_issue_items' then
      execute 'create policy "workspace_select" on public.stock_issue_items for select using (exists (select 1 from public.stock_issues h where h.id = issue_id and h.workspace_id in (select public.user_workspace_ids())))';
    elsif t = 'repack_inputs' then
      execute 'create policy "workspace_select" on public.repack_inputs for select using (exists (select 1 from public.repacks h where h.id = repack_id and h.workspace_id in (select public.user_workspace_ids())))';
    elsif t = 'repack_outputs' then
      execute 'create policy "workspace_select" on public.repack_outputs for select using (exists (select 1 from public.repacks h where h.id = repack_id and h.workspace_id in (select public.user_workspace_ids())))';
    elsif t = 'stock_adjustment_items' then
      execute 'create policy "workspace_select" on public.stock_adjustment_items for select using (exists (select 1 from public.stock_adjustments h where h.id = adjustment_id and h.workspace_id in (select public.user_workspace_ids())))';
    else
      execute format('create policy "workspace_select" on public.%I for select using (workspace_id in (select public.user_workspace_ids()))', t);
    end if;
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
