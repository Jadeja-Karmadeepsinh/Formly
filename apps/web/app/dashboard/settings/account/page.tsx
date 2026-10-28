import { redirect } from "next/navigation";
import { createServerTRPCClient } from "~/trpc/server";
import { AppSidebar } from "~/components/app-sidebar";
import { SiteHeader } from "~/components/site-header";
import {
  SidebarInset,
  SidebarProvider,
} from "~/components/ui/sidebar";
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
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col p-4 md:p-6 lg:p-8">
          <div className="flex flex-col gap-6">
            <div className="space-y-0.5">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Account & Security
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage your credentials, link social logins, and review active sessions.
              </p>
            </div>

            <AccountSettingsForm user={user} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

