"use client";

import Link from "next/link";
import { formatRupiah } from "../lib/utils/format";

const kpis = [
  ["Omset hari ini", 18750000, "+14 nota"],
  ["Laba kotor", 3650000, "19,4% margin"],
  ["Piutang aktif", 7420000, "5 customer"],
  ["Hutang supplier", 5860000, "3 jatuh tempo"],
];

const flows = [
  { title: "POS retail", desc: "Pelanggan umum bayar tunai, stok toko langsung berkurang.", href: "/pos" },
  { title: "Sales grosir", desc: "Customer grosir dapat harga khusus dan bisa tempo.", href: "/sales" },
  { title: "Pembelian", desc: "Barang masuk gudang, HPP rata-rata bergerak, hutang tercatat.", href: "/purchases" },
  { title: "Delivery partial", desc: "Order belum potong stok sampai surat jalan diposting.", href: "/delivery" },
  { title: "Repack", desc: "Roll besar dipecah jadi pack kecil dengan alokasi nilai.", href: "/inventory/repack" },
  { title: "Laporan", desc: "Owner cek stok, laba nota, angsuran, dan pending delivery.", href: "/reports" },
];

const activities = [
  ["POS-000184", "Pelanggan Umum", "Lunas", 186500],
  ["SAL-000091", "Toko Berkah Jaya", "Piutang", 3420000],
  ["PUR-000044", "PT Indofood", "Partial", 4850000],
  ["DLV-000027", "Minimarket Sejahtera", "8/12 dus", 1840000],
];

export default function DashboardClient() {
  return (
    <div className="client-dashboard">
      <section className="dash-intro">
        <div>
          <span>Demo workspace</span>
          <h1>Berkah Plastik & Packaging</h1>
          <p>Dashboard ini pakai dummy scenario agar client langsung paham alur: jual, beli, stok, delivery, hutang/piutang, repack, dan laporan.</p>
        </div>
        <Link href="/pos">Mulai dari POS</Link>
      </section>

      <section className="demo-kpis">
        {kpis.map(([label, value, note]) => (
          <div key={String(label)}>
            <span>{label}</span>
            <strong>{formatRupiah(Number(value))}</strong>
            <small>{note}</small>
          </div>
        ))}
      </section>

      <section className="story-panel">
        <div className="story-copy">
          <span>Alur presentasi 7 menit</span>
          <h2>Dari kasir ke laporan owner</h2>
          <p>Jalankan demo dari POS, lanjut ke pembelian, tunjukkan perubahan stok, lalu tutup dengan piutang, hutang, delivery partial, dan laporan.</p>
        </div>
        <div className="story-steps">
          {flows.map((flow, index) => (
            <Link href={flow.href} key={flow.title}>
              <b>{String(index + 1).padStart(2, "0")}</b>
              <strong>{flow.title}</strong>
              <span>{flow.desc}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="demo-card">
          <div className="card-head"><span>Dummy transaksi hari ini</span><strong>Live sample</strong></div>
          <div className="activity-list">
            {activities.map(([no, name, status, amount]) => (
              <div key={String(no)} className="activity-row">
                <div><b>{no}</b><span>{name}</span></div>
                <em>{status}</em>
                <strong>{formatRupiah(Number(amount))}</strong>
              </div>
            ))}
          </div>
        </div>
        <div className="demo-card">
          <div className="card-head"><span>Yang client perlu lihat</span><strong>Checklist</strong></div>
          <div className="impact-list">
            <div>Harga retail/grosir otomatis beda.</div>
            <div>Stok berkurang saat jual dan bertambah saat beli.</div>
            <div>Piutang/hutang bisa dicicil.</div>
            <div>Delivery mendukung kirim sebagian.</div>
            <div>Report mengikuti skenario demo.</div>
          </div>
        </div>
      </section>
    </div>
  );
}
