"use client";

import { useState } from "react";
import Pos from "../components/Pos";
import Dashboard from "../components/Dashboard";

const TABS = [
  { key: "pos", label: "Kasir" },
  { key: "dash", label: "Dashboard" },
];

export default function Home() {
  const [tab, setTab] = useState("pos");

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark">R</span>
          <div className="brand-text">
            <div className="brand-name">RetailERP</div>
            <div className="brand-sub">POS & ERP Retail/Grosir</div>
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

        <div className="user-chip">
          <span className="dot" />
          <div>
            <div className="user-name">Kasir · Demo</div>
            <div className="user-sub">Shift 1</div>
          </div>
        </div>
      </header>

      <main className="main">{tab === "pos" ? <Pos /> : <Dashboard />}</main>

      <style jsx>{`
        .app {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background: var(--bg);
        }
        .app-header {
          display: flex;
          align-items: center;
          gap: 24px;
          padding: 14px 24px;
          background: var(--panel);
          border-bottom: 1px solid var(--border);
          box-shadow: var(--shadow-sm);
        }
        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .brand-mark {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, var(--accent), var(--accent-2));
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 16px;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
        }
        .brand-text {
          display: flex;
          flex-direction: column;
          line-height: 1.2;
        }
        .brand-name {
          font-weight: 700;
          font-size: 15px;
        }
        .brand-sub {
          font-size: 11px;
          color: var(--muted);
        }
        .nav {
          display: flex;
          gap: 4px;
          padding: 4px;
          background: var(--panel-2);
          border-radius: 10px;
          margin-left: auto;
        }
        .nav-btn {
          background: transparent;
          border: none;
          color: var(--muted);
          padding: 8px 18px;
          border-radius: 7px;
          font-weight: 600;
          font-size: 13px;
          transition: all 0.15s;
        }
        .nav-btn:hover {
          color: var(--text);
        }
        .nav-btn.active {
          background: var(--panel);
          color: var(--text);
          box-shadow: var(--shadow-sm);
        }
        .user-chip {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 6px 14px 6px 10px;
          background: var(--panel-2);
          border: 1px solid var(--border);
          border-radius: 999px;
        }
        .user-chip .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--green);
          box-shadow: 0 0 0 3px var(--green-soft);
        }
        .user-name {
          font-size: 12px;
          font-weight: 600;
          line-height: 1.2;
        }
        .user-sub {
          font-size: 10px;
          color: var(--muted);
          line-height: 1.2;
        }
        .main {
          flex: 1;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
