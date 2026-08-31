import AppShell from "../../../components/AppShell";
import DemoModulePage from "../../../components/DemoModulePage";

export default function Page() {
  return (
    <AppShell>
      <DemoModulePage kind="adjustments" title="Koreksi Stok & HPP" description="Penyesuaian stok fisik dan pembaruan HPP untuk transaksi berikutnya." />
    </AppShell>
  );
}
