import AppShell from "../../../components/AppShell";
import DemoModulePage from "../../../components/DemoModulePage";

export default function Page() {
  return (
    <AppShell>
      <DemoModulePage kind="warehouses" title="Gudang" description="Master gudang untuk multi-location stock." />
    </AppShell>
  );
}
