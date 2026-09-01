"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { BarChart3, Boxes, ChevronDown, CircleDollarSign, ClipboardCheck, CreditCard, LayoutDashboard, Menu, PackageOpen, ReceiptText, Repeat2, Settings, ShoppingCart, Truck, Users, WalletCards, Warehouse } from "lucide-react";

const GROUPS = [
  { label: "Operasional", items: [
    { href: "/", label: "Dashboard", icon: LayoutDashboard, mobile: true }, { href: "/pos", label: "POS", icon: ShoppingCart, mobile: true },
    { href: "/sales", label: "Penjualan", icon: ReceiptText, mobile: true }, { href: "/purchases", label: "Pembelian", icon: PackageOpen },
    { href: "/delivery", label: "Delivery", icon: Truck },
  ]},
  { label: "Persediaan", items: [
    { href: "/inventory/stock", label: "Inventory", icon: Boxes, mobile: true }, { href: "/inventory/transfers", label: "Transfer Gudang", icon: Warehouse },
    { href: "/inventory/repack", label: "Repack", icon: Repeat2 }, { href: "/inventory/adjustments", label: "Stock Opname", icon: ClipboardCheck },
  ]},
  { label: "Keuangan", items: [
    { href: "/receivables", label: "Piutang", icon: CreditCard }, { href: "/payables", label: "Hutang", icon: WalletCards }, { href: "/cash/in", label: "Kas", icon: CircleDollarSign },
  ]},
  { label: "Analisis", items: [{ href: "/reports", label: "Laporan", icon: BarChart3, mobile: true }]},
  { label: "Pengaturan", items: [
    { href: "/master/products", label: "Master Data", icon: Users }, { href: "/master/warehouses", label: "Outlet & Gudang", icon: Warehouse }, { href: "/settings", label: "User & Akses", icon: Settings },
  ]},
];

export default function Sidebar() {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const isActive = (href: string) => pathname === href || (href !== "/" && Boolean(pathname?.startsWith(href + "/"))) || (href === "/" && pathname === "/dashboard");
  const rememberScroll = () => {
    if (navRef.current) sessionStorage.setItem("kelolain:sidebar-scroll", String(navRef.current.scrollTop));
  };

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const savedPosition = Number(sessionStorage.getItem("kelolain:sidebar-scroll") || 0);
    const restorePosition = () => {
      nav.scrollTop = savedPosition;
      nav.querySelector<HTMLAnchorElement>("a.active")?.scrollIntoView({ block: "nearest" });
    };
    restorePosition();
    const restoreTimer = window.setTimeout(restorePosition, 50);
    const rememberPosition = () => sessionStorage.setItem("kelolain:sidebar-scroll", String(nav.scrollTop));
    nav.addEventListener("scroll", rememberPosition, { passive: true });
    return () => {
      window.clearTimeout(restoreTimer);
      rememberPosition();
      nav.removeEventListener("scroll", rememberPosition);
    };
  }, [pathname]);
  return (
    <aside className="app-sidebar">
      <Link href="/" className="sidebar-brand"><span>KA</span><div><strong>Kelolain</strong><small>Retail & Grosir ERP</small></div></Link>
      <button className="sidebar-context" type="button"><span><small>Outlet aktif</small><strong>Semua Outlet</strong></span><ChevronDown size={15} /></button>
      <nav ref={navRef} className="sidebar-nav" aria-label="Navigasi aplikasi">
        {GROUPS.map((group) => <div className="nav-group" key={group.label}>
          <span className="nav-group-label">{group.label}</span>
          {group.items.map((item) => { const Icon = item.icon; return <Link onClick={rememberScroll} key={item.href} href={item.href} className={`${isActive(item.href) ? "active" : ""} ${item.mobile ? "mobile-primary" : "mobile-secondary"}`}><Icon size={17} /><span>{item.label}</span></Link>; })}
        </div>)}
      </nav>
      <nav className="mobile-bottom-nav" aria-label="Navigasi utama mobile">
        {[
          { href: "/", label: "Home", icon: LayoutDashboard },
          { href: "/pos", label: "POS", icon: ShoppingCart },
          { href: "/inventory/stock", label: "Inventory", icon: Boxes },
          { href: "/sales", label: "Transaksi", icon: ReceiptText },
          { href: "/menu", label: "Menu", icon: Menu },
        ].map((item) => { const Icon = item.icon; return <Link key={item.href} href={item.href} className={isActive(item.href) ? "active" : ""}><Icon /><span>{item.label}</span></Link>; })}
      </nav>
      <div className="sidebar-footer"><span className="avatar">SA</span><div><strong>Super Admin</strong><small>Administrator</small></div></div>
    </aside>
  );
}
