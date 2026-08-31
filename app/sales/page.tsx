import AppShell from "../../components/AppShell";
import DemoModulePage from "../../components/DemoModulePage";

export default function Page() {
  return (
    <AppShell>
      <DemoModulePage kind="sales" title="Daftar Penjualan" description="Penjualan POS, grosir, dan delivery dengan status pembayaran serta pengiriman." />
    </AppShell>
  );
}
