"use client";

import { Bell, ChevronDown, Search } from "lucide-react";
import Sidebar from "./Sidebar";
import { Button } from "./ui/button";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Lewati ke konten utama</a>
      <Sidebar />
      <section className="app-main">
        <header className="app-header">
          <div className="app-title">
            <div className="outlet-control-wrap">
              <button
                type="button"
                aria-label="Pilih outlet aktif"
                className="outlet-control"
              >
                <span>Toko Utama (Jl. Irian, Klaten)</span>
                <ChevronDown size={13} className="text-slate-400" />
              </button>
            </div>
          </div>

          <div className="app-actions">
            <button type="button" aria-label="Buka pencarian cepat" className="header-search-button">
              <Search size={13} />
              <span>Cari cepat…</span>
              <kbd>Ctrl K</kbd>
            </button>

            <Button variant="outline" size="icon" aria-label="Notifikasi" className="relative h-9 w-9">
              <Bell size={15} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
            </Button>

            <div className="header-user">
              <span className="header-user-avatar">
                SA
              </span>
              <div className="header-user-copy">
                <strong>Super Admin</strong>
                <small>Administrator</small>
              </div>
            </div>
          </div>
        </header>
        <main id="main-content" className="app-content">{children}</main>
      </section>
    </div>
  );
}
