"use client";

import AppShell from "./AppShell";

interface Props {
  title: string;
  description: string;
  icon?: string;
  phase?: string;
}

export default function PlaceholderPage({ title, description, icon = "🚧", phase = "Phase Berikutnya" }: Props) {
  return (
    <AppShell>
      <div className="ph-wrap">
        <div className="ph-card">
          <div className="ph-icon">{icon}</div>
          <h1 className="ph-title">{title}</h1>
          <p className="ph-desc">{description}</p>
          <div className="ph-badge">{phase}</div>
        </div>
      </div>
      <style jsx>{`
        .ph-wrap { padding: 40px; display: flex; align-items: center; justify-content: center; min-height: 70vh; }
        .ph-card { background: var(--panel); border: 1px solid var(--border); border-radius: 16px; padding: 40px; max-width: 520px; text-align: center; box-shadow: var(--shadow-sm); }
        .ph-icon { font-size: 48px; margin-bottom: 16px; }
        .ph-title { font-size: 22px; font-weight: 800; margin: 0 0 8px; }
        .ph-desc { font-size: 14px; color: var(--text-2); line-height: 1.6; margin: 0 0 20px; }
        .ph-badge { display: inline-block; background: var(--amber-soft); color: var(--amber); font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; padding: 6px 14px; border-radius: 999px; }
      `}</style>
    </AppShell>
  );
}