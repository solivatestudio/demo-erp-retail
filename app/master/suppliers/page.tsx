import AppShell from "../../../components/AppShell";
import DemoModulePage from "../../../components/DemoModulePage";

export default function Page() {
  return (
    <AppShell>
      <DemoModulePage kind="suppliers" title="Supplier" description="Master supplier dengan termin pembayaran." />
    </AppShell>
  );
}
