"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatRupiah } from "../lib/utils/format";

export type DemoKind =
  | "customers" | "suppliers" | "salesPeople" | "products" | "categories" | "brands" | "units" | "prices" | "warehouses"
  | "stock" | "stockCard" | "purchases" | "purchaseReturns" | "payables" | "sales" | "delivery" | "salesReturns"
  | "receivables" | "stockTransfers" | "stockIssues" | "repack" | "adjustments" | "cashIn" | "cashOut" | "reports" | "settings" | "reprints";

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
  settings: {
    label: "Pengaturan Toko",
    headline: "Identitas toko dan format nota bisa disiapkan dari awal demo.",
    subline: "Tampilkan nama toko, alamat, nomor telepon, header nota, dan footer nota tanpa masuk ke setup teknis.",
    cta: "Buka POS",
    href: "/pos",
    metrics: ["Header nota", "Alamat & Telp", "Footer struk"],
    story: ["Admin mengisi identitas toko.", "Header nota ikut berubah di POS.", "Footer nota dipakai saat cetak ulang.", "Brand toko bisa diganti saat implementasi."],
    records: [
      { no: "STORE", name: "Retail Demo Store", meta: "Jl. Demo Raya No. 10, Jakarta", amount: 0, status: "Aktif" },
      { no: "PHONE", name: "Telepon / WhatsApp", meta: "0812-0000-1234", amount: 0, status: "Tampil di nota" },
      { no: "FOOTER", name: "Footer Nota", meta: "Barang yang sudah dibeli tidak dapat ditukar tanpa nota.", amount: 0, status: "Siap cetak" },
    ],
    impact: ["Client paham nota bisa pakai identitas mereka.", "Demo tidak terkunci ke brand tertentu.", "Format cetak bisa dibahas cepat."],
  },
  customers: {
    label: "Master Pelanggan",
    headline: "Data pelanggan menyimpan kontak dan grup harga.",
    subline: "Field demo mencakup kode, nama, alamat, kota, Telp/WA, dan grup pelanggan.",
    cta: "Buka Penjualan",
    href: "/sales",
    metrics: ["128 pelanggan", "3 grup harga", "12 tempo aktif"],
    story: ["Input kode dan nama pelanggan.", "Lengkapi alamat, kota, dan Telp/WA.", "Pilih grup Retail/Grosir/Tempo.", "Harga POS mengikuti grup pelanggan."],
    records: [
      { no: "CUST-001", name: "Pelanggan Umum", meta: "Jakarta · Retail · 0812-0000-1001", amount: 0, status: "Retail" },
      { no: "CUST-014", name: "Retail Partner A", meta: "Bandung · Grosir · 0812-0000-1014", amount: 3420000, status: "Tempo" },
      { no: "CUST-027", name: "Outlet Cabang", meta: "Bekasi · Tempo · 0812-0000-1027", amount: 1840000, status: "Aktif" },
    ],
    impact: ["Harga jual otomatis beda per grup.", "Piutang bisa ditagih per pelanggan.", "Kontak WA siap untuk follow-up."],
  },
  suppliers: {
    label: "Master Supplier",
    headline: "Supplier siap dipakai untuk pembelian dan hutang.",
    subline: "Field demo mencakup kode, nama, alamat, kota, dan Telp/WA supplier.",
    cta: "Buka Pembelian",
    href: "/purchases",
    metrics: ["42 supplier", "8 kota", "3 TOP aktif"],
    story: ["Input supplier baru.", "Lengkapi alamat, kota, Telp/WA.", "Pakai supplier di nota beli.", "Hutang supplier otomatis terbentuk."],
    records: [
      { no: "SUP-001", name: "Supplier Nasional", meta: "Jakarta · 0812-0000-2001", amount: 2350000, status: "TOP 14" },
      { no: "SUP-009", name: "Distributor Sentosa", meta: "Bandung · 0812-0000-2009", amount: 1475000, status: "TOP 30" },
      { no: "SUP-016", name: "CV Sumber Makmur", meta: "Bekasi · 0812-0000-2016", amount: 0, status: "Tunai" },
    ],
    impact: ["Pembelian lebih cepat.", "Hutang supplier bisa di-aging.", "Riwayat supplier mudah ditelusuri."],
  },
  salesPeople: {
    label: "Master Salesman",
    headline: "Salesman dipakai untuk transaksi penjualan lapangan.",
    subline: "Field demo mencakup kode, nama, alamat, dan nomor HP.",
    cta: "Buka Penjualan",
    href: "/sales",
    metrics: ["9 salesman", "4 area", "32 order"],
    story: ["Admin input data salesman.", "Salesman dipilih di order penjualan.", "Omset bisa dilihat per salesman.", "Piutang tetap terkait ke pelanggan."],
    records: [
      { no: "SLS-001", name: "Andi Pratama", meta: "Jakarta Barat · 0812-0000-3001", amount: 8200000, status: "Aktif" },
      { no: "SLS-002", name: "Rina Lestari", meta: "Jakarta Selatan · 0812-0000-3002", amount: 6150000, status: "Aktif" },
      { no: "SLS-003", name: "Dimas Putra", meta: "Bekasi · 0812-0000-3003", amount: 2760000, status: "Training" },
    ],
    impact: ["Omset bisa dianalisis per sales.", "Order delivery tetap bisa dilacak.", "Client paham role sales di sistem."],
  },
  products: {
    label: "Produk & Inventaris",
    headline: "Barang, multi-unit, HPP, dan harga ecer/grosir masuk ke satu master.",
    subline: "Field demo mencakup kode, nama, kategori, sub-kategori, merk, satuan, HPP, harga ecer, dan harga grosir per grup.",
    cta: "Buka Stok",
    href: "/inventory/stock",
    metrics: ["28 SKU", "Multi-unit", "Harga grup"],
    story: ["Input identitas barang.", "Set kategori, sub-kategori, merk, dan satuan.", "Isi HPP dan harga jual.", "Harga POS mengikuti customer group."],
    records: [
      { no: "SKU-001", name: "Beras Premium 5 kg", meta: "Sembako · Beras · Brand A · sak/pcs", amount: 68500, status: "Aktif" },
      { no: "SKU-014", name: "Minyak Goreng 1 L", meta: "Sembako · Minyak · Brand B · karton/botol", amount: 17000, status: "Low" },
      { no: "SKU-021", name: "Kopi Sachet 10 pcs", meta: "Minuman · Kopi · Brand C · pack/pcs", amount: 14800, status: "Restock" },
    ],
    impact: ["Harga jual tidak manual di kasir.", "HPP siap untuk laporan laba.", "Multi-unit mendukung beli grosir dan jual ecer."],
  },
  categories: {
    label: "Kategori & Sub-Kategori",
    headline: "Kategori dibuat jelas supaya stok dan laporan gampang difilter.",
    subline: "Master ini mencakup kategori barang dan sub-kategori barang.",
    cta: "Buka Produk",
    href: "/master/products",
    metrics: ["7 kategori", "18 sub-kategori", "28 SKU"],
    story: ["Buat kategori utama.", "Tambahkan sub-kategori.", "Pasangkan ke produk.", "Report stok bisa difilter per kategori."],
    records: [
      { no: "CAT-001", name: "Sembako", meta: "Sub: Beras, Minyak, Gula", amount: 0, status: "Aktif" },
      { no: "CAT-002", name: "Minuman", meta: "Sub: Susu, Kopi, Teh", amount: 0, status: "Aktif" },
      { no: "CAT-003", name: "Household", meta: "Sub: Sabun, Pembersih, Tissue", amount: 0, status: "Aktif" },
    ],
    impact: ["Produk lebih mudah dicari.", "Report per kategori siap.", "Sub-kategori masuk requirement demo."],
  },
  warehouses: {
    label: "Master Gudang",
    headline: "Lokasi stok dipisah antara toko, gudang utama, dan cabang.",
    subline: "Field demo mencakup kode gudang, lokasi, dan keterangan.",
    cta: "Buka Stok Gudang",
    href: "/inventory/stock",
    metrics: ["3 lokasi", "Multi gudang", "Saldo realtime"],
    story: ["Buat kode gudang.", "Isi lokasi dan keterangan.", "Pilih gudang saat beli/jual/transfer.", "Saldo stok terlihat per lokasi."],
    records: [
      { no: "WH-001", name: "Toko Utama", meta: "Jakarta · gudang kasir", amount: 0, status: "Aktif" },
      { no: "WH-002", name: "Gudang Utama", meta: "Jakarta · stok besar", amount: 0, status: "Aktif" },
      { no: "WH-003", name: "Gudang Cabang", meta: "Bekasi · buffer stock", amount: 0, status: "Aktif" },
    ],
    impact: ["Stok per lokasi transparan.", "Transfer gudang bisa didemokan.", "POS memakai stok Toko Utama."],
  },
  prices: {
    label: "Harga Ecer & Grosir",
    headline: "Harga jual bisa berbeda berdasarkan grup pelanggan.",
    subline: "Demo menunjukkan harga ecer, grosir, satuan multi-unit, dan minimum qty.",
    cta: "Coba POS",
    href: "/pos",
    metrics: ["Retail", "Grosir", "Tempo"],
    story: ["Pilih produk.", "Set harga per grup pelanggan.", "Pilih satuan jual.", "POS otomatis memakai harga yang benar."],
    records: [
      { no: "PRICE-001", name: "Beras Premium 5 kg", meta: "Retail Rp72.000 · Grosir Rp68.500", amount: 72000, status: "Aktif" },
      { no: "PRICE-014", name: "Minyak Goreng 1 L", meta: "Retail Rp18.500 · Grosir Rp17.000", amount: 18500, status: "Aktif" },
      { no: "PRICE-021", name: "Kopi Sachet 10 pcs", meta: "Retail Rp16.500 · Grosir Rp14.800", amount: 16500, status: "Aktif" },
    ],
    impact: ["Kasir tidak salah pilih harga.", "Harga grosir bisa dikunci per grup.", "Client bisa validasi skema margin."],
  },
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
    metrics: ["24 report siap", "CSV export", "Filter tanggal"],
    story: ["Owner lihat dashboard, omset, dan laba.", "Admin cek stok, kartu stok, koreksi, dan repack.", "Finance cek hutang/piutang serta angsuran.", "Gudang cek pending delivery dan pengeluaran barang."],
    records: [
      { no: "RPT-INV", name: "Laporan Inventaris", meta: "Stok barang, kartu stok real-time, detail dan rekap koreksi stok", amount: 42600000, status: "Ready" },
      { no: "RPT-PUR", name: "Laporan Pembelian", meta: "Rekap pembelian, retur pembelian, dan angsuran supplier", amount: 9800000, status: "Ready" },
      { no: "RPT-SALES", name: "Laporan Penjualan & Omset", meta: "Rekap penjualan, retur, omset per nota, penjualan kasir", amount: 18750000, status: "Ready" },
      { no: "RPT-FIN", name: "Laporan Keuangan & Profit", meta: "Laba per nota dan rekap angsuran pelanggan", amount: 3650000, status: "Ready" },
      { no: "RPT-OPS", name: "Laporan Operasional & Logistik", meta: "Pengeluaran barang dan barang tidak terkirim", amount: 1840000, status: "Ready" },
    ],
    impact: ["Client bisa validasi definisi laporan.", "Data dummy mudah dipresentasikan.", "Report production bisa mengikuti format ini."],
  },
  reprints: {
    label: "Cetak Ulang Nota",
    headline: "Nota lama bisa dicari dan dicetak ulang tanpa repost transaksi.",
    subline: "Demo mencakup nota penjualan, retur penjualan, pembelian, dan retur pembelian.",
    cta: "Buka Laporan",
    href: "/reports",
    metrics: ["Nota jual", "Nota retur", "Nota beli"],
    story: ["Cari nomor nota.", "Preview detail transaksi.", "Klik cetak ulang.", "Sistem tidak mengubah stok/kas karena hanya reprint."],
    records: [
      { no: "POS-000184", name: "Cetak ulang Nota Penjualan", meta: "Kasir · pelanggan umum", amount: 186500, status: "Printable" },
      { no: "RET-S-000011", name: "Cetak ulang Retur Penjualan", meta: "Barang kembali dari pelanggan", amount: 420000, status: "Printable" },
      { no: "PUR-000044", name: "Cetak ulang Nota Pembelian", meta: "Supplier Nasional", amount: 4850000, status: "Printable" },
      { no: "RET-P-000006", name: "Cetak ulang Retur Pembelian", meta: "Pengembalian ke supplier", amount: 385000, status: "Printable" },
    ],
    impact: ["Kasir/admin bisa cetak ulang nota.", "Tidak ada double posting transaksi.", "Requirement cetak ulang terlihat eksplisit."],
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
