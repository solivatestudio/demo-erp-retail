import AppShell from "../../../components/AppShell";
import DemoModulePage from "../../../components/DemoModulePage";

export default function Page() {
  return (
    <AppShell>
      <DemoModulePage kind="repack" title="Repack" description="Repack SKU input menjadi SKU output dengan alokasi nilai." />
    </AppShell>
  );
}
