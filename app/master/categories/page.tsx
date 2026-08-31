import AppShell from "../../../components/AppShell";
import DemoModulePage from "../../../components/DemoModulePage";

export default function Page() {
  return (
    <AppShell>
      <DemoModulePage kind="categories" title="Kategori & Sub-Kategori" description="Master kategori dan sub-kategori barang untuk filter produk, stok, dan laporan." />
    </AppShell>
  );
}
