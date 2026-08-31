import AppShell from "../../components/AppShell";
import DemoModulePage from "../../components/DemoModulePage";

export default function Page() {
  return (
    <AppShell>
      <DemoModulePage kind="reprints" title="Cetak Ulang Nota" description="Cetak ulang Nota Penjualan, Retur Penjualan, Nota Pembelian, dan Retur Pembelian tanpa repost transaksi." />
    </AppShell>
  );
}
