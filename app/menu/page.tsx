import Link from "next/link";
import { BarChart3, Building2, ChevronRight, CircleDollarSign, ClipboardCheck, CreditCard, PackageOpen, ReceiptText, Repeat2, Settings, Truck, Users, WalletCards, Warehouse } from "lucide-react";
import AppShell from "../../components/AppShell";

const groups = [
  { title: "Operasional", items: [
    { href: "/purchases", label: "Pembelian", note: "Nota beli dan retur supplier", icon: PackageOpen },
    { href: "/delivery", label: "Delivery", note: "Pengiriman dan barang tertunda", icon: Truck },
    { href: "/sales-returns", label: "Retur Penjualan", note: "Pengembalian barang pelanggan", icon: ReceiptText },
  ]},
  { title: "Persediaan", items: [
    { href: "/inventory/transfers", label: "Transfer Gudang", note: "Mutasi stok antar lokasi", icon: Warehouse },
    { href: "/inventory/repack", label: "Repack", note: "Konversi dan pecah satuan", icon: Repeat2 },
    { href: "/inventory/adjustments", label: "Stock Opname", note: "Koreksi stok fisik dan HPP", icon: ClipboardCheck },
  ]},
  { title: "Keuangan", items: [
    { href: "/receivables", label: "Piutang", note: "Tagihan dan angsuran pelanggan", icon: CreditCard },
    { href: "/payables", label: "Hutang", note: "Hutang dan pembayaran supplier", icon: WalletCards },
    { href: "/cash/in", label: "Kas Masuk & Keluar", note: "Arus kas operasional", icon: CircleDollarSign },
  ]},
  { title: "Analisis & Pengaturan", items: [
    { href: "/reports", label: "Laporan", note: "Penjualan, stok, dan laba", icon: BarChart3 },
    { href: "/master/products", label: "Master Data", note: "Produk, mitra, harga, dan satuan", icon: Users },
    { href: "/master/warehouses", label: "Outlet & Gudang", note: "Lokasi operasional bisnis", icon: Building2 },
    { href: "/settings", label: "Pengaturan", note: "Identitas toko dan akses user", icon: Settings },
  ]},
];

export default function MenuPage() {
  return (
    <AppShell>
      <main className="more-page">
        <header className="page-header more-page-header">
          <div>
            <span className="text-blue-600 font-bold uppercase text-xs tracking-wider">Navigasi Sistem</span>
            <h1 className="text-2xl font-black text-slate-900 mt-1">Peta Menu & Modul</h1>
            <p className="text-slate-500 text-sm mt-1">Akses cepat seluruh modul operasional, persediaan, keuangan, dan pengaturan toko.</p>
          </div>
        </header>

        {groups.map((group) => (
          <section key={group.title} className="more-section">
            <h2>{group.title}</h2>
            <div className="more-list">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link href={item.href} key={item.href}>
                    <span className="more-icon">
                      <Icon size={19} />
                    </span>
                    <div>
                      <strong>{item.label}</strong>
                      <small>{item.note}</small>
                    </div>
                    <ChevronRight size={17} className="text-slate-400" />
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </main>
    </AppShell>
  );
}
