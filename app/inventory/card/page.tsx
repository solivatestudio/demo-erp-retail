import AppShell from "../../../components/AppShell";
import DemoModulePage from "../../../components/DemoModulePage";

export default function Page() {
  return (
    <AppShell>
      <DemoModulePage kind="stockCard" title="Kartu Stok" description="Riwayat mutasi stok untuk setiap produk dan lokasi gudang." />
    </AppShell>
  );
}
