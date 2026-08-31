"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "../lib/supabase/client";

const FEATURES = [
  { title: "POS kasir", desc: "Jual retail & grosir, multi-UOM, pembayaran partial." },
  { title: "Pembelian & hutang", desc: "PO → GR → Invoice → angsuran supplier." },
  { title: "Delivery & retur", desc: "Partial delivery, retur jual/beli tersinkronisasi." },
  { title: "Stok multi-gudang", desc: "Ledger inventory, transfer, repack, koreksi." },
  { title: "17 laporan", desc: "Stok, laba per nota, angsuran, pending delivery." },
  { title: "Reset data", desc: "One-click reset workspace demo ke kondisi seed." },
];

export default function LandingPage() {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const startDemo = async () => {
    setLoading(true);
    setErr(null);
    try {
      const supabase = createClient();
      // Anonymous sign-in if not authed
      let sess = await supabase.auth.getSession();
      if (!sess.data.session) {
        const { error: anonErr } = await supabase.auth.signInAnonymously();
        if (anonErr) throw anonErr;
        sess = await supabase.auth.getSession();
      }
      if (!sess.data.session) throw new Error("Gagal sign-in anonymous");

      const { data, error } = await supabase.rpc("create_demo_workspace", {
        p_business_name: "Berkah Plastik & Packaging",
      });
      if (error) throw error;
      window.location.href = `/dashboard?ws=${data}`;
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
      setLoading(false);
    }
  };

  return (
    <div className="landing">
      <header className="landing-head">
        <div className="landing-head-inner">
          <Link href="/" className="brand" style={{ textDecoration: "none" }}>
            <span className="brand-mark">R</span>
            <div>
              <div className="brand-name">RetailERP</div>
              <div className="brand-sub">Demo Serverless · Supabase + Vercel</div>
            </div>
          </Link>
        </div>
      </header>

      <main className="landing-main">
        <div className="hero">
          <div className="hero-badge">Mode Demo</div>
          <h1 className="hero-title">
            Demo Sistem POS &amp; ERP<br />
            <span className="hero-accent">Retail / Grosir</span>
          </h1>
          <p className="hero-desc">
            Coba langsung seluruh alur operasional: penjualan, pembelian, stok, hutang/piutang,
            delivery, repack, dan laporan. Database nyata di Supabase. Bukan mockup.
          </p>
          <div className="hero-actions">
            <button onClick={startDemo} disabled={loading} className="btn-cta">
              {loading ? "Membuat workspace…" : "Coba Demo"}
            </button>
            <a href="#features" className="btn-ghost">Lihat Fitur</a>
          </div>
          {err && <div className="hero-err">{err}</div>}
        </div>

        <div id="features" className="features">
          {FEATURES.map((f) => (
            <div key={f.title} className="feature-card">
              <div className="feature-title">{f.title}</div>
              <div className="feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>

        <div className="trial-panel">
          <div className="trial-badge">Yang Bisa Anda Coba</div>
          <div className="trial-grid">
            {[
              "Jual retail", "Jual grosir", "Piutang customer",
              "Pembelian", "Hutang supplier", "Partial delivery",
              "Retur jual & beli", "Repack", "Koreksi stok & HPP",
              "Transfer gudang", "17 laporan", "Reset workspace",
            ].map((t) => (
              <div key={t} className="trial-item">
                <span className="trial-tick">✓</span>{t}
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="landing-foot">
        <div className="landing-foot-inner">
          <span>Demo serverless · data tersimpan di Supabase PostgreSQL.</span>
          <span>Bukan pengganti production ERP.</span>
        </div>
      </footer>

      <style jsx>{`
        .landing { min-height: 100vh; background: var(--bg); }
        .landing-head { background: var(--panel); border-bottom: 1px solid var(--border); }
        .landing-head-inner { max-width: 1200px; margin: 0 auto; padding: 16px 24px; }
        .brand { display: flex; align-items: center; gap: 10px; }
        .brand-mark { width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, var(--accent), var(--accent-2)); color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 16px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25); }
        .brand-name { font-weight: 700; font-size: 15px; color: var(--text); }
        .brand-sub { font-size: 11px; color: var(--muted); }
        .landing-main { max-width: 1200px; margin: 0 auto; padding: 64px 24px; }
        .hero { text-align: center; max-width: 720px; margin: 0 auto; }
        .hero-badge { display: inline-block; background: var(--amber-soft); color: var(--amber); font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; padding: 4px 12px; border-radius: 999px; margin-bottom: 20px; }
        .hero-title { font-size: 42px; font-weight: 800; letter-spacing: -0.5px; line-height: 1.1; margin: 0 0 20px; }
        .hero-accent { color: var(--accent); }
        .hero-desc { font-size: 16px; color: var(--text-2); line-height: 1.6; margin: 0 0 32px; }
        .hero-actions { display: flex; align-items: center; justify-content: center; gap: 12px; }
        .btn-cta { background: var(--green); color: white; font-size: 15px; font-weight: 700; padding: 14px 24px; border-radius: 12px; border: none; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.25); cursor: pointer; }
        .btn-cta:hover:not(:disabled) { background: #047857; }
        .btn-cta:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-ghost { background: var(--panel); border: 1px solid var(--border); color: var(--text); font-size: 15px; font-weight: 600; padding: 14px 24px; border-radius: 12px; text-decoration: none; }
        .btn-ghost:hover { background: var(--panel-2); }
        .hero-err { margin-top: 16px; background: var(--red-soft); color: var(--red); padding: 10px 14px; border-radius: 8px; font-size: 13px; }
        .features { margin-top: 80px; display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; }
        .feature-card { background: var(--panel); border: 1px solid var(--border); border-radius: 12px; padding: 20px; box-shadow: var(--shadow-sm); }
        .feature-title { font-weight: 700; font-size: 14px; margin-bottom: 6px; }
        .feature-desc { font-size: 13px; color: var(--text-2); line-height: 1.5; }
        .trial-panel { margin-top: 64px; background: var(--panel); border: 1px solid var(--border); border-radius: 16px; padding: 28px; box-shadow: var(--shadow-sm); }
        .trial-badge { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: var(--amber); margin-bottom: 8px; }
        .trial-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px 24px; font-size: 13px; color: var(--text-2); }
        .trial-item { display: flex; align-items: center; gap: 8px; }
        .trial-tick { color: var(--green); font-weight: 700; }
        .landing-foot { border-top: 1px solid var(--border); background: var(--panel); }
        .landing-foot-inner { max-width: 1200px; margin: 0 auto; padding: 20px 24px; font-size: 12px; color: var(--muted); display: flex; justify-content: space-between; }
      `}</style>
    </div>
  );
}