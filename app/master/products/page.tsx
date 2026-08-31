import AppShell from "../../../components/AppShell";
import DemoModulePage from "../../../components/DemoModulePage";

export default function Page() {
  return (
    <AppShell>
      <DemoModulePage kind="products" title="Produk" description="Produk aktif dengan kategori, brand, barcode, dan HPP rata-rata." />
    </AppShell>
  );
}
