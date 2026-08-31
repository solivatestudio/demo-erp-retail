import AppShell from "../../components/AppShell";
import DashboardClient from "../../components/DashboardClient";

export default async function DashboardPage() {
  return (
    <AppShell>
      <DashboardClient />
    </AppShell>
  );
}