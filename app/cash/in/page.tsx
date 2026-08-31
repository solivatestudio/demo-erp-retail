import AppShell from "../../../components/AppShell";
import DemoModulePage from "../../../components/DemoModulePage";

export default function Page() {
  return (
    <AppShell>
      <DemoModulePage kind="cashIn" title="Kas Masuk" description="Pencatatan penerimaan kas dari pelanggan dan aktivitas operasional." />
    </AppShell>
  );
}
