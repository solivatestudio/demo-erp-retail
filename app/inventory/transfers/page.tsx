import AppShell from "../../../components/AppShell";
import DemoModulePage from "../../../components/DemoModulePage";

export default function Page() {
  return (
    <AppShell>
      <DemoModulePage kind="stockTransfers" title="Transfer Gudang" description="Pemindahan stok antar gudang dengan saldo asal dan tujuan yang tercatat otomatis." />
    </AppShell>
  );
}
