"use client";

import Link from "next/link";
import { Archive, ArrowRight, Banknote, ReceiptText, ShoppingCart, Truck, WalletCards } from "lucide-react";
import { formatRupiah } from "../lib/utils/format";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

const kpis = [
  { label: "Penjualan Hari Ini", value: 18750000, note: "+12,4%", variant: "success" },
  { label: "Nota POS", value: "42", note: "3 kasir", variant: "default" },
  { label: "Piutang Jatuh Tempo", value: 7420000, note: "5 pelanggan", variant: "warning" },
  { label: "Stok Kritis", value: "8 SKU", note: "perlu restock", variant: "warning" },
];

const shortcuts = [
  { title: "Transaksi POS", desc: "Kasir toko", href: "/pos", icon: ShoppingCart },
  { title: "Pembelian", desc: "Nota supplier", href: "/purchases", icon: ReceiptText },
  { title: "Stok Gudang", desc: "Saldo persediaan", href: "/inventory/stock", icon: Archive },
  { title: "Delivery", desc: "Status pengiriman", href: "/delivery", icon: Truck },
];

const transactions = [
  { no: "POS-000184", customer: "Pelanggan Umum (Walk-in)", channel: "POS Kasir", status: "Lunas", amount: 168000 },
  { no: "SAL-000091", customer: "Warung Makan Bu Aminah", channel: "Grosir", status: "Piutang", amount: 3420000 },
  { no: "PUR-000044", customer: "PT Sinar Joyoboyo Plastik", channel: "Pembelian", status: "Partial", amount: 8450000 },
  { no: "DLV-000027", customer: "Gatotkoco 2 (Krapyak)", channel: "Delivery / Mutasi", status: "12/12 dus", amount: 2640000 },
];

const inventory = [
  { sku: "SKU-ROLL-PE08", item: "Plastik Roll PE Bening 0.8 mm (10 kg)", location: "Toko Utama", qty: "6 roll", status: "Low" },
  { sku: "SKU-BOX-LUNCH-M", item: "Paper Lunch Box Medium Kraft", location: "Gudang Utama", qty: "3 pack", status: "Restock" },
  { sku: "SKU-BUBBLE-50M", item: "Bubble Wrap Roll 50m x 125cm", location: "Toko Utama", qty: "0 roll", status: "Habis" },
  { sku: "SKU-CUP-16OZ", item: "Cup Plastik PP 16oz Oza Slim", location: "Toko Utama", qty: "45 pack", status: "Aman" },
];

const finance = [
  { label: "Kas Masuk", value: 12850000, icon: Banknote },
  { label: "Kas Keluar", value: 4850000, icon: WalletCards },
  { label: "Margin Kotor", value: 3650000, icon: ReceiptText },
];

export default function DashboardClient() {
  return (
    <div className="dashboard-page">
      <section className="page-header">
        <div>
          <span>Dashboard</span>
          <h1>Ringkasan Operasional</h1>
          <p>Monitor penjualan, stok, pembayaran, dan pengiriman toko dalam satu layar.</p>
        </div>
        <div className="header-actions">
          <Button asChild>
            <Link href="/pos">Buka POS</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/reports">Laporan</Link>
          </Button>
        </div>
      </section>

      <section className="kpi-grid">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="kpi-card">
            <CardHeader>
              <CardDescription>{kpi.label}</CardDescription>
              <CardTitle>{typeof kpi.value === "number" ? formatRupiah(kpi.value) : kpi.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={kpi.variant as "success" | "default" | "warning"}>{kpi.note}</Badge>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="dashboard-grid">
        <Card className="span-7">
          <CardHeader>
            <CardTitle>Transaksi Terbaru</CardTitle>
            <CardDescription>Penjualan, pembelian, dan pengiriman terakhir.</CardDescription>
          </CardHeader>
          <CardContent className="data-table compact">
            <table>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Partner</th>
                  <th>Jenis</th>
                  <th>Status</th>
                  <th className="right">Total</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((row) => (
                  <tr key={row.no}>
                    <td data-label="No">{row.no}</td>
                    <td data-label="Partner">{row.customer}</td>
                    <td data-label="Jenis">{row.channel}</td>
                    <td data-label="Status"><Badge variant={row.status === "Lunas" ? "success" : "outline"}>{row.status}</Badge></td>
                    <td data-label="Total" className="right">{formatRupiah(row.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card className="span-5">
          <CardHeader>
            <CardTitle>Akses Cepat</CardTitle>
            <CardDescription>Modul yang paling sering digunakan operator.</CardDescription>
          </CardHeader>
          <CardContent className="shortcut-list">
            {shortcuts.map((item) => {
              const Icon = item.icon;
              return (
                <Link href={item.href} key={item.title}>
                  <Icon size={17} />
                  <div>
                    <strong>{item.title}</strong>
                    <span>{item.desc}</span>
                  </div>
                  <ArrowRight size={15} />
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </section>

      <section className="dashboard-grid">
        <Card className="span-7">
          <CardHeader>
            <CardTitle>Persediaan Perlu Perhatian</CardTitle>
            <CardDescription>Barang dengan saldo rendah atau perlu restock.</CardDescription>
          </CardHeader>
          <CardContent className="data-table compact">
            <table>
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Barang</th>
                  <th>Lokasi</th>
                  <th>Saldo</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((row) => (
                  <tr key={row.sku}>
                    <td data-label="SKU">{row.sku}</td>
                    <td data-label="Barang">{row.item}</td>
                    <td data-label="Lokasi">{row.location}</td>
                    <td data-label="Saldo">{row.qty}</td>
                    <td data-label="Status"><Badge variant={row.status === "Aman" ? "success" : "warning"}>{row.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card className="span-5">
          <CardHeader>
            <CardTitle>Kas & Profitabilitas</CardTitle>
            <CardDescription>Ringkasan arus kas dan margin hari ini.</CardDescription>
          </CardHeader>
          <CardContent className="finance-list">
            {finance.map((row) => {
              const Icon = row.icon;
              return (
                <div key={row.label}>
                  <Icon size={17} />
                  <span>{row.label}</span>
                  <strong>{formatRupiah(row.value)}</strong>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
