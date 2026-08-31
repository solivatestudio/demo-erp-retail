"use client";

import { PRODUCTS, CUSTOMERS, formatRupiah } from "../lib/data";

const kpi = [
  { label: "Penjualan Hari Ini", value: 18450000, delta: "+12.5%", up: true },
  { label: "Transaksi Hari Ini", value: 142, delta: "+8.2%", up: true, isNum: true },
  { label: "Laba Kotor Hari Ini", value: 3120000, delta: "+5.4%", up: true },
  { label: "Pembelian Hari Ini", value: 9750000, delta: "-2.1%", up: false },
  { label: "Piutang (AR)", value: 5250000, delta: "2 pelanggan", up: false },
  { label: "Hutang (AP)", value: 4100000, delta: "1 supplier", up: false },
];

const sales7d = [40, 55, 48, 72, 66, 88, 95];
const days = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

const paymentModes = [
  { name: "Tunai", value: 68, color: "#10b981" },
  { name: "QRIS", value: 22, color: "#3b82f6" },
  { name: "Transfer", value: 8, color: "#8b5cf6" },
  { name: "Kartu", value: 2, color: "#f59e0b" },
];

const topItems = [...PRODUCTS]
  .map((p) => ({ code: p.code, name: p.name, qty: Math.round(p.stockQty * 0.4), color: p.color }))
  .sort((a, b) => b.qty - a.qty)
  .slice(0, 5);

const maxQty = Math.max(...topItems.map((t) => t.qty));
const lowStock = PRODUCTS.filter((p) => p.stockQty < 150).slice(0, 4);

const fmtVal = (k: (typeof kpi)[number]) =>
  k.isNum ? new Intl.NumberFormat("id-ID").format(k.value) : formatRupiah(k.value);

export default function Dashboard() {
  const maxSales = Math.max(...sales7d);
  return (
    <div className="dash">
      <div className="dash-head">
        <div>
          <h2 className="dash-title">Dashboard Operasional</h2>
          <p className="dash-sub">Ringkasan penjualan, stok, dan piutang periode hari ini.</p>
        </div>
        <div className="period-chip">Hari ini · 31 Agt 2026</div>
      </div>

      <div className="kpi-grid">
        {kpi.map((k) => (
          <div className="kpi-card" key={k.label}>
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value num">{fmtVal(k)}</div>
            <div className={"kpi-delta " + (k.up ? "up" : "down")}>
              <span className="kpi-arrow">{k.up ? "↑" : "↓"}</span>
              {k.delta}
            </div>
          </div>
        ))}
      </div>

      <div className="dash-cols">
        <div className="dash-card span-2">
          <div className="card-head">
            <h3>Penjualan 7 Hari Terakhir</h3>
            <div className="card-tag">transaksi</div>
          </div>
          <div className="bar-chart">
            {sales7d.map((v, i) => (
              <div className="bar-col" key={i}>
                <div className="bar-value num">{v}</div>
                <div
                  className="bar"
                  style={{ height: `${(v / maxSales) * 100}%` }}
                />
                <span className="bar-label">{days[i]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="dash-card">
          <div className="card-head">
            <h3>Metode Pembayaran</h3>
            <div className="card-tag">7 hari</div>
          </div>
          <div className="donut-wrap">
            <svg viewBox="0 0 120 120" className="donut">
              {(() => {
                const r = 50;
                const c = 2 * Math.PI * r;
                let offset = 0;
                return paymentModes.map((m, i) => {
                  const len = (m.value / 100) * c;
                  const seg = (
                    <circle
                      key={i}
                      cx="60"
                      cy="60"
                      r={r}
                      fill="none"
                      stroke={m.color}
                      strokeWidth="14"
                      strokeDasharray={`${len} ${c - len}`}
                      strokeDashoffset={-offset}
                      transform="rotate(-90 60 60)"
                    />
                  );
                  offset += len;
                  return seg;
                });
              })()}
              <text x="60" y="58" textAnchor="middle" fontSize="20" fontWeight="800" fill="#0f172a">100%</text>
              <text x="60" y="74" textAnchor="middle" fontSize="9" fill="#64748b">trx</text>
            </svg>
            <div className="legend">
              {paymentModes.map((m) => (
                <div className="legend-row" key={m.name}>
                  <span className="legend-dot" style={{ background: m.color }} />
                  <span className="legend-name">{m.name}</span>
                  <span className="legend-val num">{m.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="dash-cols">
        <div className="dash-card">
          <div className="card-head">
            <h3>Top Produk</h3>
            <div className="card-tag">terlaris</div>
          </div>
          <div className="top-list">
            {topItems.map((t) => (
              <div className="top-row" key={t.code}>
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

        <div className="dash-card">
          <div className="card-head">
            <h3>Stok Menipis</h3>
            <div className="card-tag warning">{lowStock.length} item</div>
          </div>
          <div className="stock-list">
            {lowStock.map((p) => {
              const pct = Math.min(100, (p.stockQty / 200) * 100);
              const tone = pct < 30 ? "low" : pct < 60 ? "mid" : "ok";
              return (
                <div className="stock-row" key={p.code}>
                  <div className="stock-info">
                    <div className="stock-name">{p.name}</div>
                    <div className="stock-meta">{p.code} · {p.brand}</div>
                  </div>
                  <div className="stock-bar-wrap">
                    <div className={"stock-bar " + tone} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="stock-qty num">{p.stockQty} {p.stockUom}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="dash-card">
          <div className="card-head">
            <h3>Piutang Pelanggan</h3>
            <div className="card-tag">{CUSTOMERS.filter((c) => c.outstanding > 0).length} aktif</div>
          </div>
          <div className="ar-list">
            {CUSTOMERS.filter((c) => c.outstanding > 0).map((c) => (
              <div className="ar-row" key={c.id}>
                <div className="ar-avatar" style={{ background: c.group === "Grosir" ? "var(--purple-soft)" : "var(--accent-soft)", color: c.group === "Grosir" ? "var(--purple)" : "var(--accent)" }}>
                  {c.name.charAt(0)}
                </div>
                <div className="ar-info">
                  <div className="ar-name">{c.name}</div>
                  <div className="ar-meta">{c.id} · {c.group}</div>
                </div>
                <div className="ar-amt num">{formatRupiah(c.outstanding)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .dash { padding: 24px; max-width: 1280px; margin: 0 auto; }
        .dash-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 22px;
        }
        .dash-title { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.3px; }
        .dash-sub { margin: 4px 0 0; font-size: 13px; color: var(--muted); }
        .period-chip {
          background: var(--panel);
          border: 1px solid var(--border);
          padding: 8px 14px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-2);
          box-shadow: var(--shadow-sm);
        }
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 14px;
          margin-bottom: 20px;
        }
        .kpi-card {
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 16px 18px;
          box-shadow: var(--shadow-sm);
          transition: all 0.15s;
        }
        .kpi-card:hover { box-shadow: var(--shadow-md); }
        .kpi-label { color: var(--muted); font-size: 12px; font-weight: 600; }
        .kpi-value {
          font-size: 20px;
          font-weight: 800;
          margin: 8px 0 6px;
          letter-spacing: -0.3px;
        }
        .kpi-delta {
          font-size: 11px;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 3px;
          padding: 3px 8px;
          border-radius: 999px;
        }
        .kpi-delta.up { color: var(--green); background: var(--green-soft); }
        .kpi-delta.down { color: var(--amber); background: var(--amber-soft); }
        .kpi-arrow { font-size: 10px; }
        .dash-cols {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }
        .dash-cols:last-of-type { grid-template-columns: 1fr 1fr 1fr; }
        .span-2 { grid-column: span 1; }
        @media (max-width: 960px) {
          .dash-cols, .dash-cols:last-of-type { grid-template-columns: 1fr; }
        }
        .dash-card {
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 18px;
          box-shadow: var(--shadow-sm);
        }
        .card-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        .card-head h3 { margin: 0; font-size: 14px; font-weight: 700; color: var(--text); }
        .card-tag {
          font-size: 10px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 999px;
          background: var(--panel-2);
          color: var(--text-2);
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }
        .card-tag.warning { background: var(--amber-soft); color: var(--amber); }
        .bar-chart {
          display: flex;
          align-items: flex-end;
          gap: 14px;
          height: 180px;
          padding-top: 16px;
        }
        .bar-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          height: 100%;
          justify-content: flex-end;
        }
        .bar-value { font-size: 11px; color: var(--text-2); font-weight: 700; }
        .bar {
          width: 100%;
          max-width: 36px;
          background: linear-gradient(180deg, var(--accent), var(--accent-2));
          border-radius: 6px 6px 0 0;
          min-height: 6px;
        }
        .bar-label { font-size: 11px; color: var(--muted); font-weight: 600; }
        .donut-wrap {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .donut { width: 120px; height: 120px; flex-shrink: 0; }
        .legend { flex: 1; display: flex; flex-direction: column; gap: 8px; }
        .legend-row {
          display: grid;
          grid-template-columns: 10px 1fr auto;
          align-items: center;
          gap: 8px;
          font-size: 12px;
        }
        .legend-dot { width: 10px; height: 10px; border-radius: 50%; }
        .legend-name { color: var(--text-2); }
        .legend-val { font-weight: 700; color: var(--text); }
        .top-list { display: flex; flex-direction: column; gap: 12px; }
        .top-row {
          display: grid;
          grid-template-columns: 140px 1fr 40px;
          align-items: center;
          gap: 10px;
        }
        .top-name { font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 600; }
        .top-track {
          background: var(--panel-2);
          height: 8px;
          border-radius: 999px;
          overflow: hidden;
        }
        .top-fill { height: 100%; border-radius: 999px; }
        .top-qty { font-size: 12px; text-align: right; color: var(--text-2); font-weight: 700; }
        .stock-list { display: flex; flex-direction: column; gap: 14px; }
        .stock-row {
          display: grid;
          grid-template-columns: 1fr 80px 60px;
          align-items: center;
          gap: 12px;
        }
        .stock-name { font-size: 12px; font-weight: 600; }
        .stock-meta { font-size: 10px; color: var(--muted); margin-top: 2px; }
        .stock-bar-wrap {
          background: var(--panel-2);
          height: 6px;
          border-radius: 999px;
          overflow: hidden;
        }
        .stock-bar { height: 100%; border-radius: 999px; transition: width 0.3s; }
        .stock-bar.low { background: var(--red); }
        .stock-bar.mid { background: var(--amber); }
        .stock-bar.ok { background: var(--green); }
        .stock-qty { font-size: 11px; text-align: right; color: var(--text-2); font-weight: 700; }
        .ar-list { display: flex; flex-direction: column; gap: 12px; }
        .ar-row {
          display: grid;
          grid-template-columns: 36px 1fr auto;
          align-items: center;
          gap: 12px;
          padding: 8px;
          border-radius: var(--radius-sm);
        }
        .ar-row:hover { background: var(--panel-2); }
        .ar-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 14px;
        }
        .ar-name { font-size: 13px; font-weight: 600; }
        .ar-meta { font-size: 10px; color: var(--muted); margin-top: 1px; }
        .ar-amt { font-size: 13px; font-weight: 800; color: var(--amber); }
      `}</style>
    </div>
  );
}
