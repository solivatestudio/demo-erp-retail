"use client";

import Link from "next/link";
import { ArrowDownRight, ArrowRight, ArrowUpRight, CalendarDays, CreditCard, PackageX, ReceiptText } from "lucide-react";
import { formatRupiah } from "../lib/utils/format";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

const kpis = [
  { label: "Omzet hari ini", value: "Rp18,75 jt", delta: "+12,4%", up: true, caption: "dibanding kemarin" },
  { label: "Laba kotor", value: "Rp4,32 jt", delta: "+8,1%", up: true, caption: "margin 23,0%" },
  { label: "Piutang usaha", value: "Rp37,8 jt", delta: "Rp7,4 jt", up: false, caption: "jatuh tempo minggu ini" },
  { label: "Stok kritis", value: "18 SKU", delta: "+3", up: false, caption: "perlu ditindaklanjuti" },
];
const sales = [42, 49, 46, 61, 56, 67, 64, 77, 72, 86, 81, 94, 89, 104];
const outlets = [{name:"Toko Utama",value:48,color:"#1d4ed8"},{name:"Outlet Cibubur",value:31,color:"#60a5fa"},{name:"Outlet Depok",value:21,color:"#bfdbfe"}];
const transactions = [
  { no: "INV-260831-239", customer: "Pelanggan Umum", time: "14:42", status: "Lunas", amount: 1865000 },
  { no: "INV-260831-238", customer: "CV Mitra Sejahtera", time: "14:18", status: "Tempo", amount: 4930000 },
  { no: "INV-260831-237", customer: "Toko Berkah Jaya", time: "13:55", status: "Lunas", amount: 930000 },
  { no: "INV-260831-236", customer: "PT Nusantara Niaga", time: "13:31", status: "Lunas", amount: 2745000 },
];
const attention = [
  { icon: PackageX, title: "18 produk stok kritis", note: "5 produk sudah habis di Toko Utama", href: "/inventory/stock", tone: "danger" },
  { icon: CreditCard, title: "7 piutang jatuh tempo", note: "Total tagihan Rp7.420.000", href: "/receivables", tone: "warning" },
  { icon: ReceiptText, title: "4 pembelian belum lunas", note: "Jatuh tempo dalam 3 hari", href: "/payables", tone: "neutral" },
];

export default function DashboardClient() {
  const points = sales.map((v,i)=>`${(i/(sales.length-1))*100},${100-((v-35)/75)*100}`).join(" ");
  return <div className="dashboard-page owner-dashboard">
    <section className="owner-heading"><div><h1>Selamat sore, Pak Okky</h1><p>Berikut ringkasan operasional bisnis Anda hari ini.</p></div><div className="date-control"><CalendarDays size={15}/><span>31 Agustus 2026</span></div></section>
    <section className="kpi-grid owner-kpis">{kpis.map((k)=><Card key={k.label} className="kpi-card"><CardHeader><CardDescription>{k.label}</CardDescription><CardTitle>{k.value}</CardTitle></CardHeader><CardContent><span className={k.up?"trend-up":"trend-alert"}>{k.up?<ArrowUpRight size={13}/>:<ArrowDownRight size={13}/>} {k.delta}</span><small>{k.caption}</small></CardContent></Card>)}</section>
    <section className="analytics-grid">
      <Card className="sales-chart"><CardHeader><div><CardTitle>Penjualan 14 hari</CardTitle><CardDescription>Performa omzet seluruh outlet</CardDescription></div><strong>Rp214,8 jt <small>+14,2%</small></strong></CardHeader><CardContent><div className="chart-y"><span>30 jt</span><span>20 jt</span><span>10 jt</span><span>0</span></div><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-label="Grafik penjualan"><defs><linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2563eb" stopOpacity=".22"/><stop offset="1" stopColor="#2563eb" stopOpacity="0"/></linearGradient></defs><polygon points={`0,100 ${points} 100,100`} fill="url(#salesFill)"/><polyline points={points} fill="none" stroke="#2563eb" strokeWidth="2" vectorEffect="non-scaling-stroke"/></svg><div className="chart-x"><span>18 Agu</span><span>22 Agu</span><span>26 Agu</span><span>31 Agu</span></div></CardContent></Card>
      <Card className="outlet-chart"><CardHeader><CardTitle>Penjualan per outlet</CardTitle><CardDescription>Kontribusi omzet bulan ini</CardDescription></CardHeader><CardContent><div className="donut"/><div className="outlet-total"><strong>Rp482,6 jt</strong><span>Total omzet</span></div><div className="outlet-legend">{outlets.map(o=><div key={o.name}><i style={{background:o.color}}/><span>{o.name}</span><strong>{o.value}%</strong></div>)}</div></CardContent></Card>
    </section>
    <section className="dashboard-grid lower-grid">
      <Card className="span-5 attention-card"><CardHeader><CardTitle>Perlu perhatian</CardTitle><CardDescription>Prioritas operasional yang perlu ditindaklanjuti</CardDescription></CardHeader><CardContent>{attention.map(a=>{const Icon=a.icon;return <Link href={a.href} key={a.title} className={`attention-row ${a.tone}`}><span><Icon size={17}/></span><div><strong>{a.title}</strong><small>{a.note}</small></div><ArrowRight size={15}/></Link>})}</CardContent></Card>
      <Card className="span-7"><CardHeader className="section-heading"><div><CardTitle>Transaksi terbaru</CardTitle><CardDescription>Pembaruan transaksi dari seluruh outlet</CardDescription></div><Button asChild variant="ghost" size="sm"><Link href="/sales">Lihat semua <ArrowRight size={14}/></Link></Button></CardHeader><CardContent className="data-table compact"><table><thead><tr><th>Nomor transaksi</th><th>Pelanggan</th><th>Waktu</th><th>Status</th><th className="right">Total</th></tr></thead><tbody>{transactions.map(r=><tr key={r.no}><td data-label="Transaksi"><strong>{r.no}</strong></td><td data-label="Pelanggan">{r.customer}</td><td data-label="Waktu">{r.time}</td><td data-label="Status"><Badge variant={r.status==="Lunas"?"success":"warning"}>{r.status}</Badge></td><td data-label="Total" className="right">{formatRupiah(r.amount)}</td></tr>)}</tbody></table></CardContent></Card>
    </section>
  </div>;
}
