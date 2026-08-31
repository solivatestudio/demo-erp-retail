import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kelolain / Akuratif",
  description: "Sistem manajemen toko yang akurat dan aktif",
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
