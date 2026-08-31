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
      setMsg("Data demo sudah di-reset");
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
        <header className="topbar">
          <div className="workspace">
            <div className="crumb">Workspace Demo</div>
            <div className="business">Berkah Plastik &amp; Packaging</div>
          </div>
          <div className="top-actions">
            {msg && <span className="message">{msg}</span>}
            <button className="tour" onClick={() => window.location.href = "/reports"}>Guided Tour</button>
            <button className="reset" disabled={busy} onClick={resetDemo}>{busy ? "Resetting" : "Reset Demo"}</button>
          </div>
        </header>
        <main className="content">{children}</main>
      </div>

      <style jsx>{`
        .shell { display: flex; min-height: 100vh; background: var(--bg); }
        .shell-main { flex: 1; display: flex; flex-direction: column; min-width: 0; }
        .topbar { position: sticky; top: 0; z-index: 10; height: 62px; background: rgba(255,255,255,.86); backdrop-filter: blur(12px); border-bottom: 1px solid var(--border); padding: 0 24px; display: flex; align-items: center; justify-content: space-between; gap: 18px; }
        .crumb { color: var(--muted); font-size: 11px; font-weight: 800; letter-spacing: .65px; text-transform: uppercase; }
        .business { margin-top: 2px; color: var(--ink); font-size: 15px; font-weight: 820; letter-spacing: -.15px; }
        .top-actions { display: flex; align-items: center; justify-content: flex-end; gap: 9px; flex-wrap: wrap; }
        .message { color: var(--text-2); font-size: 12px; font-weight: 720; }
        .tour, .reset { border-radius: 8px; padding: 8px 12px; font-size: 12px; font-weight: 780; border: 1px solid var(--border); background: #fff; color: var(--text); box-shadow: var(--shadow-sm); }
        .tour:hover { background: var(--panel-2); }
        .reset { border-color: #f3c9c9; background: #fff6f6; color: var(--red); }
        .reset:hover:not(:disabled) { background: var(--red); border-color: var(--red); color: #fff; }
        .reset:disabled { opacity: .6; cursor: not-allowed; }
        .content { flex: 1; min-width: 0; overflow: auto; }
        @media (max-width: 860px) { .shell { display: block; } .topbar { height: auto; min-height: 58px; padding: 10px 14px; align-items: flex-start; } .tour { display: none; } }
      `}</style>
    </div>
  );
}
