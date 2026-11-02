import { redirect } from "next/navigation";
import { createServerTRPCClient } from "~/trpc/server";
import { AppSidebar } from "~/components/app-sidebar";
import { SiteHeader } from "~/components/site-header";
import {
  SidebarInset,
  SidebarProvider,
} from "~/components/ui/sidebar";
import { FormsDashboard } from "~/components/forms";

export default async function Page() {
  const serverTrpc = await createServerTRPCClient();

  try {
    await serverTrpc.auth.me.query();
  } catch {
    redirect("/login?redirect=/dashboard");
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
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <FormsDashboard />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
