"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { section: "Utama", items: [
    { href: "/dashboard", label: "Dashboard", icon: "DB" },
    { href: "/pos", label: "Kasir POS", icon: "KS" },
  ]},
  { section: "Penjualan", items: [
    { href: "/sales", label: "Penjualan", icon: "PJ" },
    { href: "/delivery", label: "Delivery", icon: "DV" },
    { href: "/sales-returns", label: "Retur Jual", icon: "RJ" },
    { href: "/receivables", label: "Piutang", icon: "PT" },
  ]},
  { section: "Pembelian", items: [
    { href: "/purchases", label: "Pembelian", icon: "PB" },
    { href: "/purchase-returns", label: "Retur Beli", icon: "RB" },
    { href: "/payables", label: "Hutang Supplier", icon: "HT" },
  ]},
  { section: "Stok", items: [
    { href: "/inventory/stock", label: "Produk & Stok", icon: "ST" },
    { href: "/inventory/card", label: "Kartu Stok", icon: "KC" },
    { href: "/inventory/transfers", label: "Transfer", icon: "TR" },
    { href: "/inventory/issues", label: "Issue Barang", icon: "IS" },
    { href: "/inventory/repack", label: "Repack", icon: "RP" },
    { href: "/inventory/adjustments", label: "Koreksi", icon: "AD" },
  ]},
  { section: "Master", items: [
    { href: "/master/customers", label: "Customer", icon: "CU" },
    { href: "/master/suppliers", label: "Supplier", icon: "SU" },
    { href: "/master/sales-people", label: "Salesman", icon: "SM" },
    { href: "/master/products", label: "Produk", icon: "PR" },
    { href: "/master/categories", label: "Kategori", icon: "KT" },
    { href: "/master/brands", label: "Brand", icon: "BR" },
    { href: "/master/units", label: "Satuan", icon: "UN" },
    { href: "/master/prices", label: "Harga", icon: "HG" },
    { href: "/master/warehouses", label: "Gudang", icon: "GD" },
  ]},
  { section: "Kas & Demo", items: [
    { href: "/cash/in", label: "Kas Masuk", icon: "KI" },
    { href: "/cash/out", label: "Kas Keluar", icon: "KO" },
    { href: "/reports", label: "Laporan", icon: "LP" },
    { href: "/settings/demo", label: "Pengaturan", icon: "PG" },
  ]},
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="brand-block">
        <Link href="/dashboard" className="brand-link">
          <span className="brand-mark">BP</span>
          <span>
            <span className="brand-name">Berkah Plastik</span>
            <span className="brand-sub">Retail ERP Demo</span>
          </span>
        </Link>
      </div>

      <div className="demo-strip">
        <span className="demo-dot" />
        <div>
          <div className="demo-title">MODE DEMO</div>
          <div className="demo-copy">Data sandbox per workspace.</div>
        </div>
      </div>

      <nav className="nav">
        {NAV.map((section) => (
          <div key={section.section} className="nav-group">
            <div className="nav-title">{section.section}</div>
            {section.items.map((item) => {
              const active = pathname === item.href || Boolean(pathname?.startsWith(item.href + "/"));
              return (
                <Link key={item.href} href={item.href} className={"nav-item" + (active ? " active" : "")}>
                  <span className="nav-token">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="foot">
        <div className="foot-card">
          <div className="foot-label">Operator</div>
          <div className="foot-name">Demo Owner</div>
        </div>
      </div>

      <style jsx>{`
        .sidebar { width: 252px; flex-shrink: 0; background: #fbfcfd; border-right: 1px solid var(--border); display: flex; flex-direction: column; }
        .brand-block { padding: 18px 16px 14px; }
        .brand-link { display: flex; align-items: center; gap: 11px; }
        .brand-mark { width: 38px; height: 38px; border-radius: 9px; background: #14213d; color: #fff; display: grid; place-items: center; font-weight: 850; font-size: 12px; letter-spacing: .4px; box-shadow: inset 0 -10px 16px rgba(255,255,255,.08); }
        .brand-name, .brand-sub { display: block; }
        .brand-name { font-size: 14px; font-weight: 820; letter-spacing: -.1px; color: var(--ink); }
        .brand-sub { margin-top: 2px; font-size: 11px; color: var(--muted); font-weight: 650; }
        .demo-strip { margin: 0 12px 12px; padding: 11px 12px; border: 1px solid #d8ede8; background: #effaf7; border-radius: 10px; display: flex; gap: 10px; align-items: flex-start; }
        .demo-dot { width: 8px; height: 8px; border-radius: 999px; background: var(--accent); margin-top: 4px; box-shadow: 0 0 0 4px rgba(15,118,110,.12); }
        .demo-title { font-size: 10px; letter-spacing: .7px; font-weight: 850; color: var(--accent); }
        .demo-copy { font-size: 11px; color: var(--text-2); margin-top: 2px; line-height: 1.35; }
        .nav { flex: 1; overflow-y: auto; padding: 6px 10px 14px; }
        .nav-group { margin: 10px 0 14px; }
        .nav-title { padding: 0 8px 7px; color: #7b8797; font-size: 10px; font-weight: 850; letter-spacing: .8px; text-transform: uppercase; }
        .nav-item { position: relative; display: flex; align-items: center; gap: 10px; min-height: 34px; padding: 7px 9px; border-radius: 8px; color: #4b5565; font-size: 13px; font-weight: 680; }
        .nav-item:hover { background: #eef3f6; color: var(--ink); }
        .nav-item.active { background: #152033; color: #fff; box-shadow: 0 8px 18px rgba(20,32,51,.16); }
        .nav-token { width: 25px; height: 22px; border-radius: 6px; display: grid; place-items: center; background: #edf1f5; color: #637083; font-size: 9px; font-weight: 850; letter-spacing: .35px; }
        .nav-item.active .nav-token { background: rgba(255,255,255,.13); color: #fff; }
        .nav-label { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .foot { padding: 12px; border-top: 1px solid var(--border); }
        .foot-card { border: 1px solid var(--border); background: #fff; border-radius: 10px; padding: 10px 11px; }
        .foot-label { font-size: 10px; color: var(--muted); font-weight: 780; text-transform: uppercase; letter-spacing: .6px; }
        .foot-name { margin-top: 3px; font-size: 13px; font-weight: 760; }
        @media (max-width: 860px) { .sidebar { width: 100%; height: auto; border-right: none; border-bottom: 1px solid var(--border); } .brand-block, .demo-strip, .foot { display: none; } .nav { display: flex; overflow-x: auto; padding: 8px; gap: 8px; } .nav-group { display: contents; } .nav-title { display: none; } .nav-item { flex: 0 0 auto; } }
      `}</style>
    </aside>
  );
}
