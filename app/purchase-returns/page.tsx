import AppShell from "../../components/AppShell";
import DemoModulePage from "../../components/DemoModulePage";

export default function Page() {
  return (
    <AppShell>
      <DemoModulePage kind="purchaseReturns" title="Retur Pembelian" description="Retur pembelian berbasis transaksi asal, stok berkurang, dan hutang disesuaikan." />
    </AppShell>
  );
}
