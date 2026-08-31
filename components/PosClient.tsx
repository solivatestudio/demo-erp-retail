"use client";

import { useMemo, useState } from "react";
import { Minus, Plus, ReceiptText, Search, ShoppingCart, Trash2 } from "lucide-react";
import { formatRupiah } from "../lib/utils/format";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

type Product = {
  id: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  retail: number;
  wholesale: number;
  stockToko: number;
  stockGudang: number;
};

type CartLine = Product & { qty: number; price: number };

const initialProducts: Product[] = [
  { id: "p1", sku: "ITEM-001", name: "Plastik PP 1 kg", category: "Plastik", unit: "pack", retail: 28000, wholesale: 25500, stockToko: 42, stockGudang: 120 },
  { id: "p2", sku: "ITEM-004", name: "Standing Pouch 250gr", category: "Packaging", unit: "pcs", retail: 1850, wholesale: 1600, stockToko: 260, stockGudang: 900 },
  { id: "p3", sku: "ITEM-008", name: "Bubble Wrap 50cm", category: "Packaging", unit: "roll", retail: 72000, wholesale: 68000, stockToko: 18, stockGudang: 45 },
  { id: "p4", sku: "ITEM-014", name: "Cup 12 oz", category: "Cup", unit: "dus", retail: 118000, wholesale: 109000, stockToko: 8, stockGudang: 36 },
  { id: "p5", sku: "ITEM-021", name: "Kresek Hitam 24", category: "Plastik", unit: "bal", retail: 42000, wholesale: 39000, stockToko: 12, stockGudang: 4 },
  { id: "p6", sku: "ITEM-026", name: "Sendok Plastik Putih", category: "Aksesoris", unit: "pack", retail: 11500, wholesale: 9800, stockToko: 64, stockGudang: 180 },
];

const customers = [
  { id: "retail", name: "Pelanggan Umum", group: "Retail" },
  { id: "grosir", name: "Toko Berkah Jaya", group: "Grosir" },
  { id: "tempo", name: "Minimarket Sejahtera", group: "Tempo" },
];

export default function PosClient() {
  const [products, setProducts] = useState(initialProducts);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [customerId, setCustomerId] = useState(customers[0].id);
  const [category, setCategory] = useState("Semua");
  const [query, setQuery] = useState("");
  const [paid, setPaid] = useState(0);
  const [receipt, setReceipt] = useState<{ number: string; total: number; paid: number; lines: CartLine[] } | null>(null);

  const customer = customers.find((item) => item.id === customerId) ?? customers[0];
  const isWholesale = customer.group !== "Retail";
  const categories = ["Semua", ...Array.from(new Set(products.map((item) => item.category)))];
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((item) => {
      const matchCategory = category === "Semua" || item.category === category;
      const matchQuery = !q || item.name.toLowerCase().includes(q) || item.sku.toLowerCase().includes(q);
      return matchCategory && matchQuery;
    });
  }, [category, products, query]);

  const total = cart.reduce((sum, item) => sum + item.qty * item.price, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const change = Math.max(0, paid - total);

  const priceFor = (product: Product) => (isWholesale ? product.wholesale : product.retail);

  const addItem = (product: Product) => {
    if (product.stockToko <= 0) return;
    const price = priceFor(product);
    setCart((current) => {
      const exists = current.find((item) => item.id === product.id);
      if (exists) {
        return current.map((item) => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...current, { ...product, price, qty: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart((current) =>
      current
        .map((item) => item.id === id ? { ...item, qty: Math.max(0, item.qty + delta) } : item)
        .filter((item) => item.qty > 0)
    );
  };

  const checkout = () => {
    if (cart.length === 0) return;
    setProducts((current) =>
      current.map((product) => {
        const line = cart.find((item) => item.id === product.id);
        return line ? { ...product, stockToko: Math.max(0, product.stockToko - line.qty) } : product;
      })
    );
    setReceipt({
      number: `POS-${String(Math.floor(180 + Math.random() * 40)).padStart(6, "0")}`,
      total,
      paid,
      lines: cart,
    });
    setCart([]);
    setPaid(0);
  };

  return (
    <div className="pos-page">
      <section className="pos-workspace">
        <div className="pos-toolbar">
          <div>
            <Badge variant={isWholesale ? "warning" : "success"}>{isWholesale ? "Harga grosir/tempo" : "Harga retail"}</Badge>
            <h1>POS Kasir</h1>
            <p>Dummy kasir untuk presentasi: pilih customer, tambah barang, bayar, stok toko langsung berkurang.</p>
          </div>
          <div className="pos-selectors">
            <select value={customerId} onChange={(event) => setCustomerId(event.target.value)}>
              {customers.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.group}</option>)}
            </select>
            <select defaultValue="toko">
              <option value="toko">Toko Utama</option>
              <option value="gudang">Gudang Utama</option>
            </select>
          </div>
        </div>

        <Card>
          <CardContent className="pos-filter">
            <div className="pos-search">
              <Search size={16} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari produk / scan barcode..." />
            </div>
            <div className="category-tabs">
              {categories.map((item) => (
                <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>
                  {item}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="product-grid">
          {filtered.map((product) => (
            <button className="product-tile" key={product.id} onClick={() => addItem(product)}>
              <div className="product-topline">
                <span>{product.sku}</span>
                <Badge variant={product.stockToko <= 10 ? "warning" : "outline"}>Toko {product.stockToko}</Badge>
              </div>
              <strong>{product.name}</strong>
              <small>{product.category} · Gudang {product.stockGudang} · {product.unit}</small>
              <b>{formatRupiah(priceFor(product))}</b>
            </button>
          ))}
        </div>
      </section>

      <aside className="cart-panel">
        <Card>
          <CardHeader>
            <div className="cart-heading">
              <div>
                <CardTitle>Keranjang</CardTitle>
                <CardDescription>{itemCount} item · {customer.name}</CardDescription>
              </div>
              <ShoppingCart size={20} />
            </div>
          </CardHeader>
          <CardContent className="cart-content">
            {cart.length === 0 ? (
              <div className="cart-empty">
                <ReceiptText size={28} />
                <strong>Belum ada item</strong>
                <span>Pilih produk dari grid kiri.</span>
              </div>
            ) : (
              <div className="cart-lines">
                {cart.map((item) => (
                  <div className="cart-line" key={item.id}>
                    <div>
                      <strong>{item.name}</strong>
                      <span>{formatRupiah(item.price)} / {item.unit}</span>
                    </div>
                    <div className="qty-control">
                      <button onClick={() => updateQty(item.id, -1)}><Minus size={14} /></button>
                      <b>{item.qty}</b>
                      <button onClick={() => updateQty(item.id, 1)}><Plus size={14} /></button>
                    </div>
                    <em>{formatRupiah(item.qty * item.price)}</em>
                  </div>
                ))}
              </div>
            )}

            <div className="cart-summary">
              <div>
                <span>Total</span>
                <strong>{formatRupiah(total)}</strong>
              </div>
              <label>
                <span>Tunai</span>
                <input type="number" min={0} value={paid || ""} onChange={(event) => setPaid(Number(event.target.value) || 0)} placeholder="0" />
              </label>
              <div>
                <span>Kembali</span>
                <strong>{formatRupiah(change)}</strong>
              </div>
            </div>

            <div className="cart-actions">
              <Button variant="outline" disabled={cart.length === 0} onClick={() => setCart([])}>
                <Trash2 size={15} /> Kosongkan
              </Button>
              <Button disabled={cart.length === 0} onClick={checkout}>
                Bayar dummy
              </Button>
            </div>
          </CardContent>
        </Card>
      </aside>

      {receipt && (
        <div className="receipt-overlay" onClick={() => setReceipt(null)}>
          <div className="receipt-modal" onClick={(event) => event.stopPropagation()}>
            <strong>Berkah Plastik &amp; Packaging</strong>
            <span>{receipt.number}</span>
            <div className="receipt-lines">
              {receipt.lines.map((item) => (
                <div key={item.id}>
                  <span>{item.name} × {item.qty}</span>
                  <b>{formatRupiah(item.qty * item.price)}</b>
                </div>
              ))}
            </div>
            <div className="receipt-total">
              <span>Total</span>
              <b>{formatRupiah(receipt.total)}</b>
            </div>
            <Button onClick={() => setReceipt(null)}>Tutup struk</Button>
          </div>
        </div>
      )}
    </div>
  );
}
