"use client";

import { useEffect, useMemo, useState } from "react";
import { Minus, Plus, Printer, ReceiptText, Search, ShoppingCart, Trash2, X } from "lucide-react";
import { formatRupiah } from "../lib/utils/format";
import { getStockSnapshot, SalesReceipt, saveSalesReceipt, saveStockSnapshot } from "../lib/demoFlow";
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
  { id: "p1", sku: "SKU-001", name: "Beras Premium 5 kg", category: "Sembako", unit: "sak", retail: 72000, wholesale: 68500, stockToko: 42, stockGudang: 120 },
  { id: "p2", sku: "SKU-004", name: "Minyak Goreng 1 L", category: "Sembako", unit: "botol", retail: 18500, wholesale: 17000, stockToko: 260, stockGudang: 900 },
  { id: "p3", sku: "SKU-008", name: "Susu UHT 1 L", category: "Minuman", unit: "kotak", retail: 21000, wholesale: 19500, stockToko: 18, stockGudang: 45 },
  { id: "p4", sku: "SKU-014", name: "Mie Instan Goreng", category: "Makanan", unit: "dus", retail: 118000, wholesale: 109000, stockToko: 8, stockGudang: 36 },
  { id: "p5", sku: "SKU-021", name: "Kopi Sachet 10 pcs", category: "Minuman", unit: "pack", retail: 16500, wholesale: 14800, stockToko: 12, stockGudang: 4 },
  { id: "p6", sku: "SKU-026", name: "Sabun Cair 450 ml", category: "Household", unit: "botol", retail: 24500, wholesale: 22500, stockToko: 64, stockGudang: 180 },
];

const customers = [
  { id: "retail", name: "Pelanggan Umum", group: "Retail" },
  { id: "grosir", name: "Retail Partner A", group: "Grosir" },
  { id: "tempo", name: "Outlet Cabang", group: "Tempo" },
];

export default function PosClient() {
  const [products, setProducts] = useState(initialProducts);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [customerId, setCustomerId] = useState(customers[0].id);
  const [category, setCategory] = useState("Semua");
  const [query, setQuery] = useState("");
  const [paid, setPaid] = useState(0);
  const [receipt, setReceipt] = useState<SalesReceipt | null>(null);

  useEffect(() => {
    const savedStock = getStockSnapshot();
    if (Object.keys(savedStock).length === 0) return;
    setProducts((current) => current.map((product) => ({
      ...product,
      stockToko: savedStock[product.sku] ?? product.stockToko,
    })));
  }, []);

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
    const paidAmount = paid || total;
    const nextProducts = products.map((product) => {
        const line = cart.find((item) => item.id === product.id);
        return line ? { ...product, stockToko: Math.max(0, product.stockToko - line.qty) } : product;
      });
    const nextReceipt: SalesReceipt = {
      number: `POS-${String(Date.now()).slice(-6)}`,
      date: new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date()),
      cashier: "Admin Toko",
      customer: customer.name,
      customerGroup: customer.group,
      warehouse: "Toko Utama",
      total,
      paid: paidAmount,
      change: Math.max(0, paidAmount - total),
      lines: cart.map((item) => ({
        sku: item.sku,
        name: item.name,
        unit: item.unit,
        qty: item.qty,
        price: item.price,
        subtotal: item.qty * item.price,
      })),
    };
    setProducts(nextProducts);
    saveStockSnapshot(Object.fromEntries(nextProducts.map((product) => [product.sku, product.stockToko])));
    saveSalesReceipt(nextReceipt);
    setReceipt(nextReceipt);
    setCart([]);
    setPaid(0);
  };

  return (
    <div className="pos-page">
      <section className="pos-catalog">
        <div className="pos-toolbar">
          <div>
            <Badge variant={isWholesale ? "warning" : "success"}>{isWholesale ? "Harga grosir/tempo" : "Harga retail"}</Badge>
            <h1>POS Kasir</h1>
            <p>Pilih pelanggan, scan atau cari barang, lalu selesaikan pembayaran di kasir.</p>
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
                Bayar
              </Button>
            </div>
          </CardContent>
        </Card>
      </aside>

      {receipt && (
        <div className="receipt-overlay" onClick={() => setReceipt(null)}>
          <div className="nota-modal" onClick={(event) => event.stopPropagation()}>
            <div className="nota-actions">
              <Button variant="outline" onClick={() => window.print()}><Printer size={15} /> Cetak</Button>
              <Button variant="ghost" size="icon" onClick={() => setReceipt(null)} aria-label="Tutup"><X size={16} /></Button>
            </div>
            <div className="nota-paper">
              <header className="nota-header">
                <strong>RetailOS</strong>
                <span>Jl. Operasional No. 10, Jakarta</span>
                <span>Telp/WA 0812-0000-1234</span>
              </header>
              <section className="nota-meta">
                <div><span>No Nota</span><b>{receipt.number}</b></div>
                <div><span>Tanggal</span><b>{receipt.date}</b></div>
                <div><span>Pelanggan</span><b>{receipt.customer}</b></div>
                <div><span>Grup</span><b>{receipt.customerGroup}</b></div>
                <div><span>Gudang</span><b>{receipt.warehouse}</b></div>
                <div><span>Kasir</span><b>{receipt.cashier}</b></div>
              </section>
            <div className="receipt-lines">
              {receipt.lines.map((item) => (
                <div key={item.sku}>
                  <span>{item.name}</span>
                  <em>{item.qty} {item.unit} × {formatRupiah(item.price)}</em>
                  <b>{formatRupiah(item.subtotal)}</b>
                </div>
              ))}
            </div>
              <section className="nota-total">
                <div><span>Total</span><b>{formatRupiah(receipt.total)}</b></div>
                <div><span>Tunai</span><b>{formatRupiah(receipt.paid)}</b></div>
                <div><span>Kembali</span><b>{formatRupiah(receipt.change)}</b></div>
              </section>
              <footer className="nota-footer">Barang yang sudah dibeli dapat ditukar sesuai kebijakan toko dengan membawa nota.</footer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
