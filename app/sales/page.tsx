import AppShell from "../../components/AppShell";
import DemoModulePage from "../../components/DemoModulePage";

export default function Page() {
  return (
    <AppShell>
      <DemoModulePage kind="sales" title="Daftar Penjualan" description="Penjualan POS, direct sale, dan delivery sale dengan piutang serta status fulfillment." />
    </AppShell>
  );
}
