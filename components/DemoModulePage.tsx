"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatRupiah } from "../lib/utils/format";

export type DemoKind =
  | "customers" | "suppliers" | "salesPeople" | "products" | "categories" | "brands" | "units" | "prices" | "warehouses"
  | "stock" | "stockCard" | "purchases" | "purchaseReturns" | "payables" | "sales" | "delivery" | "salesReturns"
  | "receivables" | "stockTransfers" | "stockIssues" | "repack" | "adjustments" | "cashIn" | "cashOut" | "reports" | "settings";

type DemoRecord = { no: string; name: string; meta: string; amount: number; status: string };
type DemoContent = {
  label: string;
  headline: string;
  subline: string;
  cta: string;
  href: string;
  metrics: [string, string, string];
  story: string[];
  records: DemoRecord[];
  impact: string[];
};

const salesRecords: DemoRecord[] = [
  { no: "POS-000184", name: "Pelanggan Umum", meta: "3 item retail - Toko Utama", amount: 186500, status: "Lunas" },
  { no: "SAL-000091", name: "Retail Partner A", meta: "Grosir tempo 14 hari", amount: 3420000, status: "Piutang" },
  { no: "DLV-000027", name: "Outlet Cabang", meta: "Kirim 8/12 koli", amount: 2760000, status: "Partial" },
];

const CONTENT: Partial<Record<DemoKind, DemoContent>> = {
  sales: {
    label: "Penjualan",
    headline: "Client lihat alur jual dari kasir sampai piutang.",
    subline: "Gunakan contoh retail, grosir, tempo, dan reprint nota dalam satu layar demo.",
    cta: "Buka POS",
    href: "/pos",
    metrics: ["14 nota hari ini", "Rp 18,7 jt omset", "Rp 4,1 jt piutang"],
    story: ["Pilih customer retail atau grosir.", "Harga otomatis mengikuti group customer.", "Pembayaran bisa lunas, partial, atau tempo.", "Nota masuk laporan omset dan laba."],
    records: salesRecords,
    impact: ["Stok berkurang saat POS/direct sale.", "Piutang muncul kalau belum lunas.", "Laba memakai HPP saat transaksi diposting."],
  },
  purchases: {
    label: "Pembelian",
    headline: "Pembelian supplier langsung mengubah stok dan hutang.",
    subline: "Demo cukup pakai satu purchase order contoh, lalu jelaskan efeknya ke gudang dan AP.",
    cta: "Simulasi Pembelian",
    href: "/purchases",
    metrics: ["4 supplier aktif", "Rp 9,8 jt pembelian", "Rp 3,2 jt hutang"],
    story: ["Pilih supplier dan gudang tujuan.", "Input barang multi satuan.", "Post pembelian.", "Stok bertambah dan hutang supplier tercatat."],
    records: [
      { no: "PUR-000044", name: "PT Indofood Sukses Makmur", meta: "Gudang Utama - jatuh tempo 14 hari", amount: 4850000, status: "Partial" },
      { no: "PUR-000045", name: "CV Aqua Golden", meta: "Toko Utama - tunai", amount: 2125000, status: "Lunas" },
      { no: "RET-P-000006", name: "Retur barang penyok", meta: "Mengurangi hutang supplier", amount: 385000, status: "Retur" },
    ],
    impact: ["Stock balance naik di gudang tujuan.", "Moving average cost berubah.", "Hutang supplier muncul sampai dibayar."],
  },
  delivery: {
    label: "Delivery",
    headline: "Order delivery dan partial delivery dibuat mudah dipahami.",
    subline: "Fokus ke barang belum terkirim, bukan form logistik yang terlalu detail.",
    cta: "Lihat Pending",
    href: "/delivery",
    metrics: ["6 order delivery", "18 dus pending", "2 pengiriman hari ini"],
    story: ["Sales order dibuat tanpa potong stok.", "Gudang posting delivery sebagian.", "Sistem hitung sisa belum terkirim.", "Laporan pending delivery berubah."],
    records: [
      { no: "SAL-000088", name: "Outlet Cabang", meta: "Order 12 koli, terkirim 8 koli", amount: 2760000, status: "Partial" },
      { no: "SAL-000089", name: "Distributor Sentosa", meta: "Menunggu jadwal kirim", amount: 6150000, status: "Pending" },
      { no: "DLV-000027", name: "Surat jalan", meta: "Gudang Utama ke Bandung", amount: 1840000, status: "Posted" },
    ],
    impact: ["Stok baru berkurang saat delivery diposting.", "Sisa order terlihat di laporan.", "Surat jalan bisa dicetak ulang."],
  },
  receivables: {
    label: "Piutang",
    headline: "Client bisa paham siapa belum bayar dan sisa tagihannya.",
    subline: "Tampilkan contoh aging ringan, pembayaran partial, dan sisa tagihan.",
    cta: "Bayar Dummy",
    href: "/receivables",
    metrics: ["Rp 7,4 jt piutang", "5 customer tempo", "Rp 1,2 jt dibayar hari ini"],
    story: ["Buka nota outstanding.", "Input pembayaran sebagian.", "Sisa piutang otomatis turun.", "Kas masuk tercatat."],
    records: [
      { no: "SAL-000091", name: "Retail Partner A", meta: "Jatuh tempo 7 hari lagi", amount: 3420000, status: "Belum lunas" },
      { no: "SAL-000086", name: "Warung Bu Sari", meta: "Dibayar sebagian", amount: 980000, status: "Partial" },
      { no: "PAY-C-000031", name: "Pembayaran customer", meta: "Tunai ke kas toko", amount: 500000, status: "Kas masuk" },
    ],
    impact: ["Outstanding invoice turun.", "Cash in otomatis bertambah.", "Laporan angsuran customer update."],
  },
  payables: {
    label: "Hutang Supplier",
    headline: "Invoice, jatuh tempo, dan pembayaran supplier terlihat jelas.",
    subline: "Tidak perlu accounting penuh, yang penting client lihat AP operasional.",
    cta: "Bayar Supplier",
    href: "/payables",
    metrics: ["Rp 5,8 jt hutang", "3 supplier tempo", "1 lewat tempo"],
    story: ["Pilih invoice supplier outstanding.", "Catat pembayaran.", "Hutang berkurang.", "Kas keluar tercatat otomatis."],
    records: [
      { no: "PUR-000044", name: "PT Indofood Sukses Makmur", meta: "Sisa pembayaran", amount: 2350000, status: "Partial" },
      { no: "PUR-000039", name: "Distributor Nasional", meta: "Lewat jatuh tempo 2 hari", amount: 1475000, status: "Overdue" },
      { no: "PAY-S-000014", name: "Pembayaran supplier", meta: "Transfer bank", amount: 750000, status: "Kas keluar" },
    ],
    impact: ["Outstanding purchase turun.", "Cash out tercatat.", "Dashboard hutang berubah."],
  },
  stock: {
    label: "Stok",
    headline: "Stok multi gudang cukup ditampilkan sebagai ringkasan yang gampang dibaca.",
    subline: "Client lihat stok per gudang, barang menipis, dan nilai stok tanpa membuka ledger mentah.",
    cta: "Buka POS",
    href: "/pos",
    metrics: ["28 SKU aktif", "3 gudang", "Rp 42,6 jt nilai stok"],
    story: ["Produk punya satuan stok dasar.", "Harga jual retail/grosir.", "Saldo stok terlihat per gudang.", "Mutasi tercatat di kartu stok."],
    records: [
      { no: "SKU-001", name: "Beras Premium 5 kg", meta: "Toko 42 sak, Gudang 120 sak", amount: 3850000, status: "Aman" },
      { no: "SKU-014", name: "Minyak Goreng 1 L", meta: "Sisa 8 karton di Toko Utama", amount: 960000, status: "Menipis" },
      { no: "SKU-021", name: "Kopi Sachet 10 pcs", meta: "Butuh restock minggu ini", amount: 420000, status: "Low" },
    ],
    impact: ["Semua transaksi stok masuk ledger.", "Saldo gudang selalu terlihat.", "Nilai stok memakai avg cost demo."],
  },
  stockCard: {
    label: "Kartu Stok",
    headline: "Jawab pertanyaan client: barang ini bergerak ke mana?",
    subline: "Movement dibuat ringkas agar audit trail stok langsung kebaca.",
    cta: "Lihat Stok",
    href: "/inventory/stock",
    metrics: ["126 movement", "9 tipe mutasi", "Real-time balance"],
    story: ["Pilih produk.", "Lihat opening, purchase, sale, transfer, retur.", "Balance berjalan terlihat.", "Gudang bisa difilter."],
    records: [
      { no: "OPENING", name: "Stok awal", meta: "Gudang Utama +240 PCS", amount: 1680000, status: "Masuk" },
      { no: "SALE", name: "POS-000184", meta: "Toko Utama -6 PCS", amount: 42000, status: "Keluar" },
      { no: "TRANSFER", name: "TRF-000012", meta: "Gudang Utama ke Toko Utama", amount: 280000, status: "Mutasi" },
    ],
    impact: ["Audit stok gampang dijelaskan.", "Tidak ada stok yang diubah dari client.", "Semua movement punya reference."],
  },
  stockTransfers: {
    label: "Transfer Gudang",
    headline: "Barang pindah dari gudang besar ke toko dalam satu skenario.",
    subline: "Cukup satu contoh transfer agar client paham multi warehouse.",
    cta: "Simulasi Transfer",
    href: "/inventory/transfers",
    metrics: ["3 gudang", "7 transfer minggu ini", "0 pending"],
    story: ["Pilih gudang asal dan tujuan.", "Input barang serta qty.", "Post transfer.", "Saldo asal turun dan tujuan naik."],
    records: [
      { no: "TRF-000012", name: "Gudang Utama -> Toko Utama", meta: "Minyak goreng, kopi sachet", amount: 1280000, status: "Posted" },
      { no: "TRF-000011", name: "Gudang Cadangan -> Gudang Utama", meta: "Restock internal", amount: 840000, status: "Posted" },
      { no: "TRF-000010", name: "Toko Utama -> Gudang Utama", meta: "Barang slow moving", amount: 315000, status: "Posted" },
    ],
    impact: ["Ledger transfer out/in terbentuk.", "Cost barang tetap terbawa.", "Stok per gudang langsung berubah."],
  },
  repack: {
    label: "Repack",
    headline: "Repack digambarkan sebagai pecah barang besar jadi SKU jual kecil.",
    subline: "Ini menggambarkan pecah stok besar jadi SKU jual kecil, misalnya karton ke satuan atau bundle promo.",
    cta: "Simulasi Repack",
    href: "/inventory/repack",
    metrics: ["5 repack bulan ini", "100% alokasi", "2 output SKU"],
    story: ["Ambil input barang dari gudang.", "Tentukan output SKU dan qty.", "Alokasi nilai total 100%.", "Input turun, output naik."],
    records: [
      { no: "RPK-000008", name: "Karton Produk -> Satuan", meta: "Input 2 karton, output 48 pcs", amount: 1260000, status: "Posted" },
      { no: "RPK-000007", name: "Bundle Promo Weekend", meta: "Output siap dijual retail", amount: 780000, status: "Posted" },
      { no: "RPK-000006", name: "Paket Hemat Bulanan", meta: "Alokasi nilai 100%", amount: 240000, status: "Posted" },
    ],
    impact: ["Repack out/in tercatat.", "Harga pokok output terbentuk.", "Bukan sekadar konversi UOM."],
  },
  reports: {
    label: "Laporan",
    headline: "Laporan dibuat sebagai bahan validasi requirement client.",
    subline: "Tampilkan report yang paling sering dipakai owner, admin, finance, dan gudang.",
    cta: "Buka Dashboard",
    href: "/dashboard",
    metrics: ["17 report siap", "CSV export", "Filter tanggal"],
    story: ["Owner lihat dashboard dan laba.", "Admin cek stok dan kartu stok.", "Finance cek hutang/piutang.", "Gudang cek pending delivery."],
    records: [
      { no: "RPT-STOCK", name: "Stock Summary", meta: "Qty, gudang, nilai stok", amount: 42600000, status: "Ready" },
      { no: "RPT-PROFIT", name: "Laba per Nota", meta: "Omset dikurangi HPP snapshot", amount: 3650000, status: "Ready" },
      { no: "RPT-PENDING", name: "Barang Tidak Terkirim", meta: "Order delivery belum full", amount: 1840000, status: "Ready" },
    ],
    impact: ["Client bisa validasi definisi laporan.", "Data dummy mudah dipresentasikan.", "Report production bisa mengikuti format ini."],
  },
};

const fallback: DemoContent = {
  label: "Demo Module",
  headline: "Halaman ini disiapkan sebagai contoh modul operasional.",
  subline: "Fokus demo: client paham data apa yang dikelola, alurnya bagaimana, dan efeknya ke laporan.",
  cta: "Buka Dashboard",
  href: "/dashboard",
  metrics: ["Data dummy", "Flow demo", "Siap feedback"],
  story: ["Lihat contoh master/transaksi.", "Jelaskan hubungan ke stok, kas, hutang, atau piutang.", "Catat feedback client.", "Finalisasi requirement production."],
  records: [
    { no: "DM-001", name: "Contoh data demo", meta: "Data dummy untuk presentasi client", amount: 1250000, status: "Aktif" },
    { no: "DM-002", name: "Simulasi transaksi", meta: "Menggambarkan flow utama", amount: 850000, status: "Ready" },
    { no: "DM-003", name: "Output laporan", meta: "Angka berubah sesuai skenario demo", amount: 420000, status: "Preview" },
  ],
  impact: ["Mengurangi distraksi teknis.", "Client fokus ke proses bisnis.", "Demo tetap bisa dikembangkan ke form lengkap."],
};

export default function DemoModulePage({ kind, title, description }: { kind: DemoKind; title: string; description: string }) {
  const [posted, setPosted] = useState(false);
  const content = useMemo(() => CONTENT[kind] ?? fallback, [kind]);

  return (
    <div className="demo-page">
      <section className="demo-hero">
        <div>
          <span className="demo-kicker">Client demo screen</span>
          <h1>{title || content.label}</h1>
          <p>{description || content.subline}</p>
        </div>
        <div className="demo-actions">
          <Link className="primary-action" href={content.href}>{content.cta}</Link>
          <button onClick={() => setPosted(true)}>{posted ? "Simulasi berhasil" : "Jalankan Dummy"}</button>
        </div>
      </section>

      <section className="demo-focus">
        <div className="focus-copy">
          <span>{content.label}</span>
          <h2>{content.headline}</h2>
          <p>{content.subline}</p>
          {posted && <div className="success-note">Dummy transaction posted: stok, kas, hutang/piutang, dan laporan diperbarui pada skenario demo.</div>}
        </div>
        <div className="focus-metrics">
          {content.metrics.map((metric) => <div key={metric}>{metric}</div>)}
        </div>
      </section>

      <div className="demo-grid">
        <section className="demo-card">
          <div className="card-head"><span>Flow yang dijelaskan</span><strong>4 langkah</strong></div>
          <ol className="flow-list">{content.story.map((step) => <li key={step}>{step}</li>)}</ol>
        </section>
        <section className="demo-card">
          <div className="card-head"><span>Dampak sistem</span><strong>Realtime</strong></div>
          <div className="impact-list">{content.impact.map((item) => <div key={item}>{item}</div>)}</div>
        </section>
      </div>

      <section className="demo-card records-card">
        <div className="card-head"><span>Dummy data untuk presentasi</span><strong>Retail Demo Store</strong></div>
        <div className="record-list">
          {content.records.map((record) => (
            <div className="record-row" key={record.no}>
              <div><span className="record-no">{record.no}</span><h3>{record.name}</h3><p>{record.meta}</p></div>
              <div className="record-side"><strong>{formatRupiah(record.amount)}</strong><span>{record.status}</span></div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
