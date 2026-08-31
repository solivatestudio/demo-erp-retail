import AppShell from "../../../components/AppShell";
import DemoModulePage from "../../../components/DemoModulePage";

export default function Page() {
  return (
    <AppShell>
      <DemoModulePage kind="stock" title="Produk & Stok" description="Saldo stok per produk dan gudang dengan status minimum persediaan." />
    </AppShell>
  );
}
