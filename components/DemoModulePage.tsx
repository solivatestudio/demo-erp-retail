"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "../lib/supabase/client";
import { formatDateID, formatNumber, formatRupiah } from "../lib/utils/format";

type Row = Record<string, any>;
export type DemoKind =
  | "customers" | "suppliers" | "salesPeople" | "products" | "categories" | "brands" | "units" | "prices" | "warehouses"
  | "stock" | "stockCard" | "purchases" | "purchaseReturns" | "payables" | "sales" | "delivery" | "salesReturns"
  | "receivables" | "stockTransfers" | "stockIssues" | "repack" | "adjustments" | "cashIn" | "cashOut" | "reports" | "settings";

type RefData = {
  workspaceId: string;
  products: Row[];
  units: Row[];
  warehouses: Row[];
  suppliers: Row[];
  customers: Row[];
  salesPeople: Row[];
  purchases: Row[];
  sales: Row[];
  saleItems: Row[];
};

const MASTER: Partial<Record<DemoKind, { table: string; select: string; make: (r: RefData) => Row }>> = {
  customers: { table: "customers", select: "code,name,phone,city,credit_limit,active,customer_groups(name)", make: (r) => ({ workspace_id: r.workspaceId, code: "CUST-" + Date.now().toString().slice(-4), name: "Customer Demo Baru", phone: "0812-DEMO", city: "Jakarta", customer_group_id: r.customers[0]?.customer_group_id, credit_limit: 5000000, active: true }) },
  suppliers: { table: "suppliers", select: "code,name,phone,city,payment_term_days,active", make: (r) => ({ workspace_id: r.workspaceId, code: "SUP-" + Date.now().toString().slice(-4), name: "Supplier Demo Baru", phone: "021-DEMO", city: "Jakarta", payment_term_days: 30, active: true }) },
  salesPeople: { table: "sales_people", select: "code,name,phone,active", make: (r) => ({ workspace_id: r.workspaceId, code: "SP-" + Date.now().toString().slice(-4), name: "Sales Demo Baru", phone: "0813-DEMO", active: true }) },
  categories: { table: "categories", select: "name,created_at", make: (r) => ({ workspace_id: r.workspaceId, name: "Kategori Demo " + Date.now().toString().slice(-3) }) },
  brands: { table: "brands", select: "name,created_at", make: (r) => ({ workspace_id: r.workspaceId, name: "Brand Demo " + Date.now().toString().slice(-3) }) },
  units: { table: "units", select: "code,name", make: (r) => ({ workspace_id: r.workspaceId, code: "U" + Date.now().toString().slice(-3), name: "Unit Demo" }) },
  warehouses: { table: "warehouses", select: "code,name,location,active", make: (r) => ({ workspace_id: r.workspaceId, code: "WH-" + Date.now().toString().slice(-3), name: "Gudang Demo Baru", location: "Area Demo", active: true }) },
};

function text(v: any): string {
  if (v == null) return "-";
  if (typeof v === "boolean") return v ? "Aktif" : "Nonaktif";
  if (typeof v === "object") return v.name || v.code || v.number || "-";
  const s = String(v);
  return /^\d{4}-\d{2}-\d{2}/.test(s) ? formatDateID(s) : s;
}

function moneyColumn(name: string) {
  return /amount|total|price|cost|value|limit|outstanding|paid/.test(name);
}

export default function DemoModulePage({ kind, title, description }: { kind: DemoKind; title: string; description: string }) {
  const supabase = useMemo(() => createClient(), []);
  const [ref, setRef] = useState<RefData | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = "/"; return; }
    const ws = await supabase.from("workspace_members").select("workspace_id").eq("user_id", user.id).limit(1);
    if (ws.error) throw ws.error;
    const workspaceId = ws.data?.[0]?.workspace_id;
    if (!workspaceId) throw new Error("Workspace demo belum dibuat. Klik Coba Demo dari landing page.");

    const [products, units, warehouses, suppliers, customers, salesPeople, purchases, sales, saleItems] = await Promise.all([
      supabase.from("products").select("id,code,name,current_avg_cost,active,categories(name),brands(name),stock_unit_id").eq("workspace_id", workspaceId).order("code"),
      supabase.from("units").select("id,code,name").eq("workspace_id", workspaceId).order("code"),
      supabase.from("warehouses").select("id,code,name,location,active").eq("workspace_id", workspaceId).order("code"),
      supabase.from("suppliers").select("id,code,name,phone,city,payment_term_days,active").eq("workspace_id", workspaceId).order("code"),
      supabase.from("customers").select("id,code,name,phone,city,customer_group_id,credit_limit,active,customer_groups(name)").eq("workspace_id", workspaceId).order("code"),
      supabase.from("sales_people").select("id,code,name,phone,active").eq("workspace_id", workspaceId).order("code"),
      supabase.from("purchases").select("id,supplier_id,number,purchase_date,total,paid_amount,outstanding_amount,status,suppliers(name),warehouses(name)").eq("workspace_id", workspaceId).order("created_at", { ascending: false }).limit(50),
      supabase.from("sales").select("id,customer_id,number,sale_type,sale_date,total,paid_amount,outstanding_amount,payment_status,fulfillment_status,status,customers(name),warehouses(name)").eq("workspace_id", workspaceId).order("created_at", { ascending: false }).limit(50),
      supabase.from("sale_items").select("id,sale_id,product_id,unit_id,qty,stock_qty,delivered_qty,unit_price,products(name)").limit(200),
    ]);
    for (const res of [products, units, warehouses, suppliers, customers, salesPeople, purchases, sales, saleItems]) if (res.error) throw res.error;
    const nextRef: RefData = { workspaceId, products: products.data ?? [], units: units.data ?? [], warehouses: warehouses.data ?? [], suppliers: suppliers.data ?? [], customers: customers.data ?? [], salesPeople: salesPeople.data ?? [], purchases: purchases.data ?? [], sales: sales.data ?? [], saleItems: saleItems.data ?? [] };
    setRef(nextRef);

    if (kind in MASTER) {
      const cfg = MASTER[kind]!;
      const data = await supabase.from(cfg.table).select(cfg.select).eq("workspace_id", workspaceId).limit(100);
      if (data.error) throw data.error;
      setRows(data.data ?? []);
    } else if (kind === "products") {
      const data = await supabase.from("products").select("code,name,barcode,current_avg_cost,active,categories(name),brands(name)").eq("workspace_id", workspaceId).order("code");
      if (data.error) throw data.error;
      setRows(data.data ?? []);
    } else if (kind === "prices") {
      const data = await supabase.from("product_prices").select("products(code,name),customer_groups(name),units(code),min_qty,price").eq("workspace_id", workspaceId).limit(120);
      if (data.error) throw data.error;
      setRows(data.data ?? []);
    } else if (kind === "stock") {
      const data = await supabase.from("stock_balances").select("qty,avg_cost,stock_value,products(code,name),warehouses(name)").eq("workspace_id", workspaceId).order("qty", { ascending: true }).limit(150);
      if (data.error) throw data.error;
      setRows(data.data ?? []);
    } else if (kind === "stockCard") {
      const data = await supabase.from("inventory_movements").select("posted_at,movement_type,qty_delta_stock_unit,unit_cost,value_delta,balance_after,avg_cost_after,note,products(code,name),warehouses(name)").eq("workspace_id", workspaceId).order("posted_at", { ascending: false }).limit(150);
      if (data.error) throw data.error;
      setRows(data.data ?? []);
    } else if (["purchases", "payables"].includes(kind)) setRows(nextRef.purchases);
    else if (["sales", "receivables", "delivery"].includes(kind)) setRows(nextRef.sales);
    else if (kind === "purchaseReturns") await loadTable("purchase_returns", "number,return_date,total,notes,suppliers(name),purchases(number)", workspaceId);
    else if (kind === "salesReturns") await loadTable("sales_returns", "number,return_date,total,notes,customers(name),sales(number)", workspaceId);
    else if (kind === "stockTransfers") await loadTable("stock_transfers", "number,transfer_date,notes,from_warehouse:warehouses!stock_transfers_from_warehouse_id_fkey(name),to_warehouse:warehouses!stock_transfers_to_warehouse_id_fkey(name)", workspaceId);
    else if (kind === "stockIssues") await loadTable("stock_issues", "number,issue_date,reason,notes,warehouses(name)", workspaceId);
    else if (kind === "repack") await loadTable("repacks", "number,repack_date,notes", workspaceId);
    else if (kind === "adjustments") await loadTable("stock_adjustments", "number,adjustment_date,reason,notes,warehouses(name)", workspaceId);
    else if (kind === "cashIn" || kind === "cashOut") {
      const data = await supabase.from("cash_transactions").select("number,transaction_date,type,category,amount,payment_method,note").eq("workspace_id", workspaceId).eq("type", kind === "cashIn" ? "IN" : "OUT").order("created_at", { ascending: false });
      if (data.error) throw data.error;
      setRows(data.data ?? []);
    } else setRows([]);
    setLoading(false);
  };

  const loadTable = async (table: string, select: string, workspaceId: string) => {
    const data = await supabase.from(table).select(select).eq("workspace_id", workspaceId).order("created_at", { ascending: false });
    if (data.error) throw data.error;
    setRows(data.data ?? []);
  };

  useEffect(() => { load().catch((e) => { setError(e.message); setLoading(false); }); }, [kind]);

  const run = async (label: string, fn: (r: RefData) => Promise<void>) => {
    if (!ref) return;
    setBusy(true); setNotice(null); setError(null);
    try { await fn(ref); await load(); setNotice(label + " berhasil."); }
    catch (e: any) { setError(e.message ?? String(e)); }
    finally { setBusy(false); }
  };

  const sampleItems = (r: RefData, count = 2) => {
    const pcs = r.units.find((u) => u.code === "PCS") ?? r.units[0];
    return r.products.slice(0, count).map((p, i) => ({ product_id: p.id, unit_id: pcs.id, qty: i + 2, conversion_factor: 1, unit_price: Number(p.current_avg_cost || 1000) * 1.1 }));
  };

  const rpc = (name: string, label: string, params: (r: RefData) => Row) => run(label, async (r) => {
    const { error } = await supabase.rpc(name, params(r));
    if (error) throw error;
  });

  const addMaster = () => run("Tambah data", async (r) => {
    const cfg = MASTER[kind];
    if (!cfg) throw new Error("Tambah cepat belum tersedia untuk modul ini.");
    const { error } = await supabase.from(cfg.table).insert(cfg.make(r));
    if (error) throw error;
  });

  const purchase = () => rpc("post_purchase", "Pembelian", (r) => ({ p_workspace: r.workspaceId, p_supplier: r.suppliers[0]?.id, p_invoice_number: "INV-DEMO-" + Date.now().toString().slice(-5), p_purchase_date: new Date().toISOString().slice(0, 10), p_due_date: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10), p_warehouse: r.warehouses[0]?.id, p_items: sampleItems(r), p_notes: "Demo pembelian dari UI" }));
  const sale = (type: "DIRECT" | "DELIVERY") => rpc("post_sale", type === "DIRECT" ? "Penjualan langsung" : "Order delivery", (r) => ({ p_workspace: r.workspaceId, p_sale_type: type, p_customer: r.customers[0]?.id, p_salesman: r.salesPeople[0]?.id ?? null, p_warehouse: r.warehouses[0]?.id, p_items: sampleItems(r).map(({ product_id, unit_id, qty }) => ({ product_id, unit_id, qty })), p_paid: type === "DIRECT" ? 100000 : 0, p_notes: "Demo transaksi dari UI" }));

  const customerPayment = () => run("Pembayaran piutang", async (r) => {
    const s = r.sales.find((x) => Number(x.outstanding_amount) > 0);
    if (!s) throw new Error("Tidak ada piutang aktif.");
    const { error } = await supabase.rpc("record_customer_payment", { p_workspace: r.workspaceId, p_customer: s.customer_id, p_sale: s.id, p_amount: Math.min(50000, Number(s.outstanding_amount)), p_payment_method: "CASH", p_note: "Demo angsuran customer" });
    if (error) throw error;
  });

  const supplierPayment = () => run("Pembayaran hutang", async (r) => {
    const p = r.purchases.find((x) => Number(x.outstanding_amount) > 0);
    if (!p) throw new Error("Tidak ada hutang aktif.");
    const { error } = await supabase.rpc("record_supplier_payment", { p_workspace: r.workspaceId, p_supplier: p.supplier_id, p_purchase: p.id, p_amount: Math.min(50000, Number(p.outstanding_amount)), p_payment_method: "CASH", p_note: "Demo angsuran supplier" });
    if (error) throw error;
  });

  const delivery = () => run("Delivery", async (r) => {
    const s = r.sales.find((x) => x.sale_type === "DELIVERY" && x.fulfillment_status !== "FULL");
    if (!s) throw new Error("Tidak ada order delivery pending. Buat delivery sale dulu.");
    const items = r.saleItems.filter((i) => i.sale_id === s.id && Number(i.delivered_qty || 0) < Number(i.qty)).slice(0, 2).map((i) => ({ sale_item_id: i.id, qty: 1 }));
    if (!items.length) throw new Error("Item pending tidak ditemukan.");
    const { error } = await supabase.rpc("post_delivery", { p_workspace: r.workspaceId, p_sale: s.id, p_items: items });
    if (error) throw error;
  });

  const cash = (type: "IN" | "OUT") => rpc("create_cash_transaction", type === "IN" ? "Kas masuk" : "Kas keluar", (r) => ({ p_workspace: r.workspaceId, p_type: type, p_category: type === "IN" ? "Setoran Modal Demo" : "Biaya Operasional Demo", p_amount: type === "IN" ? 250000 : 125000, p_payment_method: "CASH", p_note: "Input demo manual" }));

  const reset = () => run("Reset data demo", async (r) => {
    if (!window.confirm("Reset data demo ke kondisi seed awal?")) return;
    const { error } = await supabase.rpc("reset_demo_workspace", { p_workspace: r.workspaceId });
    if (error) throw error;
  });

  const filtered = rows.filter((row) => JSON.stringify(row).toLowerCase().includes(query.toLowerCase()));
  const columns = Array.from(new Set(filtered.flatMap((r) => Object.keys(r)))).slice(0, 8);
  const totals = {
    sales: ref?.sales.reduce((s, x) => s + Number(x.total || 0), 0) ?? 0,
    ar: ref?.sales.reduce((s, x) => s + Number(x.outstanding_amount || 0), 0) ?? 0,
    ap: ref?.purchases.reduce((s, x) => s + Number(x.outstanding_amount || 0), 0) ?? 0,
    products: ref?.products.length ?? 0,
  };

  const exportCsv = () => {
    const header = columns.join(",");
    const body = filtered.map((r) => columns.map((c) => '"' + text(r[c]).replace(/"/g, '""') + '"').join(",")).join("\n");
    const blob = new Blob([header + "\n" + body], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = kind + ".csv"; a.click(); URL.revokeObjectURL(url);
  };

  const actions = <div className="actions">
    {kind in MASTER && <button onClick={addMaster} disabled={busy}>Tambah Demo</button>}
    {kind === "purchases" && <button onClick={purchase} disabled={busy}>Post Pembelian</button>}
    {kind === "purchaseReturns" && <button onClick={() => rpc("post_purchase_return", "Retur pembelian", (r) => ({ p_workspace: r.workspaceId, p_purchase: r.purchases[0]?.id, p_items: sampleItems(r, 1).map((i) => ({ product_id: i.product_id, unit_id: i.unit_id, qty: 1 })) }))} disabled={busy}>Post Retur</button>}
    {kind === "payables" && <button onClick={supplierPayment} disabled={busy}>Bayar Hutang</button>}
    {kind === "sales" && <><button onClick={() => sale("DIRECT")} disabled={busy}>Post Direct Sale</button><button onClick={() => sale("DELIVERY")} disabled={busy}>Buat Delivery Sale</button></>}
    {kind === "delivery" && <button onClick={delivery} disabled={busy}>Kirim Pending</button>}
    {kind === "salesReturns" && <button onClick={() => rpc("post_sales_return", "Retur penjualan", (r) => ({ p_workspace: r.workspaceId, p_sale: r.sales[0]?.id, p_items: r.saleItems.slice(0, 1).map((i) => ({ sale_item_id: i.id, qty: 1 })) }))} disabled={busy}>Post Retur</button>}
    {kind === "receivables" && <button onClick={customerPayment} disabled={busy}>Bayar Piutang</button>}
    {kind === "stockTransfers" && <button onClick={() => rpc("post_stock_transfer", "Transfer stok", (r) => ({ p_workspace: r.workspaceId, p_from_warehouse: r.warehouses[0]?.id, p_to_warehouse: r.warehouses[1]?.id, p_items: [{ product_id: r.products[0]?.id, qty: 3 }] }))} disabled={busy}>Transfer 3 PCS</button>}
    {kind === "stockIssues" && <button onClick={() => rpc("post_stock_issue", "Pengeluaran barang", (r) => ({ p_workspace: r.workspaceId, p_warehouse: r.warehouses[0]?.id, p_reason: "SAMPLE", p_items: [{ product_id: r.products[0]?.id, qty: 1 }] }))} disabled={busy}>Issue Sample</button>}
    {kind === "repack" && <button onClick={() => rpc("post_repack", "Repack", (r) => ({ p_workspace: r.workspaceId, p_warehouse: r.warehouses[0]?.id, p_inputs: [{ product_id: r.products[0]?.id, qty: 2 }], p_outputs: [{ product_id: r.products[1]?.id, qty: 1, allocation_percent: 100 }], p_notes: "Demo repack" }))} disabled={busy}>Post Repack</button>}
    {kind === "adjustments" && <button onClick={() => rpc("post_stock_adjustment", "Koreksi stok", (r) => ({ p_workspace: r.workspaceId, p_warehouse: r.warehouses[0]?.id, p_reason: "Stock opname demo", p_items: [{ product_id: r.products[0]?.id, system_qty: 0, physical_qty: 10 }] }))} disabled={busy}>Koreksi Stok</button>}
    {kind === "cashIn" && <button onClick={() => cash("IN")} disabled={busy}>Tambah Kas Masuk</button>}
    {kind === "cashOut" && <button onClick={() => cash("OUT")} disabled={busy}>Tambah Kas Keluar</button>}
    {kind === "settings" && <button className="danger" onClick={reset} disabled={busy}>Reset Data Demo</button>}
    {filtered.length > 0 && <button onClick={exportCsv} disabled={busy}>Export CSV</button>}
  </div>;

  if (loading) return <div className="module"><div className="empty">Memuat data...</div><style jsx>{`.module{padding:24px}.empty{color:var(--muted)}`}</style></div>;

  return <div className="module">
    <div className="head"><div><h1>{title}</h1><p>{description}</p></div>{actions}</div>
    {(notice || error) && <div className={error ? "notice error" : "notice"}>{error || notice}</div>}
    {kind === "reports" || kind === "settings" ? <div className="report-grid">
      <div className="metric"><span>Omset total demo</span><strong>{formatRupiah(totals.sales)}</strong></div>
      <div className="metric"><span>Piutang aktif</span><strong>{formatRupiah(totals.ar)}</strong></div>
      <div className="metric"><span>Hutang supplier</span><strong>{formatRupiah(totals.ap)}</strong></div>
      <div className="metric"><span>SKU aktif</span><strong>{formatNumber(totals.products)}</strong></div>
      <div className="panel wide"><h2>Laporan tersedia</h2><div className="report-list">{["Stock Summary","Kartu Stok","Koreksi Stok","Pembelian","Retur Pembelian","Angsuran Supplier","Penjualan","Retur Penjualan","Omset Per Nota","Penjualan Kasir","Laba Per Nota","Angsuran Customer","Pengeluaran Barang","Barang Tidak Terkirim"].map((x) => <span key={x}>{x}</span>)}</div></div>
      <div className="panel wide"><h2>Quick links</h2><div className="links"><Link href="/pos">POS</Link><Link href="/purchases">Pembelian</Link><Link href="/delivery">Delivery</Link><Link href="/inventory/repack">Repack</Link><Link href="/reports">Laporan</Link></div></div>
    </div> : <>
      <div className="toolbar"><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari data..." /><span>{filtered.length} baris</span></div>
      <div className="table-wrap"><table><thead><tr>{columns.map((c) => <th key={c}>{c.replaceAll("_", " ")}</th>)}</tr></thead><tbody>{filtered.map((row, i) => <tr key={i}>{columns.map((c) => <td key={c}>{typeof row[c] === "number" && moneyColumn(c) ? formatRupiah(row[c]) : text(row[c])}</td>)}</tr>)}</tbody></table></div>
    </>}
    <style jsx>{`
      .module{padding:24px;max-width:1280px;margin:0 auto}.head{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;margin-bottom:16px}h1{margin:0;font-size:22px}p{margin:6px 0 0;color:var(--muted);font-size:13px;line-height:1.5}.actions{display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-end}button,.links a{border:1px solid var(--border);background:var(--panel);color:var(--text);border-radius:8px;padding:9px 12px;font-size:12px;font-weight:700;text-decoration:none}button:hover,.links a:hover{background:var(--panel-2)}button:disabled{opacity:.55;cursor:not-allowed}.danger{background:var(--red-soft);color:var(--red);border-color:rgba(220,38,38,.2)}.notice{background:var(--green-soft);color:var(--green);border:1px solid rgba(5,150,105,.18);padding:10px 12px;border-radius:8px;margin-bottom:14px;font-size:13px;font-weight:700}.notice.error{background:var(--red-soft);color:var(--red);border-color:rgba(220,38,38,.18)}.toolbar{display:flex;justify-content:space-between;align-items:center;gap:12px;margin:12px 0}.toolbar input{width:320px;max-width:100%;border:1px solid var(--border);border-radius:8px;background:var(--panel);padding:10px 12px;color:var(--text)}.toolbar span{color:var(--muted);font-size:12px;font-weight:700}.table-wrap{background:var(--panel);border:1px solid var(--border);border-radius:12px;overflow:auto;box-shadow:var(--shadow-sm)}table{width:100%;border-collapse:collapse;font-size:13px}th{background:var(--panel-2);color:var(--muted);font-size:11px;text-align:left;text-transform:uppercase;letter-spacing:.4px;padding:11px 12px;white-space:nowrap}td{padding:11px 12px;border-top:1px solid var(--border);white-space:nowrap}tr:hover td{background:#fafcff}.report-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}.metric,.panel{background:var(--panel);border:1px solid var(--border);border-radius:12px;padding:16px;box-shadow:var(--shadow-sm)}.metric span{display:block;color:var(--muted);font-size:12px;font-weight:700;margin-bottom:8px}.metric strong{font-size:20px}.wide{grid-column:span 4}.panel h2{margin:0 0 12px;font-size:14px}.report-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:8px}.report-list span{background:var(--panel-2);border:1px solid var(--border);border-radius:8px;padding:10px;font-size:12px;font-weight:700;color:var(--text-2)}.links{display:flex;flex-wrap:wrap;gap:8px}@media(max-width:900px){.head{display:block}.actions{justify-content:flex-start;margin-top:12px}.report-grid{grid-template-columns:1fr}.wide{grid-column:auto}.module{padding:16px}}
    `}</style>
  </div>;
}
