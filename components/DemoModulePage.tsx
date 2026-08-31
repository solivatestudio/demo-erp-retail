"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  Boxes,
  CheckCircle2,
  ChevronDown,
  Download,
  Eye,
  FileText,
  HelpCircle,
  Info,
  Layers,
  Pencil,
  Plus,
  Printer,
  Save,
  Search,
  Sliders,
  Trash2,
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
    kode: "SKU-001",
    nama: "Beras Premium 5 kg",
    kategori: "Sembako / Beras",
    merk: "Beras Kita",
    satuan: "sak",
    hpp: 68500,
    ecer: 72000,
    grosir: 68500,
    stockToko: 32,
    stockGudang: 120,
    stockCabang: 40,
    lowStockThreshold: 20,
    reorderPoint: 10,
  },
  {
    kode: "SKU-014",
    nama: "Minyak Goreng 1 L",
    kategori: "Sembako / Minyak",
    merk: "Bimoli",
    satuan: "karton",
    hpp: 17000,
    ecer: 18500,
    grosir: 17000,
    stockToko: 16,
    stockGudang: 36,
    stockCabang: 8,
    lowStockThreshold: 20,
    reorderPoint: 10,
  },
  {
    kode: "SKU-021",
    nama: "Kopi Sachet 10 pcs",
    kategori: "Minuman / Kopi",
    merk: "Kapal Api",
    satuan: "pack",
    hpp: 14800,
    ecer: 16500,
    grosir: 14800,
    stockToko: 7,
    stockGudang: 4,
    stockCabang: 0,
    lowStockThreshold: 20,
    reorderPoint: 10,
  },
  {
    kode: "SKU-008",
    nama: "Susu UHT 1 L",
    kategori: "Minuman / Susu",
    merk: "Ultra",
    satuan: "kotak",
    hpp: 16500,
    ecer: 21000,
    grosir: 19500,
    stockToko: 0,
    stockGudang: 45,
    stockCabang: 12,
    lowStockThreshold: 15,
    reorderPoint: 5,
  },
  {
    kode: "SKU-026",
    nama: "Sabun Cair 450 ml",
    kategori: "Household",
    merk: "Lifebuoy",
    satuan: "botol",
    hpp: 21000,
    ecer: 24500,
    grosir: 22500,
    stockToko: 50,
    stockGudang: 200,
    stockCabang: 80,
    lowStockThreshold: null, // Threshold not set test case
    reorderPoint: null,
  },
];

const INITIAL_TRANSACTIONS: Record<string, TransactionDetail> = {
  "POS-000184": {
    no: "POS-000184",
    tanggal: "31/08/2026",
    tipe: "Nota Penjualan POS",
    partner: "Pelanggan Umum",
    partnerRole: "Pelanggan",
    gudang: "Toko Utama",
    petugas: "Kasir 01 (Siti)",
    status: "Lunas",
    items: [
      { sku: "SKU-001", name: "Beras Premium 5 kg", qty: 2, unit: "sak", price: 72000, subtotal: 144000 },
      { sku: "SKU-021", name: "Kopi Sachet 10 pcs", qty: 2, unit: "pack", price: 16500, subtotal: 33000 },
      { sku: "SKU-014", name: "Minyak Goreng 1 L", qty: 1, unit: "botol", price: 18500, subtotal: 18500 },
    ],
    subtotal: 195500,
    diskon: 9000,
    pajak: 0,
    biayaKirim: 0,
    total: 186500,
    terbayar: 200000,
    sisa: 0,
    catatan: "Penjualan langsung POS Kasir tunai",
  },
  "SAL-000091": {
    no: "SAL-000091",
    tanggal: "31/08/2026",
    tipe: "Penjualan Grosir",
    partner: "Retail Partner A",
    partnerRole: "Pelanggan",
    fakturRef: "PO-RPA-992",
    gudang: "Gudang Utama",
    petugas: "Andi Pratama (Sales)",
    top: "30 Hari",
    jatuhTempo: "30/09/2026",
    status: "Piutang",
    items: [
      { sku: "SKU-001", name: "Beras Premium 5 kg", qty: 30, unit: "sak", price: 68500, subtotal: 2055000 },
      { sku: "SKU-014", name: "Minyak Goreng 1 L", qty: 40, unit: "karton", price: 17000, subtotal: 680000 },
      { sku: "SKU-008", name: "Susu UHT 1 L", qty: 35, unit: "kotak", price: 19500, subtotal: 685000 },
    ],
    subtotal: 3420000,
    diskon: 0,
    pajak: 0,
    biayaKirim: 0,
    total: 3420000,
    terbayar: 0,
    sisa: 3420000,
    catatan: "Pengiriman via Armada Truk Toko Utama",
  },
  "PUR-000044": {
    no: "PUR-000044",
    tanggal: "31/08/2026",
    tipe: "Faktur Pembelian",
    partner: "Supplier Nasional",
    partnerRole: "Supplier",
    fakturRef: "INV-SUP-8841",
    gudang: "Gudang Utama",
    petugas: "Budi Santoso (Purchasing)",
    top: "14 Hari",
    jatuhTempo: "14/09/2026",
    status: "Partial",
    items: [
      { sku: "SKU-001", name: "Beras Premium 5 kg", qty: 50, unit: "sak", price: 65000, subtotal: 3250000 },
      { sku: "SKU-014", name: "Minyak Goreng 1 L", qty: 100, unit: "karton", price: 16000, subtotal: 1600000 },
    ],
    subtotal: 4850000,
    diskon: 0,
    pajak: 0,
    biayaKirim: 0,
    total: 4850000,
    terbayar: 2500000,
    sisa: 2350000,
    catatan: "Uang muka 50% telah ditransfer",
  },
};

const commonRows = {
  products: [
    { kode: "SKU-001", nama: "Beras Premium 5 kg", kategori: "Sembako / Beras", merk: "Beras Kita", satuan: "sak", hpp: 68500, ecer: 72000, grosir: 68500, minStock: 20, reorderPoint: 10, status: "Aktif" },
    { kode: "SKU-014", nama: "Minyak Goreng 1 L", kategori: "Sembako / Minyak", merk: "Bimoli", satuan: "karton", hpp: 17000, ecer: 18500, grosir: 17000, minStock: 20, reorderPoint: 10, status: "Aktif" },
    { kode: "SKU-021", nama: "Kopi Sachet 10 pcs", kategori: "Minuman / Kopi", merk: "Kapal Api", satuan: "pack", hpp: 14800, ecer: 16500, grosir: 14800, minStock: 20, reorderPoint: 10, status: "Aktif" },
    { kode: "SKU-008", nama: "Susu UHT 1 L", kategori: "Minuman / Susu", merk: "Ultra", satuan: "kotak", hpp: 16500, ecer: 21000, grosir: 19500, minStock: 15, reorderPoint: 5, status: "Aktif" },
    { kode: "SKU-026", nama: "Sabun Cair 450 ml", kategori: "Household", merk: "Lifebuoy", satuan: "botol", hpp: 21000, ecer: 24500, grosir: 22500, minStock: "-", reorderPoint: "-", status: "Aktif" },
  ],
  sales: [
    { no: "POS-000184", tanggal: "31/08/2026", pelanggan: "Pelanggan Umum", jenis: "POS Kasir", gudang: "Toko Utama", total: 186500, status: "Lunas" },
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
    stats: [{ label: "Profil Toko", value: "Lengkap" }, { label: "Template Nota", value: "Aktif" }, { label: "Global Threshold", value: "Aktif" }],
    columns: ["kode", "pengaturan", "nilai", "status"],
    rows: [
      { kode: "STORE_NAME", pengaturan: "Nama Toko", nilai: "Kelolain / Akuratif", status: "Aktif" },
      { kode: "DEFAULT_LOW_STOCK", pengaturan: "Default Low Stock Threshold", nilai: "15", status: "Aktif" },
      { kode: "DEFAULT_REORDER_POINT", pengaturan: "Default Reorder Point", nilai: "5", status: "Aktif" },
      { kode: "RECEIPT_FOOTER", pengaturan: "Footer Nota", nilai: "Terima kasih atas kunjungan Anda.", status: "Aktif" },
    ],
    sideTitle: "Pengaturan Inventory",
    sideItems: [
      "Default Low Stock Threshold global",
      "Default Reorder Point global",
      "Format nota & printer thermal",
      "Konfigurasi multi-gudang",
    ],
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
    columns: ["kode", "nama", "kategori", "merk", "satuan", "hpp", "ecer", "grosir", "minStock", "reorderPoint", "status"],
    rows: commonRows.products,
    sideTitle: "Konfigurasi Stok & Harga",
    sideItems: [
      "Minimum / Low Stock Threshold per SKU",
      "Reorder Point untuk alert restock",
      "Multi-satuan konversi (UOM)",
      "Harga retail & grosir per grup",
    ],
  },
  stock: {
    section: "Inventaris",
    primaryAction: "Koreksi Stok",
    stats: [{ label: "SKU Aktif", value: "5" }, { label: "Perlu Restock", value: "2 SKU", status: "warning" }, { label: "Nilai Stok", value: "Rp 42,6 jt" }],
    columns: ["kode", "nama", "kategori", "stokSaatIni", "minStock", "reorderPoint", "hpp", "status"],
    rows: [],
    sideTitle: "Logika Status Persediaan",
    sideItems: [
      "AMAN: Stok saat ini > Batas Low",
      "LOW: Reorder Point < Stok ≤ Batas Low",
      "RESTOCK: Stok saat ini ≤ Reorder Point",
      "HABIS: Stok saat ini = 0",
      "Belum Diatur: Belum ada konfigurasi threshold",
    ],
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
  categories: {
    section: "Inventaris",
    primaryAction: "Tambah Kategori",
    stats: [{ label: "Kategori", value: "7" }, { label: "Sub-Kategori", value: "18" }, { label: "SKU Terkait", value: "28" }],
    columns: ["kode", "kategori", "subKategori", "jumlahSku", "status"],
    rows: [
      { kode: "CAT-001", kategori: "Sembako", subKategori: "Beras, Minyak, Gula", jumlahSku: 11, status: "Aktif" },
      { kode: "CAT-002", kategori: "Minuman", subKategori: "Susu, Kopi, Teh", jumlahSku: 8, status: "Aktif" },
    ],
    sideTitle: "Struktur Kategori",
    sideItems: ["Kategori utama", "Sub-kategori", "Merk", "Filter produk"],
  },
  warehouses: {
    section: "Inventaris",
    primaryAction: "Tambah Gudang",
    stats: [{ label: "Lokasi", value: "3" }, { label: "Transfer", value: "7" }, { label: "Stok Aktif", value: "28 SKU" }],
    columns: ["kode", "lokasi", "keterangan", "sku", "status"],
    rows: [
      { kode: "WH-001", lokasi: "Toko Utama", keterangan: "Stok kasir & display", sku: 24, status: "Aktif" },
      { kode: "WH-002", lokasi: "Gudang Utama", keterangan: "Stok pembelian pusat", sku: 28, status: "Aktif" },
      { kode: "WH-003", lokasi: "Gudang Cabang", keterangan: "Buffer stock & transit", sku: 16, status: "Aktif" },
    ],
    sideTitle: "Lokasi Stok",
    sideItems: ["Kode gudang", "Lokasi", "Keterangan", "Saldo per gudang"],
  },
  stockCard: {
    section: "Inventaris",
    primaryAction: "Filter Kartu Stok",
    stats: [{ label: "Movement", value: "126" }, { label: "Produk", value: "28" }, { label: "Lokasi", value: "3" }],
    columns: ["tanggal", "referensi", "produk", "gudang", "masuk", "keluar", "saldo"],
    rows: [
      { tanggal: "31/08/2026", referensi: "PUR-000044", produk: "Minyak Goreng 1 L", gudang: "Gudang Utama", masuk: "36 karton", keluar: "-", saldo: "36 karton" },
      { tanggal: "31/08/2026", referensi: "POS-000184", produk: "Beras Premium 5 kg", gudang: "Toko Utama", masuk: "-", keluar: "3 sak", saldo: "32 sak" },
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
    ],
    sideTitle: "Konversi Barang",
    sideItems: ["Input SKU", "Output SKU", "Alokasi nilai", "Stok keluar/masuk"],
  },
  adjustments: {
    section: "Inventaris",
    primaryAction: "Buat Koreksi",
    stats: [{ label: "Koreksi", value: "8" }, { label: "Selisih Qty", value: "14 pcs" }, { label: "Review", value: "1", status: "warning" }],
    columns: ["no", "tanggal", "produk", "gudang", "qtySistem", "qtyFisik", "status"],
    rows: [
      { no: "ADJ-000021", tanggal: "31/08/2026", produk: "Minyak Goreng 1 L", gudang: "Toko Utama", qtySistem: "18", qtyFisik: "16", status: "Posted" },
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
    ],
    sideTitle: "Sumber Kas",
    sideItems: ["Pembayaran piutang", "Setoran kasir", "Penerimaan manual"],
  },
  cashOut: {
    section: "Keuangan",
    primaryAction: "Tambah Kas Keluar",
    stats: [{ label: "Kas Keluar", value: "Rp 4,8 jt" }, { label: "Transaksi", value: "11" }, { label: "Supplier", value: "4" }],
    columns: ["no", "tanggal", "tujuan", "keterangan", "jumlah", "status"],
    rows: [
      { no: "COUT-000014", tanggal: "31/08/2026", tujuan: "Supplier Nasional", keterangan: "Angsuran PUR-000044", jumlah: 750000, status: "Posted" },
    ],
    sideTitle: "Pengeluaran",
    sideItems: ["Bayar supplier", "Biaya operasional", "Kas/bank"],
  },
  brands: {
    section: "Inventaris",
    primaryAction: "Tambah Merk",
    stats: [{ label: "Merk", value: "16" }, { label: "SKU", value: "28" }, { label: "Aktif", value: "16" }],
    columns: ["kode", "merk", "kategori", "sku", "status"],
    rows: [
      { kode: "BR-001", merk: "Beras Kita", kategori: "Sembako", sku: 8, status: "Aktif" },
      { kode: "BR-002", merk: "Bimoli", kategori: "Sembako", sku: 6, status: "Aktif" },
    ],
    sideTitle: "Merk Produk",
    sideItems: ["Kode merk", "Nama merk", "Kategori terkait"],
  },
  units: {
    section: "Inventaris",
    primaryAction: "Tambah Satuan",
    stats: [{ label: "Satuan", value: "9" }, { label: "Multi-unit", value: "12 SKU" }, { label: "Konversi", value: "Aktif" }],
    columns: ["kode", "satuan", "konversi", "digunakanPada", "status"],
    rows: [
      { kode: "PCS", satuan: "Pieces", konversi: "1 pcs", digunakanPada: "Penjualan", status: "Aktif" },
      { kode: "KRT", satuan: "Karton", konversi: "24 pcs", digunakanPada: "Pembelian", status: "Aktif" },
    ],
    sideTitle: "Konversi UOM",
    sideItems: ["Satuan dasar", "Satuan beli", "Satuan jual"],
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
    ],
    sideTitle: "Kategori Laporan",
    sideItems: ["Inventaris", "Pembelian", "Penjualan & omset", "Keuangan", "Operasional"],
  },
  reprints: {
    section: "Dokumen",
    primaryAction: "Cari Nota",
    stats: [{ label: "Nota Jual", value: "184" }, { label: "Nota Beli", value: "44" }, { label: "Retur", value: "17" }],
    columns: ["no", "tanggal", "tipe", "partner", "total", "status"],
    rows: [
      { no: "POS-000184", tanggal: "31/08/2026", tipe: "Nota Penjualan", partner: "Pelanggan Umum", total: 186500, status: "Printable" },
      { no: "PUR-000044", tanggal: "31/08/2026", tipe: "Nota Pembelian", partner: "Supplier Nasional", total: 4850000, status: "Printable" },
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
    { no: "TRX-0001", tanggal: "31/08/2026", nama: "Transaksi Operasional", referensi: "Kelolain", total: 1250000, status: "Open" },
  ],
  sideTitle: "Informasi Modul",
  sideItems: ["Pencarian data", "Filter status", "Export laporan", "Cetak dokumen"],
};

function formatCell(key: string, value: any) {
  if (typeof value === "number" && ["total", "amount", "hpp", "ecer", "grosir", "subtotal", "jumlah", "terbayar", "sisa"].includes(key)) {
    return formatRupiah(value);
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
    if (column === "produk") return "Contoh: Minyak Goreng Bimoli 1 L";
    if (column === "gudang") return "Contoh: Toko Utama / Rak Display 01";
  }

  if (kind === "repack") {
    if (column === "input") return "Contoh: 1 Sak Beras 50 kg (induk/karung besar)";
    if (column === "output") return "Contoh: 10 Kemasan @ 5 kg (kemasan ecer)";
    if (column === "nilai") return "Contoh: 650000 (alokasi HPP bahan)";
  }

  if (kind === "stockTransfers") {
    if (column === "asal") return "Contoh: Gudang Utama (Transit)";
    if (column === "tujuan") return "Contoh: Toko Utama (Display Depan)";
    if (column === "item") return "Contoh: Beras Premium 5 kg (20 sak)";
  }

  if (kind === "stockIssues") {
    if (column === "keperluan") return "Contoh: Rusak / Kadaluarsa / Sample promosi";
    if (column === "item") return "Contoh: Susu UHT 1 L (3 kotak)";
  }

  if (kind === "suppliers") {
    if (column === "kode") return "Contoh: SUP-001";
    if (column === "nama") return "Contoh: PT Distributor Sentosa Abadi";
    if (column === "alamat") return "Contoh: Jl. Pergudangan Kamal No. 18, Jakarta Barat";
    if (column === "kota") return "Contoh: Jakarta Barat";
    if (column === "telp") return "Contoh: 0812-9876-5432 / (021) 555-1234";
  }

  if (kind === "customers") {
    if (column === "kode") return "Contoh: CUST-001";
    if (column === "nama") return "Contoh: Toko Sejahtera / Retail Partner A";
    if (column === "alamat") return "Contoh: Jl. Ahmad Yani No. 12 Pasar Lama";
    if (column === "kota") return "Contoh: Bandung";
    if (column === "telp") return "Contoh: 0857-1122-3344";
    if (column === "grup") return "Contoh: Grosir / Retail Walk-in / Member VIP";
  }

  if (kind === "salesPeople") {
    if (column === "kode") return "Contoh: SLS-001";
    if (column === "nama") return "Contoh: Andi Pratama";
    if (column === "hp") return "Contoh: 0813-2233-4455";
    if (column === "alamat") return "Contoh: Jl. Kebon Jeruk No. 8, Jakarta Barat";
    if (column === "area") return "Contoh: Jabodetabek / Jakarta Barat";
  }

  if (kind === "warehouses") {
    if (column === "kode") return "Contoh: WH-001";
    if (column === "lokasi") return "Contoh: Toko Utama (Kasir & Display)";
    if (column === "keterangan") return "Contoh: Lokasi penjualan langsung lantai 1";
  }

  if (kind === "products" || kind === "stock") {
    if (column === "kode") return "Contoh: SKU-001 / 8992753123456 (Barcode)";
    if (column === "nama") return "Contoh: Beras Pandan Wangi Premium 5 kg";
    if (column === "kategori") return "Contoh: Sembako / Beras";
    if (column === "merk") return "Contoh: Beras Kita / Bimoli / Kapal Api";
    if (column === "satuan") return "Contoh: Sak / Karton / Botol / Pcs";
    if (column === "hpp") return "Contoh: 65000 (Harga beli supplier)";
    if (column === "ecer") return "Contoh: 72000 (Harga kasir walk-in)";
    if (column === "grosir") return "Contoh: 68500 (Harga mitra grosir)";
  }

  if (kind === "purchases") {
    if (column === "no") return "Contoh: PUR-202608-0044";
    if (column === "supplier") return "Contoh: PT Distributor Sentosa";
    if (column === "faktur") return "Contoh: INV-SUP-8841/VIII/2026";
    if (column === "top") return "Contoh: TOP 14 Hari / Tunai / Transfer BCA";
    if (column === "gudang") return "Contoh: Gudang Utama (Pusat)";
    if (column === "total") return "Contoh: 4850000";
  }

  if (kind === "sales") {
    if (column === "no") return "Contoh: SAL-202608-0091";
    if (column === "pelanggan") return "Contoh: Retail Partner A / Pelanggan Umum";
    if (column === "jenis") return "Contoh: Penjualan Grosir / Delivery / POS";
    if (column === "gudang") return "Contoh: Toko Utama / Gudang Pusat";
    if (column === "total") return "Contoh: 3420000";
  }

  if (kind === "purchaseReturns" || kind === "salesReturns") {
    if (column === "no") return kind === "purchaseReturns" ? "Contoh: RET-P-000006" : "Contoh: RET-S-000011";
    if (column === "notaAsal") return kind === "purchaseReturns" ? "Contoh: PUR-000044 (No. Faktur Pembelian)" : "Contoh: POS-000184 (No. Nota Penjualan)";
    if (column === "gudang") return "Contoh: Toko Utama / Gudang Utama";
    if (column === "total") return "Contoh: 240000";
  }

  if (kind === "payables" || kind === "receivables") {
    if (column === "no") return "Contoh: INV-202608-0044";
    if (column === "total") return "Contoh: 4850000";
    if (column === "terbayar") return "Contoh: 2500000 (Nominal yang sudah dibayar)";
    if (column === "sisa") return "Contoh: 2350000 (Sisa kewajiban)";
  }

  if (kind === "cashIn" || kind === "cashOut") {
    if (column === "no") return kind === "cashIn" ? "Contoh: CIN-202608-0031" : "Contoh: COUT-202608-0014";
    if (column === "sumber") return "Contoh: Pembayaran Piutang Customer / Setoran Kasir";
    if (column === "tujuan") return "Contoh: Pembayaran Faktur Supplier / Biaya Listrik Toko";
    if (column === "keterangan") return "Contoh: Pembayaran invoice INV-8841 via transfer bank";
    if (column === "jumlah") return "Contoh: 750000";
  }

  if (kind === "categories") {
    if (column === "kode") return "Contoh: CAT-001";
    if (column === "kategori") return "Contoh: Sembako / Bahan Pokok";
    if (column === "subKategori") return "Contoh: Beras, Minyak Goreng, Gula Pasir";
    if (column === "jumlahSku") return "Contoh: 12";
  }

  if (kind === "brands") {
    if (column === "kode") return "Contoh: BR-001";
    if (column === "merk") return "Contoh: Indomie / Bimoli / Kapal Api";
    if (column === "kategori") return "Contoh: Makanan Instan / Sembako";
  }

  if (kind === "units") {
    if (column === "kode") return "Contoh: PCS / KRT / LSN / SAK";
    if (column === "satuan") return "Contoh: Pieces / Karton / Lusin / Sak";
    if (column === "konversi") return "Contoh: 1 Karton = 24 Pcs";
    if (column === "digunakanPada") return "Contoh: Transaksi Pembelian & Penjualan";
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
  const [activeTooltipSku, setActiveTooltipSku] = useState<string | null>(null);

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
  }, [config, kind]);

  // Filtered rows for general table
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return records;
    return records.filter((row) => Object.values(row).some((value) => String(value).toLowerCase().includes(q)));
  }, [records, query]);

  // Filtered products for stock module
  const filteredStockProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return stockProducts.filter((item) => {
      if (!q) return true;
      return item.nama.toLowerCase().includes(q) || item.kode.toLowerCase().includes(q) || item.kategori.toLowerCase().includes(q);
    });
  }, [stockProducts, query]);

  // Function to get current stock by selected warehouse
  const getStockQtyByWarehouse = (item: ProductStockData) => {
    if (selectedWarehouse === "TOKO") return item.stockToko;
    if (selectedWarehouse === "GUDANG") return item.stockGudang;
    if (selectedWarehouse === "CABANG") return item.stockCabang;
    // ALL -> aggregate
    return item.stockToko + item.stockGudang + item.stockCabang;
  };

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
          { sku: "SKU-001", name: "Beras Premium 5 kg", qty: 2, unit: "sak", price: 72000, subtotal: 144000 },
          { sku: "SKU-014", name: "Minyak Goreng 1 L", qty: 3, unit: "karton", price: 17000, subtotal: 51000 },
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
                {stat.status ? "Perhatian" : "Normal"}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </section>

      {saved && <div className="system-alert">Perubahan data berhasil disimpan secara lokal.</div>}

      {/* Multi-Warehouse Selector for Stock Module */}
      {kind === "stock" && (
        <Card className="warehouse-filter-card">
          <CardContent className="warehouse-filter-content">
            <div className="warehouse-filter-header">
              <div className="flex items-center gap-2">
                <Warehouse size={18} className="text-zinc-600" />
                <strong>Pilih Lokasi Gudang:</strong>
                <span className="text-xs text-zinc-500">
                  (Status stok & threshold dihitung secara dinamis sesuai gudang terpilih)
                </span>
              </div>
            </div>
            <div className="warehouse-pills">
              <button
                type="button"
                className={`warehouse-pill ${selectedWarehouse === "ALL" ? "active" : ""}`}
                onClick={() => setSelectedWarehouse("ALL")}
              >
                🏢 Semua Gudang (Total Akumulasi)
              </button>
              <button
                type="button"
                className={`warehouse-pill ${selectedWarehouse === "TOKO" ? "active" : ""}`}
                onClick={() => setSelectedWarehouse("TOKO")}
              >
                🏪 Toko Utama (Kasir & Display)
              </button>
              <button
                type="button"
                className={`warehouse-pill ${selectedWarehouse === "GUDANG" ? "active" : ""}`}
                onClick={() => setSelectedWarehouse("GUDANG")}
              >
                📦 Gudang Utama (Pembelian)
              </button>
              <button
                type="button"
                className={`warehouse-pill ${selectedWarehouse === "CABANG" ? "active" : ""}`}
                onClick={() => setSelectedWarehouse("CABANG")}
              >
                🚚 Gudang Cabang (Transit & Buffer)
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Table Layout */}
      <section className="module-layout">
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
                          ? "Toko Utama"
                          : selectedWarehouse === "GUDANG"
                          ? "Gudang Utama"
                          : "Gudang Cabang"
                      }`
                    : "Daftar Data"}
                </CardTitle>
                <CardDescription>
                  {kind === "stock"
                    ? `${filteredStockProducts.length} SKU terdaftar · Status real-time berdasarkan threshold`
                    : `${rows.length} data ditampilkan`}
                </CardDescription>
              </div>
              <div className="table-tools">
                <div className="table-search">
                  <Search size={15} />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={getSearchPlaceholder(kind, title)}
                  />
                </div>
                <Button variant="outline" size="icon" aria-label="Cetak" onClick={() => window.print()}>
                  <Printer size={15} />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="data-table">
            {kind === "stock" ? (
              /* DEDICATED INVENTORY / STOCK TABLE WITH DYNAMIC STATUS */
              <table>
                <thead>
                  <tr>
                    <th>Kode SKU</th>
                    <th>Nama Produk</th>
                    <th>Kategori / Merk</th>
                    <th className="right">
                      {selectedWarehouse === "ALL" ? "Total Stok" : `Stok (${selectedWarehouse})`}
                    </th>
                    <th className="right">Batas Low</th>
                    <th className="right">Reorder Point</th>
                    <th className="right">HPP</th>
                    <th>
                      <div className="status-header-cell">
                        <span>Status</span>
                        <div className="status-info-trigger" title="Status stok dihitung berdasarkan jumlah stok saat ini, batas minimum stok, dan reorder point produk.">
                          <HelpCircle size={13} />
                        </div>
                      </div>
                    </th>
                    <th className="right">Aksi</th>
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
                          <span className="font-mono font-bold text-xs">{product.kode}</span>
                        </td>
                        <td data-label="Nama Produk">
                          <strong>{product.nama}</strong>
                          <span className="block text-xs text-zinc-500">{product.satuan}</span>
                        </td>
                        <td data-label="Kategori / Merk">
                          <span className="text-xs text-zinc-700 font-medium">{product.kategori}</span>
                          <span className="block text-xs text-zinc-400">{product.merk}</span>
                        </td>
                        <td className="right" data-label="Stok">
                          <b className="text-sm">
                            {currentQty} {product.satuan}
                          </b>
                          {selectedWarehouse === "ALL" && (
                            <small className="block text-xs text-zinc-400">
                              (Toko: {product.stockToko} | Gd: {product.stockGudang} | Cb: {product.stockCabang})
                            </small>
                          )}
                        </td>
                        <td className="right" data-label="Batas Low">
                          <span className="text-xs text-zinc-600">
                            {product.lowStockThreshold != null ? `${product.lowStockThreshold} ${product.satuan}` : "-"}
                          </span>
                        </td>
                        <td className="right" data-label="Reorder Point">
                          <span className="text-xs text-zinc-600">
                            {product.reorderPoint != null ? `≤ ${product.reorderPoint} ${product.satuan}` : "-"}
                          </span>
                        </td>
                        <td className="right" data-label="HPP">
                          <span className="font-medium text-xs">{formatRupiah(product.hpp)}</span>
                        </td>
                        <td data-label="Status">
                          <div className="status-badge-wrapper">
                            <button
                              type="button"
                              className={`stock-badge-btn badge-${statusRes.variant}`}
                              onClick={() =>
                                setActiveTooltipSku(activeTooltipSku === product.kode ? null : product.kode)
                              }
                            >
                              {statusRes.label}
                              <Info size={11} className="badge-info-icon" />
                            </button>

                            {/* Explainable Popover on Hover / Click */}
                            {activeTooltipSku === product.kode && (
                              <div className="stock-explain-popover">
                                <div className="popover-header">
                                  <strong>{statusRes.label}</strong>
                                  <button onClick={() => setActiveTooltipSku(null)}>
                                    <X size={12} />
                                  </button>
                                </div>
                                <p className="popover-text">{statusRes.explanation}</p>
                                <div className="popover-breakdown">
                                  <div>
                                    <span>Stok ({selectedWarehouse}):</span>
                                    <b>{currentQty} {product.satuan}</b>
                                  </div>
                                  <div>
                                    <span>Batas Low:</span>
                                    <b>{product.lowStockThreshold ?? "Belum diatur"}</b>
                                  </div>
                                  <div>
                                    <span>Reorder Point:</span>
                                    <b>{product.reorderPoint != null ? `≤ ${product.reorderPoint}` : "Belum diatur"}</b>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="right" data-label="Aksi">
                          <div className="row-actions">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setForm({
                                  kode: product.kode,
                                  nama: product.nama,
                                  kategori: product.kategori,
                                  merk: product.merk,
                                  satuan: product.satuan,
                                  hpp: product.hpp,
                                  ecer: product.ecer,
                                  grosir: product.grosir,
                                  minStock: product.lowStockThreshold ?? "",
                                  reorderPoint: product.reorderPoint ?? "",
                                });
                                setEditorOpen(true);
                              }}
                            >
                              <Sliders size={14} /> Atur Threshold
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
                          data-label={column}
                          className={["total", "hpp", "ecer", "grosir", "terbayar", "sisa", "jumlah"].includes(column) ? "right" : ""}
                        >
                          {column === "status" ? (
                            <Badge variant={row[column] === "Lunas" || row[column] === "Aktif" || row[column] === "Posted" || row[column] === "Selesai" ? "success" : "warning"}>
                              {row[column]}
                            </Badge>
                          ) : (
                            formatCell(column, row[column])
                          )}
                        </td>
                      ))}
                      <td className="right" data-label="aksi">
                        <div className="row-actions">
                          {isTransactionModule && (
                            <Button variant="outline" size="sm" onClick={() => openTransactionDetail(row)}>
                              <Eye size={14} /> Detail / Kelola
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => openEdit(row)}>
                            <Pencil size={14} /> Edit
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => deleteRecord(row)}>
                            <Trash2 size={14} />
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

        {/* Sidebar Info Card */}
        <Card className="module-side-card">
          <CardHeader>
            <CardTitle>{config.sideTitle}</CardTitle>
            <CardDescription>Parameter & kaidah logika operasional modul.</CardDescription>
          </CardHeader>
          <CardContent className="side-list">
            {config.sideItems.map((item) => (
              <div key={item} className="side-list-item">
                <CheckCircle2 size={15} className="text-emerald-600 flex-shrink-0" />
                <span>{item}</span>
              </div>
            ))}
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
      {/* 2. CREATE / EDIT DATA MODAL (WITH MANAJEMEN STOK THRESHOLDS)             */}
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
                      {editingIndex === null ? `Tambah Data ${title || config.section}` : `Edit Data ${title || config.section}`}
                    </h2>
                    <p className="modal-subtitle">Lengkapi atribut data dan konfigurasi stok.</p>
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
                            type={["total", "hpp", "ecer", "grosir", "jumlah", "nilai", "terbayar", "sisa", "sku", "jumlahSku"].includes(column) ? "number" : "text"}
                            className="field-input"
                            value={form[column] ?? ""}
                            onChange={(event) => setForm((curr) => ({ ...curr, [column]: event.target.value }))}
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
