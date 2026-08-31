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
  Printer,
  ShoppingCart,
  Truck,
  WalletCards,
  Warehouse,
} from "lucide-react";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, mobile: true },
  { href: "/pos", label: "POS Kasir", icon: ShoppingCart, mobile: true },
  { href: "/inventory/stock", label: "Stok Gudang", icon: Warehouse, mobile: true },
  { href: "/sales", label: "Penjualan", icon: ReceiptText, mobile: true },
  { href: "/purchases", label: "Pembelian", icon: PackageOpen },
  { href: "/delivery", label: "Delivery", icon: Truck },
  { href: "/receivables", label: "Piutang", icon: CreditCard },
  { href: "/payables", label: "Hutang", icon: WalletCards },
  { href: "/master/products", label: "Produk & Harga", icon: Boxes },
  { href: "/inventory/repack", label: "Repack", icon: Repeat2 },
  { href: "/reprints", label: "Cetak Nota", icon: Printer },
  { href: "/reports", label: "Laporan", icon: BarChart3, mobile: true },
  { href: "/settings", label: "Pengaturan", icon: ClipboardList },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="app-sidebar">
      <Link href="/" className="sidebar-brand">
        <span>KA</span>
        <div>
          <strong>Kelolain</strong>
          <small>Akuratif · Akurat dan Aktif</small>
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
            <Link key={item.href} href={item.href} className={`${active ? "active" : ""} ${item.mobile ? "mobile-primary" : "mobile-secondary"}`}>
              <Icon size={16} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <span>Operator</span>
        <strong>Admin Toko</strong>
      </div>
    </aside>
  );
}
