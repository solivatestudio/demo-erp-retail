"use client";

import Link from "next/link";
import { AlertTriangle, ArrowDownRight, ArrowRight, ArrowUpRight, CalendarDays, CreditCard, DatabaseZap, PackageX, ReceiptText } from "lucide-react";
import { formatRupiah } from "../lib/utils/format";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

const kpis = [
  { label: "Omzet hari ini", value: "Rp18,75 jt", delta: "+12,4%", up: true, caption: "dibanding kemarin" },
  { label: "Laba kotor", value: "Rp4,32 jt", delta: "+8,1%", up: true, caption: "margin 23,0%" },
  { label: "Piutang usaha", value: "Rp7,42 jt", delta: "4 UMKM", up: false, caption: "jatuh tempo minggu ini" },
  { label: "Stok kritis", value: "2 SKU", delta: "+3 menipis", up: false, caption: "1 habis, 1 perlu restock" },
];
const sales = [42, 49, 46, 61, 56, 67, 64, 77, 72, 86, 81, 94, 89, 104];
const outlets = [
  { name: "Toko Utama (Irian)", value: 52, color: "#1d4ed8" },
  { name: "Gatotkoco 2 (Krapyak)", value: 33, color: "#10b981" },
  { name: "Gudang Logistik Pusat", value: 15, color: "#6366f1" },
];
const transactions = [
  { no: "SAL-202608-0091", customer: "Warung Makan Bu Aminah", time: "14:42", status: "Lunas", amount: 1865000 },
  { no: "SAL-202608-0090", customer: "Kedai Kopi Selaras", time: "14:18", status: "Tempo", amount: 4930000 },
  { no: "SAL-202608-0089", customer: "Pelanggan Umum (Walk-in)", time: "13:55", status: "Lunas", amount: 930000 },
  { no: "SAL-202608-0088", customer: "Catering Berkah Klaten", time: "13:31", status: "Lunas", amount: 2745000 },
];
const attention = [
  { icon: PackageX, title: "2 produk stok kritis & habis", note: "Paper Lunch Box & Bubble Wrap 50m perlu PO", href: "/inventory/stock", tone: "danger" },
  { icon: AlertTriangle, title: "1 SKU belum diatur threshold", note: "SKU-SEDOTAN-STR belum ada ambang batas restock", href: "/inventory/stock", tone: "warning" },
  { icon: CreditCard, title: "4 piutang tempo UMKM", note: "Total tagihan Rp7.420.000 (jatuh tempo minggu ini)", href: "/receivables", tone: "warning" },
  { icon: ReceiptText, title: "3 pembelian pabrik belum lunas", note: "PT Sinar Joyoboyo & CV Starindo", href: "/payables", tone: "neutral" },
  { icon: ArrowRight, title: "2 pengiriman armada toko", note: "Truk delivery Klaten Tengah & Selatan", href: "/delivery", tone: "neutral" },
];

export default function DashboardClient() {
  const points = sales.map((v, i) => `${(i / (sales.length - 1)) * 100},${100 - ((v - 35) / 75) * 100}`).join(" ");

  return (
    <div className="dashboard-page owner-dashboard">
      <section className="owner-heading">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
              <DatabaseZap size={11} /> Data Simulasi Terverifikasi
            </span>
          </div>
          <h1>Selamat Datang di Kelolain</h1>
          <p>Ringkasan performa penjualan, stok gudang, dan piutang toko retail & grosir hari ini.</p>
        </div>
        <div className="date-control">
          <CalendarDays size={15} />
          <span>31 Agustus 2026</span>
        </div>
      </section>

      <section className="kpi-grid owner-kpis">
        {kpis.map((k) => (
          <Card key={k.label} className="kpi-card">
            <CardHeader>
              <CardDescription>{k.label}</CardDescription>
              <CardTitle>{k.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <span className={k.up ? "trend-up" : "trend-alert"}>
                {k.up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />} {k.delta}
              </span>
              <small>{k.caption}</small>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="dashboard-content-grid">
        <Card className="sales-chart">
          <CardHeader>
            <div>
              <CardTitle>Penjualan 14 hari</CardTitle>
              <CardDescription>Performa omzet seluruh outlet & toko</CardDescription>
            </div>
            <strong>
              Rp214,8 jt <small>+14,2%</small>
            </strong>
          </CardHeader>
          <CardContent>
            <div className="chart-y">
              <span>30 jt</span>
              <span>20 jt</span>
              <span>10 jt</span>
              <span>0</span>
            </div>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-label="Grafik penjualan">
              <defs>
                <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#2563eb" stopOpacity=".22" />
                  <stop offset="1" stopColor="#2563eb" stopOpacity="0" />
                </linearGradient>
              </defs>
              <polygon points={`0,100 ${points} 100,100`} fill="url(#salesFill)" />
              <polyline points={points} fill="none" stroke="#2563eb" strokeWidth="2" vectorEffect="non-scaling-stroke" />
            </svg>
            <div className="chart-x">
              <span>18 Agu</span>
              <span>22 Agu</span>
              <span>26 Agu</span>
              <span>31 Agu</span>
            </div>
          </CardContent>
        </Card>

        <Card className="span-5 attention-card">
          <CardHeader>
            <CardTitle>Perlu perhatian</CardTitle>
            <CardDescription>Prioritas operasional stok & piutang (9 SKU terdaftar)</CardDescription>
          </CardHeader>
          <CardContent>
            {attention.map((a) => {
              const Icon = a.icon;
              return (
                <Link href={a.href} key={a.title} className={`attention-row ${a.tone}`}>
                  <span>
                    <Icon size={17} />
                  </span>
                  <div>
                    <strong>{a.title}</strong>
                    <small>{a.note}</small>
                  </div>
                  <ArrowRight size={15} />
                </Link>
              );
            })}
          </CardContent>
        </Card>

        <Card className="outlet-chart">
          <CardHeader>
            <CardTitle>Performa outlet</CardTitle>
            <CardDescription>Kontribusi omzet per cabang bulan ini</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="donut-wrap">
              <div className="donut" />
              <div className="outlet-total">
                <strong>Rp482,6 jt</strong>
                <span>Total omzet</span>
              </div>
            </div>
            <div className="outlet-legend">
              {outlets.map((o) => (
                <div key={o.name}>
                  <i style={{ background: o.color }} />
                  <span>{o.name}</span>
                  <strong>{o.value}%</strong>
                  <span className="outlet-progress">
                    <i style={{ width: `${o.value}%`, background: o.color }} />
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="span-7">
          <CardHeader className="section-heading">
            <div>
              <CardTitle>Transaksi terbaru</CardTitle>
              <CardDescription>Pembaruan nota penjualan grosir & eceran</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/sales">
                Lihat semua <ArrowRight size={14} />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="data-table compact">
            <table>
              <thead>
                <tr>
                  <th>Nomor transaksi</th>
                  <th>Pelanggan</th>
                  <th>Waktu</th>
                  <th>Status</th>
                  <th className="right">Total</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((r) => (
                  <tr key={r.no}>
                    <td data-label="Transaksi">
                      <strong>{r.no}</strong>
                    </td>
                    <td data-label="Pelanggan">{r.customer}</td>
                    <td data-label="Waktu">{r.time}</td>
                    <td data-label="Status">
                      <Badge variant={r.status === "Lunas" ? "success" : "warning"}>{r.status}</Badge>
                    </td>
                    <td data-label="Total" className="right">
                      {formatRupiah(r.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <section className="mobile-shortcuts">
          <h2>Aksi cepat</h2>
          <div>
            <Link href="/pos">
              Buka POS Kasir <ArrowRight size={14} />
            </Link>
            <Link href="/purchases">
              Buat PO Pabrik <ArrowRight size={14} />
            </Link>
            <Link href="/inventory/stock">
              Cek Stok Gudang <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      </section>
    </div>
  );
}
