"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/dashboard", label: "Dashboard", tag: "01" },
  { href: "/pos", label: "POS Kasir", tag: "02" },
  { href: "/sales", label: "Penjualan", tag: "03" },
  { href: "/purchases", label: "Pembelian", tag: "04" },
  { href: "/delivery", label: "Delivery", tag: "05" },
  { href: "/inventory/stock", label: "Stok", tag: "06" },
  { href: "/receivables", label: "Piutang", tag: "07" },
  { href: "/payables", label: "Hutang", tag: "08" },
  { href: "/inventory/repack", label: "Repack", tag: "09" },
  { href: "/reports", label: "Laporan", tag: "10" },
  { href: "/settings/demo", label: "Reset Demo", tag: "R" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar simple-sidebar">
      <Link href="/dashboard" className="simple-brand">
        <span>BP</span>
        <div>
          <strong>Berkah Plastik</strong>
          <small>Demo ERP Retail</small>
        </div>
      </Link>

      <div className="demo-note">
        <b>Mode demo</b>
        <span>Dummy data siap untuk presentasi client.</span>
      </div>

      <nav className="simple-nav">
        {NAV.map((item) => {
          const active = pathname === item.href || Boolean(pathname?.startsWith(item.href + "/"));
          return (
            <Link key={item.href} href={item.href} className={active ? "active" : ""}>
              <span>{item.tag}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
