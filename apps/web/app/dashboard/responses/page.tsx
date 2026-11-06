import { redirect } from "next/navigation";
import { createServerTRPCClient } from "~/trpc/server";
import { DashboardShell } from "~/components/dashboard-shell";
import { ResponsesView } from "~/components/responses";

export const metadata = {
  title: "Responses — Formly",
  description: "Search, filter, inspect, and export respondent submissions across your forms.",
};

export default async function ResponsesPage() {
  const serverTrpc = await createServerTRPCClient();

  try {
    await serverTrpc.auth.me.query();
  } catch {
    redirect("/login?redirect=/dashboard/responses");
  }

  return (
    <DashboardShell>
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <ResponsesView />
      </div>
    </DashboardShell>
  );
}

