import AppShell from "../../../components/AppShell";
import DemoModulePage from "../../../components/DemoModulePage";

export default function Page() {
  return (
    <AppShell>
      <DemoModulePage kind="salesPeople" title="Salesman" description="Master salesman yang terhubung ke transaksi penjualan." />
    </AppShell>
  );
}
