"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Banknote,
  Coffee,
  DatabaseZap,
  Layers,
  Minus,
  Package,
  Plus,
  Printer,
  ReceiptText,
  Search,
  ShoppingCart,
  Sparkles,
  Trash2,
  UtensilsCrossed,
  X,
} from "lucide-react";
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

const getCategoryVisual = (category: string) => {
  switch (category) {
    case "Cup & Minuman":
      return { icon: Coffee, tagClass: "tag-cup", label: "Cup & Minuman" };
    case "Kemasan Makanan":
      return { icon: UtensilsCrossed, tagClass: "tag-food", label: "Kemasan Makanan" };
    case "Plastik & Kresek":
      return { icon: Layers, tagClass: "tag-plastic", label: "Plastik & Kresek" };
    case "Perlengkapan Packing":
      return { icon: Package, tagClass: "tag-packing", label: "Perlengkapan Packing" };
    default:
      return { icon: Sparkles, tagClass: "tag-default", label: category };
  }
};

export default function PosClient() {
  const [products, setProducts] = useState(initialProducts);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [customerId, setCustomerId] = useState(customers[0].id);
  const [category, setCategory] = useState("Semua");
  const [query, setQuery] = useState("");
  const [paid, setPaid] = useState(0);
  const [receipt, setReceipt] = useState<SalesReceipt | null>(null);
  const [mobileCartOpen, setMobileCartOpen] = useState(false);

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

  const addItem = (product: Product, quantityToAdd: number = 1) => {
    if (product.stockToko <= 0) return;
    const price = priceFor(product);
    setCart((current) => {
      const exists = current.find((item) => item.id === product.id);
      if (exists) {
        const nextQty = Math.min(product.stockToko, exists.qty + quantityToAdd);
        return current.map((item) => (item.id === product.id ? { ...item, qty: nextQty } : item));
      }
      const initialQty = Math.min(product.stockToko, quantityToAdd);
      return [...current, { ...product, price, qty: initialQty }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart((current) =>
      current
        .map((item) => {
          if (item.id !== id) return item;
          const nextQty = item.qty + delta;
          if (nextQty > item.stockToko) return item;
          return { ...item, qty: Math.max(0, nextQty) };
        })
        .filter((item) => item.qty > 0)
    );
  };

  const setExactQty = (id: string, nextQty: number) => {
    setCart((current) =>
      current
        .map((item) => {
          if (item.id !== id) return item;
          const validQty = Math.min(item.stockToko, Math.max(1, nextQty));
          return { ...item, qty: validQty };
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
      warehouse: "Toko Utama (Jl. Irian)",
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
        <div className="pos-top-fixed">
          <div className="pos-toolbar">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant={isWholesale ? "warning" : "success"}>
                  {isWholesale ? `Mode ${customer.group} (Harga Grosir)` : "Mode Retail Eceran"}
                </Badge>
                <Badge variant="outline">Toko Utama (Irian)</Badge>
                <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-semibold inline-flex items-center gap-1">
                  <DatabaseZap size={11} /> POS Aktif
                </span>
              </div>
              <h1>Point of Sale Kasir</h1>
              <p>Pilih produk dengan cepat, sesuaikan kuantiti grosir/eceran, dan cetak nota transaksi.</p>
            </div>
            <div className="pos-selectors">
              <select value={customerId} onChange={(event) => setCustomerId(event.target.value)} title="Pilih Pelanggan & Skema Harga">
                {customers.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.group})
                  </option>
                ))}
              </select>
              <select defaultValue="toko" title="Pilih Lokasi Kasir">
                <option value="toko">🏪 Toko Utama (Irian)</option>
                <option value="krapyak">🚚 Gatotkoco 2 (Krapyak)</option>
              </select>
            </div>
          </div>

          <Card className="pos-filter-card">
            <CardContent className="pos-filter">
              <div className="pos-search">
                <Search size={16} />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Cari produk, SKU, barcode (contoh: Cup 16oz, Mika Bento, Kresek 15)..."
                />
              </div>
              <div className="category-tabs">
                {categories.map((item) => {
                  const visual = item !== "Semua" ? getCategoryVisual(item) : null;
                  const Icon = visual?.icon;
                  return (
                    <button
                      key={item}
                      className={`${category === item ? "active" : ""} ${visual ? visual.tagClass : ""}`}
                      onClick={() => setCategory(item)}
                    >
                      {Icon && <Icon size={13} className="inline mr-1 opacity-80" />}
                      {item}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="product-grid">
          {filtered.map((product) => {
            const status = calculateStockStatus({
              currentStock: product.stockToko,
              lowStockThreshold: product.lowStockThreshold,
              reorderPoint: product.reorderPoint,
              uom: product.unit,
            });
            const visual = getCategoryVisual(product.category);
            const CatIcon = visual.icon;

            return (
              <div
                className={`product-tile-card ${visual.tagClass} ${product.stockToko <= 0 ? "is-out-of-stock" : ""}`}
                key={product.id}
                onClick={() => addItem(product)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && addItem(product)}
              >
                <div className="product-topline">
                  <div className="product-cat-badge">
                    <CatIcon size={13} />
                    <span>{product.sku}</span>
                  </div>
                  <Badge variant={status.variant}>
                    {status.label === "HABIS" ? "Habis" : `${product.stockToko} ${product.unit}`}
                  </Badge>
                </div>

                <strong className="product-tile-name">{product.name}</strong>

                <div className="product-tile-meta">
                  <span className="cat-text-pill">{product.category}</span>
                  <small>Gd. Pusat: {product.stockGudang} {product.unit}</small>
                </div>

                <div className="product-price-row">
                  <div>
                    <b>{formatRupiah(priceFor(product))}</b>
                    <span className="text-xs text-zinc-400">/{product.unit}</span>
                  </div>
                  {isWholesale && (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                      Grosir
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {mobileCartOpen && <button className="mobile-cart-backdrop" aria-label="Tutup keranjang" onClick={() => setMobileCartOpen(false)} />}
      <aside className={`cart-panel ${cart.length === 0 ? "is-empty" : "has-items"} ${mobileCartOpen ? "mobile-open" : ""}`}>
        <Card className="cart-card-container">
          <CardHeader className="cart-card-header">
            <div className="cart-heading">
              <div>
                <CardTitle>Keranjang Kasir</CardTitle>
                <CardDescription>
                  {itemCount} unit barang · {customer.name}
                </CardDescription>
              </div>
              <div className="cart-header-icon">
                <ShoppingCart size={18} /><button className="mobile-cart-close" onClick={() => setMobileCartOpen(false)} aria-label="Tutup"><X size={18}/></button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="cart-content">
            {cart.length === 0 ? (
              <div className="cart-empty">
                <ReceiptText size={32} />
                <strong>Keranjang Masih Kosong</strong>
                <span>Klik item produk di katalog kiri untuk memasukkan pesanan.</span>
              </div>
            ) : (
              <div className="cart-lines">
                {cart.map((item) => {
                  const visual = getCategoryVisual(item.category);
                  const Icon = visual.icon;

                  return (
                    <div className="cart-line-enhanced" key={item.id}>
                      <div className="cart-line-header">
                        <div className="cart-line-info">
                          <div className="flex items-center gap-1.5">
                            <span className={`cart-cat-dot ${visual.tagClass}`}>
                              <Icon size={11} />
                            </span>
                            <strong>{item.name}</strong>
                          </div>
                          <span className="cart-line-meta">
                            {formatRupiah(item.price)} / {item.unit} · Stok Toko: {item.stockToko} {item.unit}
                          </span>
                        </div>
                        <em className="cart-line-subtotal">{formatRupiah(item.qty * item.price)}</em>
                      </div>

                      <div className="cart-ctrl-row">
                        <div className="qty-control-input-group">
                          <button type="button" onClick={() => updateQty(item.id, -1)} aria-label="Kurangi 1">
                            <Minus size={13} />
                          </button>
                          <input
                            type="number"
                            min="1"
                            max={item.stockToko}
                            value={item.qty}
                            onChange={(e) => setExactQty(item.id, parseInt(e.target.value) || 1)}
                            className="qty-number-input"
                            title="Ketik jumlah langsung"
                          />
                          <button type="button" onClick={() => updateQty(item.id, 1)} aria-label="Tambah 1">
                            <Plus size={13} />
                          </button>
                        </div>

                        <div className="quick-qty-chips">
                          {[5, 10, 20, 50].map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              className="qty-preset-btn"
                              onClick={() => setExactQty(item.id, item.qty + preset)}
                              title={`Tambah +${preset} ${item.unit}`}
                            >
                              +{preset}
                            </button>
                          ))}
                          <button
                            type="button"
                            className="qty-preset-btn text-rose-600 hover:bg-rose-100 hover:border-rose-300"
                            onClick={() => updateQty(item.id, -item.qty)}
                            title="Hapus baris ini"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

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
                      type="text"
                      inputMode="numeric"
                      value={paid ? new Intl.NumberFormat("id-ID").format(paid) : ""}
                      onChange={(event) => setPaid(Number(event.target.value.replace(/\D/g, "")) || 0)}
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

      {cart.length > 0 && <div className="mobile-cart-bar"><div><span>{itemCount} item</span><strong>{formatRupiah(total)}</strong></div><Button onClick={() => setMobileCartOpen(true)}>Lihat Keranjang <ShoppingCart size={16}/></Button></div>}

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
