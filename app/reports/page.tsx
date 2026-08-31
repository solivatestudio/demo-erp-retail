import AppShell from "../../components/AppShell";
import DemoModulePage from "../../components/DemoModulePage";

export default function Page() {
  return (
    <AppShell>
      <DemoModulePage kind="reports" title="Laporan" description="Ringkasan dan daftar laporan utama berbasis data transaksi aktif." />
    </AppShell>
  );
}
