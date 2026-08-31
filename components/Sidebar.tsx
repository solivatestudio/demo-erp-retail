"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { section: "Utama", items: [
    { href: "/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/pos", label: "Kasir (POS)", icon: "🛒" },
  ]},
  { section: "Penjualan", items: [
    { href: "/sales", label: "Daftar Penjualan", icon: "📋" },
    { href: "/delivery", label: "Delivery", icon: "🚚" },
    { href: "/sales-returns", label: "Retur Penjualan", icon: "↩️" },
    { href: "/receivables", label: "Piutang", icon: "💳" },
  ]},
  { section: "Pembelian", items: [
    { href: "/purchases", label: "Pembelian", icon: "📦" },
    { href: "/purchase-returns", label: "Retur Pembelian", icon: "↩️" },
    { href: "/payables", label: "Hutang Supplier", icon: "📑" },
  ]},
  { section: "Stok", items: [
    { href: "/inventory/stock", label: "Produk & Stok", icon: "📦" },
    { href: "/inventory/transfers", label: "Transfer Gudang", icon: "🔄" },
    { href: "/inventory/issues", label: "Pengeluaran Barang", icon: "📤" },
    { href: "/inventory/repack", label: "Repack", icon: "🧪" },
    { href: "/inventory/adjustments", label: "Koreksi Stok", icon: "🛠️" },
    { href: "/inventory/card", label: "Kartu Stok", icon: "📇" },
  ]},
  { section: "Master Data", items: [
    { href: "/master/customers", label: "Customer", icon: "👥" },
    { href: "/master/suppliers", label: "Supplier", icon: "🏭" },
    { href: "/master/sales-people", label: "Salesman", icon: "🧑‍💼" },
    { href: "/master/products", label: "Produk", icon: "📦" },
    { href: "/master/categories", label: "Kategori", icon: "🗂️" },
    { href: "/master/brands", label: "Brand", icon: "™️" },
    { href: "/master/units", label: "Satuan", icon: "📐" },
    { href: "/master/prices", label: "Harga", icon: "💰" },
    { href: "/master/warehouses", label: "Gudang", icon: "🏬" },
  ]},
  { section: "Kas", items: [
    { href: "/cash/in", label: "Kas Masuk", icon: "💵" },
    { href: "/cash/out", label: "Kas Keluar", icon: "💸" },
  ]},
  { section: "Lainnya", items: [
    { href: "/reports", label: "Laporan", icon: "📈" },
    { href: "/settings/demo", label: "Pengaturan Demo", icon: "⚙️" },
  ]},
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <span className="brand-mark">R</span>
          <div>
            <div className="brand-name">RetailERP</div>
            <div className="brand-sub">POS & ERP Demo</div>
          </div>
        </Link>
      </div>

      <div className="sidebar-banner">
        <div className="banner-box">
          <div className="banner-title">Mode Demo</div>
          <div className="banner-text">Data dapat diubah & di-reset kapan saja.</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV.map((section) => (
          <div key={section.section} className="nav-section">
            <div className="nav-section-title">{section.section}</div>
            {section.items.map((item) => {
              const active = pathname === item.href || (pathname?.startsWith(item.href + "/") ?? false);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={"nav-item" + (active ? " active" : "")}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-foot">
        <div className="user-row">
          <span className="dot" />
          <div>
            <div className="user-name">Demo User</div>
            <div className="user-role">Role: Owner</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .sidebar { width: 240px; flex-shrink: 0; background: var(--panel); border-right: 1px solid var(--border); display: flex; flex-direction: column; }
        .sidebar-brand { padding: 16px; border-bottom: 1px solid var(--border); }
        .brand-mark { width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, var(--accent), var(--accent-2)); color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 16px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25); }
        .brand-name { font-weight: 700; font-size: 14px; color: var(--text); }
        .brand-sub { font-size: 10px; color: var(--muted); }
        .sidebar-banner { padding: 12px; border-bottom: 1px solid var(--border); }
        .banner-box { background: var(--amber-soft); border: 1px solid rgba(217, 119, 6, 0.2); border-radius: 8px; padding: 10px; }
        .banner-title { font-size: 10px; font-weight: 800; letter-spacing: 0.5px; color: var(--amber); text-transform: uppercase; margin-bottom: 2px; }
        .banner-text { font-size: 11px; color: var(--text-2); line-height: 1.4; }
        .sidebar-nav { flex: 1; overflow-y: auto; padding: 12px 0; }
        .nav-section { margin-bottom: 8px; }
        .nav-section-title { padding: 6px 16px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: var(--muted); }
        .nav-item { display: flex; align-items: center; gap: 10px; padding: 8px 16px; margin: 0 8px; border-radius: 8px; font-size: 13px; color: var(--text-2); font-weight: 500; transition: background 0.1s; text-decoration: none; }
        .nav-item:hover { background: var(--panel-2); }
        .nav-item.active { background: var(--accent-soft); color: var(--accent); font-weight: 600; }
        .nav-icon { font-size: 15px; }
        .sidebar-foot { padding: 12px; border-top: 1px solid var(--border); }
        .user-row { display: flex; align-items: center; gap: 10px; padding: 8px; }
        .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--green); box-shadow: 0 0 0 3px var(--green-soft); }
        .user-name { font-size: 12px; font-weight: 600; }
        .user-role { font-size: 10px; color: var(--muted); }
      `}</style>
    </aside>
  );
}