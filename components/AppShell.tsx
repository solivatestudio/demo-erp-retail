"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import { createClient } from "../lib/supabase/client";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const resetDemo = async () => {
    if (!window.confirm("Reset Data Demo ke kondisi awal?")) return;
    setBusy(true);
    setMsg(null);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Session demo tidak ditemukan.");
      const { data, error: wsError } = await supabase.from("workspace_members").select("workspace_id").eq("user_id", user.id).limit(1).single();
      if (wsError) throw wsError;
      const { error } = await supabase.rpc("reset_demo_workspace", { p_workspace: data.workspace_id });
      if (error) throw error;
      setMsg("Data demo sudah di-reset.");
      window.location.reload();
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="shell">
      <Sidebar />
      <div className="shell-main">
        <header className="shell-header">
          <div>
            <div className="header-eyebrow">MODE DEMO</div>
            <div className="header-title">Berkah Plastik &amp; Packaging</div>
          </div>
          <div className="header-actions">
            {msg && <span className="header-msg">{msg}</span>}
            <button className="btn-secondary" onClick={() => window.location.href = "/reports"}>Start Guided Tour</button>
            <button className="btn-danger" disabled={busy} onClick={resetDemo}>{busy ? "Reset..." : "Reset Data Demo"}</button>
          </div>
        </header>
        <main className="shell-content">{children}</main>
      </div>

      <style jsx>{`
        .shell { display: flex; min-height: 100vh; background: var(--bg); }
        .shell-main { flex: 1; display: flex; flex-direction: column; min-width: 0; }
        .shell-header { background: var(--panel); border-bottom: 1px solid var(--border); padding: 12px 24px; display: flex; align-items: center; justify-content: space-between; box-shadow: var(--shadow-sm); gap: 16px; }
        .header-eyebrow { font-size: 10px; text-transform: uppercase; font-weight: 800; letter-spacing: 0.5px; color: var(--amber); }
        .header-title { font-size: 13px; font-weight: 700; }
        .header-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; justify-content: flex-end; }
        .header-msg { color: var(--muted); font-size: 12px; font-weight: 700; }
        .btn-secondary { font-size: 12px; font-weight: 700; padding: 7px 12px; border-radius: 8px; border: 1px solid var(--border); background: var(--panel); color: var(--text); }
        .btn-secondary:hover { background: var(--panel-2); }
        .btn-danger { font-size: 12px; font-weight: 800; padding: 7px 12px; border-radius: 8px; border: 1px solid rgba(220, 38, 38, 0.2); background: var(--red-soft); color: var(--red); }
        .btn-danger:hover:not(:disabled) { background: var(--red); color: white; }
        .btn-danger:disabled { opacity: .6; cursor: not-allowed; }
        .shell-content { flex: 1; overflow: auto; }
        @media (max-width: 860px) { .shell { display: block; } .shell-header { padding: 10px 14px; align-items: flex-start; } }
      `}</style>
    </div>
  );
}
