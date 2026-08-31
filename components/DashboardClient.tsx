"use client";

import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  PackageCheck,
  ReceiptText,
  ShoppingCart,
  Truck,
  WalletCards,
} from "lucide-react";
import { formatRupiah } from "../lib/utils/format";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

const kpis = [
  { label: "Omset hari ini", value: 18750000, note: "14 nota", tone: "success" },
  { label: "Transaksi POS", value: 42, note: "kasir aktif", tone: "default" },
  { label: "Stok menipis", value: 8, note: "perlu restock", tone: "warning" },
  { label: "Piutang aktif", value: 7420000, note: "5 customer", tone: "secondary" },
];

const quickFlows = [
  { title: "POS kasir", desc: "Tambah item, pilih customer, bayar, stok toko berkurang.", href: "/pos", icon: ShoppingCart },
  { title: "Kelola stok gudang", desc: "Pantau stok per gudang, barang low stock, dan nilai persediaan.", href: "/inventory/stock", icon: Boxes },
  { title: "Dashboard toko", desc: "Owner lihat omset, piutang, pending delivery, dan transaksi terbaru.", href: "/", icon: ReceiptText },
  { title: "Delivery partial", desc: "Order terkirim sebagian dan sisa yang belum jalan tetap terlihat.", href: "/delivery", icon: Truck },
];

const stockRows = [
  { sku: "ITEM-001", item: "Plastik PP 1 kg", toko: 42, gudang: 120, status: "Aman" },
  { sku: "ITEM-014", item: "Cup 12 oz", toko: 8, gudang: 36, status: "Low" },
  { sku: "ITEM-021", item: "Kresek Hitam 24", toko: 12, gudang: 4, status: "Restock" },
];

const transactions = [
  { no: "POS-000184", name: "Pelanggan Umum", type: "POS", amount: 186500, status: "Lunas" },
  { no: "SAL-000091", name: "Toko Berkah Jaya", type: "Grosir", amount: 3420000, status: "Piutang" },
  { no: "PUR-000044", name: "PT Sumber Plastik", type: "Pembelian", amount: 4850000, status: "Partial" },
  { no: "DLV-000027", name: "Minimarket Sejahtera", type: "Delivery", amount: 1840000, status: "8/12 dus" },
];

export default function DashboardClient() {
  return (
    <div className="dashboard-page">
      <section className="dashboard-hero">
        <div>
          <Badge variant="success">langsung masuk app</Badge>
          <h1>Dashboard Kelola Toko</h1>
          <p>
            Fokus demo: POS, stok gudang, penjualan, pembelian, delivery,
            piutang/hutang, dan laporan owner. Semua angka pakai dummy data.
          </p>
        </div>
        <div className="hero-actions">
          <Button asChild size="lg">
            <Link href="/pos">
              Coba POS <ArrowRight size={16} />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/inventory/stock">Lihat Stok</Link>
          </Button>
        </div>
      </section>

      <section className="kpi-grid">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="kpi-card">
            <CardHeader>
              <CardDescription>{kpi.label}</CardDescription>
              <CardTitle>
                {kpi.label.includes("Omset") || kpi.label.includes("Piutang")
                  ? formatRupiah(kpi.value)
                  : kpi.value}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={kpi.tone as "success" | "default" | "warning" | "secondary"}>{kpi.note}</Badge>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="dashboard-grid">
        <Card className="span-7">
          <CardHeader>
            <CardTitle>Alur demo yang ditunjukkan ke client</CardTitle>
            <CardDescription>Empat layar utama cukup untuk menjelaskan MVP.</CardDescription>
          </CardHeader>
          <CardContent className="flow-grid">
            {quickFlows.map((flow) => {
              const Icon = flow.icon;
              return (
                <Link href={flow.href} className="flow-card" key={flow.title}>
                  <div className="flow-icon"><Icon size={18} /></div>
                  <strong>{flow.title}</strong>
                  <span>{flow.desc}</span>
                </Link>
              );
            })}
          </CardContent>
        </Card>

        <Card className="span-5">
          <CardHeader>
            <CardTitle>Ringkasan stok gudang</CardTitle>
            <CardDescription>Dummy stok per lokasi untuk bahan diskusi.</CardDescription>
          </CardHeader>
          <CardContent className="stock-list">
            {stockRows.map((row) => (
              <div className="stock-row" key={row.sku}>
                <div>
                  <span>{row.sku}</span>
                  <strong>{row.item}</strong>
                </div>
                <div className="stock-numbers">
                  <span>Toko {row.toko}</span>
                  <span>Gudang {row.gudang}</span>
                </div>
                <Badge variant={row.status === "Aman" ? "success" : "warning"}>{row.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="dashboard-grid">
        <Card className="span-7">
          <CardHeader>
            <CardTitle>Transaksi terbaru</CardTitle>
            <CardDescription>Sample data untuk menggambarkan kondisi toko hari ini.</CardDescription>
          </CardHeader>
          <CardContent className="transaction-list">
            {transactions.map((trx) => (
              <div className="transaction-row" key={trx.no}>
                <div>
                  <span>{trx.no} · {trx.type}</span>
                  <strong>{trx.name}</strong>
                </div>
                <Badge variant={trx.status === "Lunas" ? "success" : "outline"}>{trx.status}</Badge>
                <b>{formatRupiah(trx.amount)}</b>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="span-5">
          <CardHeader>
            <CardTitle>Yang perlu client lihat</CardTitle>
            <CardDescription>Checklist presentasi demo.</CardDescription>
          </CardHeader>
          <CardContent className="checklist">
            <div><PackageCheck size={16} /> Stok berubah setelah POS/pembelian.</div>
            <div><WalletCards size={16} /> Piutang dan hutang punya status jelas.</div>
            <div><Truck size={16} /> Delivery bisa partial, sisa tetap terlacak.</div>
            <div><ReceiptText size={16} /> Laporan owner memakai angka dummy.</div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
