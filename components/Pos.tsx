"use client";

import { useState, useMemo } from "react";
import {
  PRODUCTS,
  CUSTOMERS,
  formatRupiah,
  pcsPerUnit,
  type Uom,
  type CartLine,
  type Product,
} from "../lib/data";

const UOM_OPTIONS: Uom[] = ["PCS", "DUS", "KARTON"];

export default function Pos() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Semua");
  const [customerId, setCustomerId] = useState(CUSTOMERS[2].id);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [receipt, setReceipt] = useState<CartLine[] | null>(null);
  const [paid, setPaid] = useState<number>(0);

  const customer = CUSTOMERS.find((c) => c.id === customerId) ?? CUSTOMERS[2];
  const isWholesale = customer.group === "Grosir";

  const categories = useMemo(
    () => ["Semua", ...Array.from(new Set(PRODUCTS.map((p) => p.category)))],
    []
  );

  const filtered = PRODUCTS.filter((p) => {
    const matchCat = category === "Semua" || p.category === category;
    const q = search.trim().toLowerCase();
    const matchSearch =
      !q || p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const unitPrice = (p: Product): number =>
    isWholesale ? p.wholesalePrice : p.retailPrice;

  const addToCart = (p: Product, uom: Uom) => {
    const pcs = pcsPerUnit(p, uom);
    const price = unitPrice(p) * pcs;
    setCart((prev) => {
      const existing = prev.find((l) => l.product.code === p.code && l.uom === uom);
      if (existing) {
        return prev.map((l) =>
          l === existing
            ? { ...l, qty: l.qty + 1, subtotal: (l.qty + 1) * price }
            : l
        );
      }
      return [...prev, { product: p, qty: 1, uom, unitPrice: price, pcsEquivalent: pcs, subtotal: price }];
    });
  };

  const changeQty = (line: CartLine, delta: number) => {
    setCart((prev) =>
      prev
        .map((l) => {
          if (l !== line) return l;
          const qty = Math.max(0, l.qty + delta);
          return { ...l, qty, subtotal: qty * l.unitPrice };
        })
        .filter((l) => l.qty > 0)
    );
  };

  const total = cart.reduce((s, l) => s + l.subtotal, 0);
  const totalPcs = cart.reduce((s, l) => s + l.qty * l.pcsEquivalent, 0);
  const change = Math.max(0, paid - total);

  const pay = () => {
    setReceipt(cart);
    setCart([]);
    setPaid(0);
  };

  const resetCart = () => setCart([]);

  return (
    <div className="pos">
      <div className="pos-left">
        <div className="pos-topbar">
          <div className="pos-title">
            <span className="pos-badge">{isWholesale ? "Grosir" : "Retail"}</span>
            <div>
              <div className="pos-cust-name">{customer.name}</div>
              <div className="pos-cust-sub">{customer.id} · {customer.phone}</div>
            </div>
          </div>
          <select
            className="cust-select"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
          >
            {CUSTOMERS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.group})
              </option>
            ))}
          </select>
        </div>

        <div className="search-row">
          <input
            className="search"
            placeholder="Cari produk / scan barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="cat-row">
          {categories.map((c) => (
            <button
              key={c}
              className={"chip" + (category === c ? " active" : "")}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="product-grid">
          {filtered.map((p) => {
            const up = unitPrice(p);
            return (
              <div className="product" key={p.code}>
                <div className="product-swatch" style={{ background: p.color }}>
                  {p.code}
                </div>
                <div className="product-body">
                  <div className="product-name">{p.name}</div>
                  <div className="product-meta">{p.brand} · stok {p.stockQty} {p.stockUom}</div>
                  <div className="product-price num">{formatRupiah(up)} / {p.stockUom}</div>
                </div>
                <div className="product-actions">
                  {UOM_OPTIONS.map((u) => {
                    const pcs = pcsPerUnit(p, u);
                    return (
                      <button
                        key={u}
                        className="add-btn"
                        onClick={() => addToCart(p, u)}
                        title={`${pcs} PCS`}
                      >
                        +{u}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pos-right">
        <div className="cart-head">
          <span>Keranjang</span>
          <span className="num">{cart.length} baris · {totalPcs} PCS</span>
        </div>

        <div className="cart-list">
          {cart.length === 0 ? (
            <div className="cart-empty">Belum ada item. Pilih produk di kiri.</div>
          ) : (
            cart.map((l, i) => (
              <div className="cart-line" key={`${l.product.code}-${l.uom}`}>
                <div className="cart-line-info">
                  <div className="cart-line-name">{l.product.name}</div>
                  <div className="cart-line-meta">
                    {l.uom} · {formatRupiah(l.unitPrice)}/{l.uom} · = {l.qty * l.pcsEquivalent} PCS
                  </div>
                </div>
                <div className="qty-ctrl">
                  <button onClick={() => changeQty(l, -1)}>−</button>
                  <span className="num">{l.qty}</span>
                  <button onClick={() => changeQty(l, 1)}>+</button>
                </div>
                <div className="cart-line-total num">{formatRupiah(l.subtotal)}</div>
              </div>
            ))
          )}
        </div>

        <div className="cart-foot">
          <div className="total-row">
            <span>Total</span>
            <span className="num total-value">{formatRupiah(total)}</span>
          </div>
          <div className="pay-row">
            <input
              className="pay-input num"
              type="number"
              min={0}
              value={paid || ""}
              placeholder="0"
              onChange={(e) => setPaid(Number(e.target.value) || 0)}
            />
            <span className="change-label num">Kembali: {formatRupiah(change)}</span>
          </div>
          <div className="foot-actions">
            <button className="btn btn-ghost" onClick={resetCart}>Kosongkan</button>
            <button className="btn btn-primary" onClick={pay} disabled={cart.length === 0}>
              Bayar ({isWholesale ? "Grosir" : "Retail"})
            </button>
          </div>
        </div>
      </div>

      {receipt && (
        <div className="receipt-overlay" onClick={() => setReceipt(null)}>
          <div className="receipt" onClick={(e) => e.stopPropagation()}>
            <div className="receipt-store">RetailERP · Toko Utama</div>
            <div className="receipt-meta">Jl. Merdeka No. 1 · Telp 021-0000</div>
            <hr />
            <div className="receipt-cust">Customer: {customer.name}</div>
            <div className="receipt-meta">Tipe: {isWholesale ? "Grosir" : "Retail"}</div>
            <hr />
            {receipt.map((l, i) => (
              <div className="receipt-line" key={i}>
                <span>{l.product.name} ×{l.qty} {l.uom}</span>
                <span className="num">{formatRupiah(l.subtotal)}</span>
              </div>
            ))}
            <hr />
            <div className="receipt-total">
              <span>Total</span>
              <span className="num">{formatRupiah(receipt.reduce((s, l) => s + l.subtotal, 0))}</span>
            </div>
            <div className="receipt-meta">Terima kasih atas kunjungan Anda.</div>
            <button className="btn btn-primary close-btn" onClick={() => setReceipt(null)}>
              Tutup
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .pos { display: grid; grid-template-columns: 1fr 380px; gap: 16px; height: 100vh; padding: 16px; }
        @media (max-width: 900px) { .pos { grid-template-columns: 1fr; height: auto; } .pos-right { height: auto; } }
        .pos-left { display: flex; flex-direction: column; gap: 12px; overflow: hidden; }
        .pos-right { background: var(--panel); border: 1px solid var(--border); border-radius: 14px; display: flex; flex-direction: column; overflow: hidden; }
        .pos-topbar { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
        .pos-title { display: flex; align-items: center; gap: 12px; }
        .pos-badge { background: var(--purple); padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 700; }
        .pos-cust-name { font-weight: 700; }
        .pos-cust-sub { color: var(--muted); font-size: 12px; }
        .cust-select { background: var(--panel); color: var(--text); border: 1px solid var(--border); border-radius: 8px; padding: 8px 10px; }
        .search-row { }
        .search { width: 100%; padding: 10px 14px; background: var(--panel); border: 1px solid var(--border); border-radius: 10px; color: var(--text); font-size: 14px; }
        .cat-row { display: flex; gap: 8px; flex-wrap: wrap; }
        .chip { background: var(--panel); border: 1px solid var(--border); color: var(--muted); padding: 6px 12px; border-radius: 999px; font-size: 12px; }
        .chip.active { background: var(--accent); color: white; border-color: var(--accent); }
        .product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px; overflow-y: auto; padding-bottom: 8px; }
        .product { background: var(--panel); border: 1px solid var(--border); border-radius: 12px; padding: 12px; display: flex; gap: 10px; align-items: flex-start; }
        .product-swatch { width: 44px; height: 44px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; color: #0f172a; flex-shrink: 0; }
        .product-body { flex: 1; min-width: 0; }
        .product-name { font-size: 13px; font-weight: 600; }
        .product-meta { font-size: 11px; color: var(--muted); }
        .product-price { font-size: 13px; font-weight: 700; margin-top: 4px; }
        .product-actions { display: flex; flex-direction: column; gap: 6px; }
        .add-btn { background: var(--panel-2); border: 1px solid var(--border); color: var(--text); border-radius: 7px; padding: 4px 8px; font-size: 11px; font-weight: 600; }
        .add-btn:hover { background: var(--accent); border-color: var(--accent); }
        .cart-head { display: flex; justify-content: space-between; padding: 14px 16px; border-bottom: 1px solid var(--border); font-weight: 700; }
        .cart-list { flex: 1; overflow-y: auto; padding: 8px; display: flex; flex-direction: column; gap: 8px; }
        .cart-empty { color: var(--muted); text-align: center; padding: 40px 12px; font-size: 13px; }
        .cart-line { display: grid; grid-template-columns: 1fr auto auto; gap: 8px; align-items: center; background: var(--panel-2); border-radius: 10px; padding: 10px; }
        .cart-line-name { font-size: 13px; font-weight: 600; }
        .cart-line-meta { font-size: 11px; color: var(--muted); }
        .qty-ctrl { display: flex; align-items: center; gap: 8px; }
        .qty-ctrl button { background: var(--panel); border: 1px solid var(--border); color: var(--text); border-radius: 6px; width: 26px; height: 26px; font-weight: 700; }
        .cart-line-total { font-size: 13px; font-weight: 700; min-width: 90px; text-align: right; }
        .cart-foot { border-top: 1px solid var(--border); padding: 14px 16px; display: flex; flex-direction: column; gap: 10px; }
        .total-row { display: flex; justify-content: space-between; align-items: center; font-weight: 700; }
        .total-value { font-size: 22px; }
        .pay-row { display: flex; gap: 10px; align-items: center; }
        .pay-input { flex: 1; padding: 10px 12px; background: var(--panel-2); border: 1px solid var(--border); border-radius: 8px; color: var(--text); font-size: 16px; }
        .change-label { font-size: 13px; color: var(--green); font-weight: 600; }
        .foot-actions { display: flex; gap: 10px; }
        .btn { padding: 12px 16px; border-radius: 10px; border: 1px solid var(--border); font-weight: 700; font-size: 14px; }
        .btn-ghost { background: var(--panel-2); color: var(--muted); }
        .btn-primary { background: var(--green); color: #052e1b; border-color: var(--green); flex: 1; }
        .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
        .receipt-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 100; }
        .receipt { background: #fff; color: #111; width: 320px; border-radius: 10px; padding: 20px; font-family: 'Courier New', monospace; }
        .receipt-store { text-align: center; font-weight: 700; font-size: 15px; }
        .receipt-meta { text-align: center; font-size: 11px; }
        .receipt-cust { font-size: 12px; font-weight: 700; }
        .receipt hr { border: none; border-top: 1px dashed #ccc; margin: 8px 0; }
        .receipt-line { display: flex; justify-content: space-between; font-size: 12px; margin: 2px 0; }
        .receipt-total { display: flex; justify-content: space-between; font-weight: 700; font-size: 14px; }
        .close-btn { width: 100%; margin-top: 12px; background: #111; color: #fff; border: none; }
      `}</style>
    </div>
  );
}
