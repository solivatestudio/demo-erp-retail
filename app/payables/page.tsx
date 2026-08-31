import AppShell from "../../components/AppShell";
import DemoModulePage from "../../components/DemoModulePage";

export default function Page() {
  return (
    <AppShell>
      <DemoModulePage kind="payables" title="Hutang Supplier" description="Daftar hutang supplier dan tombol angsuran yang membuat cash out otomatis." />
    </AppShell>
  );
}
