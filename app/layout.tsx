import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RetailERP — Demo POS",
  description: "Prototype interaktif POS & Dashboard retail/grosir",
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
