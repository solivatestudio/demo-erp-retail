import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kelolain · Retail & Wholesale ERP",
  description: "Sistem Manajemen Terintegrasi Penjualan, Pembelian, Multi-Gudang & Inventaris",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
