import AppShell from "../../../components/AppShell";
import DemoModulePage from "../../../components/DemoModulePage";

export default function Page() {
  return (
    <AppShell>
      <DemoModulePage kind="prices" title="Harga Retail & Grosir" description="Matrix harga per produk, customer group, UOM, dan minimum qty." />
    </AppShell>
  );
}
