import { redirect } from "next/navigation";
import { createServerTRPCClient } from "~/trpc/server";
import { DashboardShell } from "~/components/dashboard-shell";
import { AnalyticsView } from "~/components/analytics";

export const metadata = {
  title: "Analytics — Formly",
  description: "Monitor form performance, completion rates, and respondent distribution trends.",
};

export default async function AnalyticsPage() {
  const serverTrpc = await createServerTRPCClient();

  try {
    await serverTrpc.auth.me.query();
  } catch {
    redirect("/login?redirect=/dashboard/analytics");
  }

  return (
    <DashboardShell>
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <AnalyticsView />
      </div>
    </DashboardShell>
  );
}

