import { redirect } from "next/navigation";
import { createServerTRPCClient } from "~/trpc/server";
import { DashboardShell } from "~/components/dashboard-shell";
import { FormsDashboard } from "~/components/forms";

export const metadata = {
  title: "Dashboard — Formly",
  description: "Manage your forms, track response analytics, and share public links.",
};

export default async function DashboardPage() {
  const serverTrpc = await createServerTRPCClient();

  try {
    await serverTrpc.auth.me.query();
  } catch {
    redirect("/login?redirect=/dashboard");
  }

  return (
    <DashboardShell>
      <FormsDashboard />
    </DashboardShell>
  );
}
