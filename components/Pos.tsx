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
          <div className="pos-cust">
            <div className={"pos-badge " + (isWholesale ? "wholesale" : "retail")}>
              {isWholesale ? "Harga Grosir" : "Harga Retail"}
            </div>
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
                {c.name} — {c.group}
              </option>
            ))}
          </select>
        </div>

        <div className="search-row">
          <span className="search-icon">⌕</span>
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
                  {p.code.replace("ITEM-", "")}
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
          <div>
            <div className="cart-title">Keranjang</div>
            <div className="cart-sub num">{cart.length} baris · {totalPcs} PCS</div>
          </div>
          {cart.length > 0 && (
            <button className="clear-btn" onClick={resetCart}>Kosongkan</button>
          )}
        </div>

        <div className="cart-list">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">🛒</div>
              <div className="cart-empty-text">Belum ada item</div>
              <div className="cart-empty-sub">Pilih produk di sebelah kiri</div>
            </div>
          ) : (
            cart.map((l) => (
              <div className="cart-line" key={`${l.product.code}-${l.uom}`}>
                <div className="cart-line-info">
                  <div className="cart-line-name">{l.product.name}</div>
                  <div className="cart-line-meta">
                    <span className="uom-chip">{l.uom}</span>
                    <span className="num">{formatRupiah(l.unitPrice)}/{l.uom}</span>
                    <span className="meta-sep">·</span>
                    <span className="num">{l.qty * l.pcsEquivalent} PCS</span>
                  </div>
                </div>
                <div className="qty-ctrl">
                  <button onClick={() => changeQty(l, -1)}>−</button>
                  <span className="num qty-val">{l.qty}</span>
                  <button onClick={() => changeQty(l, 1)}>+</button>
                </div>
                <div className="cart-line-total num">{formatRupiah(l.subtotal)}</div>
              </div>
            ))
          )}
        </div>

        <div className="cart-foot">
          <div className="total-row">
            <span className="total-label">Total</span>
            <span className="num total-value">{formatRupiah(total)}</span>
          </div>
          <div className="pay-row">
            <label className="pay-label">Tunai</label>
            <input
              className="pay-input num"
              type="number"
              min={0}
              value={paid || ""}
              placeholder="0"
              onChange={(e) => setPaid(Number(e.target.value) || 0)}
            />
          </div>
          <div className="change-row">
            <span>Kembali</span>
            <span className="num change-value">{formatRupiah(change)}</span>
          </div>
          <button className="btn-pay" onClick={pay} disabled={cart.length === 0}>
            Bayar Sekarang
          </button>
        </div>
      </div>

      {receipt && (
        <div className="receipt-overlay" onClick={() => setReceipt(null)}>
          <div className="receipt" onClick={(e) => e.stopPropagation()}>
            <div className="receipt-store">RetailERP</div>
            <div className="receipt-store-sub">Toko Utama · Jl. Merdeka No. 1</div>
            <div className="receipt-meta">Telp 021-0000</div>
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
            <div className="receipt-thanks">Terima kasih atas kunjungan Anda.</div>
            <button className="btn-receipt" onClick={() => setReceipt(null)}>
              Tutup
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .pos {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 20px;
          height: 100%;
          padding: 20px;
        }
        @media (max-width: 960px) {
          .pos { grid-template-columns: 1fr; height: auto; }
        }
        .pos-left {
          display: flex;
          flex-direction: column;
          gap: 14px;
          overflow: hidden;
        }
        .pos-right {
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: var(--shadow-sm);
        }
        .pos-topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }
        .pos-cust { display: flex; align-items: center; gap: 12px; }
        .pos-badge {
          padding: 5px 12px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.3px;
        }
        .pos-badge.retail { background: var(--accent-soft); color: var(--accent); }
        .pos-badge.wholesale { background: var(--purple-soft); color: var(--purple); }
        .pos-cust-name { font-weight: 700; font-size: 14px; }
        .pos-cust-sub { font-size: 11px; color: var(--muted); }
        .cust-select {
          background: var(--panel);
          color: var(--text);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 9px 12px;
          font-size: 13px;
          font-weight: 500;
          outline: none;
        }
        .cust-select:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
        .search-row {
          position: relative;
          display: flex;
          align-items: center;
        }
        .search-icon {
          position: absolute;
          left: 14px;
          font-size: 16px;
          color: var(--muted);
        }
        .search {
          width: 100%;
          padding: 11px 14px 11px 38px;
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          color: var(--text);
          font-size: 13px;
          outline: none;
          transition: all 0.15s;
        }
        .search:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
        .cat-row { display: flex; gap: 6px; flex-wrap: wrap; }
        .chip {
          background: var(--panel);
          border: 1px solid var(--border);
          color: var(--text-2);
          padding: 6px 14px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
          transition: all 0.15s;
        }
        .chip:hover { border-color: var(--border-strong); }
        .chip.active {
          background: var(--text);
          color: white;
          border-color: var(--text);
        }
        .product-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 12px;
          overflow-y: auto;
          padding-bottom: 8px;
        }
        .product {
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 12px;
          display: flex;
          gap: 12px;
          align-items: flex-start;
          transition: all 0.15s;
        }
        .product:hover { border-color: var(--border-strong); box-shadow: var(--shadow-md); }
        .product-swatch {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 800;
          color: white;
          flex-shrink: 0;
        }
        .product-body { flex: 1; min-width: 0; }
        .product-name {
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 2px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .product-meta { font-size: 11px; color: var(--muted); margin-bottom: 4px; }
        .product-price { font-size: 13px; font-weight: 700; color: var(--accent); }
        .product-actions { display: flex; flex-direction: column; gap: 5px; }
        .add-btn {
          background: var(--panel-2);
          border: 1px solid var(--border);
          color: var(--text);
          border-radius: 7px;
          padding: 5px 10px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.4px;
          transition: all 0.15s;
        }
        .add-btn:hover { background: var(--accent); color: white; border-color: var(--accent); }
        .cart-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 16px 18px;
          border-bottom: 1px solid var(--border);
        }
        .cart-title { font-size: 15px; font-weight: 700; }
        .cart-sub { font-size: 11px; color: var(--muted); margin-top: 2px; }
        .clear-btn {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--muted);
          font-size: 11px;
          font-weight: 600;
          padding: 5px 10px;
          border-radius: 6px;
        }
        .clear-btn:hover { color: var(--red); border-color: var(--red); }
        .cart-list {
          flex: 1;
          overflow-y: auto;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .cart-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: var(--muted);
          gap: 4px;
          padding: 40px 12px;
        }
        .cart-empty-icon { font-size: 36px; opacity: 0.4; margin-bottom: 6px; }
        .cart-empty-text { font-size: 14px; font-weight: 600; color: var(--text-2); }
        .cart-empty-sub { font-size: 12px; }
        .cart-line {
          display: grid;
          grid-template-columns: 1fr auto auto;
          gap: 10px;
          align-items: center;
          background: var(--panel-2);
          border-radius: var(--radius-sm);
          padding: 10px 12px;
        }
        .cart-line-name { font-size: 13px; font-weight: 600; }
        .cart-line-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: var(--muted);
          margin-top: 3px;
        }
        .uom-chip {
          background: var(--accent-soft);
          color: var(--accent);
          padding: 1px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 700;
        }
        .meta-sep { color: var(--border-strong); }
        .qty-ctrl {
          display: flex;
          align-items: center;
          gap: 6px;
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 7px;
          padding: 3px;
        }
        .qty-ctrl button {
          background: transparent;
          border: none;
          color: var(--text);
          width: 22px;
          height: 22px;
          border-radius: 5px;
          font-weight: 700;
          font-size: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .qty-ctrl button:hover { background: var(--panel-2); }
        .qty-ctrl .qty-val { font-size: 12px; font-weight: 700; min-width: 16px; text-align: center; }
        .cart-line-total { font-size: 13px; font-weight: 700; min-width: 90px; text-align: right; }
        .cart-foot {
          border-top: 1px solid var(--border);
          padding: 14px 18px 18px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          background: var(--panel);
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          padding-bottom: 8px;
          border-bottom: 1px solid var(--border);
        }
        .total-label { font-size: 13px; color: var(--muted); font-weight: 600; }
        .total-value { font-size: 24px; font-weight: 800; color: var(--text); }
        .pay-row { display: flex; align-items: center; gap: 10px; }
        .pay-label {
          font-size: 12px;
          color: var(--muted);
          font-weight: 600;
          min-width: 50px;
        }
        .pay-input {
          flex: 1;
          padding: 10px 14px;
          background: var(--panel-2);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          color: var(--text);
          font-size: 15px;
          font-weight: 600;
          outline: none;
        }
        .pay-input:focus { border-color: var(--accent); background: var(--panel); }
        .change-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          padding: 6px 0;
        }
        .change-row > span:first-child { font-size: 12px; color: var(--muted); font-weight: 600; }
        .change-value { font-size: 14px; font-weight: 700; color: var(--green); }
        .btn-pay {
          background: var(--green);
          color: white;
          border: none;
          padding: 13px;
          border-radius: var(--radius-sm);
          font-weight: 700;
          font-size: 14px;
          letter-spacing: 0.3px;
          margin-top: 4px;
          transition: all 0.15s;
          box-shadow: 0 4px 12px rgba(5, 150, 105, 0.25);
        }
        .btn-pay:hover:not(:disabled) { background: #047857; }
        .btn-pay:disabled { opacity: 0.4; cursor: not-allowed; box-shadow: none; }
        .receipt-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          animation: fadeIn 0.15s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .receipt {
          background: #fff;
          color: #0f172a;
          width: 340px;
          border-radius: 14px;
          padding: 24px;
          font-family: 'SF Mono', 'Monaco', 'Courier New', monospace;
          box-shadow: var(--shadow-lg);
        }
        .receipt-store { text-align: center; font-weight: 800; font-size: 16px; letter-spacing: 0.5px; }
        .receipt-store-sub { text-align: center; font-size: 11px; margin-top: 2px; }
        .receipt-meta { text-align: center; font-size: 10px; color: #64748b; }
        .receipt-cust { font-size: 12px; font-weight: 700; margin: 4px 0; }
        .receipt hr { border: none; border-top: 1px dashed #cbd5e1; margin: 10px 0; }
        .receipt-line { display: flex; justify-content: space-between; font-size: 11px; margin: 3px 0; }
        .receipt-total {
          display: flex;
          justify-content: space-between;
          font-weight: 800;
          font-size: 14px;
          margin-top: 6px;
        }
        .receipt-thanks { text-align: center; font-size: 10px; margin-top: 10px; color: #64748b; }
        .btn-receipt {
          width: 100%;
          margin-top: 14px;
          background: var(--accent);
          color: white;
          border: none;
          padding: 11px;
          border-radius: 8px;
          font-weight: 700;
          font-family: -apple-system, sans-serif;
        }
      `}</style>
    </div>
  );
}
