export type Uom = "PCS" | "DUS" | "KARTON";

export interface Product {
  code: string;
  name: string;
  category: string;
  brand: string;
  stockUom: Uom;
  stockQty: number;
  barcode: string;
  retailPrice: number; // per stock UOM (PCS)
  wholesalePrice: number; // per stock UOM (PCS)
  conversions: Record<Exclude<Uom, "PCS">, number>; // 1 DUS = n PCS
  color: string;
}

export interface Customer {
  id: string;
  name: string;
  group: "Retail" | "Grosir";
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
  { code: "ITEM-A", name: "Air Mineral 600ml", category: "Minuman", brand: "Aqua", stockUom: "PCS", stockQty: 480, barcode: "8990001", retailPrice: 5000, wholesalePrice: 4200, conversions: { DUS: 24, KARTON: 48 }, color: "#60a5fa" },
  { code: "ITEM-B", name: "Air Mineral 1500ml", category: "Minuman", brand: "Aqua", stockUom: "PCS", stockQty: 240, barcode: "8990002", retailPrice: 8000, wholesalePrice: 7000, conversions: { DUS: 12, KARTON: 24 }, color: "#38bdf8" },
  { code: "ITEM-C", name: "Teh Botol 350ml", category: "Minuman", brand: "Sosro", stockUom: "PCS", stockQty: 360, barcode: "8990003", retailPrice: 4500, wholesalePrice: 3800, conversions: { DUS: 24, KARTON: 48 }, color: "#34d399" },
  { code: "ITEM-D", name: "Kopi Sachet (renceng)", category: "Sembako", brand: "Kapal Api", stockUom: "PCS", stockQty: 120, barcode: "8990004", retailPrice: 1500, wholesalePrice: 1300, conversions: { DUS: 50, KARTON: 100 }, color: "#a78bfa" },
  { code: "ITEM-E", name: "Gula Pasir 1kg", category: "Sembako", brand: "Gulaku", stockUom: "PCS", stockQty: 200, barcode: "8990005", retailPrice: 17500, wholesalePrice: 16000, conversions: { DUS: 20, KARTON: 40 }, color: "#fbbf24" },
  { code: "ITEM-F", name: "Minyak Goreng 1L", category: "Sembako", brand: "Bimoli", stockUom: "PCS", stockQty: 150, barcode: "8990006", retailPrice: 19000, wholesalePrice: 17500, conversions: { DUS: 12, KARTON: 24 }, color: "#f59e0b" },
  { code: "ITEM-G", name: "Beras Premium 5kg", category: "Sembako", brand: "Beras Kita", stockUom: "PCS", stockQty: 80, barcode: "8990007", retailPrice: 72000, wholesalePrice: 68000, conversions: { DUS: 10, KARTON: 20 }, color: "#f87171" },
  { code: "ITEM-H", name: "Mie Instan Goreng", category: "Makanan", brand: "Indomie", stockUom: "PCS", stockQty: 600, barcode: "8990008", retailPrice: 3500, wholesalePrice: 3200, conversions: { DUS: 40, KARTON: 80 }, color: "#fb923c" },
  { code: "ITEM-I", name: "Susu UHT 1L", category: "Minuman", brand: "Ultra", stockUom: "PCS", stockQty: 96, barcode: "8990009", retailPrice: 18000, wholesalePrice: 16500, conversions: { DUS: 12, KARTON: 24 }, color: "#93c5fd" },
  { code: "ITEM-J", name: "Sabun Mandi Batang", category: "Perawatan", brand: "Lifebuoy", stockUom: "PCS", stockQty: 300, barcode: "8990010", retailPrice: 5500, wholesalePrice: 4800, conversions: { DUS: 72, KARTON: 144 }, color: "#c084fc" },
  { code: "ITEM-K", name: "Shampoo Sachet", category: "Perawatan", brand: "Pantene", stockUom: "PCS", stockQty: 500, barcode: "8990011", retailPrice: 1000, wholesalePrice: 900, conversions: { DUS: 100, KARTON: 200 }, color: "#f472b6" },
  { code: "ITEM-L", name: "Detergen 800g", category: "Perawatan", brand: "Rinso", stockUom: "PCS", stockQty: 140, barcode: "8990012", retailPrice: 24000, wholesalePrice: 22000, conversions: { DUS: 12, KARTON: 24 }, color: "#22d3ee" },
];

export const CUSTOMERS: Customer[] = [
  { id: "CUST-0001", name: "Toko Berkah Jaya", group: "Grosir", phone: "0812-0001", outstanding: 3000000 },
  { id: "CUST-0002", name: "Warung Bu Sari", group: "Grosir", phone: "0812-0002", outstanding: 1500000 },
  { id: "CUST-0003", name: "Pelanggan Retail (Umum)", group: "Retail", phone: "-", outstanding: 0 },
  { id: "CUST-0004", name: "Minimarket Sejahtera", group: "Grosir", phone: "0812-0004", outstanding: 0 },
  { id: "CUST-0005", name: "Toko Kelontong Pak Budi", group: "Grosir", phone: "0812-0005", outstanding: 750000 },
];

export const formatRupiah = (n: number): string =>
  "Rp " + new Intl.NumberFormat("id-ID").format(Math.round(n));

export const pcsPerUnit = (p: Product, uom: Uom): number =>
  uom === "PCS" ? 1 : p.conversions[uom as Exclude<Uom, "PCS">];
