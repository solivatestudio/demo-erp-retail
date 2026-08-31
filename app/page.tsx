"use client";

import { useState } from "react";
import Pos from "../components/Pos";
import Dashboard from "../components/Dashboard";

const TABS = [
  { key: "pos", label: "Kasir (POS)" },
  { key: "dash", label: "Dashboard" },
];

export default function Home() {
  const [tab, setTab] = useState("pos");

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark">R</span>
          <div>
            <div className="brand-name">RetailERP</div>
            <div className="brand-sub">POS &amp; ERP Retail/Grosir — Demo</div>
          </div>
        </div>
        <nav className="nav">
          {TABS.map((t) => (
            <button
              key={t.key}
              className={"nav-btn" + (tab === t.key ? " active" : "")}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </nav>
        <div className="user-chip">Kasir · Shift 1</div>
      </header>

      <main className="main">{tab === "pos" ? <Pos /> : <Dashboard />}</main>

      <style jsx>{`
        .app { display: flex; flex-direction: column; height: 100vh; }
        .app-header { display: flex; align-items: center; gap: 20px; padding: 12px 20px; background: var(--panel); border-bottom: 1px solid var(--border); }
        .brand { display: flex; align-items: center; gap: 10px; }
        .brand-mark { width: 34px; height: 34px; border-radius: 8px; background: var(--accent); color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; }
        .brand-name { font-weight: 800; }
        .brand-sub { font-size: 11px; color: var(--muted); }
        .nav { display: flex; gap: 6px; margin-left: auto; }
        .nav-btn { background: transparent; border: 1px solid transparent; color: var(--muted); padding: 8px 14px; border-radius: 8px; font-weight: 600; font-size: 13px; }
        .nav-btn.active { background: var(--panel-2); color: var(--text); border-color: var(--border); }
        .user-chip { font-size: 12px; color: var(--muted); background: var(--panel-2); border: 1px solid var(--border); padding: 6px 12px; border-radius: 999px; }
        .main { flex: 1; overflow: hidden; }
      `}</style>
    </div>
  );
}
