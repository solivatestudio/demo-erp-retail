import AppShell from "../../../components/AppShell";
import DemoModulePage from "../../../components/DemoModulePage";

export default function Page() {
  return (
    <AppShell>
      <DemoModulePage kind="units" title="Satuan / UOM" description="Master satuan seperti PCS, PACK, DUS, KARTON, dan KG." />
    </AppShell>
  );
}
