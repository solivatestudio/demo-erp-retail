"use client";

import Link from "next/link";
import { Bell, Search, Store } from "lucide-react";
import Sidebar from "./Sidebar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <section className="app-main">
        <header className="app-header">
          <div className="app-title">
            <div className="app-title-icon">
              <Store size={18} />
            </div>
            <div>
              <span>Kelolain</span>
              <strong>Akuratif</strong>
              <small>Akurat dan Aktif</small>
            </div>
          </div>

          <div className="app-actions">
            <div className="global-search">
              <Search size={15} />
              <span>Cari nota, SKU, customer...</span>
            </div>
            <Badge variant="success">Online</Badge>
            <Button variant="outline" size="icon" aria-label="Notifikasi">
              <Bell size={16} />
            </Button>
            <Button asChild>
              <Link href="/pos">Buka POS</Link>
            </Button>
          </div>
        </header>
        <main className="app-content">{children}</main>
      </section>
    </div>
  );
}
