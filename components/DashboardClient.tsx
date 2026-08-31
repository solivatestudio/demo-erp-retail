"use client";

import { useEffect, useState } from "react";
import { createClient } from "../lib/supabase/client";
import { formatRupiah, formatNumber } from "../lib/utils/format";

interface Kpi {
  label: string;
  value: number;
  isCurrency: boolean;
  delta: string;
  up: boolean;
}

export default function DashboardClient() {
  const [kpis, setKpis] = useState<Kpi[]>([]);
  const [sales7d, setSales7d] = useState<{ day: string; value: number }[]>([]);
  const [topProducts, setTopProducts] = useState<{ name: string; qty: number; color: string }[]>([]);
  const [lowStock, setLowStock] = useState<{ code: string; name: string; qty: number; uom: string }[]>([]);
  const [arList, setArList] = useState<{ id: string; name: string; group: string; outstanding: number; initial: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

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
        const wsId = ms?.[0]?.workspace_id;
        if (!wsId) { setErr("Workspace belum ada. Klik Coba Demo dulu."); setLoading(false); return; }

        const today = new Date().toISOString().slice(0, 10);
        const weekAgo = new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10);

        // KPI: today's sales, transactions, gross profit, today's purchases, AR, AP
        const [
          salesToday, txToday, profitToday, purchToday, arAgg, apAgg, stockVal,
        ] = await Promise.all([
          supabase.from("sales").select("total").eq("workspace_id", wsId).gte("sale_date", today).eq("status", "POSTED"),
          supabase.from("sales").select("id", { count: "exact", head: true }).eq("workspace_id", wsId).gte("sale_date", today).eq("status", "POSTED"),
          supabase.rpc("sum_gross_profit", { p_workspace: wsId, p_from: today, p_to: today }).then((r) => r.data ?? 0),
          supabase.from("purchases").select("total").eq("workspace_id", wsId).eq("purchase_date", today).neq("status", "CANCELLED"),
          supabase.from("sales").select("outstanding_amount").eq("workspace_id", wsId).neq("payment_status", "PAID").eq("status", "POSTED"),
          supabase.from("purchases").select("outstanding_amount").eq("workspace_id", wsId).neq("status", "PAID").neq("status", "CANCELLED"),
          supabase.from("stock_balances").select("stock_value").eq("workspace_id", wsId),
        ]);

        const sumToday = (salesToday.data ?? []).reduce((s, r) => s + Number(r.total), 0);
        const profit = Number(profitToday);
        const purch = (purchToday.data ?? []).reduce((s, r) => s + Number(r.total), 0);
        const ar = (arAgg.data ?? []).reduce((s, r) => s + Number(r.outstanding_amount), 0);
        const ap = (apAgg.data ?? []).reduce((s, r) => s + Number(r.outstanding_amount), 0);
        const sv = (stockVal.data ?? []).reduce((s, r) => s + Number(r.stock_value), 0);

        setKpis([
          { label: "Penjualan Hari Ini", value: sumToday, isCurrency: true, delta: "+0%", up: true },
          { label: "Transaksi Hari Ini", value: txToday.count ?? 0, isCurrency: false, delta: "+0%", up: true },
          { label: "Laba Kotor Hari Ini", value: profit, isCurrency: true, delta: "+0%", up: true },
          { label: "Pembelian Hari Ini", value: purch, isCurrency: true, delta: "+0%", up: false },
          { label: "Piutang (AR)", value: ar, isCurrency: true, delta: "0 pelanggan", up: false },
          { label: "Hutang (AP)", value: ap, isCurrency: true, delta: "0 supplier", up: false },
          { label: "Nilai Stok", value: sv, isCurrency: true, delta: "0 SKU", up: false },
        ]);

        // Sales 7d chart
        const days = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
        const { data: salesAll } = await supabase
          .from("sales")
          .select("sale_date, total")
          .eq("workspace_id", wsId)
          .eq("status", "POSTED")
          .gte("sale_date", weekAgo);
        const byDay: Record<string, number> = {};
        (salesAll ?? []).forEach((r) => {
          const d = String(r.sale_date).slice(0, 10);
          byDay[d] = (byDay[d] ?? 0) + Number(r.total);
        });
        const chart: { day: string; value: number }[] = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date(Date.now() - i * 86400000);
          const key = d.toISOString().slice(0, 10);
          chart.push({ day: days[d.getDay()], value: byDay[key] ?? 0 });
        }
        setSales7d(chart);

        // Top products (last 30d by qty sold)
        const since = new Date(Date.now() - 30 * 86400000).toISOString();
        const { data: saleItems } = await supabase
          .from("sale_items")
          .select("stock_qty, products(name), sales!inner(workspace_id, status, sale_date)")
          .eq("sales.workspace_id", wsId)
          .eq("sales.status", "POSTED")
          .gte("sales.sale_date", since);
        const productAgg: Record<string, number> = {};
        (saleItems ?? []).forEach((r: any) => {
          const name = r.products?.name ?? "?";
          productAgg[name] = (productAgg[name] ?? 0) + Number(r.stock_qty);
        });
        const tops = Object.entries(productAgg)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name, qty], i) => ({ name, qty: Math.round(qty), color: ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444"][i] }));
        setTopProducts(tops.length ? tops : [
          { name: "Belum ada transaksi", qty: 0, color: "#cbd5e1" }
        ]);

        // Low stock
        const { data: balances } = await supabase
          .from("stock_balances")
          .select("qty, products(code, name, stock_unit_id), units(code)")
          .eq("workspace_id", wsId)
          .order("qty", { ascending: true })
          .limit(5);
        setLowStock(
          (balances ?? []).map((b: any) => ({
            code: b.products?.code ?? "-",
            name: b.products?.name ?? "-",
            qty: Math.round(Number(b.qty)),
            uom: b.units?.code ?? "PCS",
          }))
        );

        // AR list
        const { data: custs } = await supabase
          .from("customers")
          .select("id, code, name, customer_groups(name), sales(outstanding_amount)")
          .eq("workspace_id", wsId)
          .eq("active", true)
          .limit(6);
        setArList(
          (custs ?? []).map((c: any) => {
            const out = (c.sales ?? []).reduce((s: number, x: any) => s + Number(x.outstanding_amount ?? 0), 0);
            return {
              id: c.code,
              name: c.name,
              group: c.customer_groups?.name ?? "-",
              outstanding: out,
              initial: c.name?.charAt(0) ?? "?",
            };
          }).filter((x) => x.outstanding > 0).slice(0, 4)
        );

        setLoading(false);
      } catch (e: unknown) {
        setErr(e instanceof Error ? e.message : String(e));
        setLoading(false);
      }
    };
    load();
  }, []);

  if (err) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <div style={{ background: "var(--amber-soft)", color: "var(--amber)", padding: 16, borderRadius: 12, maxWidth: 480, margin: "0 auto" }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>⚠️ Setup Diperlukan</div>
          <div style={{ fontSize: 13 }}>{err}</div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>
        Memuat data workspace…
      </div>
    );
  }

  const maxSales = Math.max(1, ...sales7d.map((s) => s.value));
  const maxTop = Math.max(1, ...topProducts.map((t) => t.qty));

  return (
    <div className="dash-wrap">
      <div className="dash-head">
        <div>
          <h2 className="dash-title">Dashboard Operasional</h2>
          <p className="dash-sub">Data realtime dari Supabase · {new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}</p>
        </div>
      </div>

      <div className="kpi-grid">
        {kpis.map((k) => (
          <div className="kpi-card" key={k.label}>
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value num">{k.isCurrency ? formatRupiah(k.value) : formatNumber(k.value)}</div>
            <div className={"kpi-delta " + (k.up ? "up" : "down")}>{k.delta}</div>
          </div>
        ))}
      </div>

      <div className="dash-cols-2">
        <div className="dash-card">
          <h3>Penjualan 7 Hari Terakhir</h3>
          <div className="bar-chart">
            {sales7d.map((d, i) => (
              <div key={i} className="bar-col">
                <div className="bar-val num">{formatRupiah(d.value)}</div>
                <div className="bar" style={{ height: `${(d.value / maxSales) * 100}%` }} />
                <span className="bar-label">{d.day}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="dash-card">
          <h3>Top Produk (30 hari)</h3>
          {topProducts.length === 0 ? <div className="empty">Belum ada penjualan</div> :
            topProducts.map((t) => (
              <div key={t.name} className="top-row">
                <span className="top-name">{t.name}</span>
                <div className="top-track">
                  <div className="top-fill" style={{ width: `${(t.qty / maxTop) * 100}%`, background: t.color }} />
                </div>
                <span className="top-qty num">{t.qty}</span>
              </div>
            ))
          }
        </div>
      </div>

      <div className="dash-cols-2">
        <div className="dash-card">
          <h3>Stok Menipis</h3>
          {lowStock.length === 0 ? <div className="empty">Belum ada data stok</div> :
            lowStock.map((s) => (
              <div key={s.code} className="low-row">
                <div>
                  <div className="low-name">{s.name}</div>
                  <div className="low-meta">{s.code}</div>
                </div>
                <div className="low-qty num">{s.qty} {s.uom}</div>
              </div>
            ))
          }
        </div>
        <div className="dash-card">
          <h3>Piutang Pelanggan (Outstanding)</h3>
          {arList.length === 0 ? <div className="empty">Tidak ada piutang aktif</div> :
            arList.map((c) => (
              <div key={c.id} className="ar-row">
                <div className="ar-av" style={{ background: c.group === "Grosir" ? "var(--purple-soft)" : "var(--accent-soft)", color: c.group === "Grosir" ? "var(--purple)" : "var(--accent)" }}>{c.initial}</div>
                <div>
                  <div className="ar-name">{c.name}</div>
                  <div className="ar-meta">{c.id} · {c.group}</div>
                </div>
                <div className="ar-amt num">{formatRupiah(c.outstanding)}</div>
              </div>
            ))
          }
        </div>
      </div>

      <style jsx>{`
        .dash-wrap { padding: 24px; max-width: 1280px; margin: 0 auto; }
        .dash-head { margin-bottom: 22px; }
        .dash-title { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.3px; }
        .dash-sub { margin: 4px 0 0; font-size: 13px; color: var(--muted); }
        .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; margin-bottom: 20px; }
        .kpi-card { background: var(--panel); border: 1px solid var(--border); border-radius: 12px; padding: 16px 18px; box-shadow: var(--shadow-sm); }
        .kpi-label { color: var(--muted); font-size: 12px; font-weight: 600; }
        .kpi-value { font-size: 20px; font-weight: 800; margin: 8px 0 6px; letter-spacing: -0.3px; }
        .kpi-delta { font-size: 11px; font-weight: 700; display: inline-block; padding: 3px 8px; border-radius: 999px; background: var(--panel-2); color: var(--muted); }
        .dash-cols-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
        @media (max-width: 900px) { .dash-cols-2 { grid-template-columns: 1fr; } }
        .dash-card { background: var(--panel); border: 1px solid var(--border); border-radius: 12px; padding: 18px; box-shadow: var(--shadow-sm); }
        .dash-card h3 { margin: 0 0 14px; font-size: 14px; font-weight: 700; color: var(--text); }
        .empty { color: var(--muted); font-size: 13px; text-align: center; padding: 20px; }
        .bar-chart { display: flex; align-items: flex-end; gap: 12px; height: 180px; padding-top: 12px; }
        .bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; height: 100%; justify-content: flex-end; }
        .bar-val { font-size: 9px; color: var(--muted); }
        .bar { width: 100%; max-width: 40px; background: linear-gradient(180deg, var(--accent), var(--accent-2)); border-radius: 6px 6px 0 0; min-height: 4px; }
        .bar-label { font-size: 11px; color: var(--muted); font-weight: 600; }
        .top-row { display: grid; grid-template-columns: 140px 1fr 40px; align-items: center; gap: 10px; margin-bottom: 12px; }
        .top-name { font-size: 12px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .top-track { background: var(--panel-2); height: 8px; border-radius: 999px; overflow: hidden; }
        .top-fill { height: 100%; border-radius: 999px; }
        .top-qty { font-size: 12px; text-align: right; color: var(--text-2); font-weight: 700; }
        .low-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--border); }
        .low-row:last-child { border-bottom: none; }
        .low-name { font-size: 13px; font-weight: 600; }
        .low-meta { font-size: 11px; color: var(--muted); }
        .low-qty { font-size: 13px; font-weight: 700; color: var(--amber); }
        .ar-row { display: grid; grid-template-columns: 36px 1fr auto; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--border); }
        .ar-row:last-child { border-bottom: none; }
        .ar-av { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px; }
        .ar-name { font-size: 13px; font-weight: 600; }
        .ar-meta { font-size: 10px; color: var(--muted); margin-top: 2px; }
        .ar-amt { font-size: 13px; font-weight: 800; color: var(--amber); }
      `}</style>
    </div>
  );
}