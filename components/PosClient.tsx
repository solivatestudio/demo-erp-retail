"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "../lib/supabase/client";
import { formatRupiah } from "../lib/utils/format";

interface Product {
  id: string;
  code: string;
  name: string;
  category_name: string | null;
  brand_name: string | null;
  stock_qty: number;
  unit_options: { unit_id: string; unit_code: string; conversion: number }[];
  retail_price: number;
  wholesale_price: number;
  unit_id_pcs: string;
  color: string;
}
interface Customer {
  id: string;
  code: string;
  name: string;
  group_id: string | null;
  group_name: string | null;
}
interface CartLine {
  product_id: string;
  product_code: string;
  product_name: string;
  unit_id: string;
  unit_code: string;
  qty: number;
  unit_price: number;
  stock_qty: number;
  subtotal: number;
}

const COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899", "#a78bfa"];

export default function PosClient({ initialWorkspaceId }: { initialWorkspaceId?: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [warehouses, setWarehouses] = useState<{ id: string; name: string }[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Semua");
  const [customerId, setCustomerId] = useState<string>("");
  const [warehouseId, setWarehouseId] = useState<string>("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [paid, setPaid] = useState<number>(0);
  const [receipt, setReceipt] = useState<{ number: string; total: number; paid: number; change: number; lines: CartLine[]; customer: string } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { window.location.href = "/"; return; }
        const { data: ms } = await supabase
          .from("workspace_members")
          .select("workspace_id")
          .eq("user_id", user.id)
          .limit(1);
        const wsId = (initialWorkspaceId || ms?.[0]?.workspace_id) as string;
        if (!wsId) { setErr("Workspace belum ada. Buka landing dulu."); setLoading(false); return; }

        // Products + units + prices
        const { data: prods } = await supabase
          .from("products")
          .select("id, code, name, category_id, brand_id, stock_unit_id, categories(name), brands(name)")
          .eq("workspace_id", wsId)
          .eq("active", true);

        const { data: pUnits } = await supabase
          .from("product_units")
          .select("product_id, unit_id, conversion_to_stock_unit, units(code)")
          .eq("workspace_id", wsId);

        const { data: pPrices } = await supabase
          .from("product_prices")
          .select("product_id, customer_group_id, unit_id, price, customer_groups(code)")
          .eq("workspace_id", wsId);

        const { data: balances } = await supabase
          .from("stock_balances")
          .select("product_id, qty")
          .eq("workspace_id", wsId);

        const groupCode = (groupId: string | null) => {
          const p = pPrices?.find((x: any) => x.customer_group_id === groupId);
          return (p?.customer_groups as any)?.code ?? null;
        };

        const productList: Product[] = (prods ?? []).map((p: any, i: number) => {
          const units = (pUnits ?? [])
            .filter((u: any) => u.product_id === p.id)
            .map((u: any) => ({ unit_id: u.unit_id, unit_code: u.units?.code ?? "?", conversion: Number(u.conversion_to_stock_unit) }));
          const stockQty = (balances ?? []).filter((b: any) => b.product_id === p.id).reduce((s: number, b: any) => s + Number(b.qty), 0);
          const retailPrice = (pPrices ?? []).find((x: any) => x.product_id === p.id && (x.customer_groups as any)?.code === "RETAIL")?.price ?? 0;
          const wholesalePrice = (pPrices ?? []).find((x: any) => x.product_id === p.id && (x.customer_groups as any)?.code === "GROSIR")?.price ?? 0;
          return {
            id: p.id, code: p.code, name: p.name,
            category_name: p.categories?.name ?? null,
            brand_name: p.brands?.name ?? null,
            stock_qty: stockQty,
            unit_options: units,
            retail_price: Number(retailPrice),
            wholesale_price: Number(wholesalePrice),
            unit_id_pcs: p.stock_unit_id,
            color: COLORS[i % COLORS.length],
          };
        });
        setProducts(productList);

        const { data: custs } = await supabase
          .from("customers")
          .select("id, code, name, customer_group_id, customer_groups(name)")
          .eq("workspace_id", wsId)
          .eq("active", true);
        setCustomers(
          (custs ?? []).map((c: any) => ({
            id: c.id, code: c.code, name: c.name,
            group_id: c.customer_group_id, group_name: c.customer_groups?.name ?? null,
          }))
        );
        const defaultCust = (custs ?? []).find((c: any) => c.code === "CUST-0003") ?? custs?.[0];
        if (defaultCust) setCustomerId(defaultCust.id);

        const { data: whs } = await supabase
          .from("warehouses")
          .select("id, name")
          .eq("workspace_id", wsId)
          .eq("active", true);
        setWarehouses((whs ?? []).map((w: any) => ({ id: w.id, name: w.name })));
        const toko = (whs ?? []).find((w: any) => w.name?.includes("Toko"));
        if (toko) setWarehouseId(toko.id);
        else if (whs?.[0]) setWarehouseId(whs[0].id);

        setLoading(false);
      } catch (e: unknown) {
        setErr(e instanceof Error ? e.message : String(e));
        setLoading(false);
      }
    };
    load();
  }, [initialWorkspaceId]);

  const customer = customers.find((c) => c.id === customerId);
  const isWholesale = customer?.group_name === "Grosir";

  const categories = useMemo(() => ["Semua", ...Array.from(new Set(products.map((p) => p.category_name).filter(Boolean) as string[]))], [products]);

  const filtered = products.filter((p) => {
    const catOk = category === "Semua" || p.category_name === category;
    const q = search.trim().toLowerCase();
    const searchOk = !q || p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q);
    return catOk && searchOk;
  });

  const priceFor = (p: Product) => isWholesale ? p.wholesale_price : p.retail_price;

  const addToCart = (p: Product, unit: { unit_id: string; unit_code: string; conversion: number }) => {
    const unitPrice = priceFor(p) * unit.conversion;
    setCart((prev) => {
      const ex = prev.find((l) => l.product_id === p.id && l.unit_id === unit.unit_id);
      if (ex) {
        return prev.map((l) => l === ex ? { ...l, qty: l.qty + 1, subtotal: (l.qty + 1) * l.unit_price } : l);
      }
      return [...prev, {
        product_id: p.id, product_code: p.code, product_name: p.name,
        unit_id: unit.unit_id, unit_code: unit.unit_code,
        qty: 1, unit_price: unitPrice, stock_qty: unit.conversion,
        subtotal: unitPrice,
      }];
    });
  };

  const changeQty = (line: CartLine, delta: number) => {
    setCart((prev) =>
      prev.map((l) => {
        if (l !== line) return l;
        const qty = Math.max(0, l.qty + delta);
        return { ...l, qty, subtotal: qty * l.unit_price };
      }).filter((l) => l.qty > 0)
    );
  };

  const total = cart.reduce((s, l) => s + l.subtotal, 0);
  const totalPcs = cart.reduce((s, l) => s + l.qty * l.stock_qty, 0);
  const change = Math.max(0, paid - total);

  const checkout = async () => {
    if (!customer || !warehouseId || cart.length === 0) return;
    setPosting(true);
    setErr(null);
    try {
      const supabase = createClient();
      const items = cart.map((l) => ({
        product_id: l.product_id,
        unit_id: l.unit_id,
        qty: l.qty,
      }));
      const { data, error } = await supabase.rpc("post_sale", {
        p_workspace: (await supabase.from("workspace_members").select("workspace_id").eq("user_id", (await supabase.auth.getUser()).data.user?.id).limit(1).single()).data?.workspace_id,
        p_sale_type: "POS",
        p_customer: customer.id,
        p_salesman: null,
        p_warehouse: warehouseId,
        p_items: items,
        p_paid: paid,
        p_notes: null,
      });
      if (error) throw error;
      setReceipt({
        number: data.number,
        total,
        paid,
        change,
        lines: cart,
        customer: customer.name,
      });
      setCart([]);
      setPaid(0);
      setPosting(false);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
      setPosting(false);
    }
  };

  if (err && loading === false && products.length === 0) {
    return <div style={{ padding: 40, textAlign: "center", color: "var(--red)" }}>{err}</div>;
  }
  if (loading) {
    return <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>Memuat POS…</div>;
  }

  return (
    <div className="pos-root">
      <div className="pos-left">
        <div className="pos-top">
          <div className="pos-cust">
            <div className={"price-badge " + (isWholesale ? "ws" : "rt")}>
              {isWholesale ? "Harga Grosir" : "Harga Retail"}
            </div>
            <div>
              <div className="cust-name">{customer?.name ?? "(pilih customer)"}</div>
              <div className="cust-sub">{customer?.code ?? ""}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <select className="cust-select" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.group_name})</option>)}
            </select>
            <select className="cust-select" value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)}>
              {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
        </div>

        <div className="search-row">
          <span className="search-icon">⌕</span>
          <input className="search" placeholder="Cari produk / scan barcode..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className="cat-row">
          {categories.map((c) => (
            <button key={c} className={"chip" + (category === c ? " active" : "")} onClick={() => setCategory(c)}>{c}</button>
          ))}
        </div>

        <div className="product-grid">
          {filtered.map((p) => {
            const up = priceFor(p);
            return (
              <div key={p.id} className="product-card">
                <div className="product-swatch" style={{ background: p.color }}>{p.code.replace("ITEM-", "")}</div>
                <div className="product-body">
                  <div className="product-name">{p.name}</div>
                  <div className="product-meta">{p.brand_name ?? "-"} · stok {Math.round(p.stock_qty)}</div>
                  <div className="product-price num">{formatRupiah(up)} / PCS</div>
                </div>
                <div className="product-actions">
                  {p.unit_options.map((u) => (
                    <button key={u.unit_id} className="add-btn" onClick={() => addToCart(p, u)} title={`${u.conversion} PCS`}>
                      +{u.unit_code}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="cart-panel">
        <div className="cart-head">
          <div>
            <div className="cart-title">Keranjang</div>
            <div className="cart-sub num">{cart.length} baris · {totalPcs} PCS</div>
          </div>
          {cart.length > 0 && <button className="clear-btn" onClick={() => setCart([])}>Kosongkan</button>}
        </div>

        <div className="cart-list">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">🛒</div>
              <div className="cart-empty-title">Belum ada item</div>
              <div className="cart-empty-sub">Pilih produk di sebelah kiri</div>
            </div>
          ) : cart.map((l) => (
            <div key={`${l.product_id}-${l.unit_id}`} className="cart-line">
              <div>
                <div className="cart-line-name">{l.product_name}</div>
                <div className="cart-line-meta">
                  <span className="uom-chip">{l.unit_code}</span>
                  <span className="num">{formatRupiah(l.unit_price)}/{l.unit_code}</span>
                  <span className="meta-sep">·</span>
                  <span className="num">{l.qty * l.stock_qty} PCS</span>
                </div>
              </div>
              <div className="qty-ctrl">
                <button onClick={() => changeQty(l, -1)}>−</button>
                <span className="qty-val num">{l.qty}</span>
                <button onClick={() => changeQty(l, 1)}>+</button>
              </div>
              <div className="cart-line-total num">{formatRupiah(l.subtotal)}</div>
            </div>
          ))}
        </div>

        <div className="cart-foot">
          <div className="total-row">
            <span className="total-label">Total</span>
            <span className="total-value num">{formatRupiah(total)}</span>
          </div>
          <div className="pay-row">
            <label className="pay-label">Tunai</label>
            <input className="pay-input num" type="number" min={0} value={paid || ""} placeholder="0" onChange={(e) => setPaid(Number(e.target.value) || 0)} />
          </div>
          <div className="change-row">
            <span>Kembali</span>
            <span className="change-value num">{formatRupiah(change)}</span>
          </div>
          {err && <div className="cart-err">{err}</div>}
          <button className="btn-pay" disabled={cart.length === 0 || posting} onClick={checkout}>
            {posting ? "Posting..." : "Bayar Sekarang"}
          </button>
        </div>
      </div>

      {receipt && (
        <div className="receipt-overlay" onClick={() => setReceipt(null)}>
          <div className="receipt" onClick={(e) => e.stopPropagation()}>
            <div className="receipt-store">RetailERP</div>
            <div className="receipt-store-sub">Berkah Plastik &amp; Packaging</div>
            <div className="receipt-num">{receipt.number}</div>
            <hr />
            <div className="receipt-cust">Customer: {receipt.customer}</div>
            <hr />
            {receipt.lines.map((l, i) => (
              <div key={i} className="receipt-line">
                <span>{l.product_name} ×{l.qty} {l.unit_code}</span>
                <span className="num">{formatRupiah(l.subtotal)}</span>
              </div>
            ))}
            <hr />
            <div className="receipt-total">
              <span>Total</span>
              <span className="num">{formatRupiah(receipt.total)}</span>
            </div>
            <div className="receipt-line">
              <span>Tunai</span>
              <span className="num">{formatRupiah(receipt.paid)}</span>
            </div>
            <div className="receipt-line">
              <span>Kembali</span>
              <span className="num">{formatRupiah(receipt.change)}</span>
            </div>
            <div className="receipt-thanks">Terima kasih atas kunjungan Anda.</div>
            <button className="btn-receipt" onClick={() => setReceipt(null)}>Tutup</button>
          </div>
        </div>
      )}

      <style jsx>{`
        .pos-root { display: grid; grid-template-columns: 1fr 400px; gap: 20px; height: 100%; padding: 20px; }
        @media (max-width: 960px) { .pos-root { grid-template-columns: 1fr; height: auto; } }
        .pos-left { display: flex; flex-direction: column; gap: 14px; overflow: hidden; }
        .pos-top { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
        .pos-cust { display: flex; align-items: center; gap: 12px; }
        .price-badge { padding: 5px 12px; border-radius: 999px; font-size: 11px; font-weight: 700; }
        .price-badge.rt { background: var(--accent-soft); color: var(--accent); }
        .price-badge.ws { background: var(--purple-soft); color: var(--purple); }
        .cust-name { font-weight: 700; font-size: 14px; }
        .cust-sub { font-size: 11px; color: var(--muted); }
        .cust-select { background: var(--panel); color: var(--text); border: 1px solid var(--border); border-radius: 8px; padding: 9px 12px; font-size: 13px; font-weight: 500; outline: none; }
        .search-row { position: relative; display: flex; align-items: center; }
        .search-icon { position: absolute; left: 14px; font-size: 16px; color: var(--muted); }
        .search { width: 100%; padding: 11px 14px 11px 38px; background: var(--panel); border: 1px solid var(--border); border-radius: 8px; color: var(--text); font-size: 13px; outline: none; }
        .cat-row { display: flex; gap: 6px; flex-wrap: wrap; }
        .chip { background: var(--panel); border: 1px solid var(--border); color: var(--text-2); padding: 6px 14px; border-radius: 999px; font-size: 12px; font-weight: 600; cursor: pointer; }
        .chip.active { background: var(--text); color: white; border-color: var(--text); }
        .product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px; overflow-y: auto; padding-bottom: 8px; }
        .product-card { background: var(--panel); border: 1px solid var(--border); border-radius: 12px; padding: 12px; display: flex; gap: 12px; align-items: flex-start; }
        .product-card:hover { border-color: var(--border-strong); box-shadow: var(--shadow-md); }
        .product-swatch { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; color: white; flex-shrink: 0; }
        .product-body { flex: 1; min-width: 0; }
        .product-name { font-size: 13px; font-weight: 600; margin-bottom: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .product-meta { font-size: 11px; color: var(--muted); margin-bottom: 4px; }
        .product-price { font-size: 13px; font-weight: 700; color: var(--accent); }
        .product-actions { display: flex; flex-direction: column; gap: 5px; }
        .add-btn { background: var(--panel-2); border: 1px solid var(--border); color: var(--text); border-radius: 7px; padding: 5px 10px; font-size: 10px; font-weight: 700; cursor: pointer; }
        .add-btn:hover { background: var(--accent); color: white; border-color: var(--accent); }
        .cart-panel { background: var(--panel); border: 1px solid var(--border); border-radius: 12px; display: flex; flex-direction: column; overflow: hidden; box-shadow: var(--shadow-sm); }
        .cart-head { display: flex; justify-content: space-between; align-items: flex-start; padding: 16px 18px; border-bottom: 1px solid var(--border); }
        .cart-title { font-size: 15px; font-weight: 700; }
        .cart-sub { font-size: 11px; color: var(--muted); margin-top: 2px; }
        .clear-btn { background: transparent; border: 1px solid var(--border); color: var(--muted); font-size: 11px; font-weight: 600; padding: 5px 10px; border-radius: 6px; cursor: pointer; }
        .cart-list { flex: 1; overflow-y: auto; padding: 12px; display: flex; flex-direction: column; gap: 8px; }
        .cart-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: var(--muted); gap: 4px; padding: 40px 12px; }
        .cart-empty-icon { font-size: 36px; opacity: 0.4; margin-bottom: 6px; }
        .cart-empty-title { font-size: 14px; font-weight: 600; color: var(--text-2); }
        .cart-empty-sub { font-size: 12px; }
        .cart-line { display: grid; grid-template-columns: 1fr auto auto; gap: 10px; align-items: center; background: var(--panel-2); border-radius: 8px; padding: 10px 12px; }
        .cart-line-name { font-size: 13px; font-weight: 600; }
        .cart-line-meta { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--muted); margin-top: 3px; }
        .uom-chip { background: var(--accent-soft); color: var(--accent); padding: 1px 6px; border-radius: 4px; font-size: 10px; font-weight: 700; }
        .meta-sep { color: var(--border-strong); }
        .qty-ctrl { display: flex; align-items: center; gap: 6px; background: var(--panel); border: 1px solid var(--border); border-radius: 7px; padding: 3px; }
        .qty-ctrl button { background: transparent; border: none; color: var(--text); width: 22px; height: 22px; border-radius: 5px; font-weight: 700; cursor: pointer; }
        .qty-val { font-size: 12px; font-weight: 700; min-width: 16px; text-align: center; }
        .cart-line-total { font-size: 13px; font-weight: 700; min-width: 90px; text-align: right; }
        .cart-foot { border-top: 1px solid var(--border); padding: 14px 18px 18px; display: flex; flex-direction: column; gap: 10px; background: var(--panel); }
        .total-row { display: flex; justify-content: space-between; align-items: baseline; padding-bottom: 8px; border-bottom: 1px solid var(--border); }
        .total-label { font-size: 13px; color: var(--muted); font-weight: 600; }
        .total-value { font-size: 24px; font-weight: 800; color: var(--text); }
        .pay-row { display: flex; align-items: center; gap: 10px; }
        .pay-label { font-size: 12px; color: var(--muted); font-weight: 600; min-width: 50px; }
        .pay-input { flex: 1; padding: 10px 14px; background: var(--panel-2); border: 1px solid var(--border); border-radius: 8px; color: var(--text); font-size: 15px; font-weight: 600; outline: none; }
        .change-row { display: flex; justify-content: space-between; align-items: baseline; padding: 6px 0; }
        .change-row > span:first-child { font-size: 12px; color: var(--muted); font-weight: 600; }
        .change-value { font-size: 14px; font-weight: 700; color: var(--green); }
        .cart-err { background: var(--red-soft); color: var(--red); padding: 8px 10px; border-radius: 6px; font-size: 12px; }
        .btn-pay { background: var(--green); color: white; border: none; padding: 13px; border-radius: 8px; font-weight: 700; font-size: 14px; cursor: pointer; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.25); }
        .btn-pay:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; }
        .receipt-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.5); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 100; }
        .receipt { background: #fff; color: #0f172a; width: 340px; border-radius: 14px; padding: 24px; font-family: 'SF Mono', 'Monaco', 'Courier New', monospace; box-shadow: var(--shadow-lg); }
        .receipt-store { text-align: center; font-weight: 800; font-size: 16px; }
        .receipt-store-sub { text-align: center; font-size: 11px; margin-top: 2px; }
        .receipt-num { text-align: center; font-size: 12px; font-weight: 700; margin-top: 4px; color: #475569; }
        .receipt-cust { font-size: 12px; font-weight: 700; margin: 4px 0; }
        .receipt hr { border: none; border-top: 1px dashed #cbd5e1; margin: 10px 0; }
        .receipt-line { display: flex; justify-content: space-between; font-size: 11px; margin: 3px 0; }
        .receipt-total { display: flex; justify-content: space-between; font-weight: 800; font-size: 14px; margin-top: 6px; }
        .receipt-thanks { text-align: center; font-size: 10px; margin-top: 10px; color: #64748b; }
        .btn-receipt { width: 100%; margin-top: 14px; background: var(--accent); color: white; border: none; padding: 11px; border-radius: 8px; font-weight: 700; cursor: pointer; }
      `}</style>
    </div>
  );
}