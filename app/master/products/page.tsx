import AppShell from "../../../components/AppShell";
import DemoModulePage from "../../../components/DemoModulePage";

export default function Page() {
  return (
    <AppShell>
      <DemoModulePage kind="products" title="Produk" description="Produk aktif dengan kategori, merk, barcode, satuan, HPP, dan harga jual." />
    </AppShell>
  );
}
