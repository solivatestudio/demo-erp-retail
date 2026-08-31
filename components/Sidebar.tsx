"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Boxes,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  PackageOpen,
  ReceiptText,
  Repeat2,
  ShoppingCart,
  Truck,
  WalletCards,
  Warehouse,
} from "lucide-react";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pos", label: "POS Kasir", icon: ShoppingCart },
  { href: "/inventory/stock", label: "Stok Gudang", icon: Warehouse },
  { href: "/sales", label: "Penjualan", icon: ReceiptText },
  { href: "/purchases", label: "Pembelian", icon: PackageOpen },
  { href: "/delivery", label: "Delivery", icon: Truck },
  { href: "/receivables", label: "Piutang", icon: CreditCard },
  { href: "/payables", label: "Hutang", icon: WalletCards },
  { href: "/master/products", label: "Produk & Harga", icon: Boxes },
  { href: "/inventory/repack", label: "Repack", icon: Repeat2 },
  { href: "/reports", label: "Laporan", icon: BarChart3 },
  { href: "/settings/demo", label: "Checklist Demo", icon: ClipboardList },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="app-sidebar">
      <Link href="/" className="sidebar-brand">
        <span>BP</span>
        <div>
          <strong>Berkah Plastik</strong>
          <small>Retail ERP Demo</small>
        </div>
      </Link>

      <div className="sidebar-context">
        <strong>Toko Utama</strong>
        <span>Kasir, gudang, owner dashboard</span>
      </div>

      <nav className="sidebar-nav" aria-label="Navigasi aplikasi">
        {NAV.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/" && Boolean(pathname?.startsWith(item.href + "/"))) ||
            (item.href === "/" && pathname === "/dashboard");
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href} className={active ? "active" : ""}>
              <Icon size={16} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <span>Demo script</span>
        <strong>POS → Stok → Laporan</strong>
      </div>
    </aside>
  );
}
