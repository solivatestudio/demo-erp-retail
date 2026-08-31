import AppShell from "../../components/AppShell";
import DemoModulePage from "../../components/DemoModulePage";

export default function Page() {
  return (
    <AppShell>
      <DemoModulePage kind="receivables" title="Piutang Pelanggan" description="Daftar piutang customer dan angsuran yang membuat cash in otomatis." />
    </AppShell>
  );
}
