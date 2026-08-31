import AppShell from "../../components/AppShell";
import PosClient from "../../components/PosClient";

export default function PosPage({ searchParams }: { searchParams: { ws?: string } }) {
  return (
    <AppShell>
      <PosClient initialWorkspaceId={searchParams?.ws} />
    </AppShell>
  );
}