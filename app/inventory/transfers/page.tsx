import AppShell from "../../../components/AppShell";
import DemoModulePage from "../../../components/DemoModulePage";

export default function Page() {
  return (
    <AppShell>
      <DemoModulePage kind="stockTransfers" title="Transfer Gudang" description="Transfer antar gudang dengan movement TRANSFER_OUT dan TRANSFER_IN." />
    </AppShell>
  );
}
