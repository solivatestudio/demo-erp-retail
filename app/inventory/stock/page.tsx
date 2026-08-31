import AppShell from "../../../components/AppShell";
import DemoModulePage from "../../../components/DemoModulePage";

export default function Page() {
  return (
    <AppShell>
      <DemoModulePage kind="stock" title="Produk & Stok" description="Stok per produk dan gudang dari stock_balances, bukan angka hardcode." />
    </AppShell>
  );
}
