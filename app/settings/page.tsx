import AppShell from "../../components/AppShell";
import DemoModulePage from "../../components/DemoModulePage";

export default function Page() {
  return (
    <AppShell>
      <DemoModulePage kind="settings" title="Pengaturan Toko" description="Kustomisasi identitas toko: header nama, alamat, no. telp, dan footer nota." />
    </AppShell>
  );
}
