import AppShell from "../../../components/AppShell";
import DemoModulePage from "../../../components/DemoModulePage";

export default function Page() {
  return (
    <AppShell>
      <DemoModulePage kind="stockCard" title="Kartu Stok" description="Ledger inventory movement untuk semua transaksi stok." />
    </AppShell>
  );
}
