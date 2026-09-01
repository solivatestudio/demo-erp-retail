"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  Boxes,
  Building2,
  ChevronDown,
  Download,
  Eye,
  FileText,
  HelpCircle,
  Layers,
  Pencil,
  Plus,
  Printer,
  Save,
  Search,
  Store,
  Sliders,
  Trash2,
  Truck,
  Upload,
  Warehouse,
  X,
} from "lucide-react";
import { formatRupiah } from "../lib/utils/format";
import { getSalesReceipts, getStockSnapshot } from "../lib/demoFlow";
import { calculateStockStatus, StockStatusResult } from "../lib/stockLogic";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

export type DemoKind =
  | "customers" | "suppliers" | "salesPeople" | "products" | "categories" | "brands" | "units" | "prices" | "warehouses"
  | "stock" | "stockCard" | "purchases" | "purchaseReturns" | "payables" | "sales" | "delivery" | "salesReturns"
  | "receivables" | "stockTransfers" | "stockIssues" | "repack" | "adjustments" | "cashIn" | "cashOut" | "reports" | "settings" | "reprints";

export interface ProductStockData {
  kode: string;
  nama: string;
  kategori: string;
  merk: string;
  satuan: string;
  hpp: number;
  ecer: number;
  grosir: number;
  stockToko: number;
  stockGudang: number;
  stockCabang: number;
  lowStockThreshold?: number | null;
  reorderPoint?: number | null;
}

export interface TransactionItem {
  sku: string;
  name: string;
  qty: number;
  unit: string;
  price: number;
  subtotal: number;
}

export interface TransactionDetail {
  no: string;
  tanggal: string;
  tipe: string;
  partner: string;
  partnerRole: "Supplier" | "Pelanggan";
  fakturRef?: string;
  gudang: string;
  petugas: string;
  top?: string;
  jatuhTempo?: string;
  status: string;
  items: TransactionItem[];
  subtotal: number;
  diskon: number;
  pajak: number;
  biayaKirim: number;
  total: number;
  terbayar: number;
  sisa: number;
  catatan?: string;
}

type Row = Record<string, any>;
type ModuleConfig = {
  section: string;
  primaryAction: string;
  stats: { label: string; value: string; status?: string }[];
  columns: string[];
  rows: Row[];
  sideTitle: string;
  sideItems: string[];
};

const INITIAL_STOCK_PRODUCTS: ProductStockData[] = [
  {
    kode: "SKU-CUP-16OZ",
    nama: "Cup Plastik PP 16oz Oza Slim (Isi 50 pcs)",
    kategori: "Cup & Minuman",
    merk: "Oza Pack",
    satuan: "pack",
    hpp: 12000,
    ecer: 15000,
    grosir: 13200,
    stockToko: 45,
    stockGudang: 240,
    stockCabang: 80,
    lowStockThreshold: 30,
    reorderPoint: 15,
  },
  {
    kode: "SKU-MIKA-B4",
    nama: "Mika Bento 4 Sekat Hitam + Tutup (Isi 50 pcs)",
    kategori: "Kemasan Makanan",
    merk: "Starindo",
    satuan: "pack",
    hpp: 38000,
    ecer: 46000,
    grosir: 41500,
    stockToko: 18,
    stockGudang: 90,
    stockCabang: 25,
    lowStockThreshold: 20,
    reorderPoint: 10,
  },
  {
    kode: "SKU-KRESEK-15",
    nama: "Kantong Kresek HDPE Bening 15x30 (500 gr)",
    kategori: "Plastik & Kresek",
    merk: "Bawang Super",
    satuan: "pack",
    hpp: 9500,
    ecer: 12500,
    grosir: 10500,
    stockToko: 65,
    stockGudang: 350,
    stockCabang: 120,
    lowStockThreshold: 40,
    reorderPoint: 20,
  },
  {
    kode: "SKU-ROLL-PE08",
    nama: "Plastik Roll PE Bening 0.8 mm (10 kg)",
    kategori: "Plastik & Kresek",
    merk: "Wayang",
    satuan: "roll",
    hpp: 285000,
    ecer: 330000,
    grosir: 305000,
    stockToko: 6,
    stockGudang: 28,
    stockCabang: 4,
    lowStockThreshold: 10,
    reorderPoint: 5,
  },
  {
    kode: "SKU-BOX-LUNCH-M",
    nama: "Paper Lunch Box Medium Kraft (Isi 100 pcs)",
    kategori: "Kemasan Makanan",
    merk: "EcoKraft",
    satuan: "pack",
    hpp: 62000,
    ecer: 75000,
    grosir: 67000,
    stockToko: 4,
    stockGudang: 3,
    stockCabang: 0,
    lowStockThreshold: 15,
    reorderPoint: 8,
  },
  {
    kode: "SKU-BUBBLE-50M",
    nama: "Bubble Wrap Tebal Premium Roll 50m x 125cm",
    kategori: "Perlengkapan Packing",
    merk: "Klaten Pack",
    satuan: "roll",
    hpp: 82000,
    ecer: 105000,
    grosir: 92000,
    stockToko: 0,
    stockGudang: 18,
    stockCabang: 6,
    lowStockThreshold: 8,
    reorderPoint: 3,
  },
  {
    kode: "SKU-LAKBAN-48",
    nama: "Lakban Bening Daimaru 48mm x 90y",
    kategori: "Perlengkapan Packing",
    merk: "Daimaru",
    satuan: "roll",
    hpp: 8800,
    ecer: 11500,
    grosir: 9800,
    stockToko: 80,
    stockGudang: 420,
    stockCabang: 150,
    lowStockThreshold: 50,
    reorderPoint: 25,
  },
  {
    kode: "SKU-SEDOTAN-STR",
    nama: "Sedotan Steril Runcing Bubble 12mm (Isi 100 pcs)",
    kategori: "Cup & Minuman",
    merk: "Tomat",
    satuan: "pack",
    hpp: 6500,
    ecer: 9000,
    grosir: 7500,
    stockToko: 50,
    stockGudang: 200,
    stockCabang: 80,
    lowStockThreshold: null,
    reorderPoint: null,
  },
  {
    kode: "SKU-PANIR-1KG",
    nama: "Tepung Panir Halus Bakery 1 kg",
    kategori: "Bahan Pelengkap",
    merk: "Mamasuka",
    satuan: "kg",
    hpp: 14500,
    ecer: 18000,
    grosir: 16000,
    stockToko: 12,
    stockGudang: 40,
    stockCabang: 10,
    lowStockThreshold: 15,
    reorderPoint: 8,
  },
];

const INITIAL_TRANSACTIONS: Record<string, TransactionDetail> = {
  "POS-000184": {
    no: "POS-000184",
    tanggal: "31/08/2026",
    tipe: "Nota Penjualan POS",
    partner: "Pelanggan Umum (Walk-in)",
    partnerRole: "Pelanggan",
    gudang: "Toko Utama (Irian)",
    petugas: "Siti Rahayu (Kasir Toko)",
    status: "Lunas",
    items: [
      { sku: "SKU-CUP-16OZ", name: "Cup Plastik PP 16oz Oza (50 pcs)", qty: 2, unit: "pack", price: 15000, subtotal: 30000 },
      { sku: "SKU-KRESEK-15", name: "Kresek HDPE Bening 15x30 (500 gr)", qty: 3, unit: "pack", price: 12500, subtotal: 37500 },
      { sku: "SKU-SEDOTAN-STR", name: "Sedotan Steril Bubble 12mm (100 pcs)", qty: 2, unit: "pack", price: 9000, subtotal: 18000 },
    ],
    subtotal: 85500,
    diskon: 0,
    pajak: 0,
    biayaKirim: 0,
    total: 85500,
    terbayar: 100000,
    sisa: 0,
    catatan: "Pembayaran Tunai Kasir Toko Irian",
  },
  "SAL-000091": {
    no: "SAL-000091",
    tanggal: "31/08/2026",
    tipe: "Penjualan Grosir Packaging",
    partner: "Warung Makan Bu Aminah",
    partnerRole: "Pelanggan",
    fakturRef: "PO-WMA-442",
    gudang: "Gudang Logistik Pusat",
    petugas: "Budi Santoso (Kru Toko)",
    top: "14 Hari",
    jatuhTempo: "14/09/2026",
    status: "Piutang",
    items: [
      { sku: "SKU-MIKA-B4", name: "Mika Bento 4 Sekat Hitam (50 pcs)", qty: 40, unit: "pack", price: 41500, subtotal: 1660000 },
      { sku: "SKU-BOX-LUNCH-M", name: "Paper Lunch Box Medium Kraft (100 pcs)", qty: 20, unit: "pack", price: 67000, subtotal: 1340000 },
      { sku: "SKU-KRESEK-15", name: "Kresek HDPE Bening 15x30 (500 gr)", qty: 40, unit: "pack", price: 10500, subtotal: 420000 },
    ],
    subtotal: 3420000,
    diskon: 0,
    pajak: 0,
    biayaKirim: 0,
    total: 3420000,
    terbayar: 0,
    sisa: 3420000,
    catatan: "Pengiriman via Armada Toko ke Pandanrejo, Klaten",
  },
  "PUR-000044": {
    no: "PUR-000044",
    tanggal: "31/08/2026",
    tipe: "Faktur Pembelian Pabrik",
    partner: "PT Sinar Joyoboyo Plastik",
    partnerRole: "Supplier",
    fakturRef: "INV-SJP-9941",
    gudang: "Gudang Logistik Pusat",
    petugas: "Agus Pramono (Logistik)",
    top: "30 Hari",
    jatuhTempo: "30/09/2026",
    status: "Partial",
    items: [
      { sku: "SKU-KRESEK-15", name: "Kantong Kresek HDPE Bening 15x30", qty: 500, unit: "pack", price: 8500, subtotal: 4250000 },
      { sku: "SKU-ROLL-PE08", name: "Plastik Roll PE Bening 0.8 mm (10 kg)", qty: 15, unit: "roll", price: 280000, subtotal: 4200000 },
    ],
    subtotal: 8450000,
    diskon: 0,
    pajak: 0,
    biayaKirim: 0,
    total: 8450000,
    terbayar: 4000000,
    sisa: 4450000,
    catatan: "Uang muka 50% via Transfer BCA",
  },
};

const commonRows = {
  products: [
    { kode: "SKU-CUP-16OZ", nama: "Cup Plastik PP 16oz Oza Slim (50 pcs)", kategori: "Cup & Minuman", merk: "Oza Pack", satuan: "pack", hpp: 12000, ecer: 15000, grosir: 13200, minStock: 30, reorderPoint: 15, status: "Aktif" },
    { kode: "SKU-MIKA-B4", nama: "Mika Bento 4 Sekat Hitam + Tutup (50 pcs)", kategori: "Kemasan Makanan", merk: "Starindo", satuan: "pack", hpp: 38000, ecer: 46000, grosir: 41500, minStock: 20, reorderPoint: 10, status: "Aktif" },
    { kode: "SKU-KRESEK-15", nama: "Kantong Kresek HDPE Bening 15x30 (500 gr)", kategori: "Plastik & Kresek", merk: "Bawang Super", satuan: "pack", hpp: 9500, ecer: 12500, grosir: 10500, minStock: 40, reorderPoint: 20, status: "Aktif" },
    { kode: "SKU-ROLL-PE08", nama: "Plastik Roll PE Bening 0.8 mm (10 kg)", kategori: "Plastik & Kresek", merk: "Wayang", satuan: "roll", hpp: 285000, ecer: 330000, grosir: 305000, minStock: 10, reorderPoint: 5, status: "Aktif" },
    { kode: "SKU-BOX-LUNCH-M", nama: "Paper Lunch Box Medium Kraft (100 pcs)", kategori: "Kemasan Makanan", merk: "EcoKraft", satuan: "pack", hpp: 62000, ecer: 75000, grosir: 67000, minStock: 15, reorderPoint: 8, status: "Aktif" },
    { kode: "SKU-BUBBLE-50M", nama: "Bubble Wrap Roll 50m x 125cm", kategori: "Perlengkapan Packing", merk: "Klaten Pack", satuan: "roll", hpp: 82000, ecer: 105000, grosir: 92000, minStock: 8, reorderPoint: 3, status: "Aktif" },
    { kode: "SKU-LAKBAN-48", nama: "Lakban Bening Daimaru 48mm x 90y", kategori: "Perlengkapan Packing", merk: "Daimaru", satuan: "roll", hpp: 8800, ecer: 11500, grosir: 9800, minStock: 50, reorderPoint: 25, status: "Aktif" },
    { kode: "SKU-SEDOTAN-STR", nama: "Sedotan Steril Runcing Bubble 12mm (100 pcs)", kategori: "Cup & Minuman", merk: "Tomat", satuan: "pack", hpp: 6500, ecer: 9000, grosir: 7500, minStock: "-", reorderPoint: "-", status: "Aktif" },
    { kode: "SKU-PANIR-1KG", nama: "Tepung Panir Halus Bakery 1 kg", kategori: "Bahan Pelengkap", merk: "Mamasuka", satuan: "kg", hpp: 14500, ecer: 18000, grosir: 16000, minStock: 15, reorderPoint: 8, status: "Aktif" },
  ],
  sales: [
    { no: "POS-000184", tanggal: "31/08/2026", pelanggan: "Pelanggan Umum (Walk-in)", jenis: "POS Kasir", gudang: "Toko Utama (Irian)", total: 85500, status: "Lunas" },
    { no: "SAL-000091", tanggal: "31/08/2026", pelanggan: "Warung Makan Bu Aminah", jenis: "Grosir", gudang: "Gudang Logistik Pusat", total: 3420000, status: "Piutang" },
    { no: "SAL-000092", tanggal: "31/08/2026", pelanggan: "Kedai Kopi Selaras", jenis: "Grosir", gudang: "Toko Utama (Irian)", total: 940000, status: "Lunas" },
    { no: "DLV-000027", tanggal: "31/08/2026", pelanggan: "Catering Berkah Klaten", jenis: "Delivery", gudang: "Gudang Logistik Pusat", total: 2640000, status: "Partial" },
  ],
  purchases: [
    { no: "PUR-000044", tanggal: "31/08/2026", supplier: "PT Sinar Joyoboyo Plastik", faktur: "INV-SJP-9941", top: "30 Hari", gudang: "Gudang Logistik Pusat", total: 8450000, status: "Partial" },
    { no: "PUR-000045", tanggal: "31/08/2026", supplier: "CV Starindo Packaging Solo", faktur: "INV-STA-7712", top: "14 Hari", gudang: "Toko Utama (Irian)", total: 4250000, status: "Lunas" },
    { no: "PUR-000046", tanggal: "30/08/2026", supplier: "Pabrik Daimaru Tape", faktur: "INV-DMR-3320", top: "Tunai", gudang: "Gatotkoco 2 (Krapyak)", total: 2850000, status: "Lunas" },
  ],
};

const CONFIG: Partial<Record<DemoKind, ModuleConfig>> = {
  settings: {
    section: "System",
    primaryAction: "Simpan Pengaturan",
    stats: [{ label: "Profil Toko", value: "Lengkap" }, { label: "Template Nota", value: "Aktif" }, { label: "Multi-Gudang", value: "3 Lokasi" }],
    columns: ["kode", "pengaturan", "nilai", "status"],
    rows: [
      { kode: "STORE_NAME", pengaturan: "Nama Toko / Usaha", nilai: "Kelolain", status: "Aktif" },
      { kode: "STORE_BRANCH", pengaturan: "Outlet Utama", nilai: "Gatotkoco Irian (Klaten)", status: "Aktif" },
      { kode: "DEFAULT_LOW_STOCK", pengaturan: "Default Low Stock Threshold", nilai: "20", status: "Aktif" },
      { kode: "DEFAULT_REORDER_POINT", pengaturan: "Default Reorder Point", nilai: "10", status: "Aktif" },
      { kode: "RECEIPT_FOOTER", pengaturan: "Footer Nota Kasir", nilai: "Pusat Plastik & Packaging Terlengkap Klaten", status: "Aktif" },
    ],
    sideTitle: "Pengaturan Inventory & Toko",
    sideItems: [
      "Default Low Stock Threshold global",
      "Default Reorder Point alert",
      "Konfigurasi multi-gudang Klaten",
      "Format cetak nota thermal 58/80mm",
    ],
  },
  suppliers: {
    section: "Master",
    primaryAction: "Tambah Supplier",
    stats: [{ label: "Supplier Aktif", value: "18" }, { label: "Pabrik / Distributor", value: "6" }, { label: "Hutang Open", value: "Rp 8,4 jt", status: "warning" }],
    columns: ["kode", "nama", "alamat", "kota", "telp", "status"],
    rows: [
      { kode: "SUP-001", nama: "PT Sinar Joyoboyo Plastik", alamat: "Kawasan Industri Rungkut", kota: "Surabaya", telp: "0812-3000-1122", status: "TOP 30" },
      { kode: "SUP-002", nama: "CV Starindo Packaging Solo", alamat: "Jl. Palur Raya No. 45", kota: "Surakarta", telp: "0813-2900-4455", status: "TOP 14" },
      { kode: "SUP-003", nama: "Pabrik Daimaru Tape Indonesia", alamat: "Kawasan Industri Candi", kota: "Semarang", telp: "0811-2400-8899", status: "TOP 14" },
      { kode: "SUP-004", nama: "CV EcoKraft Boxindo", alamat: "Jl. Ring Road Utara", kota: "Yogyakarta", telp: "0818-0200-3344", status: "Tunai" },
    ],
    sideTitle: "Master Supplier Packaging",
    sideItems: ["Pabrik plastik & mika", "Distributor cup & sedotan", "Produsen lakban & bubble wrap", "Termin pembayaran (TOP)"],
  },
  customers: {
    section: "Master",
    primaryAction: "Tambah Pelanggan",
    stats: [{ label: "Pelanggan Terdaftar", value: "142" }, { label: "Grup Grosir / UMKM", value: "48" }, { label: "Total Piutang", value: "Rp 6,2 jt", status: "warning" }],
    columns: ["kode", "nama", "alamat", "kota", "telp", "grup", "status"],
    rows: [
      { kode: "CUST-001", nama: "Pelanggan Umum (Walk-in)", alamat: "Jl. Irian & Sekitarnya", kota: "Klaten Tengah", telp: "-", grup: "Retail", status: "Aktif" },
      { kode: "CUST-002", nama: "Warung Makan Bu Aminah", alamat: "Pandanrejo", kota: "Klaten Tengah", telp: "0877-1234-5678", grup: "Grosir", status: "Aktif" },
      { kode: "CUST-003", nama: "Kedai Kopi Selaras", alamat: "Merbung", kota: "Klaten Selatan", telp: "0858-9876-5432", grup: "Grosir", status: "Aktif" },
      { kode: "CUST-004", name: "Catering Berkah Klaten", alamat: "Krapyak", kota: "Klaten Selatan", telp: "0813-2468-1357", grup: "Tempo", status: "Tempo 14 Hari" },
      { kode: "CUST-005", nama: "UMKM Keripik & Snack Jaya", alamat: "Ceper", kota: "Klaten", telp: "0812-3344-5566", grup: "Grosir", status: "Aktif" },
    ],
    sideTitle: "Segmentasi Pelanggan",
    sideItems: ["Pelanggan retail umum", "UMKM Kuliner & Warung", "Kedai Minuman & Kopi", "Catering & Reseller"],
  },
  salesPeople: {
    section: "Master",
    primaryAction: "Tambah Kru / Sales",
    stats: [{ label: "Kru Toko & Sales", value: "8" }, { label: "Outlet", value: "2" }, { label: "Transaksi Hari Ini", value: "147" }],
    columns: ["kode", "nama", "alamat", "hp", "area", "status"],
    rows: [
      { kode: "SLS-001", nama: "Budi Santoso", alamat: "Pandanrejo, Klaten", hp: "0877-4400-1122", area: "Toko Utama (Irian)", status: "Kru Toko & Display" },
      { kode: "SLS-002", nama: "Siti Rahayu", alamat: "Merbung, Klaten", hp: "0858-2200-3344", area: "Kasir Toko (Irian)", status: "Kasir Utama" },
      { kode: "SLS-003", nama: "Agus Pramono", alamat: "Ceper, Klaten", hp: "0813-8800-5566", area: "Gudang Logistik", status: "Logistik & Armada" },
      { kode: "SLS-004", nama: "Dewi Lestari", alamat: "Krapyak, Klaten", hp: "0812-7700-9900", area: "Gatotkoco 2 (Krapyak)", status: "Kru Outlet Cabang" },
    ],
    sideTitle: "Kru & Operasional Toko",
    sideItems: ["Kru display & replenishment", "Kasir POS harian", "Petugas gudang logistik", "Kru cabang Krapyak"],
  },
  products: {
    section: "Inventaris",
    primaryAction: "Tambah Barang",
    stats: [{ label: "SKU Aktif", value: "9" }, { label: "Kategori", value: "6" }, { label: "Nilai Aset Stok", value: "Rp 68,4 jt" }],
    columns: ["kode", "nama", "kategori", "merk", "satuan", "hpp", "ecer", "grosir", "minStock", "reorderPoint", "status"],
    rows: commonRows.products,
    sideTitle: "Konfigurasi Stok & Harga",
    sideItems: [
      "Minimum / Low Stock Threshold per SKU",
      "Reorder Point untuk rekomendasi restock",
      "Multi-satuan konversi (Pcs - Pack - Dus)",
      "Tiering harga Retail & Grosir",
    ],
  },
  stock: {
    section: "Inventaris",
    primaryAction: "Koreksi Stok",
    stats: [{ label: "Total SKU", value: "9" }, { label: "Perlu Restock", value: "2 SKU", status: "warning" }, { label: "Nilai Aset", value: "Rp 68,4 jt" }],
    columns: ["kode", "nama", "kategori", "stokSaatIni", "minStock", "reorderPoint", "hpp", "status"],
    rows: [],
    sideTitle: "Logika Status Persediaan",
    sideItems: [
      "AMAN: Stok saat ini > Batas Low",
      "LOW: Reorder Point < Stok ≤ Batas Low",
      "RESTOCK: Stok saat ini ≤ Reorder Point",
      "HABIS: Saldo stok = 0 di lokasi terpilih",
      "Belum Diatur: Belum dikonfigurasi threshold",
    ],
  },
  sales: {
    section: "Penjualan",
    primaryAction: "Buat Penjualan",
    stats: [{ label: "Omset Hari Ini", value: "Rp 18,4 jt" }, { label: "Total Nota", value: "147" }, { label: "Piutang Berjalan", value: "Rp 6,2 jt", status: "warning" }],
    columns: ["no", "tanggal", "pelanggan", "jenis", "gudang", "total", "status"],
    rows: commonRows.sales,
    sideTitle: "Channel Penjualan",
    sideItems: ["POS kasir walk-in", "Order grosir UMKM", "Pengiriman armada toko", "Retur & piutang tempo"],
  },
  purchases: {
    section: "Pembelian",
    primaryAction: "Buat Pembelian",
    stats: [{ label: "Pembelian Bulan Ini", value: "Rp 24,8 jt" }, { label: "Supplier Aktif", value: "4 Pabrik" }, { label: "Hutang Berjalan", value: "Rp 8,4 jt", status: "warning" }],
    columns: ["no", "tanggal", "supplier", "faktur", "top", "gudang", "total", "status"],
    rows: commonRows.purchases,
    sideTitle: "Pengadaan Pabrik / Supplier",
    sideItems: ["Nomor faktur pabrik", "Termin pembayaran (TOP)", "Gudang penerimaan", "Input ball/dus & konversi pack"],
  },
  delivery: {
    section: "Logistik",
    primaryAction: "Buat Surat Jalan",
    stats: [{ label: "Order Antar", value: "8" }, { label: "Pending Kirim", value: "4 dus", status: "warning" }, { label: "Terkirim Hari Ini", value: "6 rute" }],
    columns: ["no", "tanggal", "pelanggan", "alamat", "qtyOrder", "qtyKirim", "status"],
    rows: [
      { no: "DLV-000027", tanggal: "31/08/2026", pelanggan: "Catering Berkah Klaten", alamat: "Krapyak, Klaten", qtyOrder: "20 pack", qtyKirim: "15 pack", status: "Partial" },
      { no: "DLV-000028", tanggal: "31/08/2026", pelanggan: "Warung Makan Bu Aminah", alamat: "Pandanrejo, Klaten", qtyOrder: "40 pack", qtyKirim: "40 pack", status: "Selesai" },
      { no: "DLV-000029", tanggal: "31/08/2026", pelanggan: "Kedai Kopi Selaras", alamat: "Merbung, Klaten", qtyOrder: "10 dus", qtyKirim: "10 dus", status: "Selesai" },
    ],
    sideTitle: "Distribusi & Pengiriman",
    sideItems: ["Armada toko Klaten", "Surat jalan pengiriman", "Kirim penuh atau bertahap", "Konfirmasi penerimaan barang"],
  },
  purchaseReturns: {
    section: "Pembelian",
    primaryAction: "Buat Retur Beli",
    stats: [{ label: "Retur Bulan Ini", value: "3" }, { label: "Nilai Retur", value: "Rp 1,4 jt" }, { label: "Open", value: "1", status: "warning" }],
    columns: ["no", "tanggal", "supplier", "notaAsal", "gudang", "total", "status"],
    rows: [
      { no: "RET-P-000006", tanggal: "29/08/2026", supplier: "CV Starindo Packaging Solo", notaAsal: "PUR-000045", gudang: "Gudang Logistik Pusat", total: 420000, status: "Posted" },
      { no: "RET-P-000007", tanggal: "30/08/2026", supplier: "PT Sinar Joyoboyo Plastik", notaAsal: "PUR-000044", gudang: "Toko Utama (Irian)", total: 340000, status: "Draft" },
    ],
    sideTitle: "Retur ke Pabrik",
    sideItems: ["Barang cacat / reject produksi", "Plastik tipis / sobek", "Kompensasi potong hutang", "Nota retur resmi"],
  },
  salesReturns: {
    section: "Penjualan",
    primaryAction: "Buat Retur Jual",
    stats: [{ label: "Retur Bulan Ini", value: "4" }, { label: "Nilai Retur", value: "Rp 680 rb" }, { label: "Diproses", value: "1", status: "warning" }],
    columns: ["no", "tanggal", "pelanggan", "notaAsal", "gudang", "total", "status"],
    rows: [
      { no: "RET-S-000011", tanggal: "30/08/2026", pelanggan: "Warung Makan Bu Aminah", notaAsal: "SAL-000091", gudang: "Toko Utama (Irian)", total: 240000, status: "Posted" },
      { no: "RET-S-000012", tanggal: "31/08/2026", pelanggan: "Pelanggan Umum (Walk-in)", notaAsal: "POS-000184", gudang: "Toko Utama (Irian)", total: 30000, status: "Draft" },
    ],
    sideTitle: "Retur dari Pembeli",
    sideItems: ["Tukar ukuran cup/kresek", "Barang tidak sesuai pesanan", "Pengembalian saldo stok", "Penyesuaian nota & kasir"],
  },
  payables: {
    section: "Keuangan",
    primaryAction: "Bayar Supplier",
    stats: [{ label: "Total Hutang", value: "Rp 8,4 jt", status: "warning" }, { label: "Jatuh Tempo", value: "2 Pabrik" }, { label: "Dibayar Hari Ini", value: "Rp 2,5 jt" }],
    columns: ["no", "supplier", "jatuhTempo", "total", "terbayar", "sisa", "status"],
    rows: [
      { no: "PUR-000044", supplier: "PT Sinar Joyoboyo Plastik", jatuhTempo: "30/09/2026", total: 8450000, terbayar: 4000000, sisa: 4450000, status: "Partial" },
      { no: "PUR-000042", supplier: "CV Starindo Packaging Solo", jatuhTempo: "28/08/2026", total: 3950000, terbayar: 0, sisa: 3950000, status: "Overdue" },
    ],
    sideTitle: "Manajemen Hutang Supplier",
    sideItems: ["Jadwal jatuh tempo TOP", "Cicilan bertahap", "Histori pembayaran pabrik", "Arus kas keluar"],
  },
  receivables: {
    section: "Keuangan",
    primaryAction: "Terima Pembayaran",
    stats: [{ label: "Total Piutang", value: "Rp 6,2 jt", status: "warning" }, { label: "Pelanggan Tempo", value: "4 UMKM" }, { label: "Diterima Hari Ini", value: "Rp 1,8 jt" }],
    columns: ["no", "pelanggan", "jatuhTempo", "total", "terbayar", "sisa", "status"],
    rows: [
      { no: "SAL-000091", pelanggan: "Warung Makan Bu Aminah", jatuhTempo: "14/09/2026", total: 3420000, terbayar: 0, sisa: 3420000, status: "Open" },
      { no: "SAL-000088", pelanggan: "Catering Berkah Klaten", jatuhTempo: "05/09/2026", total: 2840000, terbayar: 1000000, sisa: 1840000, status: "Partial" },
    ],
    sideTitle: "Pengawasan Piutang Grosir",
    sideItems: ["Batas limit piutang toko", "Aging piutang per UMKM", "Penerimaan cicilan", "Pengingat jatuh tempo"],
  },
  categories: {
    section: "Inventaris",
    primaryAction: "Tambah Kategori",
    stats: [{ label: "Kategori Utama", value: "6" }, { label: "Sub-Kategori", value: "24" }, { label: "SKU Terdaftar", value: "140+" }],
    columns: ["kode", "kategori", "subKategori", "jumlahSku", "status"],
    rows: [
      { kode: "CAT-CUP", kategori: "Cup & Minuman", subKategori: "PP Cup, PET Cup, Sedotan, Sealing", jumlahSku: 36, status: "Aktif" },
      { kode: "CAT-FOOD", kategori: "Kemasan Makanan", subKategori: "Mika Bento, Thinwall, Lunch Box Kraft", jumlahSku: 42, status: "Aktif" },
      { kode: "CAT-PLASTIK", kategori: "Plastik & Kresek", subKategori: "HDPE Kresek, PE Roll, PP Wayang, OPP", jumlahSku: 58, status: "Aktif" },
      { kode: "CAT-PACK", kategori: "Perlengkapan Packing", subKategori: "Lakban Daimaru, Bubble Wrap, Tali Rafia", jumlahSku: 22, status: "Aktif" },
      { kode: "CAT-BAKERY", kategori: "Bahan Pelengkap", subKategori: "Tepung Panir, Box Donat, Mika Tart", jumlahSku: 14, status: "Aktif" },
    ],
    sideTitle: "Hierarki Kategori Produk",
    sideItems: ["Kategori kemasan makanan", "Kategori minuman & cup", "Kategori plastik roll & kresek", "Perlengkapan lakban & packing"],
  },
  warehouses: {
    section: "Inventaris",
    primaryAction: "Tambah Lokasi",
    stats: [{ label: "Lokasi Terdaftar", value: "3" }, { label: "Transfer Stok", value: "14" }, { label: "SKU Terkelola", value: "140+" }],
    columns: ["kode", "lokasi", "keterangan", "sku", "status"],
    rows: [
      { kode: "WH-IRIAN", lokasi: "Toko Utama (Irian)", keterangan: "Jl. Irian No.8, Klaten Tengah (Display & Kasir)", sku: 140, status: "Aktif" },
      { kode: "WH-GUDANG", lokasi: "Gudang Logistik Pusat", keterangan: "Pusat penerimaan pabrik (Ball & Dus besar)", sku: 140, status: "Aktif" },
      { kode: "WH-KRAPYAK", lokasi: "Gatotkoco 2 (Krapyak)", keterangan: "Jl. Kuntowijayandanu, Krapyak, Klaten Selatan", sku: 85, status: "Aktif" },
    ],
    sideTitle: "Jaringan Toko & Multi-Gudang",
    sideItems: ["Toko Utama Irian Klaten", "Outlet 2 Krapyak Merbung", "Gudang Logistik Pusat", "Sinkronisasi saldo antar cabang"],
  },
  stockCard: {
    section: "Inventaris",
    primaryAction: "Filter Kartu Stok",
    stats: [{ label: "Mutasi Hari Ini", value: "38" }, { label: "SKU Terpilih", value: "Semua" }, { label: "Lokasi", value: "Toko Utama" }],
    columns: ["tanggal", "referensi", "produk", "gudang", "masuk", "keluar", "saldo"],
    rows: [
      { tanggal: "31/08/2026", referensi: "PUR-000044", produk: "Kantong Kresek HDPE 15x30", gudang: "Gudang Logistik Pusat", masuk: "500 pack", keluar: "-", saldo: "850 pack" },
      { tanggal: "31/08/2026", referensi: "TRF-000012", produk: "Kantong Kresek HDPE 15x30", gudang: "Toko Utama (Irian)", masuk: "50 pack", keluar: "-", saldo: "65 pack" },
      { tanggal: "31/08/2026", referensi: "SAL-000091", produk: "Mika Bento 4 Sekat Hitam", gudang: "Gudang Logistik Pusat", masuk: "-", keluar: "40 pack", saldo: "90 pack" },
      { tanggal: "31/08/2026", referensi: "POS-000184", produk: "Cup Plastik PP 16oz Oza", gudang: "Toko Utama (Irian)", masuk: "-", keluar: "2 pack", saldo: "45 pack" },
    ],
    sideTitle: "Audit Trail & Buku Besar Stok",
    sideItems: ["Saldo awal (Opening balance)", "Penerimaan pembelian pabrik", "Penjualan POS kasir & grosir", "Transfer antar cabang / gudang"],
  },
  stockTransfers: {
    section: "Inventaris",
    primaryAction: "Buat Mutasi Antar Gudang",
    stats: [{ label: "Mutasi Bulan Ini", value: "14" }, { label: "Dalam Perjalanan", value: "0" }, { label: "Lokasi", value: "3 Titik" }],
    columns: ["no", "tanggal", "asal", "tujuan", "item", "total", "status"],
    rows: [
      { no: "TRF-000012", tanggal: "31/08/2026", asal: "Gudang Logistik Pusat", tujuan: "Toko Utama (Irian)", item: "Cup 16oz (20 pk), Kresek (50 pk)", total: 765000, status: "Posted" },
      { no: "TRF-000013", tanggal: "31/08/2026", asal: "Gudang Logistik Pusat", tujuan: "Gatotkoco 2 (Krapyak)", item: "Lakban (72 roll), Mika (20 pk)", total: 1420000, status: "Posted" },
    ],
    sideTitle: "Replenishment Antar Cabang",
    sideItems: ["Gudang logistik ke toko display", "Pasokan toko ke outlet cabang 2", "HPP terjaga otomatis", "Verifikasi fisik saat tiba"],
  },
  stockIssues: {
    section: "Operasional",
    primaryAction: "Pengeluaran Non-Jual",
    stats: [{ label: "Pengeluaran", value: "5" }, { label: "Nilai", value: "Rp 340 rb" }, { label: "Status", value: "Posted" }],
    columns: ["no", "tanggal", "gudang", "keperluan", "item", "total", "status"],
    rows: [
      { no: "OUT-000019", tanggal: "31/08/2026", gudang: "Toko Utama (Irian)", keperluan: "Mika Bento Pecah / Rusak", item: "2 pack", total: 76000, status: "Posted" },
      { no: "OUT-000020", tanggal: "31/08/2026", gudang: "Toko Utama (Irian)", keperluan: "Sample Display Pelanggan", item: "1 pack", total: 15000, status: "Posted" },
    ],
    sideTitle: "Pencatatan Kerusakan & Sample",
    sideItems: ["Barang pecah / retak saat display", "Sample contoh untuk pelanggan", "Plastik kotor / reject", "Beban operasional toko"],
  },
  repack: {
    section: "Inventaris",
    primaryAction: "Buat Repack / Konversi",
    stats: [{ label: "Repack Bulan Ini", value: "8" }, { label: "Output Satuan", value: "Pack & Pcs" }, { label: "Status", value: "Ready" }],
    columns: ["no", "tanggal", "gudang", "input", "output", "nilai", "status"],
    rows: [
      { no: "RPK-000008", tanggal: "31/08/2026", gudang: "Gudang Logistik Pusat", input: "1 Dus Cup 16oz", output: "20 Pack (1.000 Pcs)", nilai: 240000, status: "Posted" },
      { no: "RPK-000009", tanggal: "31/08/2026", gudang: "Toko Utama (Irian)", input: "1 Ball Kresek HDPE", output: "40 Pack (500 gr)", nilai: 380000, status: "Posted" },
    ],
    sideTitle: "Konversi Dus ke Pack / Pcs",
    sideItems: ["Buka dus pabrik jadi eceran", "Konversi ball plastik ke pack", "Alokasi HPP tetap presisi", "Stok ecer bertambah otomatis"],
  },
  adjustments: {
    section: "Inventaris",
    primaryAction: "Buat Stock Opname",
    stats: [{ label: "Opname Terakhir", value: "28/08/2026" }, { label: "Selisih Bersih", value: "+2 pack" }, { label: "Status", value: "Posted" }],
    columns: ["no", "tanggal", "produk", "gudang", "qtySistem", "qtyFisik", "status"],
    rows: [
      { no: "ADJ-000021", tanggal: "31/08/2026", produk: "Cup Plastik PP 16oz Oza", gudang: "Toko Utama (Irian)", qtySistem: "47", qtyFisik: "45", status: "Posted" },
      { no: "ADJ-000022", tanggal: "31/08/2026", produk: "Lakban Bening Daimaru", gudang: "Toko Utama (Irian)", qtySistem: "78", qtyFisik: "80", status: "Posted" },
    ],
    sideTitle: "Stock Opname & Penyesuaian",
    sideItems: ["Pencocokan stok fisik display", "Identifikasi barang selisih", "Alasan selisih & catatan kru", "Penyesuaian saldo sistem"],
  },
  cashIn: {
    section: "Keuangan",
    primaryAction: "Tambah Kas Masuk",
    stats: [{ label: "Kas Masuk Hari Ini", value: "Rp 14,2 jt" }, { label: "Transaksi POS", value: "147 Nota" }, { label: "Pelunasan UMKM", value: "2" }],
    columns: ["no", "tanggal", "sumber", "keterangan", "jumlah", "status"],
    rows: [
      { no: "CIN-000031", tanggal: "31/08/2026", sumber: "Setoran Kasir Toko Irian", keterangan: "Pendapatan POS Shift Siang", jumlah: 8450000, status: "Posted" },
      { no: "CIN-000032", tanggal: "31/08/2026", sumber: "Transfer Pelunasan Piutang", keterangan: "Catering Berkah Klaten (SAL-000088)", jumlah: 1000000, status: "Posted" },
    ],
    sideTitle: "Penerimaan Kas & Bank",
    sideItems: ["Setoran kasir POS tunai/QRIS", "Pelunasan piutang grosir UMKM", "Penerimaan transfer BCA/Mandiri", "Buku kas operasional"],
  },
  cashOut: {
    section: "Keuangan",
    primaryAction: "Tambah Kas Keluar",
    stats: [{ label: "Kas Keluar Hari Ini", value: "Rp 4,5 jt" }, { label: "Bayar Supplier", value: "Rp 4,0 jt" }, { label: "Biaya Toko", value: "Rp 500 rb" }],
    columns: ["no", "tanggal", "tujuan", "keterangan", "jumlah", "status"],
    rows: [
      { no: "COUT-000014", tanggal: "31/08/2026", tujuan: "PT Sinar Joyoboyo Plastik", keterangan: "Angsuran Faktur PUR-000044", jumlah: 4000000, status: "Posted" },
      { no: "COUT-000015", tanggal: "31/08/2026", tujuan: "Operasional Toko Irian", keterangan: "Bensin Armada Truk & Konsumsi Kru", jumlah: 500000, status: "Posted" },
    ],
    sideTitle: "Pengeluaran Kas & Hutang",
    sideItems: ["Pelunasan faktur pabrik plastik", "Biaya bahan bakar & armada antar", "Listrik & operasional toko", "Biaya gaji & konsumsi kru"],
  },
  brands: {
    section: "Inventaris",
    primaryAction: "Tambah Merk",
    stats: [{ label: "Merk Terdaftar", value: "18" }, { label: "Merk Utama", value: "9" }, { label: "Status", value: "Aktif" }],
    columns: ["kode", "merk", "kategori", "sku", "status"],
    rows: [
      { kode: "BR-OZA", merk: "Oza Pack", kategori: "Cup & Minuman", sku: 24, status: "Aktif" },
      { kode: "BR-STAR", merk: "Starindo", kategori: "Kemasan Makanan", sku: 28, status: "Aktif" },
      { kode: "BR-BWG", merk: "Bawang Super", kategori: "Plastik & Kresek", sku: 32, status: "Aktif" },
      { kode: "BR-WYG", merk: "Wayang", kategori: "Plastik & Kresek", sku: 18, status: "Aktif" },
      { kode: "BR-DMR", merk: "Daimaru", kategori: "Perlengkapan Packing", sku: 12, status: "Aktif" },
      { kode: "BR-KRAFT", merk: "EcoKraft", kategori: "Kemasan Makanan", sku: 16, status: "Aktif" },
    ],
    sideTitle: "Manajemen Merk & Pabrik",
    sideItems: ["Merk plastik terkenal (Bawang, Wayang)", "Merk kemasan (Starindo, EcoKraft)", "Merk cup minuman (Oza)", "Merk isolasi (Daimaru)"],
  },
  units: {
    section: "Inventaris",
    primaryAction: "Tambah Satuan",
    stats: [{ label: "Satuan Terdaftar", value: "8" }, { label: "Konversi Multi-UOM", value: "Aktif" }, { label: "Satuan Dasar", value: "Pack / Pcs" }],
    columns: ["kode", "satuan", "konversi", "digunakanPada", "status"],
    rows: [
      { kode: "PACK", satuan: "Pack", konversi: "1 pack = 50 pcs", digunakanPada: "Penjualan Retail & Grosir", status: "Aktif" },
      { kode: "DUS", satuan: "Dus / Karton", konversi: "1 dus = 20 pack", digunakanPada: "Pembelian Pabrik", status: "Aktif" },
      { kode: "BALL", satuan: "Ball", konversi: "1 ball = 40 pack", digunakanPada: "Grosir Plastik", status: "Aktif" },
      { kode: "ROLL", satuan: "Roll", konversi: "1 roll = 50 meter / 10 kg", digunakanPada: "Plastik Roll & Bubble", status: "Aktif" },
      { kode: "KG", satuan: "Kilogram", konversi: "1 kg", digunakanPada: "Tepung Panir & Biji Plastik", status: "Aktif" },
      { kode: "PCS", satuan: "Pieces (Satuan)", konversi: "1 pcs", digunakanPada: "Eceran Kasir POS", status: "Aktif" },
    ],
    sideTitle: "Standar Satuan & Konversi",
    sideItems: ["Konversi dus ke pack", "Konversi ball ke pack", "Satuan panjang roll & berat kg", "Satuan terkecil pcs"],
  },
  reports: {
    section: "Reporting",
    primaryAction: "Export Laporan",
    stats: [{ label: "Laporan Eksekutif", value: "24" }, { label: "Format", value: "PDF/XLS" }, { label: "Sinkronisasi", value: "Realtime" }],
    columns: ["kode", "laporan", "kategori", "periode", "status"],
    rows: [
      { kode: "RPT-STK-01", laporan: "Analisis Persediaan & Valuasi Multi-Gudang", kategori: "Inventaris", periode: "Realtime", status: "Ready" },
      { kode: "RPT-SAL-01", laporan: "Rekap Penjualan Harian Kasir & Grosir UMKM", kategori: "Penjualan", periode: "Harian", status: "Ready" },
      { kode: "RPT-PUR-01", laporan: "Laporan Pembelian Pabrik & Monitoring TOP", kategori: "Pembelian", periode: "Bulanan", status: "Ready" },
      { kode: "RPT-FIN-01", laporan: "Arus Kas Masuk, Keluar & Margin Laba Bersih", kategori: "Keuangan", periode: "Bulanan", status: "Ready" },
      { kode: "RPT-RST-01", laporan: "Smart Restock Recommendation & Slow Moving", kategori: "Inventaris", periode: "Mingguan", status: "Ready" },
    ],
    sideTitle: "Laporan Strategis Owner",
    sideItems: ["Analisis turnover stok packaging", "Laba kotor per kategori barang", "Monitoring piutang UMKM kuliner", "Rekomendasi pemesanan pabrik"],
  },
  reprints: {
    section: "Dokumen",
    primaryAction: "Cari Dokumen",
    stats: [{ label: "Nota POS", value: "147" }, { label: "Faktur Grosir", value: "32" }, { label: "Faktur Pabrik", value: "18" }],
    columns: ["no", "tanggal", "tipe", "partner", "total", "status"],
    rows: [
      { no: "POS-000184", tanggal: "31/08/2026", tipe: "Nota Penjualan POS", partner: "Pelanggan Umum (Walk-in)", total: 85500, status: "Printable" },
      { no: "SAL-000091", tanggal: "31/08/2026", tipe: "Faktur Penjualan Grosir", partner: "Warung Makan Bu Aminah", total: 3420000, status: "Printable" },
      { no: "PUR-000044", tanggal: "31/08/2026", tipe: "Faktur Pembelian Pabrik", partner: "PT Sinar Joyoboyo Plastik", total: 8450000, status: "Printable" },
    ],
    sideTitle: "Cetak Ulang Dokumen",
    sideItems: ["Nota thermal kasir 58/80mm", "Invoice / faktur penjualan A4/F4", "Surat jalan pengiriman barang", "Bukti tanda terima retur"],
  },
};

const fallback: ModuleConfig = {
  section: "Operasional",
  primaryAction: "Tambah Data",
  stats: [{ label: "Data Aktif", value: "36" }, { label: "Open", value: "8" }, { label: "Selesai", value: "28" }],
  columns: ["no", "tanggal", "nama", "referensi", "total", "status"],
  rows: [
    { no: "TRX-0001", tanggal: "31/08/2026", nama: "Transaksi Operasional", referensi: "Kelolain", total: 1250000, status: "Open" },
  ],
  sideTitle: "Informasi Modul",
  sideItems: ["Pencarian data", "Filter status", "Export laporan", "Cetak dokumen"],
};

const monetaryFields = new Set(["total", "amount", "hpp", "ecer", "grosir", "subtotal", "terbayar", "sisa", "harga", "hargaBeli", "hargaJual"]);

function isMonetaryField(kind: DemoKind, key: string) {
  return monetaryFields.has(key) || (["cashIn", "cashOut"].includes(kind) && key === "jumlah") || (kind === "repack" && key === "nilai");
}

function formatThousands(value: unknown) {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (!digits) return "";
  return new Intl.NumberFormat("id-ID").format(Number(digits));
}

function formatCell(kind: DemoKind, key: string, value: any) {
  if (isMonetaryField(kind, key) && value !== "" && value != null && Number.isFinite(Number(value))) {
    return formatRupiah(Number(value));
  }
  return value ?? "-";
}

function getFieldLabel(kind: DemoKind, column: string): string {
  const labelMap: Record<string, string> = {
    kode: kind === "products" || kind === "stock" ? "Kode SKU / Barcode" : kind === "suppliers" ? "Kode Supplier" : kind === "customers" ? "Kode Pelanggan" : kind === "salesPeople" ? "Kode Salesman" : kind === "warehouses" ? "Kode Gudang" : kind === "categories" ? "Kode Kategori" : kind === "brands" ? "Kode Merk" : kind === "units" ? "Kode Satuan" : "Kode Dokumen / ID",
    nama: kind === "products" || kind === "stock" ? "Nama Produk / Barang" : kind === "suppliers" ? "Nama Supplier / Vendor" : kind === "customers" ? "Nama Pelanggan / Toko" : kind === "salesPeople" ? "Nama Lengkap Salesman" : "Nama Lengkap",
    pelanggan: "Nama Pelanggan / Mitra",
    supplier: "Nama Supplier / Distributor",
    alamat: "Alamat Lengkap",
    kota: "Kota / Kabupaten",
    telp: "No. Telepon / HP",
    hp: "No. Handphone / WhatsApp",
    grup: "Grup Pelanggan / Level Harga",
    area: "Area Penjualan / Wilayah",
    kategori: "Kategori Produk",
    subKategori: "Sub-Kategori / Rincian",
    merk: "Merk / Brand",
    satuan: "Satuan Dasar (UOM)",
    konversi: "Rasio Konversi Satuan",
    digunakanPada: "Digunakan Pada Modul",
    lokasi: "Nama Lokasi / Gudang",
    keterangan: "Keterangan / Catatan",
    keperluan: "Keperluan Pengeluaran Stok",
    faktur: "No. Faktur Supplier",
    fakturRef: "Referensi No. PO / Faktur",
    notaAsal: "No. Nota / Faktur Asal",
    top: "Termin Pembayaran (TOP)",
    gudang: "Gudang / Lokasi Penyimpanan",
    asal: "Gudang Asal (Pengirim)",
    tujuan: "Gudang Tujuan (Penerima)",
    item: "Rincian Item / Barang",
    input: "Item Input (Bahan Baku / Induk)",
    output: "Item Output (Hasil Repack)",
    qtyOrder: "Qty Order (Dipesan)",
    qtyKirim: "Qty Kirim (Surat Jalan)",
    qtySistem: "Qty Sistem (Buku)",
    qtyFisik: "Qty Fisik (Hasil Opname)",
    stokSaatIni: "Stok Fisik Saat Ini",
    sumber: "Sumber Penerimaan Kas",
    pengaturan: "Nama Parameter Pengaturan",
    nilai: "Nilai Parameter",
    hpp: "HPP (Harga Beli Pokok)",
    ecer: "Harga Jual Eceran (Retail)",
    grosir: "Harga Jual Grosir (Mitra)",
    total: "Total Nominal (Rp)",
    jumlah: "Jumlah Nominal Kas (Rp)",
    terbayar: "Nominal Terbayar (Rp)",
    sisa: "Sisa Tagihan / Hutang (Rp)",
    minStock: "Batas Minimum / Low Stock",
    reorderPoint: "Reorder Point (Pesan Ulang)",
    laporan: "Judul Laporan",
    periode: "Periode Transaksi",
    jenis: "Jenis Penjualan",
    no: "Nomor Dokumen / Bukti",
    tanggal: "Tanggal Transaksi",
    jatuhTempo: "Tanggal Jatuh Tempo",
    referensi: "No. Referensi / Bukti Transaksi",
    sku: "Jumlah SKU",
    jumlahSku: "Jumlah SKU Terkait",
    status: "Status Dokumen / Data",
  };
  return labelMap[column] ?? column.charAt(0).toUpperCase() + column.slice(1);
}

function getFieldPlaceholder(kind: DemoKind, column: string): string {
  if (kind === "delivery") {
    if (column === "qtyOrder") return "Contoh: 50 karton (total order pelanggan)";
    if (column === "qtyKirim") return "Contoh: 30 karton (pengiriman bertahap)";
    if (column === "alamat") return "Contoh: Jl. Industri Raya No. 45, Kawasan MM2100, Cikarang";
    if (column === "pelanggan") return "Contoh: Toko Berkah Mandiri / Retail Partner A";
    if (column === "no") return "Contoh: SJ-202608-0027";
  }

  if (kind === "adjustments") {
    if (column === "qtySistem") return "Contoh: 24 pcs (stok tercatat di sistem)";
    if (column === "qtyFisik") return "Contoh: 20 pcs (hasil hitung fisik di rak)";
    if (column === "produk") return "Contoh: Minyak Goreng 1 L / Kopi Bubuk 200 gr";
    if (column === "gudang") return "Contoh: Toko Utama (Irian) / Gudang Logistik Pusat";
  }

  if (kind === "repack") {
    if (column === "input") return "Contoh: 1 karton produk (isi 20 pack)";
    if (column === "output") return "Contoh: 20 pack satuan jual";
    if (column === "nilai") return "Contoh: 240000 (alokasi HPP bahan)";
  }

  if (kind === "stockTransfers") {
    if (column === "asal") return "Contoh: Gudang Logistik Pusat";
    if (column === "tujuan") return "Contoh: Toko Utama (Irian) / Gatotkoco 2 (Krapyak)";
    if (column === "item") return "Contoh: Cup 16oz (20 pack), Kresek HDPE (50 pack)";
  }

  if (kind === "stockIssues") {
    if (column === "keperluan") return "Contoh: Mika Pecah / Reject Pabrik / Sample Display";
    if (column === "item") return "Contoh: Mika Bento 4 Sekat (2 pack)";
  }

  if (kind === "suppliers") {
    if (column === "kode") return "Contoh: SUP-001";
    if (column === "nama") return "Contoh: PT Sumber Makmur / CV Mitra Niaga";
    if (column === "alamat") return "Contoh: Kawasan Industri Rungkut / Palur Raya";
    if (column === "kota") return "Contoh: Surabaya / Surakarta / Semarang";
    if (column === "telp") return "Contoh: 0812-3000-1122 / (0271) 654-321";
  }

  if (kind === "customers") {
    if (column === "kode") return "Contoh: CUST-001";
    if (column === "nama") return "Contoh: Warung Makan Bu Aminah / Kedai Kopi Selaras";
    if (column === "alamat") return "Contoh: Jl. Pandanrejo No. 12 / Krapyak";
    if (column === "kota") return "Contoh: Klaten Tengah / Klaten Selatan";
    if (column === "telp") return "Contoh: 0877-1234-5678";
    if (column === "grup") return "Contoh: Grosir UMKM / Retail Walk-in / Tempo 14 Hari";
  }

  if (kind === "salesPeople") {
    if (column === "kode") return "Contoh: SLS-001";
    if (column === "nama") return "Contoh: Budi Santoso / Siti Rahayu";
    if (column === "hp") return "Contoh: 0877-4400-1122";
    if (column === "alamat") return "Contoh: Pandanrejo / Merbung, Klaten";
    if (column === "area") return "Contoh: Toko Utama (Irian) / Gatotkoco 2 (Krapyak)";
  }

  if (kind === "warehouses") {
    if (column === "kode") return "Contoh: WH-IRIAN / WH-GUDANG";
    if (column === "lokasi") return "Contoh: Toko Utama (Irian) / Gatotkoco 2 (Krapyak)";
    if (column === "keterangan") return "Contoh: Jl. Irian No.8, Klaten Tengah (Display & Kasir)";
  }

  if (kind === "products" || kind === "stock") {
    if (column === "kode") return "Contoh: SKU-MINYAK-1L / 8991001 (Barcode)";
    if (column === "nama") return "Contoh: Minyak Goreng Premium 1 Liter";
    if (column === "kategori") return "Contoh: Sembako / Minuman / Rumah Tangga";
    if (column === "merk") return "Contoh: Merek Utama / Merek Lokal";
    if (column === "satuan") return "Contoh: Pack / Dus / Roll / Ball / Pcs / Kg";
    if (column === "hpp") return "Contoh: 12000 (Harga beli supplier)";
    if (column === "ecer") return "Contoh: 15000 (Harga eceran kasir)";
    if (column === "grosir") return "Contoh: 13200 (Harga mitra grosir/UMKM)";
  }

  if (kind === "purchases") {
    if (column === "no") return "Contoh: PUR-202608-0044";
    if (column === "supplier") return "Contoh: PT Sumber Makmur";
    if (column === "faktur") return "Contoh: INV-SJP-9941/VIII/2026";
    if (column === "top") return "Contoh: TOP 30 Hari / TOP 14 Hari / Tunai";
    if (column === "gudang") return "Contoh: Gudang Logistik Pusat / Toko Utama";
    if (column === "total") return "Contoh: 8450000";
  }

  if (kind === "sales") {
    if (column === "no") return "Contoh: SAL-202608-0091";
    if (column === "pelanggan") return "Contoh: Warung Makan Bu Aminah / Kedai Kopi Selaras";
    if (column === "jenis") return "Contoh: Penjualan Grosir / POS Kasir / Delivery";
    if (column === "gudang") return "Contoh: Toko Utama (Irian) / Gudang Pusat";
    if (column === "total") return "Contoh: 3420000";
  }

  if (kind === "purchaseReturns" || kind === "salesReturns") {
    if (column === "no") return kind === "purchaseReturns" ? "Contoh: RET-P-000006" : "Contoh: RET-S-000011";
    if (column === "notaAsal") return kind === "purchaseReturns" ? "Contoh: PUR-000044 (Faktur Beli Pabrik)" : "Contoh: POS-000184 (Nota Kasir Jual)";
    if (column === "gudang") return "Contoh: Toko Utama (Irian) / Gudang Pusat";
    if (column === "total") return "Contoh: 340000";
  }

  if (kind === "payables" || kind === "receivables") {
    if (column === "no") return "Contoh: INV-202608-0044";
    if (column === "total") return "Contoh: 8450000";
    if (column === "terbayar") return "Contoh: 4000000 (Nominal yang sudah dibayar)";
    if (column === "sisa") return "Contoh: 4450000 (Sisa kewajiban)";
  }

  if (kind === "cashIn" || kind === "cashOut") {
    if (column === "no") return kind === "cashIn" ? "Contoh: CIN-202608-0031" : "Contoh: COUT-202608-0014";
    if (column === "sumber") return "Contoh: Setoran Kasir Toko Irian / Pelunasan UMKM";
    if (column === "tujuan") return "Contoh: Pembayaran Faktur Pabrik / Bensin Armada Toko";
    if (column === "keterangan") return "Contoh: Pembayaran faktur INV-SJP-9941 via transfer BCA";
    if (column === "jumlah") return "Contoh: 4000000";
  }

  if (kind === "categories") {
    if (column === "kode") return "Contoh: CAT-FOOD";
    if (column === "kategori") return "Contoh: Kemasan Makanan & Bento";
    if (column === "subKategori") return "Contoh: Mika Bento, Thinwall, Paper Lunch Box";
    if (column === "jumlahSku") return "Contoh: 42";
  }

  if (kind === "brands") {
    if (column === "kode") return "Contoh: BR-OZA";
    if (column === "merk") return "Contoh: Oza Pack / Starindo / Daimaru";
    if (column === "kategori") return "Contoh: Cup & Minuman / Kemasan Makanan";
    if (column === "sku") return "Contoh: 24";
  }

  if (kind === "units") {
    if (column === "kode") return "Contoh: PACK / DUS / BALL / ROLL / PCS";
    if (column === "satuan") return "Contoh: Pack / Dus / Ball / Roll / Pieces";
    if (column === "konversi") return "Contoh: 1 Dus = 20 Pack / 1 Pack = 50 Pcs";
    if (column === "digunakanPada") return "Contoh: Penjualan Retail & Grosir";
  }

  if (kind === "settings") {
    if (column === "kode") return "Contoh: STORE_NAME / DEFAULT_LOW_STOCK";
    if (column === "pengaturan") return "Contoh: Batas Minimum Stok Global";
    if (column === "nilai") return "Contoh: 15 / Toko Berkah Mandiri";
  }

  const genericMap: Record<string, string> = {
    kode: "Contoh: KOD-001",
    nama: "Contoh: Nama item atau entitas",
    no: "Contoh: DOC-202608-0001",
    tanggal: "Contoh: 31/08/2026 (DD/MM/YYYY)",
    jatuhTempo: "Contoh: 30/09/2026 (DD/MM/YYYY)",
    pelanggan: "Contoh: Toko Sejahtera / Pelanggan Umum",
    supplier: "Contoh: PT Distributor Sentosa",
    alamat: "Contoh: Jl. Sudirman No. 45, Jakarta",
    kota: "Contoh: Jakarta Pusat",
    telp: "Contoh: 0812-3456-7890",
    hp: "Contoh: 0813-9876-5432",
    gudang: "Contoh: Toko Utama / Gudang Pusat",
    total: "Contoh: 1500000",
    jumlah: "Contoh: 500000",
    hpp: "Contoh: 25000",
    ecer: "Contoh: 30000",
    grosir: "Contoh: 27500",
    keterangan: "Contoh: Catatan atau rincian transaksi",
    referensi: "Contoh: REF-9921 / No. Bukti Bank",
  };

  return genericMap[column] ?? `Contoh data untuk ${column}`;
}

function getSearchPlaceholder(kind: DemoKind, title: string): string {
  const map: Partial<Record<DemoKind, string>> = {
    products: "Cari kode SKU, barcode, nama produk, merk, kategori...",
    stock: "Cari kode SKU, nama produk, merk, atau filter stok...",
    suppliers: "Cari kode supplier, nama vendor, alamat, kota...",
    customers: "Cari kode pelanggan, nama toko, grup retail/grosir...",
    salesPeople: "Cari nama salesman, kode, area penjualan, nomor HP...",
    purchases: "Cari no. faktur beli, nama supplier, gudang...",
    sales: "Cari no. nota jual, nama pelanggan, metode bayar...",
    delivery: "Cari no. surat jalan, nama penerima, alamat kirim...",
    purchaseReturns: "Cari no. retur beli, supplier, faktur asal...",
    salesReturns: "Cari no. retur jual, nama pelanggan, nota asal...",
    payables: "Cari no. hutang, nama supplier, tanggal jatuh tempo...",
    receivables: "Cari no. piutang, nama pelanggan, tanggal jatuh tempo...",
    cashIn: "Cari no. kas masuk, sumber dana, keterangan...",
    cashOut: "Cari no. kas keluar, tujuan penerima, keterangan...",
    warehouses: "Cari kode gudang, nama lokasi, status...",
    categories: "Cari nama kategori, sub-kategori produk...",
    brands: "Cari nama brand / merk produk...",
    units: "Cari nama satuan, kode satuan, rasio konversi...",
    reprints: "Cari no. nota cetak ulang, tanggal, nama pembeli...",
    settings: "Cari parameter pengaturan sistem...",
  };
  return map[kind] ?? `Cari data pada modul ${title}...`;
}

export default function DemoModulePage({ kind, title, description }: { kind: DemoKind; title: string; description: string }) {
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState(false);
  const config = useMemo(() => CONFIG[kind] ?? fallback, [kind]);

  // Inventory / Stock state
  const [stockProducts, setStockProducts] = useState<ProductStockData[]>(INITIAL_STOCK_PRODUCTS);
  const [selectedWarehouse, setSelectedWarehouse] = useState<"ALL" | "TOKO" | "GUDANG" | "CABANG">("ALL");
  const [inspectingProduct, setInspectingProduct] = useState<ProductStockData | null>(null);
  const [stockStatusFilter, setStockStatusFilter] = useState<string>("ALL");

  // General records state
  const [records, setRecords] = useState<Row[]>(config.rows);

  // Edit / Create modal state
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [form, setForm] = useState<Record<string, any>>({});

  // Transaction detail modal state
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [activeTransaction, setActiveTransaction] = useState<TransactionDetail | null>(null);

  useEffect(() => {
    if (kind === "reprints") {
      const receipts = getSalesReceipts().map((receipt) => ({
        no: receipt.number,
        tanggal: receipt.date,
        tipe: "Nota Penjualan",
        partner: receipt.customer,
        total: receipt.total,
        status: "Printable",
      }));
      setRecords([...receipts, ...config.rows]);
    } else if (kind === "stock") {
      const savedStock = getStockSnapshot();
      if (Object.keys(savedStock).length > 0) {
        setStockProducts((current) =>
          current.map((p) => ({
            ...p,
            stockToko: savedStock[p.kode] !== undefined ? savedStock[p.kode] : p.stockToko,
          }))
        );
      }
    } else {
      setRecords(config.rows);
    }
    setQuery("");
    setSaved(false);
    setEditorOpen(false);
    setDetailModalOpen(false);
    setActiveTransaction(null);
    setInspectingProduct(null);
    setStockStatusFilter("ALL");
  }, [config, kind]);

  // Function to get current stock by selected warehouse
  const getStockQtyByWarehouse = (item: ProductStockData) => {
    if (selectedWarehouse === "TOKO") return item.stockToko;
    if (selectedWarehouse === "GUDANG") return item.stockGudang;
    if (selectedWarehouse === "CABANG") return item.stockCabang;
    // ALL -> aggregate
    return item.stockToko + item.stockGudang + item.stockCabang;
  };

  // Filtered rows for general table
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return records;
    return records.filter((row) => Object.values(row).some((value) => String(value).toLowerCase().includes(q)));
  }, [records, query]);

  // Stock status counts for quick filter chips
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { AMAN: 0, LOW: 0, RESTOCK: 0, HABIS: 0, BELUM_DIATUR: 0 };
    stockProducts.forEach((p) => {
      const qty = getStockQtyByWarehouse(p);
      const res = calculateStockStatus({
        currentStock: qty,
        lowStockThreshold: p.lowStockThreshold,
        reorderPoint: p.reorderPoint,
        uom: p.satuan,
      });
      if (counts[res.status] !== undefined) {
        counts[res.status]++;
      }
    });
    return counts;
  }, [stockProducts, selectedWarehouse]);

  // Filtered products for stock module
  const filteredStockProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return stockProducts.filter((item) => {
      if (stockStatusFilter !== "ALL") {
        const qty = getStockQtyByWarehouse(item);
        const res = calculateStockStatus({
          currentStock: qty,
          lowStockThreshold: item.lowStockThreshold,
          reorderPoint: item.reorderPoint,
          uom: item.satuan,
        });
        if (res.status !== stockStatusFilter) return false;
      }
      if (!q) return true;
      return (
        item.nama.toLowerCase().includes(q) ||
        item.kode.toLowerCase().includes(q) ||
        item.kategori.toLowerCase().includes(q) ||
        item.merk.toLowerCase().includes(q)
      );
    });
  }, [stockProducts, query, selectedWarehouse, stockStatusFilter]);

  // Open Create Modal
  const openCreate = () => {
    const next: Record<string, any> = {};
    config.columns.forEach((column) => {
      if (column === "status") next[column] = "Aktif";
      else if (["tanggal", "jatuhTempo"].includes(column)) next[column] = "31/08/2026";
      else if (["total", "hpp", "ecer", "grosir", "jumlah", "nilai", "terbayar", "sisa", "sku", "jumlahSku"].includes(column)) next[column] = 0;
      else if (column === "minStock") next[column] = 20;
      else if (column === "reorderPoint") next[column] = 10;
      else next[column] = "";
    });
    const firstColumn = config.columns[0];
    if (firstColumn && !next[firstColumn]) {
      next[firstColumn] = `${firstColumn.toUpperCase()}-${String(records.length + 1).padStart(3, "0")}`;
    }
    setForm(next);
    setEditingIndex(null);
    setEditorOpen(true);
  };

  // Open Edit Modal
  const openEdit = (row: Row) => {
    const sourceIndex = records.findIndex((record) => record === row);
    const next: Record<string, any> = { ...row };
    setForm(next);
    setEditingIndex(sourceIndex >= 0 ? sourceIndex : null);
    setEditorOpen(true);
  };

  // Open Transaction Detail / Manage Modal
  const openTransactionDetail = (row: Row) => {
    const no = String(row.no ?? row.kode ?? "");
    let trx = INITIAL_TRANSACTIONS[no];

    if (!trx) {
      // Build dynamic fallback transaction
      const isSales = kind.includes("sale") || kind === "delivery" || kind === "reprints";
      const total = typeof row.total === "number" ? row.total : Number(String(row.total ?? "0").replace(/[^\d.-]/g, "")) || 500000;
      trx = {
        no: no || "TRX-DEMO-001",
        tanggal: String(row.tanggal ?? "31/08/2026"),
        tipe: String(row.jenis ?? row.tipe ?? title),
        partner: String(row.pelanggan ?? row.supplier ?? row.partner ?? "Partner Demo"),
        partnerRole: isSales ? "Pelanggan" : "Supplier",
        fakturRef: row.faktur ? String(row.faktur) : undefined,
        gudang: String(row.gudang ?? "Gudang Utama"),
        petugas: "Admin Operasional",
        top: row.top ? String(row.top) : "Tunai",
        jatuhTempo: row.jatuhTempo ? String(row.jatuhTempo) : "-",
        status: String(row.status ?? "Open"),
        items: [
          { sku: "SKU-CUP-16OZ", name: "Cup Plastik PP 16oz Oza (50 pcs)", qty: 2, unit: "pack", price: 15000, subtotal: 30000 },
          { sku: "SKU-KRESEK-15", name: "Kresek HDPE Bening 15x30 (500 gr)", qty: 3, unit: "pack", price: 12500, subtotal: 37500 },
        ],
        subtotal: total,
        diskon: 0,
        pajak: 0,
        biayaKirim: 0,
        total: total,
        terbayar: String(row.status).toLowerCase().includes("lunas") ? total : 0,
        sisa: String(row.status).toLowerCase().includes("lunas") ? 0 : total,
        catatan: "Dokumen transaksi sistem POS & ERP Retail",
      };
    }

    setActiveTransaction(trx);
    setDetailModalOpen(true);
  };

  // Save Record
  const saveRecord = () => {
    const nextRow: Row = { ...form };
    config.columns.forEach((column) => {
      const raw = form[column] ?? "";
      const shouldNumber = ["total", "hpp", "ecer", "grosir", "jumlah", "nilai", "terbayar", "sisa", "minStock", "reorderPoint"].includes(column);
      if (shouldNumber && typeof raw === "string") {
        nextRow[column] = Number(raw.replace(/[^\d.-]/g, "")) || 0;
      }
    });

    if (kind === "products") {
      // Update in stockProducts as well if editing
      setStockProducts((current) => {
        const exists = current.find((p) => p.kode === nextRow.kode);
        if (exists) {
          return current.map((p) =>
            p.kode === nextRow.kode
              ? {
                  ...p,
                  nama: nextRow.nama ?? p.nama,
                  kategori: nextRow.kategori ?? p.kategori,
                  merk: nextRow.merk ?? p.merk,
                  satuan: nextRow.satuan ?? p.satuan,
                  hpp: Number(nextRow.hpp) || p.hpp,
                  ecer: Number(nextRow.ecer) || p.ecer,
                  grosir: Number(nextRow.grosir) || p.grosir,
                  lowStockThreshold: nextRow.minStock !== "" && nextRow.minStock !== "-" ? Number(nextRow.minStock) : null,
                  reorderPoint: nextRow.reorderPoint !== "" && nextRow.reorderPoint !== "-" ? Number(nextRow.reorderPoint) : null,
                }
              : p
          );
        } else {
          return [
            ...current,
            {
              kode: nextRow.kode,
              nama: nextRow.nama,
              kategori: nextRow.kategori,
              merk: nextRow.merk,
              satuan: nextRow.satuan || "PCS",
              hpp: Number(nextRow.hpp) || 0,
              ecer: Number(nextRow.ecer) || 0,
              grosir: Number(nextRow.grosir) || 0,
              stockToko: 0,
              stockGudang: 0,
              stockCabang: 0,
              lowStockThreshold: nextRow.minStock ? Number(nextRow.minStock) : 20,
              reorderPoint: nextRow.reorderPoint ? Number(nextRow.reorderPoint) : 10,
            },
          ];
        }
      });
    }

    setRecords((current) => {
      if (editingIndex === null) return [nextRow, ...current];
      return current.map((row, index) => (index === editingIndex ? nextRow : row));
    });
    setEditorOpen(false);
    setEditingIndex(null);
    setSaved(true);
  };

  const deleteRecord = (row: Row) => {
    const recordName = String(row.nama ?? row.no ?? row.kode ?? "data ini");
    if (!window.confirm(`Hapus ${recordName}? Tindakan ini tidak dapat dibatalkan.`)) return;
    setRecords((current) => current.filter((record) => record !== row));
    setSaved(true);
  };

  const isTransactionModule = [
    "sales", "purchases", "delivery", "purchaseReturns", "salesReturns", "payables", "receivables", "reprints", "stockTransfers", "stockIssues", "repack", "adjustments"
  ].includes(kind);

  return (
    <div className="module-page">
      {/* Header Section */}
      <section className="page-header">
        <div>
          <span>{config.section}</span>
          <h1>{title || config.section}</h1>
          <p>{description}</p>
        </div>
        <div className="header-actions">
          <Button onClick={openCreate}>
            <Plus size={16} /> {config.primaryAction}
          </Button>
          <Button variant="outline">
            <Upload size={15} /> Import
          </Button>
          <Button variant="outline">
            <Download size={15} /> Export
          </Button>
        </div>
      </section>

      {/* KPI Stats */}
      <section className="module-stats">
        {config.stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle>{stat.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={stat.status === "warning" ? "warning" : "success"}>
                {stat.status ? "Perlu ditinjau" : "Terkendali"}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </section>

      {saved && <div className="system-alert" role="status" aria-live="polite">Perubahan berhasil disimpan.</div>}

      {/* Multi-Warehouse Selector for Stock Module */}
      {kind === "stock" && (
        <div className="stock-warehouse-dashboard">
          <Card className="warehouse-selector-card">
            <CardContent className="warehouse-selector-body">
              <div className="warehouse-nav-top">
                <div className="warehouse-title-group">
                  <div className="warehouse-icon-badge">
                    <Warehouse size={18} />
                  </div>
                  <div className="warehouse-title-copy">
                    <strong>Lokasi persediaan</strong>
                    <p>
                      Pilih gudang untuk melihat saldo dan status persediaan di setiap lokasi.
                    </p>
                  </div>
                </div>
                <div className="warehouse-segmented-control">
                  <button
                    type="button"
                    className={`segmented-btn ${selectedWarehouse === "ALL" ? "active" : ""}`}
                    onClick={() => setSelectedWarehouse("ALL")}
                  >
                    <Building2 size={14} /> Semua Gudang ({stockProducts.length} SKU)
                  </button>
                  <button
                    type="button"
                    className={`segmented-btn ${selectedWarehouse === "TOKO" ? "active" : ""}`}
                    onClick={() => setSelectedWarehouse("TOKO")}
                  >
                    <Store size={14} /> Toko Utama (Irian)
                  </button>
                  <button
                    type="button"
                    className={`segmented-btn ${selectedWarehouse === "GUDANG" ? "active" : ""}`}
                    onClick={() => setSelectedWarehouse("GUDANG")}
                  >
                    <Warehouse size={14} /> Gudang Logistik Pusat
                  </button>
                  <button
                    type="button"
                    className={`segmented-btn ${selectedWarehouse === "CABANG" ? "active" : ""}`}
                    onClick={() => setSelectedWarehouse("CABANG")}
                  >
                    <Truck size={14} /> Gatotkoco 2 (Krapyak)
                  </button>
                </div>
              </div>

              {/* Quick Stock Status Filter Pills */}
              <div className="stock-status-chips">
                <span className="text-xs font-semibold text-zinc-500 mr-1">Filter Status:</span>
                <button
                  type="button"
                  className={`status-chip ${stockStatusFilter === "ALL" ? "active" : ""}`}
                  onClick={() => setStockStatusFilter("ALL")}
                >
                  Semua ({stockProducts.length})
                </button>
                <button
                  type="button"
                  className={`status-chip ${stockStatusFilter === "AMAN" ? "active" : ""}`}
                  onClick={() => setStockStatusFilter(stockStatusFilter === "AMAN" ? "ALL" : "AMAN")}
                >
                  <span className="status-dot dot-success" />
                  Aman ({statusCounts.AMAN})
                </button>
                <button
                  type="button"
                  className={`status-chip ${stockStatusFilter === "LOW" ? "active" : ""}`}
                  onClick={() => setStockStatusFilter(stockStatusFilter === "LOW" ? "ALL" : "LOW")}
                >
                  <span className="status-dot dot-warning" />
                  Menipis ({statusCounts.LOW})
                </button>
                <button
                  type="button"
                  className={`status-chip ${stockStatusFilter === "RESTOCK" ? "active" : ""}`}
                  onClick={() => setStockStatusFilter(stockStatusFilter === "RESTOCK" ? "ALL" : "RESTOCK")}
                >
                  <span className="status-dot dot-danger" />
                  Perlu Restock ({statusCounts.RESTOCK})
                </button>
                <button
                  type="button"
                  className={`status-chip ${stockStatusFilter === "HABIS" ? "active" : ""}`}
                  onClick={() => setStockStatusFilter(stockStatusFilter === "HABIS" ? "ALL" : "HABIS")}
                >
                  <span className="status-dot dot-neutral" />
                  Habis ({statusCounts.HABIS})
                </button>
                {statusCounts.UNCONFIGURED > 0 && (
                  <button
                    type="button"
                    className={`status-chip ${stockStatusFilter === "UNCONFIGURED" ? "active" : ""}`}
                    onClick={() => setStockStatusFilter(stockStatusFilter === "UNCONFIGURED" ? "ALL" : "UNCONFIGURED")}
                  >
                    <span className="status-dot dot-neutral" />
                    Belum Diatur ({statusCounts.UNCONFIGURED})
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Full-width Main Table Card */}
      <section className="module-layout-full">
        <Card className="module-table-card">
          <CardHeader>
            <div className="table-header">
              <div>
                <CardTitle>
                  {kind === "stock"
                    ? `Daftar Saldo Stok — ${
                        selectedWarehouse === "ALL"
                          ? "Semua Gudang"
                          : selectedWarehouse === "TOKO"
                          ? "Toko Irian"
                          : selectedWarehouse === "GUDANG"
                          ? "Gudang Pusat"
                          : "Krapyak"
                      }`
                    : title || config.section}
                </CardTitle>
                <CardDescription>
                  {kind === "stock"
                    ? `${filteredStockProducts.length} produk · Status diperbarui berdasarkan batas minimum stok`
                    : `${rows.length} data tercatat dalam sistem`}
                </CardDescription>
              </div>
              <div className="table-tools">
                <div className="table-search">
                  <Search size={15} />
                  <input
                    aria-label="Cari data"
                    name="module-search"
                    autoComplete="off"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={getSearchPlaceholder(kind, title)}
                  />
                </div>
                <Button variant="outline" size="sm" onClick={() => window.print()}>
                  <Printer size={15} /> Cetak
                </Button>
                <Button size="sm" onClick={openCreate}>
                  <Plus size={15} /> {config.primaryAction}
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="data-table">
            {kind === "stock" ? (
              /* DEDICATED INVENTORY / STOCK TABLE WITH DYNAMIC STATUS */
              <table className="stock-clean-table">
                <thead>
                  <tr>
                    <th style={{ width: "130px" }}>Kode SKU</th>
                    <th>Nama Produk</th>
                    <th style={{ width: "190px" }}>Kategori / Merk</th>
                    <th className="right" style={{ width: "180px" }}>Stok Tersedia</th>
                    <th className="right" style={{ width: "120px" }}>HPP</th>
                    <th style={{ width: "170px" }}>Status</th>
                    <th className="right" style={{ width: "100px" }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStockProducts.map((product) => {
                    const currentQty = getStockQtyByWarehouse(product);
                    const statusRes = calculateStockStatus({
                      currentStock: currentQty,
                      lowStockThreshold: product.lowStockThreshold,
                      reorderPoint: product.reorderPoint,
                      uom: product.satuan,
                    });

                    return (
                      <tr key={product.kode}>
                        <td data-label="Kode SKU">
                          <span className="sku-badge">{product.kode}</span>
                        </td>
                        <td data-label="Produk">
                          <div className="product-info-cell">
                            <strong className="product-title-text">{product.nama}</strong>
                          </div>
                        </td>
                        <td data-label="Kategori / Merk">
                          <div className="category-brand-cell">
                            <span className="cell-category-tag">{product.kategori}</span>
                            <small className="cell-brand-text">{product.merk}</small>
                          </div>
                        </td>
                        <td className="right" data-label="Stok Tersedia">
                          <div className="stock-figure-cell">
                            <strong className="stock-qty-num">{currentQty}</strong>
                            <span className="stock-uom-tag">{product.satuan}</span>
                          </div>
                        </td>
                        <td className="right font-mono" data-label="HPP">
                          {formatRupiah(product.hpp)}
                        </td>
                        <td data-label="Status">
                          <div className="stock-status-cell">
                            <Badge variant={statusRes.variant}>
                              {statusRes.label}
                            </Badge>
                          </div>
                        </td>
                        <td className="right" data-label="Aksi">
                          <div className="row-actions">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setInspectingProduct(product)}
                              title="Inspeksi Multi-Gudang & Threshold"
                            >
                              <Sliders size={13} /> Detail
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              /* STANDARD MODULE TABLE */
              <table>
                <thead>
                  <tr>
                    {config.columns.map((column) => (
                      <th key={column} className={["total", "hpp", "ecer", "grosir", "terbayar", "sisa", "jumlah"].includes(column) ? "right" : ""}>
                        {column === "status" ? (
                          <div className="status-header-cell">
                            <span>Status</span>
                            <div className="status-info-trigger" title="Status indikator operasional">
                              <HelpCircle size={13} />
                            </div>
                          </div>
                        ) : (
                          getFieldLabel(kind, column)
                        )}
                      </th>
                    ))}
                    <th className="right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={index}>
                      {config.columns.map((column) => (
                        <td
                          key={column}
                          data-label={getFieldLabel(kind, column)}
                          className={["total", "hpp", "ecer", "grosir", "terbayar", "sisa", "jumlah"].includes(column) ? "right" : ""}
                        >
                          {column === "status" ? (
                            <Badge variant={row[column] === "Lunas" || row[column] === "Aktif" || row[column] === "Posted" || row[column] === "Selesai" ? "success" : "warning"}>
                              {row[column]}
                            </Badge>
                          ) : (
                            formatCell(kind, column, row[column])
                          )}
                        </td>
                      ))}
                      <td className="right" data-label="aksi">
                        <div className="row-actions">
                          {isTransactionModule && (
                            <Button variant="outline" size="sm" onClick={() => openTransactionDetail(row)}>
                              <Eye size={14} /> Detail
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => openEdit(row)}>
                            <Pencil size={14} /> Edit
                          </Button>
                          <Button variant="ghost" size="sm" aria-label={`Hapus ${String(row.nama ?? row.no ?? row.kode ?? "data")}`} onClick={() => deleteRecord(row)}>
                            <Trash2 size={14} /> Hapus
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

      </section>

      {/* ======================================================================== */}
      {/* 1. TRANSACTION DETAIL & MANAGE MODAL (LARGE 900-1100px, STICKY FOOTER) */}
      {/* ======================================================================== */}
      {detailModalOpen && activeTransaction && (
        <div className="crud-overlay" onClick={() => setDetailModalOpen(false)}>
          <div className="large-modal-dialog" onClick={(event) => event.stopPropagation()}>
            {/* Header Modal */}
            <div className="modal-header">
              <div className="modal-title-box">
                <div className="flex items-center gap-3">
                  <div className="modal-badge-icon">
                    <FileText size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="modal-title">{activeTransaction.tipe}</h2>
                      <Badge variant={activeTransaction.status === "Lunas" || activeTransaction.status === "Selesai" ? "success" : "warning"}>
                        {activeTransaction.status}
                      </Badge>
                    </div>
                    <p className="modal-subtitle">
                      Nomor Transaksi: <span className="font-mono font-bold text-zinc-900">{activeTransaction.no}</span> · Tanggal: {activeTransaction.tanggal}
                    </p>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setDetailModalOpen(false)} aria-label="Tutup">
                <X size={18} />
              </Button>
            </div>

            {/* Scrollable Body Modal */}
            <div className="modal-body-scrollable">
              {/* Transaction Meta Cards */}
              <div className="trx-meta-grid">
                <div className="trx-meta-card">
                  <span className="trx-meta-label">{activeTransaction.partnerRole}</span>
                  <strong className="trx-meta-val">{activeTransaction.partner}</strong>
                  {activeTransaction.fakturRef && (
                    <small className="trx-meta-sub">Ref/Faktur: {activeTransaction.fakturRef}</small>
                  )}
                </div>
                <div className="trx-meta-card">
                  <span className="trx-meta-label">Gudang & Lokasi</span>
                  <strong className="trx-meta-val">{activeTransaction.gudang}</strong>
                  <small className="trx-meta-sub">Petugas: {activeTransaction.petugas}</small>
                </div>
                <div className="trx-meta-card">
                  <span className="trx-meta-label">Termin Pembayaran (TOP)</span>
                  <strong className="trx-meta-val">{activeTransaction.top || "Tunai"}</strong>
                  <small className="trx-meta-sub">Jatuh Tempo: {activeTransaction.jatuhTempo || "-"}</small>
                </div>
                <div className="trx-meta-card">
                  <span className="trx-meta-label">Status Pelunasan</span>
                  <strong className="trx-meta-val text-emerald-700">{formatRupiah(activeTransaction.total)}</strong>
                  <small className="trx-meta-sub">
                    Terbayar: {formatRupiah(activeTransaction.terbayar)} | Sisa: {formatRupiah(activeTransaction.sisa)}
                  </small>
                </div>
              </div>

              {/* Items Table */}
              <div className="trx-items-section">
                <div className="trx-section-title">
                  <Boxes size={16} />
                  <span>Rincian Barang / Produk</span>
                </div>
                <div className="trx-table-container">
                  <table className="trx-table">
                    <thead>
                      <tr>
                        <th>No</th>
                        <th>Kode SKU & Nama Produk</th>
                        <th className="right">Qty & Satuan</th>
                        <th className="right">Harga Satuan</th>
                        <th className="right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeTransaction.items.map((item, idx) => (
                        <tr key={item.sku}>
                          <td className="text-zinc-400 font-mono text-xs">{idx + 1}</td>
                          <td>
                            <strong>{item.name}</strong>
                            <span className="block text-xs font-mono text-zinc-500">{item.sku}</span>
                          </td>
                          <td className="right">
                            <b>{item.qty}</b> <span className="text-xs text-zinc-500">{item.unit}</span>
                          </td>
                          <td className="right font-mono text-sm">{formatRupiah(item.price)}</td>
                          <td className="right font-mono text-sm font-bold">{formatRupiah(item.subtotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Summary Section */}
              <div className="trx-summary-grid">
                <div className="trx-notes-box">
                  <span className="text-xs font-bold text-zinc-500 block mb-1">Catatan Transaksi:</span>
                  <p className="text-sm text-zinc-700">{activeTransaction.catatan || "Tidak ada catatan tambahan."}</p>
                </div>
                <div className="trx-totals-box">
                  <div className="trx-total-row">
                    <span>Subtotal Barang</span>
                    <b>{formatRupiah(activeTransaction.subtotal)}</b>
                  </div>
                  {activeTransaction.diskon > 0 && (
                    <div className="trx-total-row text-amber-700">
                      <span>Potongan / Diskon</span>
                      <b>- {formatRupiah(activeTransaction.diskon)}</b>
                    </div>
                  )}
                  {activeTransaction.biayaKirim > 0 && (
                    <div className="trx-total-row">
                      <span>Biaya Pengiriman</span>
                      <b>+ {formatRupiah(activeTransaction.biayaKirim)}</b>
                    </div>
                  )}
                  <div className="trx-total-row trx-grand-total">
                    <span>TOTAL TRANSAKSI</span>
                    <strong>{formatRupiah(activeTransaction.total)}</strong>
                  </div>
                  <div className="trx-total-row text-xs pt-1 border-t border-zinc-200">
                    <span>Total Terbayar:</span>
                    <span className="font-bold text-emerald-700">{formatRupiah(activeTransaction.terbayar)}</span>
                  </div>
                  {activeTransaction.sisa > 0 && (
                    <div className="trx-total-row text-xs">
                      <span>Sisa Tagihan / Hutang:</span>
                      <span className="font-bold text-rose-700">{formatRupiah(activeTransaction.sisa)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sticky Footer Modal with Prominent Actions */}
            <div className="modal-footer-sticky">
              <Button variant="outline" onClick={() => setDetailModalOpen(false)}>
                Tutup
              </Button>
              <Button variant="outline" onClick={() => window.print()}>
                <Printer size={15} /> Cetak Dokumen
              </Button>
              <Button onClick={() => {
                alert(`Transaksi ${activeTransaction.no} berhasil diproses.`);
                setDetailModalOpen(false);
              }}>
                <Save size={15} /> Simpan / Proses Transaksi
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================== */}
      {/* 2. DEDICATED STOCK ANALYSIS & INSPECTION MODAL (NO CLIPPING/OVERFLOW)   */}
      {/* ======================================================================== */}
      {inspectingProduct && (
        <div className="crud-overlay" onClick={() => setInspectingProduct(null)}>
          <div
            className="large-modal-dialog"
            onClick={(event) => event.stopPropagation()}
            style={{ maxWidth: "840px" }}
          >
            {/* Modal Header */}
            <div className="modal-header">
              <div className="modal-title-box">
                <div className="modal-badge-icon">
                  <Boxes size={20} />
                </div>
                <div>
                  <h2 className="modal-title">Analisis Status & Persediaan Stok</h2>
                  <p className="modal-subtitle">
                    Kode SKU: <b className="font-mono text-zinc-900">{inspectingProduct.kode}</b> · {inspectingProduct.nama}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setInspectingProduct(null)} aria-label="Tutup">
                <X size={18} />
              </Button>
            </div>

            {/* Modal Body */}
            <div className="modal-body-scrollable">
              {(() => {
                const qty = getStockQtyByWarehouse(inspectingProduct);
                const statusRes = calculateStockStatus({
                  currentStock: qty,
                  lowStockThreshold: inspectingProduct.lowStockThreshold,
                  reorderPoint: inspectingProduct.reorderPoint,
                  uom: inspectingProduct.satuan,
                });

                return (
                  <div className="stock-analysis-modal-content">
                    {/* Highlight Banner */}
                    <div className={`status-highlight-banner banner-${statusRes.variant}`}>
                      <div className="banner-top">
                        <span className={`status-indicator-dot dot-${statusRes.variant}`} />
                        <strong>STATUS PERSEDIAAN: {statusRes.label}</strong>
                        <span className="banner-loc-tag">
                          Lokasi: {selectedWarehouse === "ALL" ? "Semua Gudang (Akumulasi)" : selectedWarehouse === "TOKO" ? "Toko Utama" : selectedWarehouse === "GUDANG" ? "Gudang Utama" : "Gudang Cabang"}
                        </span>
                      </div>
                      <p className="banner-desc">{statusRes.explanation}</p>
                    </div>

                    <div className="analysis-grid">
                      {/* Saldo Multi-Gudang */}
                      <div className="analysis-card">
                        <div className="analysis-card-title">
                          <Warehouse size={15} />
                          <span>Rincian Saldo Multi-Gudang</span>
                        </div>
                        <div className="analysis-card-body">
                          <div className="breakdown-row">
                            <span><Store size={14} /> Toko Utama (Kasir/Display):</span>
                            <b>{inspectingProduct.stockToko} {inspectingProduct.satuan}</b>
                          </div>
                          <div className="breakdown-row">
                            <span><Warehouse size={14} /> Gudang Utama (Pusat Pembelian):</span>
                            <b>{inspectingProduct.stockGudang} {inspectingProduct.satuan}</b>
                          </div>
                          <div className="breakdown-row">
                            <span><Truck size={14} /> Gudang Cabang (Transit & Buffer):</span>
                            <b>{inspectingProduct.stockCabang} {inspectingProduct.satuan}</b>
                          </div>
                          <div className="breakdown-row total-row">
                            <strong>Total Saldo Akumulasi:</strong>
                            <strong>{inspectingProduct.stockToko + inspectingProduct.stockGudang + inspectingProduct.stockCabang} {inspectingProduct.satuan}</strong>
                          </div>
                        </div>
                      </div>

                      {/* Konfigurasi Threshold */}
                      <div className="analysis-card">
                        <div className="analysis-card-title">
                          <Sliders size={15} />
                          <span>Ambang Batas & Target Restock</span>
                        </div>
                        <div className="analysis-card-body">
                          <div className="breakdown-row">
                            <span>Batas Minimum (Low Stock):</span>
                            <b>{inspectingProduct.lowStockThreshold != null ? `${inspectingProduct.lowStockThreshold} ${inspectingProduct.satuan}` : "Belum diatur"}</b>
                          </div>
                          <div className="breakdown-row">
                            <span>Reorder Point (Pesan Ulang):</span>
                            <b>{inspectingProduct.reorderPoint != null ? `≤ ${inspectingProduct.reorderPoint} ${inspectingProduct.satuan}` : "Belum diatur"}</b>
                          </div>
                          <div className="breakdown-row">
                            <span>Satuan Dasar (UOM):</span>
                            <b>{inspectingProduct.satuan}</b>
                          </div>
                          <div className="breakdown-row total-row">
                            <span>Kebutuhan Restock:</span>
                            <b className={qty <= (inspectingProduct.reorderPoint ?? 0) ? "text-rose-600 font-bold" : "text-emerald-600 font-medium"}>
                              {qty <= (inspectingProduct.reorderPoint ?? 0)
                                ? `Perlu Restock (+${Math.max(1, (inspectingProduct.lowStockThreshold ?? 20) - qty)} ${inspectingProduct.satuan})`
                                : "Stok Masih Aman"}
                            </b>
                          </div>
                        </div>
                      </div>

                      {/* Valuasi & Harga */}
                      <div className="analysis-card" style={{ gridColumn: "span 2" }}>
                        <div className="analysis-card-title">
                          <Layers size={15} />
                          <span>Valuasi Persediaan & Skema Harga</span>
                        </div>
                        <div className="analysis-card-body valuation-grid">
                          <div className="val-box">
                            <small>Harga Pokok (HPP)</small>
                            <strong>{formatRupiah(inspectingProduct.hpp)}</strong>
                          </div>
                          <div className="val-box">
                            <small>Harga Jual Eceran</small>
                            <strong>{formatRupiah(inspectingProduct.ecer)}</strong>
                          </div>
                          <div className="val-box">
                            <small>Harga Jual Grosir</small>
                            <strong>{formatRupiah(inspectingProduct.grosir)}</strong>
                          </div>
                          <div className="val-box val-highlight">
                            <small>Total Nilai Aset Stok</small>
                            <strong>
                              {formatRupiah(
                                (inspectingProduct.stockToko + inspectingProduct.stockGudang + inspectingProduct.stockCabang) *
                                  inspectingProduct.hpp
                              )}
                            </strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="modal-footer-sticky">
              <Button variant="outline" onClick={() => setInspectingProduct(null)}>
                Tutup
              </Button>
              <Button
                onClick={() => {
                  const p = inspectingProduct;
                  setInspectingProduct(null);
                  setForm({
                    kode: p.kode,
                    nama: p.nama,
                    kategori: p.kategori,
                    merk: p.merk,
                    satuan: p.satuan,
                    hpp: p.hpp,
                    ecer: p.ecer,
                    grosir: p.grosir,
                    minStock: p.lowStockThreshold ?? "",
                    reorderPoint: p.reorderPoint ?? "",
                  });
                  setEditorOpen(true);
                }}
              >
                <Sliders size={15} /> Atur Ambang Batas & Stok
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================== */}
      {/* 3. CREATE / EDIT DATA MODAL (WITH MANAJEMEN STOK THRESHOLDS)             */}
      {/* ======================================================================== */}
      {editorOpen && (
        <div className="crud-overlay" onClick={() => setEditorOpen(false)}>
          <div className="large-modal-dialog" onClick={(event) => event.stopPropagation()}>
            {/* Header Modal */}
            <div className="modal-header">
              <div className="modal-title-box">
                <div className="flex items-center gap-3">
                  <div className="modal-badge-icon">
                    <Sliders size={18} />
                  </div>
                  <div>
                    <h2 className="modal-title">
                      {editingIndex === null ? config.primaryAction : `Edit ${title || config.section}`}
                    </h2>
                    <p className="modal-subtitle">Isi informasi yang diperlukan, lalu simpan perubahan.</p>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setEditorOpen(false)} aria-label="Tutup">
                <X size={18} />
              </Button>
            </div>

            {/* Scrollable Body Modal */}
            <div className="modal-body-scrollable">
              <div className="crud-form-layout">
                {/* Standard Module Form Fields */}
                <div className="form-section-title">
                  <FileText size={15} />
                  <span>Informasi Utama</span>
                </div>
                <div className="form-grid">
                  {config.columns
                    .filter((col) => !["minStock", "reorderPoint", "stokSaatIni"].includes(col))
                    .map((column) => (
                      <label key={column} className="form-field">
                        <span className="field-label">{getFieldLabel(kind, column)}</span>
                        {column === "status" ? (
                          <select
                            name={column}
                            autoComplete="off"
                            className="field-input"
                            value={form[column] ?? "Aktif"}
                            onChange={(event) => setForm((curr) => ({ ...curr, [column]: event.target.value }))}
                          >
                            <option>Aktif</option>
                            <option>Draft</option>
                            <option>Open</option>
                            <option>Partial</option>
                            <option>Posted</option>
                            <option>Lunas</option>
                            <option>Pending</option>
                          </select>
                        ) : (
                          <input
                            name={column}
                            autoComplete="off"
                            type="text"
                            inputMode={isMonetaryField(kind, column) || ["sku", "jumlahSku"].includes(column) ? "numeric" : undefined}
                            className="field-input"
                            value={isMonetaryField(kind, column) ? formatThousands(form[column]) : form[column] ?? ""}
                            onChange={(event) => {
                              const value = isMonetaryField(kind, column)
                                ? Number(event.target.value.replace(/\D/g, "")) || 0
                                : event.target.value;
                              setForm((curr) => ({ ...curr, [column]: value }));
                            }}
                            placeholder={getFieldPlaceholder(kind, column)}
                          />
                        )}
                      </label>
                    ))}
                </div>

                {/* DEDICATED MANAJEMEN STOK SECTION (Master Produk & Stock) */}
                {(kind === "products" || kind === "stock") && (
                  <div className="stock-threshold-section">
                    <div className="form-section-title text-zinc-900">
                      <Layers size={16} />
                      <span>Manajemen Stok & Ambang Batas (Threshold)</span>
                    </div>
                    <p className="section-helper-text">
                      Digunakan untuk menentukan status stok (AMAN / LOW / RESTOCK / HABIS) dan peringatan otomatis pada multi-gudang.
                    </p>

                    <div className="form-grid pt-2">
                      <label className="form-field">
                        <span className="field-label flex items-center gap-1.5">
                          <span>Minimum / Low Stock Threshold</span>
                          <span className="text-rose-500">*</span>
                        </span>
                        <input
                          type="number"
                          className="field-input"
                          value={form["minStock"] ?? 20}
                          onChange={(event) => setForm((curr) => ({ ...curr, minStock: event.target.value }))}
                          placeholder="Contoh: 20"
                        />
                        <small className="field-hint">
                          Jika stok turun mencapai angka ini atau di bawahnya, status produk menjadi <b>LOW</b>.
                        </small>
                      </label>

                      <label className="form-field">
                        <span className="field-label flex items-center gap-1.5">
                          <span>Reorder Point (Titik Pesan Ulang)</span>
                          <span className="text-rose-500">*</span>
                        </span>
                        <input
                          type="number"
                          className="field-input"
                          value={form["reorderPoint"] ?? 10}
                          onChange={(event) => setForm((curr) => ({ ...curr, reorderPoint: event.target.value }))}
                          placeholder="Contoh: 10"
                        />
                        <small className="field-hint">
                          Jika stok mencapai titik ini (≤ Reorder Point), status berubah menjadi <b>RESTOCK</b> (Kritis).
                        </small>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sticky Footer Modal */}
            <div className="modal-footer-sticky">
              <Button variant="outline" onClick={() => setEditorOpen(false)}>
                Batal
              </Button>
              <Button onClick={saveRecord}>
                <Save size={15} /> Simpan Data
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
