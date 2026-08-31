"use client";

import { useMemo, useState } from "react";
import { Download, Plus, Printer, Search, Upload } from "lucide-react";
import { formatRupiah } from "../lib/utils/format";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

export type DemoKind =
  | "customers" | "suppliers" | "salesPeople" | "products" | "categories" | "brands" | "units" | "prices" | "warehouses"
  | "stock" | "stockCard" | "purchases" | "purchaseReturns" | "payables" | "sales" | "delivery" | "salesReturns"
  | "receivables" | "stockTransfers" | "stockIssues" | "repack" | "adjustments" | "cashIn" | "cashOut" | "reports" | "settings" | "reprints";

type Row = Record<string, string | number>;
type ModuleConfig = {
  section: string;
  primaryAction: string;
  stats: { label: string; value: string; status?: string }[];
  columns: string[];
  rows: Row[];
  sideTitle: string;
  sideItems: string[];
};

const commonRows = {
  products: [
    { kode: "SKU-001", nama: "Beras Premium 5 kg", kategori: "Sembako / Beras", merk: "Brand A", satuan: "sak / pcs", hpp: 68500, ecer: 72000, grosir: 68500, status: "Aktif" },
    { kode: "SKU-014", nama: "Minyak Goreng 1 L", kategori: "Sembako / Minyak", merk: "Brand B", satuan: "karton / botol", hpp: 17000, ecer: 18500, grosir: 17000, status: "Low" },
    { kode: "SKU-021", nama: "Kopi Sachet 10 pcs", kategori: "Minuman / Kopi", merk: "Brand C", satuan: "pack / pcs", hpp: 14800, ecer: 16500, grosir: 14800, status: "Restock" },
  ],
  sales: [
    { no: "POS-000184", tanggal: "31/08/2026", pelanggan: "Pelanggan Umum", jenis: "POS", gudang: "Toko Utama", total: 186500, status: "Lunas" },
    { no: "SAL-000091", tanggal: "31/08/2026", pelanggan: "Retail Partner A", jenis: "Grosir", gudang: "Gudang Utama", total: 3420000, status: "Piutang" },
    { no: "DLV-000027", tanggal: "31/08/2026", pelanggan: "Outlet Cabang", jenis: "Delivery", gudang: "Gudang Utama", total: 1840000, status: "Partial" },
  ],
  purchases: [
    { no: "PUR-000044", tanggal: "31/08/2026", supplier: "Supplier Nasional", faktur: "INV-8841", top: "14 hari", gudang: "Gudang Utama", total: 4850000, status: "Partial" },
    { no: "PUR-000045", tanggal: "31/08/2026", supplier: "Distributor Sentosa", faktur: "INV-8842", top: "Tunai", gudang: "Toko Utama", total: 2125000, status: "Lunas" },
    { no: "PUR-000046", tanggal: "30/08/2026", supplier: "CV Sumber Makmur", faktur: "INV-8837", top: "30 hari", gudang: "Gudang Cabang", total: 3650000, status: "Open" },
  ],
};

const CONFIG: Partial<Record<DemoKind, ModuleConfig>> = {
  settings: {
    section: "System",
    primaryAction: "Simpan Pengaturan",
    stats: [{ label: "Profil Toko", value: "Lengkap" }, { label: "Template Nota", value: "Aktif" }, { label: "Printer", value: "2 device" }],
    columns: ["kode", "pengaturan", "nilai", "status"],
    rows: [
      { kode: "STORE_NAME", pengaturan: "Nama Toko", nilai: "RetailOS", status: "Aktif" },
      { kode: "STORE_ADDRESS", pengaturan: "Alamat", nilai: "Jl. Operasional No. 10, Jakarta", status: "Aktif" },
      { kode: "RECEIPT_FOOTER", pengaturan: "Footer Nota", nilai: "Terima kasih atas kunjungan Anda.", status: "Aktif" },
    ],
    sideTitle: "Format Nota",
    sideItems: ["Header nama, alamat, dan nomor telepon", "Footer nota penjualan", "Nomor transaksi otomatis", "Cetak ulang tanpa repost"],
  },
  suppliers: {
    section: "Master",
    primaryAction: "Tambah Supplier",
    stats: [{ label: "Supplier Aktif", value: "42" }, { label: "Kota", value: "8" }, { label: "Hutang Open", value: "Rp 5,8 jt", status: "warning" }],
    columns: ["kode", "nama", "alamat", "kota", "telp", "status"],
    rows: [
      { kode: "SUP-001", nama: "Supplier Nasional", alamat: "Jl. Industri 12", kota: "Jakarta", telp: "0812-0000-2001", status: "TOP 14" },
      { kode: "SUP-009", nama: "Distributor Sentosa", alamat: "Jl. Logistik 8", kota: "Bandung", telp: "0812-0000-2009", status: "TOP 30" },
      { kode: "SUP-016", nama: "CV Sumber Makmur", alamat: "Jl. Niaga 4", kota: "Bekasi", telp: "0812-0000-2016", status: "Tunai" },
    ],
    sideTitle: "Field Supplier",
    sideItems: ["Kode supplier", "Nama dan alamat", "Kota", "Telepon / WhatsApp", "Termin pembayaran"],
  },
  customers: {
    section: "Master",
    primaryAction: "Tambah Pelanggan",
    stats: [{ label: "Pelanggan", value: "128" }, { label: "Grup Harga", value: "3" }, { label: "Piutang", value: "Rp 7,4 jt", status: "warning" }],
    columns: ["kode", "nama", "alamat", "kota", "telp", "grup", "status"],
    rows: [
      { kode: "CUST-001", nama: "Pelanggan Umum", alamat: "Walk-in", kota: "Jakarta", telp: "-", grup: "Retail", status: "Aktif" },
      { kode: "CUST-014", nama: "Retail Partner A", alamat: "Jl. Niaga 21", kota: "Bandung", telp: "0812-0000-1014", grup: "Grosir", status: "Tempo" },
      { kode: "CUST-027", nama: "Outlet Cabang", alamat: "Jl. Raya 9", kota: "Bekasi", telp: "0812-0000-1027", grup: "Tempo", status: "Aktif" },
    ],
    sideTitle: "Field Pelanggan",
    sideItems: ["Kode pelanggan", "Alamat dan kota", "Telepon / WhatsApp", "Grup pelanggan", "Limit dan status piutang"],
  },
  salesPeople: {
    section: "Master",
    primaryAction: "Tambah Salesman",
    stats: [{ label: "Salesman", value: "9" }, { label: "Area", value: "4" }, { label: "Order Bulan Ini", value: "124" }],
    columns: ["kode", "nama", "alamat", "hp", "area", "status"],
    rows: [
      { kode: "SLS-001", nama: "Andi Pratama", alamat: "Jakarta Barat", hp: "0812-0000-3001", area: "Barat", status: "Aktif" },
      { kode: "SLS-002", nama: "Rina Lestari", alamat: "Jakarta Selatan", hp: "0812-0000-3002", area: "Selatan", status: "Aktif" },
      { kode: "SLS-003", nama: "Dimas Putra", alamat: "Bekasi", hp: "0812-0000-3003", area: "Bekasi", status: "Training" },
    ],
    sideTitle: "Komisi & Area",
    sideItems: ["Mapping area salesman", "Riwayat transaksi", "Omset per salesman", "Customer assignment"],
  },
  products: {
    section: "Inventaris",
    primaryAction: "Tambah Barang",
    stats: [{ label: "SKU Aktif", value: "28" }, { label: "Kategori", value: "7" }, { label: "Nilai Stok", value: "Rp 42,6 jt" }],
    columns: ["kode", "nama", "kategori", "merk", "satuan", "hpp", "ecer", "grosir", "status"],
    rows: commonRows.products,
    sideTitle: "Harga & Satuan",
    sideItems: ["Multi-unit pembelian dan penjualan", "HPP berjalan", "Harga ecer", "Harga grosir per grup pelanggan"],
  },
  categories: {
    section: "Inventaris",
    primaryAction: "Tambah Kategori",
    stats: [{ label: "Kategori", value: "7" }, { label: "Sub-Kategori", value: "18" }, { label: "SKU Terkait", value: "28" }],
    columns: ["kode", "kategori", "subKategori", "jumlahSku", "status"],
    rows: [
      { kode: "CAT-001", kategori: "Sembako", subKategori: "Beras, Minyak, Gula", jumlahSku: 11, status: "Aktif" },
      { kode: "CAT-002", kategori: "Minuman", subKategori: "Susu, Kopi, Teh", jumlahSku: 8, status: "Aktif" },
      { kode: "CAT-003", kategori: "Household", subKategori: "Sabun, Pembersih, Tissue", jumlahSku: 9, status: "Aktif" },
    ],
    sideTitle: "Struktur Produk",
    sideItems: ["Kategori utama", "Sub-kategori", "Merk", "Filter laporan stok"],
  },
  warehouses: {
    section: "Inventaris",
    primaryAction: "Tambah Gudang",
    stats: [{ label: "Lokasi", value: "3" }, { label: "Transfer", value: "7" }, { label: "Stok Aktif", value: "28 SKU" }],
    columns: ["kode", "lokasi", "keterangan", "sku", "status"],
    rows: [
      { kode: "WH-001", lokasi: "Toko Utama", keterangan: "Stok kasir", sku: 24, status: "Aktif" },
      { kode: "WH-002", lokasi: "Gudang Utama", keterangan: "Stok pembelian", sku: 28, status: "Aktif" },
      { kode: "WH-003", lokasi: "Gudang Cabang", keterangan: "Buffer stock", sku: 16, status: "Aktif" },
    ],
    sideTitle: "Lokasi Stok",
    sideItems: ["Kode gudang", "Lokasi", "Keterangan", "Saldo per gudang"],
  },
  stock: {
    section: "Inventaris",
    primaryAction: "Koreksi Stok",
    stats: [{ label: "SKU Aktif", value: "28" }, { label: "Stok Kritis", value: "8", status: "warning" }, { label: "Nilai Stok", value: "Rp 42,6 jt" }],
    columns: ["kode", "nama", "kategori", "toko", "gudang", "hpp", "status"],
    rows: [
      { kode: "SKU-001", nama: "Beras Premium 5 kg", kategori: "Sembako", toko: "42 sak", gudang: "120 sak", hpp: 68500, status: "Aman" },
      { kode: "SKU-014", nama: "Minyak Goreng 1 L", kategori: "Sembako", toko: "8 karton", gudang: "36 karton", hpp: 17000, status: "Low" },
      { kode: "SKU-021", nama: "Kopi Sachet 10 pcs", kategori: "Minuman", toko: "12 pack", gudang: "4 pack", hpp: 14800, status: "Restock" },
    ],
    sideTitle: "Kontrol Persediaan",
    sideItems: ["Saldo per gudang", "Kartu stok real-time", "Nilai stok berdasarkan HPP", "Minimum stock alert"],
  },
  sales: {
    section: "Penjualan",
    primaryAction: "Buat Penjualan",
    stats: [{ label: "Omset", value: "Rp 18,7 jt" }, { label: "Nota", value: "14" }, { label: "Piutang", value: "Rp 4,1 jt", status: "warning" }],
    columns: ["no", "tanggal", "pelanggan", "jenis", "gudang", "total", "status"],
    rows: commonRows.sales,
    sideTitle: "Status Penjualan",
    sideItems: ["POS tunai", "Penjualan grosir", "Delivery order", "Retur dan piutang"],
  },
  purchases: {
    section: "Pembelian",
    primaryAction: "Buat Pembelian",
    stats: [{ label: "Pembelian", value: "Rp 9,8 jt" }, { label: "Supplier", value: "4" }, { label: "Hutang", value: "Rp 3,2 jt", status: "warning" }],
    columns: ["no", "tanggal", "supplier", "faktur", "top", "gudang", "total", "status"],
    rows: commonRows.purchases,
    sideTitle: "Nota Pembelian",
    sideItems: ["Nomor faktur supplier", "TOP pembayaran", "Gudang tujuan", "Item, qty, satuan, harga beli"],
  },
  delivery: {
    section: "Logistik",
    primaryAction: "Buat Surat Jalan",
    stats: [{ label: "Order Kirim", value: "6" }, { label: "Pending", value: "18 koli", status: "warning" }, { label: "Terkirim", value: "2 hari ini" }],
    columns: ["no", "tanggal", "pelanggan", "alamat", "qtyOrder", "qtyKirim", "status"],
    rows: [
      { no: "DLV-000027", tanggal: "31/08/2026", pelanggan: "Outlet Cabang", alamat: "Bekasi", qtyOrder: "12 koli", qtyKirim: "8 koli", status: "Partial" },
      { no: "DLV-000028", tanggal: "31/08/2026", pelanggan: "Retail Partner A", alamat: "Bandung", qtyOrder: "7 koli", qtyKirim: "7 koli", status: "Selesai" },
      { no: "DLV-000029", tanggal: "30/08/2026", pelanggan: "Distributor Sentosa", alamat: "Jakarta", qtyOrder: "9 koli", qtyKirim: "0", status: "Pending" },
    ],
    sideTitle: "Pengiriman",
    sideItems: ["Kirim penuh atau sebagian", "Sisa barang tidak terkirim", "Surat jalan", "Cetak ulang dokumen"],
  },
  purchaseReturns: {
    section: "Pembelian",
    primaryAction: "Buat Retur",
    stats: [{ label: "Retur Bulan Ini", value: "6" }, { label: "Nilai Retur", value: "Rp 1,2 jt" }, { label: "Open", value: "1", status: "warning" }],
    columns: ["no", "tanggal", "supplier", "notaAsal", "gudang", "total", "status"],
    rows: [
      { no: "RET-P-000006", tanggal: "29/08/2026", supplier: "Distributor Sentosa", notaAsal: "PUR-000039", gudang: "Gudang Utama", total: 385000, status: "Posted" },
      { no: "RET-P-000007", tanggal: "30/08/2026", supplier: "Supplier Nasional", notaAsal: "PUR-000044", gudang: "Toko Utama", total: 240000, status: "Draft" },
    ],
    sideTitle: "Retur Supplier",
    sideItems: ["Referensi nota beli", "Qty retur dan satuan", "Stok keluar", "Penyesuaian hutang"],
  },
  salesReturns: {
    section: "Penjualan",
    primaryAction: "Buat Retur",
    stats: [{ label: "Retur Bulan Ini", value: "11" }, { label: "Nilai Retur", value: "Rp 2,1 jt" }, { label: "Diproses", value: "2", status: "warning" }],
    columns: ["no", "tanggal", "pelanggan", "notaAsal", "gudang", "total", "status"],
    rows: [
      { no: "RET-S-000011", tanggal: "30/08/2026", pelanggan: "Retail Partner A", notaAsal: "SAL-000091", gudang: "Toko Utama", total: 420000, status: "Posted" },
      { no: "RET-S-000012", tanggal: "31/08/2026", pelanggan: "Pelanggan Umum", notaAsal: "POS-000184", gudang: "Toko Utama", total: 86500, status: "Draft" },
    ],
    sideTitle: "Retur Pelanggan",
    sideItems: ["Referensi nota jual", "Barang masuk kembali", "Penyesuaian piutang", "Cetak nota retur"],
  },
  payables: {
    section: "Keuangan",
    primaryAction: "Bayar Supplier",
    stats: [{ label: "Total Hutang", value: "Rp 5,8 jt", status: "warning" }, { label: "Jatuh Tempo", value: "3 invoice" }, { label: "Dibayar Hari Ini", value: "Rp 750 rb" }],
    columns: ["no", "supplier", "jatuhTempo", "total", "terbayar", "sisa", "status"],
    rows: [
      { no: "PUR-000044", supplier: "Supplier Nasional", jatuhTempo: "14/09/2026", total: 4850000, terbayar: 2500000, sisa: 2350000, status: "Partial" },
      { no: "PUR-000039", supplier: "Distributor Sentosa", jatuhTempo: "29/08/2026", total: 1475000, terbayar: 0, sisa: 1475000, status: "Overdue" },
    ],
    sideTitle: "Pembayaran Supplier",
    sideItems: ["Angsuran bertahap", "Sisa hutang", "Jatuh tempo", "Kas keluar"],
  },
  receivables: {
    section: "Keuangan",
    primaryAction: "Terima Pembayaran",
    stats: [{ label: "Total Piutang", value: "Rp 7,4 jt", status: "warning" }, { label: "Customer Tempo", value: "5" }, { label: "Masuk Hari Ini", value: "Rp 1,2 jt" }],
    columns: ["no", "pelanggan", "jatuhTempo", "total", "terbayar", "sisa", "status"],
    rows: [
      { no: "SAL-000091", pelanggan: "Retail Partner A", jatuhTempo: "07/09/2026", total: 3420000, terbayar: 0, sisa: 3420000, status: "Open" },
      { no: "SAL-000086", pelanggan: "Outlet Cabang", jatuhTempo: "02/09/2026", total: 1980000, terbayar: 1000000, sisa: 980000, status: "Partial" },
    ],
    sideTitle: "Penerimaan Piutang",
    sideItems: ["Angsuran pelanggan", "Sisa tagihan", "Aging piutang", "Kas masuk"],
  },
  stockCard: {
    section: "Inventaris",
    primaryAction: "Filter Kartu Stok",
    stats: [{ label: "Movement", value: "126" }, { label: "Produk", value: "28" }, { label: "Lokasi", value: "3" }],
    columns: ["tanggal", "referensi", "produk", "gudang", "masuk", "keluar", "saldo"],
    rows: [
      { tanggal: "31/08/2026", referensi: "PUR-000044", produk: "Minyak Goreng 1 L", gudang: "Gudang Utama", masuk: "36 karton", keluar: "-", saldo: "36 karton" },
      { tanggal: "31/08/2026", referensi: "POS-000184", produk: "Beras Premium 5 kg", gudang: "Toko Utama", masuk: "-", keluar: "3 sak", saldo: "42 sak" },
      { tanggal: "30/08/2026", referensi: "TRF-000012", produk: "Kopi Sachet 10 pcs", gudang: "Toko Utama", masuk: "12 pack", keluar: "-", saldo: "12 pack" },
    ],
    sideTitle: "Ledger Stok",
    sideItems: ["Opening balance", "Purchase", "Sale", "Transfer", "Adjustment"],
  },
  stockTransfers: {
    section: "Inventaris",
    primaryAction: "Buat Transfer",
    stats: [{ label: "Transfer", value: "7" }, { label: "Pending", value: "0" }, { label: "Lokasi", value: "3" }],
    columns: ["no", "tanggal", "asal", "tujuan", "item", "total", "status"],
    rows: [
      { no: "TRF-000012", tanggal: "31/08/2026", asal: "Gudang Utama", tujuan: "Toko Utama", item: "2 SKU", total: 1280000, status: "Posted" },
      { no: "TRF-000011", tanggal: "30/08/2026", asal: "Gudang Cabang", tujuan: "Gudang Utama", item: "1 SKU", total: 840000, status: "Posted" },
    ],
    sideTitle: "Mutasi Gudang",
    sideItems: ["Gudang asal", "Gudang tujuan", "Transfer out/in", "Cost tetap terbawa"],
  },
  stockIssues: {
    section: "Operasional",
    primaryAction: "Buat Pengeluaran",
    stats: [{ label: "Pengeluaran", value: "9" }, { label: "Nilai", value: "Rp 1,8 jt" }, { label: "Draft", value: "1", status: "warning" }],
    columns: ["no", "tanggal", "gudang", "keperluan", "item", "total", "status"],
    rows: [
      { no: "OUT-000019", tanggal: "31/08/2026", gudang: "Toko Utama", keperluan: "Rusak", item: "1 SKU", total: 125000, status: "Posted" },
      { no: "OUT-000020", tanggal: "31/08/2026", gudang: "Gudang Utama", keperluan: "Sample", item: "2 SKU", total: 340000, status: "Draft" },
    ],
    sideTitle: "Non-Penjualan",
    sideItems: ["Barang rusak", "Sample", "Hilang", "Kebutuhan internal"],
  },
  repack: {
    section: "Inventaris",
    primaryAction: "Buat Repack",
    stats: [{ label: "Repack", value: "5" }, { label: "Output SKU", value: "12" }, { label: "Draft", value: "1", status: "warning" }],
    columns: ["no", "tanggal", "gudang", "input", "output", "nilai", "status"],
    rows: [
      { no: "RPK-000008", tanggal: "31/08/2026", gudang: "Gudang Utama", input: "2 karton", output: "48 pcs", nilai: 1260000, status: "Posted" },
      { no: "RPK-000009", tanggal: "31/08/2026", gudang: "Toko Utama", input: "3 SKU", output: "1 bundle", nilai: 780000, status: "Draft" },
    ],
    sideTitle: "Konversi Barang",
    sideItems: ["Input SKU", "Output SKU", "Alokasi nilai", "Stok keluar/masuk"],
  },
  adjustments: {
    section: "Inventaris",
    primaryAction: "Buat Koreksi",
    stats: [{ label: "Koreksi", value: "8" }, { label: "Selisih Qty", value: "14 pcs" }, { label: "Butuh Review", value: "1", status: "warning" }],
    columns: ["no", "tanggal", "produk", "gudang", "qtySistem", "qtyFisik", "status"],
    rows: [
      { no: "ADJ-000021", tanggal: "31/08/2026", produk: "Minyak Goreng 1 L", gudang: "Toko Utama", qtySistem: "10", qtyFisik: "8", status: "Posted" },
      { no: "ADJ-000022", tanggal: "31/08/2026", produk: "Kopi Sachet 10 pcs", gudang: "Gudang Utama", qtySistem: "4", qtyFisik: "6", status: "Review" },
    ],
    sideTitle: "Kontrol Koreksi",
    sideItems: ["Qty sistem", "Qty fisik", "Alasan koreksi", "Update HPP aman"],
  },
  cashIn: {
    section: "Keuangan",
    primaryAction: "Tambah Kas Masuk",
    stats: [{ label: "Kas Masuk", value: "Rp 12,8 jt" }, { label: "Transaksi", value: "18" }, { label: "Manual", value: "3" }],
    columns: ["no", "tanggal", "sumber", "keterangan", "jumlah", "status"],
    rows: [
      { no: "CIN-000031", tanggal: "31/08/2026", sumber: "Pembayaran Customer", keterangan: "SAL-000086", jumlah: 500000, status: "Posted" },
      { no: "CIN-000032", tanggal: "31/08/2026", sumber: "Setoran Kasir", keterangan: "Shift pagi", jumlah: 7250000, status: "Posted" },
    ],
    sideTitle: "Sumber Kas",
    sideItems: ["Pembayaran piutang", "Setoran kasir", "Penerimaan manual", "Referensi transaksi"],
  },
  cashOut: {
    section: "Keuangan",
    primaryAction: "Tambah Kas Keluar",
    stats: [{ label: "Kas Keluar", value: "Rp 4,8 jt" }, { label: "Transaksi", value: "11" }, { label: "Supplier", value: "4" }],
    columns: ["no", "tanggal", "tujuan", "keterangan", "jumlah", "status"],
    rows: [
      { no: "COUT-000014", tanggal: "31/08/2026", tujuan: "Supplier Nasional", keterangan: "Angsuran PUR-000044", jumlah: 750000, status: "Posted" },
      { no: "COUT-000015", tanggal: "31/08/2026", tujuan: "Operasional", keterangan: "Biaya pengiriman", jumlah: 325000, status: "Posted" },
    ],
    sideTitle: "Pengeluaran",
    sideItems: ["Bayar supplier", "Biaya operasional", "Referensi hutang", "Kas/bank"],
  },
  brands: {
    section: "Inventaris",
    primaryAction: "Tambah Merk",
    stats: [{ label: "Merk", value: "16" }, { label: "SKU", value: "28" }, { label: "Aktif", value: "16" }],
    columns: ["kode", "merk", "kategori", "sku", "status"],
    rows: [
      { kode: "BR-001", merk: "Brand A", kategori: "Sembako", sku: 8, status: "Aktif" },
      { kode: "BR-002", merk: "Brand B", kategori: "Sembako", sku: 6, status: "Aktif" },
      { kode: "BR-003", merk: "Brand C", kategori: "Minuman", sku: 5, status: "Aktif" },
    ],
    sideTitle: "Merk Produk",
    sideItems: ["Kode merk", "Nama merk", "Kategori terkait", "Filter produk"],
  },
  units: {
    section: "Inventaris",
    primaryAction: "Tambah Satuan",
    stats: [{ label: "Satuan", value: "9" }, { label: "Multi-unit", value: "12 SKU" }, { label: "Konversi", value: "Aktif" }],
    columns: ["kode", "satuan", "konversi", "digunakanPada", "status"],
    rows: [
      { kode: "PCS", satuan: "Pieces", konversi: "1 pcs", digunakanPada: "Penjualan", status: "Aktif" },
      { kode: "KRT", satuan: "Karton", konversi: "24 pcs", digunakanPada: "Pembelian", status: "Aktif" },
      { kode: "DUS", satuan: "Dus", konversi: "12 pcs", digunakanPada: "Pembelian/Penjualan", status: "Aktif" },
    ],
    sideTitle: "Konversi UOM",
    sideItems: ["Satuan dasar", "Satuan beli", "Satuan jual", "Konversi ke stok"],
  },
  reports: {
    section: "Reporting",
    primaryAction: "Generate Laporan",
    stats: [{ label: "Laporan", value: "24" }, { label: "Export", value: "CSV/XLS" }, { label: "Periode", value: "Agustus 2026" }],
    columns: ["kode", "laporan", "kategori", "periode", "status"],
    rows: [
      { kode: "RPT-INV", laporan: "Stok Barang & Kartu Stok", kategori: "Inventaris", periode: "Realtime", status: "Ready" },
      { kode: "RPT-PUR", laporan: "Rekap Pembelian & Retur", kategori: "Pembelian", periode: "Bulanan", status: "Ready" },
      { kode: "RPT-SALES", laporan: "Penjualan, Omset, Kasir", kategori: "Penjualan", periode: "Harian", status: "Ready" },
      { kode: "RPT-FIN", laporan: "Laba Per Nota & Angsuran", kategori: "Keuangan", periode: "Bulanan", status: "Ready" },
      { kode: "RPT-OPS", laporan: "Pengeluaran Barang & Pending Kirim", kategori: "Operasional", periode: "Mingguan", status: "Ready" },
    ],
    sideTitle: "Kategori Laporan",
    sideItems: ["Inventaris", "Pembelian", "Penjualan & omset", "Keuangan & profitabilitas", "Operasional & logistik"],
  },
  reprints: {
    section: "Dokumen",
    primaryAction: "Cari Nota",
    stats: [{ label: "Nota Jual", value: "184" }, { label: "Nota Beli", value: "44" }, { label: "Retur", value: "17" }],
    columns: ["no", "tanggal", "tipe", "partner", "total", "status"],
    rows: [
      { no: "POS-000184", tanggal: "31/08/2026", tipe: "Nota Penjualan", partner: "Pelanggan Umum", total: 186500, status: "Printable" },
      { no: "RET-S-000011", tanggal: "30/08/2026", tipe: "Retur Penjualan", partner: "Retail Partner A", total: 420000, status: "Printable" },
      { no: "PUR-000044", tanggal: "31/08/2026", tipe: "Nota Pembelian", partner: "Supplier Nasional", total: 4850000, status: "Printable" },
      { no: "RET-P-000006", tanggal: "29/08/2026", tipe: "Retur Pembelian", partner: "Distributor Sentosa", total: 385000, status: "Printable" },
    ],
    sideTitle: "Jenis Dokumen",
    sideItems: ["Nota Penjualan", "Nota Retur Penjualan", "Nota Pembelian", "Nota Retur Pembelian"],
  },
};

const fallback: ModuleConfig = {
  section: "Operasional",
  primaryAction: "Tambah Data",
  stats: [{ label: "Data Aktif", value: "36" }, { label: "Open", value: "8" }, { label: "Selesai", value: "28" }],
  columns: ["no", "tanggal", "nama", "referensi", "total", "status"],
  rows: [
    { no: "TRX-0001", tanggal: "31/08/2026", nama: "Transaksi Operasional", referensi: "RetailOS", total: 1250000, status: "Open" },
    { no: "TRX-0002", tanggal: "31/08/2026", nama: "Dokumen Diproses", referensi: "Gudang Utama", total: 850000, status: "Posted" },
    { no: "TRX-0003", tanggal: "30/08/2026", nama: "Riwayat Aktivitas", referensi: "Toko Utama", total: 420000, status: "Selesai" },
  ],
  sideTitle: "Informasi Modul",
  sideItems: ["Pencarian data", "Filter status", "Export laporan", "Cetak dokumen"],
};

function formatCell(key: string, value: string | number) {
  if (typeof value === "number" && ["total", "amount", "hpp", "ecer", "grosir"].includes(key)) {
    return formatRupiah(value);
  }
  return value;
}

function badgeVariant(status?: string) {
  const normalized = (status ?? "").toLowerCase();
  if (["aktif", "lunas", "aman", "selesai", "ready", "printable", "posted"].some((item) => normalized.includes(item))) return "success";
  if (["low", "restock", "pending", "partial", "piutang", "warning", "tempo", "open"].some((item) => normalized.includes(item))) return "warning";
  return "outline";
}

export default function DemoModulePage({ kind, title, description }: { kind: DemoKind; title: string; description: string }) {
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState(false);
  const config = useMemo(() => CONFIG[kind] ?? fallback, [kind]);
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return config.rows;
    return config.rows.filter((row) => Object.values(row).some((value) => String(value).toLowerCase().includes(q)));
  }, [config.rows, query]);

  return (
    <div className="module-page">
      <section className="page-header">
        <div>
          <span>{config.section}</span>
          <h1>{title || config.section}</h1>
          <p>{description}</p>
        </div>
        <div className="header-actions">
          <Button onClick={() => setSaved(true)}><Plus size={16} /> {config.primaryAction}</Button>
          <Button variant="outline"><Upload size={15} /> Import</Button>
          <Button variant="outline"><Download size={15} /> Export</Button>
        </div>
      </section>

      <section className="module-stats">
        {config.stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle>{stat.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={badgeVariant(stat.status)}>{stat.status ?? "Normal"}</Badge>
            </CardContent>
          </Card>
        ))}
      </section>

      {saved && <div className="system-alert">Perubahan berhasil disimpan.</div>}

      <section className="module-layout">
        <Card className="module-table-card">
          <CardHeader>
            <div className="table-header">
              <div>
                <CardTitle>Daftar Data</CardTitle>
                <CardDescription>{rows.length} data ditampilkan</CardDescription>
              </div>
              <div className="table-tools">
                <div className="table-search">
                  <Search size={15} />
                  <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari data..." />
                </div>
                <Button variant="outline" size="icon" aria-label="Cetak"><Printer size={15} /></Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="data-table">
            <table>
              <thead>
                <tr>
                  {config.columns.map((column) => <th key={column}>{column}</th>)}
                  <th className="right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={index}>
                    {config.columns.map((column) => (
                      <td key={column}>
                        {column === "status"
                          ? <Badge variant={badgeVariant(String(row[column]))}>{row[column]}</Badge>
                          : formatCell(column, row[column] ?? "-")}
                      </td>
                    ))}
                    <td className="right"><Button variant="ghost" size="sm">Detail</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card className="module-side-card">
          <CardHeader>
            <CardTitle>{config.sideTitle}</CardTitle>
            <CardDescription>Parameter yang tersedia di modul ini.</CardDescription>
          </CardHeader>
          <CardContent className="side-list">
            {config.sideItems.map((item) => <div key={item}>{item}</div>)}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
