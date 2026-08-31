import AppShell from "../../components/AppShell";
import DemoModulePage from "../../components/DemoModulePage";

export default function Page() {
  return (
    <AppShell>
      <DemoModulePage kind="salesReturns" title="Retur Penjualan" description="Retur penjualan berbasis nota asal, stok kembali masuk dan piutang disesuaikan." />
    </AppShell>
  );
}
