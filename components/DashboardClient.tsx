"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Boxes,
  Building2,
  CalendarDays,
  CreditCard,
  PackageOpen,
  PackageX,
  ReceiptText,
  ShoppingCart,
  TrendingUp,
  Truck,
} from "lucide-react";
import { formatRupiah } from "../lib/utils/format";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

const kpis = [
  {
    label: "Omzet Hari Ini",
    value: "Rp18.750.000",
    delta: "+12,4%",
    up: true,
    caption: "vs hari kemarin",
    accent: "border-t-blue-500",
  },
  {
    label: "Estimasi Laba Kotor",
    value: "Rp4.320.000",
    delta: "+8,1%",
    up: true,
    caption: "margin kotor 23,0%",
    accent: "border-t-emerald-500",
  },
  {
    label: "Piutang Usaha Tempo",
    value: "Rp7.420.000",
    delta: "4 Mitra UMKM",
    up: false,
    caption: "jatuh tempo minggu ini",
    accent: "border-t-amber-500",
  },
  {
    label: "Stok Kritis / Habis",
    value: "2 SKU",
    delta: "+3 menipis",
    up: false,
    caption: "1 habis, 1 perlu restock",
    accent: "border-t-rose-500",
  },
];

const sales = [42, 49, 46, 61, 56, 67, 64, 77, 72, 86, 81, 94, 89, 104];

const outlets = [
  { name: "Toko Utama (Jl. Irian)", revenue: "Rp250.950.000", value: 52, color: "#2563eb" },
  { name: "Gatotkoco 2 (Krapyak)", revenue: "Rp159.250.000", value: 33, color: "#10b981" },
  { name: "Gudang Logistik Pusat", revenue: "Rp72.400.000", value: 15, color: "#8b5cf6" },
];

const transactions = [
  { no: "SAL-202608-0091", customer: "Warung Makan Bu Aminah", type: "Grosir", time: "14:42", status: "Lunas", amount: 1865000 },
  { no: "SAL-202608-0090", customer: "Kedai Kopi Selaras", type: "Grosir", time: "14:18", status: "Tempo", amount: 4930000 },
  { no: "SAL-202608-0089", customer: "Pelanggan Umum (Walk-in)", type: "Eceran", time: "13:55", status: "Lunas", amount: 930000 },
  { no: "SAL-202608-0088", customer: "Catering Berkah Klaten", type: "Grosir", time: "13:31", status: "Lunas", amount: 2745000 },
];

const attention = [
  {
    icon: PackageX,
    title: "2 produk stok kritis & habis",
    note: "Paper Lunch Box Medium & Bubble Wrap 50m perlu PO",
    href: "/inventory/stock",
    tone: "danger",
    badge: "Restock Segera",
  },
  {
    icon: CreditCard,
    title: "4 tagihan piutang tempo UMKM",
    note: "Total tagihan Rp7.420.000 (jatuh tempo minggu ini)",
    href: "/receivables",
    tone: "warning",
    badge: "Follow-up",
  },
  {
    icon: ReceiptText,
    title: "3 pembelian pabrik belum lunas",
    note: "Tagihan supplier PT Sinar Joyoboyo & CV Starindo",
    href: "/payables",
    tone: "neutral",
    badge: "Keuangan",
  },
  {
    icon: Truck,
    title: "2 rute delivery aktif hari ini",
    note: "Armada pengiriman area Klaten Tengah & Klaten Selatan",
    href: "/delivery",
    tone: "neutral",
    badge: "Logistik",
  },
];

export default function DashboardClient() {
  const points = sales.map((v, i) => `${(i / (sales.length - 1)) * 100},${100 - ((v - 35) / 75) * 100}`).join(" ");

  return (
    <div className="dashboard-page owner-dashboard">
      {/* Top Header */}
      <section className="owner-heading">
        <div>
          <div className="owner-heading-meta">
            <span className="owner-heading-label"><Building2 size={14} /> Dashboard Pemilik</span>
            <span className="owner-heading-outlet">Toko Utama · Klaten</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Ringkasan Operasional & Bisnis</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Pantau arus kas, realisasi penjualan grosir/eceran, dan kesehatan stok inventaris secara real-time.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="date-control">
            <CalendarDays size={14} className="text-slate-400" />
            <span>31 Agustus 2026</span>
          </div>
          <Button asChild size="sm">
            <Link href="/pos">
              <ShoppingCart size={15} /> Buka POS Kasir
            </Link>
          </Button>
        </div>
      </section>

      {/* 4 Metric KPI Cards */}
      <section className="owner-kpi-grid" aria-label="Ringkasan kinerja bisnis">
        {kpis.map((k) => (
          <Card key={k.label} className={`owner-kpi-card ${k.up ? "is-positive" : "is-attention"}`}>
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>{k.label}</span>
                <span className={`inline-flex items-center gap-0.5 font-bold px-1.5 py-0.5 rounded text-[10px] ${k.up ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                  {k.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />} {k.delta}
                </span>
              </div>
              <div className="text-2xl font-extrabold text-slate-900 font-mono mt-1 tracking-tight">{k.value}</div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <span className="text-[11px] text-slate-400">{k.caption}</span>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Charts & Analytics Grid */}
      <section className="owner-analytics-grid">
        {/* Sales Trendline (Span 8) */}
        <Card className="owner-sales-card">
          <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between border-b border-slate-100">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">Tren Penjualan 14 Hari Terakhir</CardTitle>
              <CardDescription className="text-xs text-slate-500">Omzet kumulatif seluruh gerai & pemesanan grosir</CardDescription>
            </div>
            <div className="text-right">
              <strong className="text-lg font-black text-slate-900 font-mono">Rp214,8 jt</strong>
              <span className="block text-[11px] text-emerald-600 font-bold">+14,2% vs periode lalu</span>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <div className="sales-chart-wrap relative h-[210px] w-full">
              <div className="chart-y">
                <span>30 jt</span>
                <span>20 jt</span>
                <span>10 jt</span>
                <span>0</span>
              </div>
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-[160px] overflow-visible border-b border-slate-200">
                <defs>
                  <linearGradient id="salesFillNew" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <polygon points={`0,100 ${points} 100,100`} fill="url(#salesFillNew)" />
                <polyline points={points} fill="none" stroke="#2563eb" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
              </svg>
              <div className="chart-x flex justify-between text-[11px] text-slate-400 mt-2 font-mono">
                <span>18 Agu</span>
                <span>22 Agu</span>
                <span>26 Agu</span>
                <span>31 Agu</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Outlet Share (Span 4) */}
        <Card className="owner-outlet-card">
          <CardHeader className="p-5 pb-2 border-b border-slate-100">
            <CardTitle className="text-base font-bold text-slate-900">Kontribusi Penjualan Cabang</CardTitle>
            <CardDescription className="text-xs text-slate-500">Distribusi omzet bulan berjalan</CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
              <span className="text-xs text-slate-500 font-semibold block">Total Akumulasi Omzet</span>
              <strong className="text-2xl font-black text-slate-900 font-mono">Rp482.600.000</strong>
            </div>

            <div className="space-y-3">
              {outlets.map((o) => (
                <div key={o.name} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700">{o.name}</span>
                    <span className="font-mono font-bold text-slate-900">{o.value}% ({o.revenue})</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${o.value}%`, backgroundColor: o.color }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Lower Section: Recent Transactions & Alerts */}
      <section className="owner-lower-grid">
        {/* Recent Transactions (Span 7) */}
        <Card className="owner-transactions-card">
          <CardHeader className="p-5 pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">Transaksi Penjualan Terbaru</CardTitle>
              <CardDescription className="text-xs text-slate-500">Pembaruan nota penjualan grosir & eceran hari ini</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/sales" className="text-blue-600 font-bold text-xs">
                Lihat Semua <ArrowRight size={13} className="ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0 data-table">
            <table>
              <thead>
                <tr>
                  <th>No. Transaksi</th>
                  <th>Pelanggan</th>
                  <th>Tipe</th>
                  <th>Waktu</th>
                  <th>Status</th>
                  <th className="right">Total</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((r) => (
                  <tr key={r.no} className="hover:bg-slate-50/70 transition-colors">
                    <td data-label="Nomor nota">
                      <span className="sku-badge">{r.no}</span>
                    </td>
                    <td data-label="Pelanggan" className="font-semibold text-slate-800">{r.customer}</td>
                    <td data-label="Tipe">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {r.type}
                      </span>
                    </td>
                    <td data-label="Waktu" className="text-xs text-slate-500 font-mono">{r.time}</td>
                    <td data-label="Status">
                      <Badge variant={r.status === "Lunas" ? "success" : "warning"}>{r.status}</Badge>
                    </td>
                    <td data-label="Total" className="right font-mono font-bold text-slate-900">
                      {formatRupiah(r.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Priority Attention (Span 5) */}
        <Card className="owner-attention-card">
          <CardHeader className="p-5 pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-bold text-slate-900">Perlu Perhatian Operasional</CardTitle>
            <CardDescription className="text-xs text-slate-500">Tindakan prioritas stok, piutang, dan logistik</CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-2.5">
            {attention.map((a) => {
              const Icon = a.icon;
              return (
                <Link
                  href={a.href}
                  key={a.title}
                  className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group"
                >
                  <span
                    className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      a.tone === "danger"
                        ? "bg-rose-50 text-rose-600"
                        : a.tone === "warning"
                        ? "bg-amber-50 text-amber-600"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    <Icon size={18} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <strong className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {a.title}
                      </strong>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {a.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">{a.note}</p>
                  </div>
                  <ArrowRight size={14} className="text-slate-300 group-hover:text-blue-600 mt-2 transition-colors" />
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
