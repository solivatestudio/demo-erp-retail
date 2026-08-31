"use client";

import { PRODUCTS, CUSTOMERS, formatRupiah } from "../lib/data";

const kpi = [
  { label: "Penjualan Hari Ini", value: "Rp 18.450.000", delta: "+12.5%", up: true },
  { label: "Transaksi Hari Ini", value: "142", delta: "+8.2%", up: true },
  { label: "Laba Kotor Hari Ini", value: "Rp 3.120.000", delta: "+5.4%", up: true },
  { label: "Pembelian Hari Ini", value: "Rp 9.750.000", delta: "-2.1%", up: false },
  { label: "Piutang (AR)", value: "Rp 5.250.000", delta: "1 pelanggan", up: false },
  { label: "Hutang (AP)", value: "Rp 4.100.000", delta: "1 supplier", up: false },
];

const sales7d = [40, 55, 48, 72, 66, 88, 95];

const topItems = [...PRODUCTS]
  .map((p) => ({ name: p.name, qty: Math.round(p.stockQty * 0.4), color: p.color }))
  .sort((a, b) => b.qty - a.qty)
  .slice(0, 5);

const maxQty = Math.max(...topItems.map((t) => t.qty));

const lowStock = PRODUCTS.filter((p) => p.stockQty < 150).slice(0, 4);

export default function Dashboard() {
  const maxSales = Math.max(...sales7d);
  return (
    <div className="dash">
      <h2 className="dash-title">Dashboard Operasional</h2>

      <div className="kpi-grid">
        {kpi.map((k) => (
          <div className="kpi-card" key={k.label}>
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value num">{k.value}</div>
            <div className={"kpi-delta " + (k.up ? "up" : "down")}>{k.delta}</div>
          </div>
        ))}
      </div>

      <div className="dash-cols">
        <div className="dash-card">
          <h3>Penjualan 7 Hari Terakhir</h3>
          <div className="bar-chart">
            {sales7d.map((v, i) => (
              <div className="bar-col" key={i}>
                <div
                  className="bar"
                  style={{ height: `${(v / maxSales) * 100}%` }}
                  title={`${v} transaksi`}
                />
                <span className="bar-label">H{i + 1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="dash-card">
          <h3>Top Produk (Terjual)</h3>
          <div className="top-list">
            {topItems.map((t) => (
              <div className="top-row" key={t.name}>
                <span className="top-name">{t.name}</span>
                <div className="top-track">
                  <div
                    className="top-fill"
                    style={{ width: `${(t.qty / maxQty) * 100}%`, background: t.color }}
                  />
                </div>
                <span className="top-qty num">{t.qty}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="dash-cols">
        <div className="dash-card">
          <h3>Stok Menipis</h3>
          <table className="tbl">
            <thead>
              <tr>
                <th>Produk</th>
                <th className="r">Stok</th>
              </tr>
            </thead>
            <tbody>
              {lowStock.map((p) => (
                <tr key={p.code}>
                  <td>{p.name}</td>
                  <td className="r num">{p.stockQty} {p.stockUom}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="dash-card">
          <h3>Piutang Pelanggan (AR)</h3>
          <table className="tbl">
            <thead>
              <tr>
                <th>Customer</th>
                <th className="r">Outstanding</th>
              </tr>
            </thead>
            <tbody>
              {CUSTOMERS.filter((c) => c.outstanding > 0).map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td className="r num">{formatRupiah(c.outstanding)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        .dash { padding: 24px; max-width: 1200px; margin: 0 auto; }
        .dash-title { margin: 0 0 20px; font-size: 20px; }
        .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 12px; margin-bottom: 20px; }
        .kpi-card { background: var(--panel); border: 1px solid var(--border); border-radius: 12px; padding: 14px 16px; }
        .kpi-label { color: var(--muted); font-size: 12px; }
        .kpi-value { font-size: 20px; font-weight: 700; margin: 6px 0 2px; }
        .kpi-delta { font-size: 12px; }
        .kpi-delta.up { color: var(--green); }
        .kpi-delta.down { color: var(--amber); }
        .dash-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
        @media (max-width: 720px) { .dash-cols { grid-template-columns: 1fr; } }
        .dash-card { background: var(--panel); border: 1px solid var(--border); border-radius: 12px; padding: 16px; }
        .dash-card h3 { margin: 0 0 14px; font-size: 14px; color: var(--muted); font-weight: 600; }
        .bar-chart { display: flex; align-items: flex-end; gap: 10px; height: 160px; }
        .bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; height: 100%; justify-content: flex-end; }
        .bar { width: 100%; max-width: 40px; background: linear-gradient(180deg, var(--accent), var(--accent-2)); border-radius: 6px 6px 0 0; min-height: 4px; }
        .bar-label { font-size: 11px; color: var(--muted); }
        .top-list { display: flex; flex-direction: column; gap: 12px; }
        .top-row { display: grid; grid-template-columns: 160px 1fr 48px; align-items: center; gap: 10px; }
        .top-name { font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .top-track { background: var(--panel-2); height: 10px; border-radius: 6px; overflow: hidden; }
        .top-fill { height: 100%; border-radius: 6px; }
        .top-qty { font-size: 13px; text-align: right; color: var(--muted); }
        .tbl { width: 100%; border-collapse: collapse; font-size: 13px; }
        .tbl th { text-align: left; color: var(--muted); font-weight: 600; padding: 6px 8px; border-bottom: 1px solid var(--border); }
        .tbl td { padding: 8px; border-bottom: 1px solid var(--border); }
        .tbl .r { text-align: right; }
      `}</style>
    </div>
  );
}
