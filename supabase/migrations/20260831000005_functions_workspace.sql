-- Phase 0B: Numbering + Workspace RPCs

-- Numbering: atomic counter per workspace+prefix
create or replace function public.next_number(p_workspace uuid, p_prefix text)
returns text
language plpgsql
as $$
declare
  v_next int;
  v_padded text;
begin
  insert into public.workspace_counters (workspace_id, prefix, last_number)
    values (p_workspace, p_prefix, 1)
    on conflict (workspace_id, prefix)
    do update set last_number = public.workspace_counters.last_number + 1
    returning last_number into v_next;

  v_padded := lpad(v_next::text, 6, '0');
  return p_prefix || '-' || v_padded;
end;
$$;

-- create_demo_workspace: bootstrap workspace for new visitor
create or replace function public.create_demo_workspace(p_business_name text default 'Demo Toko')
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid;
  v_ws uuid;
begin
  v_user := auth.uid();
  if v_user is null then
    raise exception 'Tidak ada user auth';
  end if;

  insert into public.workspaces (name, business_name, demo_mode, owner_user_id)
    values (p_business_name, p_business_name, true, v_user)
    returning id into v_ws;

  insert into public.workspace_members (workspace_id, user_id, display_name, role)
    values (v_ws, v_user, 'Demo User', 'owner');

  -- Seed Berkah Plastik & Packaging
  perform public.seed_demo_workspace(v_ws);

  return v_ws;
end;
$$;

-- Forward declaration so create_demo_workspace can call it
-- (we'll create seed_demo_workspace in next file)