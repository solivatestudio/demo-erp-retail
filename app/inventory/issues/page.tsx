import AppShell from "../../../components/AppShell";
import DemoModulePage from "../../../components/DemoModulePage";

export default function Page() {
  return (
    <AppShell>
      <DemoModulePage kind="stockIssues" title="Pengeluaran Barang" description="Issue stok untuk sample, rusak, operasional, hilang, dan kebutuhan internal." />
    </AppShell>
  );
}
