import AppShell from "../../../components/AppShell";
import DemoModulePage from "../../../components/DemoModulePage";

export default function Page() {
  return (
    <AppShell>
      <DemoModulePage kind="cashOut" title="Kas Keluar" description="Kas keluar manual dan otomatis dari pembayaran supplier." />
    </AppShell>
  );
}
