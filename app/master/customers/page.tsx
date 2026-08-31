import AppShell from "../../../components/AppShell";
import DemoModulePage from "../../../components/DemoModulePage";

export default function Page() {
  return (
    <AppShell>
      <DemoModulePage kind="customers" title="Customer" description="Master customer dengan group retail/grosir/distributor." />
    </AppShell>
  );
}
