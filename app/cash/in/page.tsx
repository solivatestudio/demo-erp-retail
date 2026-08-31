import AppShell from "../../../components/AppShell";
import DemoModulePage from "../../../components/DemoModulePage";

export default function Page() {
  return (
    <AppShell>
      <DemoModulePage kind="cashIn" title="Kas Masuk" description="Kas masuk manual dan otomatis dari pembayaran customer." />
    </AppShell>
  );
}
