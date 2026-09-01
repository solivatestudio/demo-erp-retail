"use client";

import { Bell, ChevronDown, DatabaseZap, Search, Sparkles } from "lucide-react";
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
              <button
                type="button"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-left text-xs font-semibold text-slate-800 shadow-sm"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Toko Utama (Jl. Irian, Klaten)</span>
                <ChevronDown size={13} className="text-slate-400" />
              </button>

              <div className="simulation-badge" title="Data operasional dalam mode simulasi interaktif">
                <Sparkles size={12} className="text-amber-600" />
                <span>Simulasi Demo</span>
              </div>
            </div>
          </div>

          <div className="app-actions">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 text-xs text-slate-400 bg-slate-100/80 rounded-lg border border-slate-200/60 cursor-pointer hover:bg-slate-100 transition-colors">
              <Search size={13} />
              <span>Cari cepat...</span>
              <kbd className="text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-500 font-bold">⌘K</kbd>
            </div>

            <Button variant="outline" size="icon" aria-label="Notifikasi" className="relative h-9 w-9">
              <Bell size={15} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
            </Button>

            <div className="header-user flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <span className="w-8 h-8 rounded-lg bg-slate-900 text-white font-black text-xs flex items-center justify-center shadow-sm">
                SA
              </span>
              <div className="hidden sm:block text-left">
                <strong className="block text-xs font-bold text-slate-900 leading-tight">Super Admin</strong>
                <small className="block text-[11px] text-slate-500">Administrator</small>
              </div>
            </div>
          </div>
        </header>
        <main className="app-content">{children}</main>
      </section>
    </div>
  );
}
