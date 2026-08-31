import AppShell from "../../components/AppShell";
import DemoModulePage from "../../components/DemoModulePage";

export default function Page() {
  return (
    <AppShell>
      <DemoModulePage kind="purchases" title="Pembelian" description="Post pembelian supplier, stok bertambah, hutang muncul, dan laporan ikut berubah." />
    </AppShell>
  );
}
