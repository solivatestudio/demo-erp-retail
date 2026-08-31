"use client";

import { useEffect, useMemo, useState } from "react";
import { Banknote, Minus, Plus, Printer, ReceiptText, Search, ShoppingCart, Trash2, X } from "lucide-react";
import { formatRupiah } from "../lib/utils/format";
import { getStockSnapshot, SalesReceipt, saveSalesReceipt, saveStockSnapshot } from "../lib/demoFlow";
import { calculateStockStatus } from "../lib/stockLogic";
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
  lowStockThreshold?: number;
  reorderPoint?: number;
};

type CartLine = Product & { qty: number; price: number };

const initialProducts: Product[] = [
  { id: "p1", sku: "SKU-CUP-16OZ", name: "Cup Plastik PP 16oz Oza (50 pcs)", category: "Cup & Minuman", unit: "pack", retail: 15000, wholesale: 13200, stockToko: 45, stockGudang: 240, lowStockThreshold: 30, reorderPoint: 15 },
  { id: "p2", sku: "SKU-MIKA-B4", name: "Mika Bento 4 Sekat Hitam (50 pcs)", category: "Kemasan Makanan", unit: "pack", retail: 46000, wholesale: 41500, stockToko: 18, stockGudang: 90, lowStockThreshold: 20, reorderPoint: 10 },
  { id: "p3", sku: "SKU-KRESEK-15", name: "Kresek HDPE Bening 15x30 (500 gr)", category: "Plastik & Kresek", unit: "pack", retail: 12500, wholesale: 10500, stockToko: 65, stockGudang: 350, lowStockThreshold: 40, reorderPoint: 20 },
  { id: "p4", sku: "SKU-ROLL-PE08", name: "Plastik Roll PE Bening 0.8 mm (10 kg)", category: "Plastik & Kresek", unit: "roll", retail: 330000, wholesale: 305000, stockToko: 6, stockGudang: 28, lowStockThreshold: 10, reorderPoint: 5 },
  { id: "p5", sku: "SKU-BOX-LUNCH-M", name: "Paper Lunch Box Kraft Medium (100 pcs)", category: "Kemasan Makanan", unit: "pack", retail: 75000, wholesale: 67000, stockToko: 4, stockGudang: 3, lowStockThreshold: 15, reorderPoint: 8 },
  { id: "p6", sku: "SKU-BUBBLE-50M", name: "Bubble Wrap Roll 50m x 125cm", category: "Perlengkapan Packing", unit: "roll", retail: 105000, wholesale: 92000, stockToko: 0, stockGudang: 18, lowStockThreshold: 8, reorderPoint: 3 },
  { id: "p7", sku: "SKU-LAKBAN-48", name: "Lakban Bening Daimaru 48mm x 90y", category: "Perlengkapan Packing", unit: "roll", retail: 11500, wholesale: 9800, stockToko: 80, stockGudang: 420, lowStockThreshold: 50, reorderPoint: 25 },
  { id: "p8", sku: "SKU-SEDOTAN-STR", name: "Sedotan Steril Bubble 12mm (100 pcs)", category: "Cup & Minuman", unit: "pack", retail: 9000, wholesale: 7500, stockToko: 50, stockGudang: 200, lowStockThreshold: undefined, reorderPoint: undefined },
];

const customers = [
  { id: "retail", name: "Pelanggan Umum (Walk-in)", group: "Retail" },
  { id: "grosir1", name: "Warung Makan Bu Aminah", group: "Grosir" },
  { id: "grosir2", name: "Kedai Kopi Selaras", group: "Grosir" },
  { id: "tempo", name: "Catering Berkah Klaten", group: "Tempo" },
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
    setProducts((current) =>
      current.map((product) => ({
        ...product,
        stockToko: savedStock[product.sku] ?? product.stockToko,
      }))
    );
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
        if (exists.qty >= product.stockToko) return current; // limit by stock
        return current.map((item) => (item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
      }
      return [...current, { ...product, price, qty: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart((current) =>
      current
        .map((item) => {
          if (item.id !== id) return item;
          const nextQty = item.qty + delta;
          if (nextQty > item.stockToko) return item; // stock limit
          return { ...item, qty: Math.max(0, nextQty) };
        })
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
      cashier: "Kasir 01 (Siti)",
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
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={isWholesale ? "warning" : "success"}>
                {isWholesale ? "Grosir / Mitra" : "Retail Umum"}
              </Badge>
              <Badge variant="outline">Toko Utama</Badge>
            </div>
            <h1>POS Kasir</h1>
            <p>Pilih pelanggan, scan atau klik barang, lalu selesaikan pembayaran di kasir.</p>
          </div>
          <div className="pos-selectors">
            <select value={customerId} onChange={(event) => setCustomerId(event.target.value)}>
              {customers.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.group})
                </option>
              ))}
            </select>
            <select defaultValue="toko">
              <option value="toko">🏪 Toko Utama</option>
              <option value="gudang">📦 Gudang Utama</option>
            </select>
          </div>
        </div>

        <Card>
          <CardContent className="pos-filter">
            <div className="pos-search">
              <Search size={16} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Ketik nama produk, SKU, barcode (contoh: Cup 16oz, Mika Bento, Kresek 15)..."
              />
            </div>
            <div className="category-tabs">
              {categories.map((item) => (
                <button
                  key={item}
                  className={category === item ? "active" : ""}
                  onClick={() => setCategory(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="product-grid">
          {filtered.map((product) => {
            const status = calculateStockStatus({
              currentStock: product.stockToko,
              lowStockThreshold: product.lowStockThreshold,
              reorderPoint: product.reorderPoint,
              uom: product.unit,
            });

            return (
              <button
                className={`product-tile ${product.stockToko <= 0 ? "is-out-of-stock" : ""}`}
                key={product.id}
                onClick={() => addItem(product)}
                disabled={product.stockToko <= 0}
              >
                <div className="product-topline">
                  <span>{product.sku}</span>
                  <Badge variant={status.variant}>
                    {status.label === "HABIS" ? "Habis" : `${product.stockToko} ${product.unit}`}
                  </Badge>
                </div>
                <strong>{product.name}</strong>
                <small>
                  {product.category} · Gd: {product.stockGudang} {product.unit}
                </small>
                <div className="product-price-row">
                  <b>{formatRupiah(priceFor(product))}</b>
                  <span className="text-xs text-zinc-400">/{product.unit}</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* POS Cart Sidebar */}
      <aside className={`cart-panel ${cart.length === 0 ? "is-empty" : "has-items"}`}>
        <Card className="cart-card-container">
          <CardHeader className="cart-card-header">
            <div className="cart-heading">
              <div>
                <CardTitle>Keranjang Belanja</CardTitle>
                <CardDescription>
                  {itemCount} item · {customer.name}
                </CardDescription>
              </div>
              <div className="cart-header-icon">
                <ShoppingCart size={18} />
              </div>
            </div>
          </CardHeader>

          <CardContent className="cart-content">
            {cart.length === 0 ? (
              <div className="cart-empty">
                <ReceiptText size={32} />
                <strong>Keranjang Masih Kosong</strong>
                <span>Klik produk di sebelah kiri untuk menambahkan pesanan.</span>
              </div>
            ) : (
              <div className="cart-lines">
                {cart.map((item) => (
                  <div className="cart-line" key={item.id}>
                    <div className="cart-line-info">
                      <strong>{item.name}</strong>
                      <span className="cart-line-meta">
                        {formatRupiah(item.price)} / {item.unit}
                      </span>
                    </div>

                    <div className="cart-line-ctrl">
                      <div className="qty-control">
                        <button type="button" onClick={() => updateQty(item.id, -1)} aria-label="Kurang">
                          <Minus size={13} />
                        </button>
                        <b>{item.qty}</b>
                        <button type="button" onClick={() => updateQty(item.id, 1)} aria-label="Tambah">
                          <Plus size={13} />
                        </button>
                      </div>
                      <em className="cart-line-subtotal">{formatRupiah(item.qty * item.price)}</em>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Bottom Section: Summary & Actions */}
            <div className="cart-bottom-section">
              <div className="cart-summary">
                <div className="cart-total-row">
                  <span>Total Tagihan</span>
                  <strong className="cart-total-amount">{formatRupiah(total)}</strong>
                </div>

                <div className="cart-payment-row">
                  <span>Uang Diterima</span>
                  <div className="cart-pay-input-wrap">
                    <input
                      type="number"
                      min={0}
                      value={paid || ""}
                      onChange={(event) => setPaid(Number(event.target.value) || 0)}
                      placeholder="Rp 0"
                    />
                  </div>
                </div>

                {/* Quick Cash Buttons */}
                <div className="quick-cash-row">
                  <button type="button" onClick={() => setPaid(total)}>
                    Pas ({formatRupiah(total)})
                  </button>
                  <button type="button" onClick={() => setPaid(Math.ceil(total / 10000) * 10000)}>
                    +10k
                  </button>
                  <button type="button" onClick={() => setPaid(Math.ceil(total / 50000) * 50000)}>
                    +50k
                  </button>
                  <button type="button" onClick={() => setPaid(Math.ceil(total / 100000) * 100000)}>
                    +100k
                  </button>
                </div>

                <div className="cart-change-row">
                  <span>Kembalian</span>
                  <strong className={change > 0 ? "text-emerald-700" : ""}>{formatRupiah(change)}</strong>
                </div>
              </div>

              <div className="cart-actions">
                <Button
                  variant="outline"
                  size="default"
                  disabled={cart.length === 0}
                  onClick={() => {
                    setCart([]);
                    setPaid(0);
                  }}
                >
                  <Trash2 size={15} /> Kosongkan
                </Button>
                <Button size="default" disabled={cart.length === 0} onClick={checkout}>
                  <Banknote size={16} /> Bayar & Cetak Nota
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </aside>

      {/* Nota / Receipt Print Preview Modal */}
      {receipt && (
        <div className="receipt-overlay" onClick={() => setReceipt(null)}>
          <div className="nota-dialog" onClick={(event) => event.stopPropagation()}>
            {/* Header Modal */}
            <div className="nota-dialog-header">
              <div className="flex items-center gap-2.5">
                <div className="receipt-header-icon">
                  <ReceiptText size={18} />
                </div>
                <div>
                  <strong className="text-base font-bold text-zinc-900 block">Preview Nota Transaksi</strong>
                  <span className="text-xs text-zinc-500">No: {receipt.number} · {receipt.date}</span>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setReceipt(null)} aria-label="Tutup">
                <X size={18} />
              </Button>
            </div>

            {/* Scrollable Receipt Paper */}
            <div className="nota-dialog-body">
              <div className="nota-paper">
                <header className="nota-header">
                  <strong>Kelolain · Retail & Wholesale</strong>
                  <span>Pusat Packaging, Plastik & Perlengkapan Usaha</span>
                  <span>Jl. Irian No.8, Klaten Tengah · Telp/WA: 0877-4426-2104</span>
                </header>
                <section className="nota-meta">
                  <div>
                    <span>No Nota:</span>
                    <b>{receipt.number}</b>
                  </div>
                  <div>
                    <span>Tanggal:</span>
                    <b>{receipt.date}</b>
                  </div>
                  <div>
                    <span>Pelanggan:</span>
                    <b>{receipt.customer}</b>
                  </div>
                  <div>
                    <span>Grup Harga:</span>
                    <b>{receipt.customerGroup}</b>
                  </div>
                  <div>
                    <span>Gudang:</span>
                    <b>{receipt.warehouse}</b>
                  </div>
                  <div>
                    <span>Kasir:</span>
                    <b>{receipt.cashier}</b>
                  </div>
                </section>
                <div className="receipt-lines">
                  {receipt.lines.map((item) => (
                    <div key={item.sku}>
                      <span>{item.name}</span>
                      <em>
                        {item.qty} {item.unit} × {formatRupiah(item.price)}
                      </em>
                      <b>{formatRupiah(item.subtotal)}</b>
                    </div>
                  ))}
                </div>
                <section className="nota-total">
                  <div>
                    <span>Total Tagihan:</span>
                    <b>{formatRupiah(receipt.total)}</b>
                  </div>
                  <div>
                    <span>Tunai / Bayar:</span>
                    <b>{formatRupiah(receipt.paid)}</b>
                  </div>
                  <div>
                    <span>Kembalian:</span>
                    <b>{formatRupiah(receipt.change)}</b>
                  </div>
                </section>
                <footer className="nota-footer">
                  Terima kasih atas kunjungan Anda.
                  <br />
                  Barang yang sudah dibeli dapat ditukar sesuai kebijakan toko.
                </footer>
              </div>
            </div>

            {/* Bottom Actions Sticky Footer */}
            <div className="nota-dialog-footer">
              <Button variant="outline" onClick={() => setReceipt(null)}>
                Tutup Preview
              </Button>
              <Button onClick={() => window.print()}>
                <Printer size={16} /> Cetak Nota (Print)
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
