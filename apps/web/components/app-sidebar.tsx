"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  Command,
  Inbox,
  LayoutDashboard,
  LogOut,
  MoreVertical,
  Settings,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "~/components/ui/sidebar";
import { FormlySymbol } from "~/components/formly-logo";
import { useLogout, useMe } from "~/hooks/api/auth";
import { useForms } from "~/hooks/api/form";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  onOpenCommandPalette?: () => void;
}

export function AppSidebar({
  onOpenCommandPalette,
  ...props
}: AppSidebarProps) {
  const pathname = usePathname();
  const { data: user } = useMe();
  const { forms } = useForms();
  const { logout, isPending: isLoggingOut } = useLogout();

  const totalCount = forms?.length ?? 0;
  const recentForms = React.useMemo(() => {
    return (forms || []).slice(0, 5);
  }, [forms]);

  // Dynamic user initials (e.g. Karmadeepsinh Jadeja -> KJ)
  const initials = React.useMemo(() => {
    const name = user?.fullName || user?.name;
    if (!name) {
      if (user?.email) return user.email.slice(0, 2).toUpperCase();
      return "KJ";
    }
    const parts = name.trim().split(/\s+/);
    const first = parts[0];
    const last = parts[parts.length - 1];
    if (parts.length >= 2 && first && last && first[0] && last[0]) {
      return `${first[0]}${last[0]}`.toUpperCase();
    }
    if (name.length >= 2) {
      return name.slice(0, 2).toUpperCase();
    }
    return name.toUpperCase() || "KJ";
  }, [user?.fullName, user?.name, user?.email]);

  const isOverviewActive = pathname === "/dashboard";
  const isResponsesActive = pathname.startsWith("/dashboard/responses");
  const isAnalyticsActive = pathname.startsWith("/dashboard/analytics");
  const isSettingsActive = pathname.startsWith("/dashboard/settings");

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-sidebar-border bg-sidebar overflow-x-hidden flex flex-col h-screen"
      {...props}
    >
      {/* ========================================================= */}
      {/* Zone A — Fixed Top: Brand & Workspace Identity           */}
      {/* ========================================================= */}
      <SidebarHeader className="p-3 shrink-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center justify-between gap-2 px-1.5 py-1">
              <Link
                href="/dashboard"
                className="flex items-center gap-2.5 transition-opacity hover:opacity-85"
                title="Formly Dashboard"
              >
                <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-foreground text-background shadow-xs">
                  <FormlySymbol size={16} />
                </div>
                <div className="flex flex-col group-data-[collapsible=icon]:hidden min-w-0">
                  <span className="text-sm font-semibold tracking-tight text-foreground leading-none">
                    Formly
                  </span>
                  <span className="text-[11px] text-muted-foreground mt-0.5 truncate">
                    Personal Studio
                  </span>
                </div>
              </Link>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator className="mx-2 my-1 shrink-0" />

      {/* ========================================================= */}
      {/* Zone B — Scrollable Navigation Region                    */}
      {/* ========================================================= */}
      <SidebarContent className="px-2 flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin">
        {/* Workspace Primary Navigation */}
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="text-[11px] font-medium text-muted-foreground/80 px-2 py-1.5 uppercase tracking-wider">
            Workspace
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isOverviewActive}
                  tooltip="Overview"
                  className="rounded-lg text-xs font-medium"
                >
                  <Link href="/dashboard">
                    <LayoutDashboard className="size-4 shrink-0" />
                    <span>Overview</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isResponsesActive}
                  tooltip="Responses"
                  className="rounded-lg text-xs font-medium"
                >
                  <Link href="/dashboard/responses">
                    <Inbox className="size-4 shrink-0" />
                    <span>Responses</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isAnalyticsActive}
                  tooltip="Analytics"
                  className="rounded-lg text-xs font-medium"
                >
                  <Link href="/dashboard/analytics">
                    <BarChart3 className="size-4 shrink-0" />
                    <span>Analytics</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Recent Forms Shelf (Showing up to 5 items, matching count badge) */}
        {recentForms.length > 0 && (
          <SidebarGroup className="p-0 mt-3">
            <SidebarGroupLabel className="text-[11px] font-medium text-muted-foreground/80 px-2 py-1.5 uppercase tracking-wider flex items-center justify-between">
              <span>Recent Forms</span>
              <span className="text-[10px] font-mono text-muted-foreground/70">{recentForms.length}</span>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                <TooltipProvider delayDuration={300}>
                  {recentForms.map((f) => {
                    const isFormActive = pathname === `/dashboard/forms/${f.id}`;
                    return (
                      <SidebarMenuItem key={f.id}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <SidebarMenuButton
                              asChild
                              isActive={isFormActive}
                              className="rounded-lg text-xs font-normal h-7.5"
                            >
                              <Link
                                href={`/dashboard/forms/${f.id}`}
                                className="flex items-center gap-2 min-w-0"
                              >
                                <span
                                  className={`size-1.5 rounded-full shrink-0 ${
                                    f.status === "published"
                                      ? "bg-emerald-500"
                                      : "bg-muted-foreground/40"
                                  }`}
                                  aria-label={`Status: ${f.status}`}
                                />
                                <span className="truncate flex-1 min-w-0">{f.title}</span>
                              </Link>
                            </SidebarMenuButton>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="text-xs max-w-xs font-normal">
                            <p className="font-semibold text-foreground">{f.title}</p>
                            <p className="text-[11px] text-muted-foreground capitalize mt-0.5">
                              Status: {f.status} · {f.visibility}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </SidebarMenuItem>
                    );
                  })}
                </TooltipProvider>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarSeparator className="my-2 mx-1" />

        {/* Preferences Group */}
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="text-[11px] font-medium text-muted-foreground/80 px-2 py-1.5 uppercase tracking-wider">
            Preferences
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isSettingsActive}
                  tooltip="Settings"
                  className="rounded-lg text-xs font-medium"
                >
                  <Link href="/dashboard/settings/account">
                    <Settings className="size-4 shrink-0" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Help Group */}
        <SidebarGroup className="p-0 mt-2">
          <SidebarGroupLabel className="text-[11px] font-medium text-muted-foreground/80 px-2 py-1.5 uppercase tracking-wider">
            Help
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Documentation"
                  className="rounded-lg text-xs font-medium"
                >
                  <Link href="/docs" target="_blank">
                    <BookOpen className="size-4 shrink-0" />
                    <span>Documentation</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Global Command Menu Entry (No duplicate shortcut badge) */}
        <SidebarGroup className="p-0 mt-2">
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={onOpenCommandPalette}
                  tooltip="Open Command Menu"
                  className="rounded-lg text-xs font-medium cursor-pointer text-muted-foreground hover:text-foreground"
                >
                  <Command className="size-4 shrink-0" />
                  <span>Command Menu</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ========================================================= */}
      {/* Zone C — Fixed Bottom: Plan Meter & User Profile         */}
      {/* ========================================================= */}
      <SidebarFooter className="p-2.5 border-t border-sidebar-border gap-2 shrink-0 bg-sidebar">
        {/* Workspace Capacity Meter */}
        <div className="mx-0.5 px-3 py-2.5 rounded-xl bg-muted/25 border border-sidebar-border/70 text-xs space-y-1.5 group-data-[collapsible=icon]:hidden shadow-2xs">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="font-medium text-foreground">Workspace Plan</span>
            <span className="font-mono text-[10px] font-medium">{totalCount} / 10 Forms</span>
          </div>
          <div className="w-full h-1 bg-muted/70 rounded-full overflow-hidden">
            <div
              className="h-full bg-foreground rounded-full transition-all duration-500"
              style={{ width: `${Math.min((totalCount / 10) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Subtle separator between Plan meter and User profile */}
        <div className="h-px bg-sidebar-border/50 mx-1 group-data-[collapsible=icon]:hidden" />

        {/* User Card with Dynamic Initials and Clean Single-Line Email */}
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="rounded-xl p-1.5 hover:bg-sidebar-accent transition-colors cursor-pointer"
                >
                  <Avatar className="size-8 rounded-lg shrink-0 border border-sidebar-border">
                    {user?.image ? (
                      <AvatarImage src={user.image} alt={user.name || user.fullName || "User"} />
                    ) : null}
                    <AvatarFallback className="rounded-lg bg-muted text-xs font-semibold text-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-xs leading-tight min-w-0 group-data-[collapsible=icon]:hidden">
                    <span className="truncate font-semibold text-foreground">
                      {user?.name || user?.fullName || "Karmadeepsinh Jadeja"}
                    </span>
                    <span className="truncate text-[11px] text-muted-foreground" title={user?.email || ""}>
                      {user?.email || "karmadeepsinh@example.com"}
                    </span>
                  </div>
                  <MoreVertical className="ml-auto size-3.5 text-muted-foreground group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 rounded-xl p-1.5 shadow-lg border border-border"
                side="right"
                align="end"
                sideOffset={8}
              >
                <DropdownMenuLabel className="p-2 font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-xs font-semibold leading-none text-foreground truncate">
                      {user?.name || user?.fullName || "Karmadeepsinh Jadeja"}
                    </p>
                    <p className="text-[11px] leading-none text-muted-foreground truncate">
                      {user?.email || ""}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="gap-2 cursor-pointer text-xs rounded-lg py-1.5">
                  <Link href="/dashboard/settings/account">
                    <Settings className="size-3.5" />
                    <span>Account Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => logout()}
                  disabled={isLoggingOut}
                  className="gap-2 cursor-pointer text-xs text-destructive focus:text-destructive rounded-lg py-1.5"
                >
                  <LogOut className="size-3.5" />
                  <span>{isLoggingOut ? "Signing out..." : "Sign Out"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
