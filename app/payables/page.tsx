import AppShell from "../../components/AppShell";
import DemoModulePage from "../../components/DemoModulePage";

export default function Page() {
  return (
    <AppShell>
      <DemoModulePage kind="payables" title="Hutang Supplier" description="Daftar hutang pembelian, jatuh tempo, dan angsuran pembayaran supplier." />
    </AppShell>
  );
}
