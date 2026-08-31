export type Uom = "PCS" | "PACK" | "DUS" | "ROLL" | "KG";

export interface Product {
  code: string;
  name: string;
  category: string;
  brand: string;
  stockUom: Uom;
  stockQty: number;
  barcode: string;
  retailPrice: number; // per stock UOM
  wholesalePrice: number; // per stock UOM
  conversions: Partial<Record<Uom, number>>; // 1 DUS = n PACK
  color: string;
}

export interface Customer {
  id: string;
  name: string;
  group: "Retail" | "Grosir" | "Tempo";
  phone: string;
  outstanding: number;
}

export interface CartLine {
  product: Product;
  qty: number;
  uom: Uom;
  unitPrice: number; // price per selected UOM
  pcsEquivalent: number;
  subtotal: number;
}

export const PRODUCTS: Product[] = [
  { code: "SKU-CUP-16OZ", name: "Cup Plastik PP 16oz Oza Slim (Isi 50 pcs)", category: "Cup & Minuman", brand: "Oza Pack", stockUom: "PACK", stockQty: 45, barcode: "8991001", retailPrice: 15000, wholesalePrice: 13200, conversions: { DUS: 20 }, color: "#38bdf8" },
  { code: "SKU-MIKA-B4", name: "Mika Bento 4 Sekat Hitam + Tutup (Isi 50 pcs)", category: "Kemasan Makanan", brand: "Starindo", stockUom: "PACK", stockQty: 18, barcode: "8991002", retailPrice: 46000, wholesalePrice: 41500, conversions: { DUS: 10 }, color: "#34d399" },
  { code: "SKU-KRESEK-15", name: "Kantong Kresek HDPE Bening 15x30 (500 gr)", category: "Plastik & Kresek", brand: "Bawang Super", stockUom: "PACK", stockQty: 65, barcode: "8991003", retailPrice: 12500, wholesalePrice: 10500, conversions: { DUS: 40 }, color: "#a78bfa" },
  { code: "SKU-ROLL-PE08", name: "Plastik Roll PE Bening 0.8 mm (10 kg)", category: "Plastik & Kresek", brand: "Wayang", stockUom: "ROLL", stockQty: 6, barcode: "8991004", retailPrice: 330000, wholesalePrice: 305000, conversions: {}, color: "#f59e0b" },
  { code: "SKU-BOX-LUNCH-M", name: "Paper Lunch Box Medium Kraft (Isi 100 pcs)", category: "Kemasan Makanan", brand: "EcoKraft", stockUom: "PACK", stockQty: 4, barcode: "8991005", retailPrice: 75000, wholesalePrice: 67000, conversions: { DUS: 10 }, color: "#fbbf24" },
  { code: "SKU-BUBBLE-50M", name: "Bubble Wrap Tebal Premium Roll 50m x 125cm", category: "Perlengkapan Packing", brand: "Klaten Pack", stockUom: "ROLL", stockQty: 8, barcode: "8991006", retailPrice: 105000, wholesalePrice: 92000, conversions: {}, color: "#60a5fa" },
  { code: "SKU-LAKBAN-48", name: "Lakban Bening Daimaru 48mm x 90y", category: "Perlengkapan Packing", brand: "Daimaru", stockUom: "ROLL", stockQty: 80, barcode: "8991007", retailPrice: 11500, wholesalePrice: 9800, conversions: { DUS: 72 }, color: "#f87171" },
  { code: "SKU-SEDOTAN-STR", name: "Sedotan Steril Runcing Bubble 12mm (Isi 100 pcs)", category: "Cup & Minuman", brand: "Tomat", stockUom: "PACK", stockQty: 50, barcode: "8991008", retailPrice: 9000, wholesalePrice: 7500, conversions: { DUS: 25 }, color: "#c084fc" },
  { code: "SKU-PANIR-1KG", name: "Tepung Panir Halus Bakery 1 kg", category: "Bahan Pelengkap", brand: "Mamasuka", stockUom: "KG", stockQty: 12, barcode: "8991009", retailPrice: 18000, wholesalePrice: 16000, conversions: { DUS: 20 }, color: "#fb923c" },
];

export const CUSTOMERS: Customer[] = [
  { id: "CUST-001", name: "Pelanggan Umum (Walk-in)", group: "Retail", phone: "-", outstanding: 0 },
  { id: "CUST-002", name: "Warung Makan Bu Aminah", group: "Grosir", phone: "0877-1234-5678", outstanding: 1250000 },
  { id: "CUST-003", name: "Kedai Kopi Selaras", group: "Grosir", phone: "0858-9876-5432", outstanding: 0 },
  { id: "CUST-004", name: "Catering Berkah Klaten", group: "Tempo", phone: "0813-2468-1357", outstanding: 2840000 },
  { id: "CUST-005", name: "UMKM Keripik & Snack Jaya", group: "Grosir", phone: "0812-3344-5566", outstanding: 650000 },
];

export const formatRupiah = (n: number): string =>
  "Rp " + new Intl.NumberFormat("id-ID").format(Math.round(n));

export const pcsPerUnit = (p: Product, uom: Uom): number =>
  uom === p.stockUom ? 1 : (p.conversions[uom] ?? 1);
