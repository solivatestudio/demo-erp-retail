"use client";

import { Bell, ChevronDown, Search } from "lucide-react";
import Sidebar from "./Sidebar";
import { Button } from "./ui/button";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <section className="app-main">
        <header className="app-header">
          <div className="app-title">
            <div>
              <span>Outlet</span>
              <strong>Toko Utama <ChevronDown size={13} /></strong>
            </div>
          </div>

          <div className="app-actions">
            <div className="global-search">
              <Search size={15} />
              <span>Cari nota, SKU, customer...</span>
            </div>
            <Button variant="outline" size="icon" aria-label="Notifikasi">
              <Bell size={16} />
            </Button>
            <div className="header-user"><span>OA</span><div><strong>Okky Aditya</strong><small>Owner</small></div></div>
          </div>
        </header>
        <main className="app-content">{children}</main>
      </section>
    </div>
  );
}
