import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jakarta",
});

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
      <body className={`${jakartaSans.className} ${jakartaSans.variable}`}>{children}</body>
    </html>
  );
}
