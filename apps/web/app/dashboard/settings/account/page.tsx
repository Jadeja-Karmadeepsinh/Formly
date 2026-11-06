import { redirect } from "next/navigation";
import { createServerTRPCClient } from "~/trpc/server";
import { DashboardShell } from "~/components/dashboard-shell";
import { AccountSettingsForm } from "~/components/account-settings-form";

export const metadata = {
  title: "Account Settings — Formly",
  description: "Manage your profile, linked accounts, and session security.",
};

export default async function AccountSettingsPage() {
  const serverTrpc = await createServerTRPCClient();

  let user;
  try {
    user = await serverTrpc.auth.me.query();
  } catch {
    redirect("/login?redirect=/dashboard/settings/account");
  }

  return (
    <DashboardShell>
      <div className="flex flex-1 flex-col p-4 sm:p-6 lg:p-8 max-w-5xl w-full mx-auto">
        <div className="flex flex-col gap-6">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Account & Security
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Manage your credentials, link social logins, and review active sessions.
            </p>
          </div>

          <AccountSettingsForm user={user} />
        </div>
      </div>
    </DashboardShell>
  );
}
