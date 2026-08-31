import AppShell from "../../components/AppShell";
import DemoModulePage from "../../components/DemoModulePage";

export default function Page() {
  return (
    <AppShell>
      <DemoModulePage kind="purchases" title="Pembelian" description="Pencatatan nota beli supplier, gudang tujuan, item barang, TOP, dan status hutang." />
    </AppShell>
  );
}
