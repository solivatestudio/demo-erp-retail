"use client";

import Sidebar from "./Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="shell">
      <Sidebar />
      <div className="shell-main">
        <header className="shell-header">
          <div>
            <div className="header-eyebrow">Demo Workspace</div>
            <div className="header-title">Berkah Plastik &amp; Packaging</div>
          </div>
          <div className="header-actions">
            <button className="btn-secondary">Start Guided Tour</button>
            <button className="btn-danger">Reset Data Demo</button>
          </div>
        </header>
        <main className="shell-content">{children}</main>
      </div>

      <style jsx>{`
        .shell { display: flex; height: 100vh; background: var(--bg); }
        .shell-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
        .shell-header { background: var(--panel); border-bottom: 1px solid var(--border); padding: 12px 24px; display: flex; align-items: center; justify-content: space-between; box-shadow: var(--shadow-sm); }
        .header-eyebrow { font-size: 10px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; color: var(--muted); }
        .header-title { font-size: 13px; font-weight: 600; }
        .header-actions { display: flex; align-items: center; gap: 12px; }
        .btn-secondary { font-size: 12px; font-weight: 600; padding: 6px 12px; border-radius: 8px; border: 1px solid var(--border); background: var(--panel); color: var(--text); }
        .btn-secondary:hover { background: var(--panel-2); }
        .btn-danger { font-size: 12px; font-weight: 700; padding: 6px 12px; border-radius: 8px; border: 1px solid rgba(220, 38, 38, 0.2); background: var(--red-soft); color: var(--red); }
        .btn-danger:hover { background: var(--red); color: white; }
        .shell-content { flex: 1; overflow: auto; }
      `}</style>
    </div>
  );
}