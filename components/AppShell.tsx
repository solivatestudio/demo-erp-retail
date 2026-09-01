"use client";

import { Bell, ChevronDown, DatabaseZap } from "lucide-react";
import Sidebar from "./Sidebar";
import { Button } from "./ui/button";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <section className="app-main">
        <header className="app-header">
          <div className="app-title">
            <div className="flex items-center gap-3">
              <div>
                <span>Outlet Aktif</span>
                <strong>Toko Utama (Jl. Irian) <ChevronDown size={13} /></strong>
              </div>
              <div className="simulation-badge" title="Data operasional dalam mode simulasi interaktif">
                <DatabaseZap size={13} />
                <span>Data Simulasi</span>
              </div>
            </div>
          </div>

          <div className="app-actions">
            <Button variant="outline" size="icon" aria-label="Notifikasi">
              <Bell size={16} />
            </Button>
            <div className="header-user">
              <span>SA</span>
              <div>
                <strong>Super Admin</strong>
                <small>Administrator</small>
              </div>
            </div>
          </div>
        </header>
        <main className="app-content">{children}</main>
      </section>
    </div>
  );
}
