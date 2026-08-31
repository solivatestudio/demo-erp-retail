import AppShell from "../../components/AppShell";
import DemoModulePage from "../../components/DemoModulePage";

export default function Page() {
  return (
    <AppShell>
      <DemoModulePage kind="delivery" title="Delivery" description="Kirim order delivery secara partial atau penuh dan kurangi stok saat pengiriman." />
    </AppShell>
  );
}
