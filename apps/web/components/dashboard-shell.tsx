"use client";

import * as React from "react";
import { AppSidebar } from "~/components/app-sidebar";
import { SiteHeader } from "~/components/site-header";
import { CommandMenu } from "~/components/command-menu";
import { CreateFormDialog } from "~/components/forms/create-form-dialog";
import {
  SidebarInset,
  SidebarProvider,
} from "~/components/ui/sidebar";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [isCommandOpen, setIsCommandOpen] = React.useState(false);

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "15.5rem",
          "--sidebar-width-icon": "3.5rem",
          "--header-height": "4rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar
        variant="sidebar"
        onOpenCommandPalette={() => setIsCommandOpen(true)}
      />
      <SidebarInset className="bg-background min-h-screen flex flex-col min-w-0">
        <SiteHeader
          onOpenCommandPalette={() => setIsCommandOpen(true)}
        />
        <div className="flex-1 flex flex-col">{children}</div>
      </SidebarInset>

      {/* Global Command Menu (⌘K) */}
      <CommandMenu
        open={isCommandOpen}
        onOpenChange={setIsCommandOpen}
        onOpenCreateForm={() => {
          setIsCommandOpen(false);
          setIsCreateOpen(true);
        }}
      />

      {/* Global Create Form Dialog */}
      <CreateFormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />
    </SidebarProvider>
  );
}
