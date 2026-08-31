import AppShell from "../../../components/AppShell";
import DemoModulePage from "../../../components/DemoModulePage";

export default function Page() {
  return (
    <AppShell>
      <DemoModulePage kind="settings" title="Pengaturan Demo" description="Reset workspace demo dan akses cepat ke alur yang perlu dicoba." />
    </AppShell>
  );
}
