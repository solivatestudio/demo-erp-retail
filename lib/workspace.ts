import { createClient } from "./supabase/server";
import { redirect } from "next/navigation";

export async function getCurrentWorkspace() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: memberships, error } = await supabase
    .from("workspace_members")
    .select("workspace_id, role, display_name, workspaces(id, name, business_name, demo_mode)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1);

  if (error) throw new Error(error.message);
  const m = memberships?.[0];
  if (!m) redirect("/");

  return {
    workspaceId: m.workspace_id,
    role: m.role,
    displayName: m.display_name,
    workspace: m.workspaces,
  };
}