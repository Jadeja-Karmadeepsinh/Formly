"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Command,
  Inbox,
  LayoutDashboard,
  LogOut,
  MoreVertical,
  Settings,
  BarChart3,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";
import { FormlySymbol } from "~/components/formly-logo";
import { useLogout, useMe } from "~/hooks/api/auth";
import { useForms } from "~/hooks/api/form";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  onOpenCommandPalette?: () => void;
}

export function AppSidebar({
  onOpenCommandPalette,
  ...props
}: AppSidebarProps) {
  const pathname = usePathname();
  const { data: user } = useMe();
  const { logout, isPending: isLoggingOut } = useLogout();

  // Fetch recent forms for the sidebar quick shelf (limit 5)
  const { forms } = useForms();
  const recentForms = React.useMemo(() => {
    return forms.slice(0, 5);
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
      className="border-r border-border/80 bg-sidebar overflow-x-hidden flex flex-col h-svh"
      {...props}
    >
      {/* ========================================================= */}
      {/* Zone A — Fixed Top: Brand & Workspace Identity           */}
      {/* Exactly 64px (h-16) to align with TopNavbar              */}
      {/* ========================================================= */}
      <SidebarHeader className="h-16 shrink-0 flex items-center justify-between px-3 border-b border-border/80 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center justify-between gap-2 px-1.5 py-1 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center">
              <Link
                href="/dashboard"
                className="flex items-center gap-2.5 transition-opacity hover:opacity-85 group-data-[collapsible=icon]:gap-0"
                title="Formly Dashboard"
              >
                <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-foreground text-background shadow-xs mx-auto">
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

      {/* ========================================================= */}
      {/* Zone B — Scrollable Navigation Region                    */}
      {/* ========================================================= */}
      <SidebarContent className="px-2 pt-3 group-data-[collapsible=icon]:px-1 group-data-[collapsible=icon]:pt-3 flex-1 flex flex-col overflow-y-auto overflow-x-hidden scrollbar-none">
        {/* Workspace Primary Navigation */}
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="text-[11px] font-medium text-muted-foreground/80 px-2 py-1.5 uppercase tracking-wider group-data-[collapsible=icon]:hidden">
            Workspace
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isOverviewActive}
                  tooltip="Overview"
                  className="rounded-lg text-xs font-medium group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:mx-auto"
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
                  className="rounded-lg text-xs font-medium group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:mx-auto"
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
                  className="rounded-lg text-xs font-medium group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:mx-auto"
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

        {/* Recent Forms Shelf (Only visible when sidebar is expanded) */}
        {recentForms.length > 0 && (
          <SidebarGroup className="p-0 mt-3 group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel className="text-[11px] font-medium text-muted-foreground/80 px-2 py-1.5 uppercase tracking-wider flex items-center justify-between">
              <span>Recent Forms</span>
              <span className="text-[10px] font-mono tabular-nums opacity-60">
                {recentForms.length}
              </span>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {recentForms.map((form) => {
                  const isFormActive = pathname === `/dashboard/forms/${form.id}`;
                  const isLive = form.status === "published";

                  return (
                    <SidebarMenuItem key={form.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton
                            asChild
                            isActive={isFormActive}
                            className="rounded-lg text-xs font-normal text-muted-foreground hover:text-foreground h-8 px-2"
                          >
                            <Link
                              href={`/dashboard/forms/${form.id}`}
                              className="flex items-center gap-2 min-w-0"
                            >
                              <span
                                className={`size-1.5 rounded-full shrink-0 ${
                                  isLive ? "bg-emerald-500" : "bg-muted-foreground/40"
                                }`}
                              />
                              <span className="truncate">{form.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent
                          side="right"
                          align="center"
                          className="text-xs max-w-xs"
                        >
                          <p className="font-semibold text-foreground">{form.title}</p>
                          <p className="text-[10px] text-muted-foreground capitalize mt-0.5">
                            Status: {form.status}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* ========================================================= */}
        {/* Zone B3 — Consolidated Bottom Utilities (Anchored mt-auto) */}
        {/* Settings, Documentation, and Command Menu in one group     */}
        {/* ========================================================= */}
        <div className="mt-auto shrink-0 pt-2 pb-1">
          <SidebarSeparator className="my-2 mx-1 border-border/60 group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:w-8" />
          <SidebarGroup className="p-0">
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isSettingsActive}
                    tooltip="Settings"
                    className="rounded-lg text-xs font-medium group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:mx-auto"
                  >
                    <Link href="/dashboard/settings/account">
                      <Settings className="size-4 shrink-0" />
                      <span>Settings</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    tooltip="Documentation"
                    className="rounded-lg text-xs font-medium group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:mx-auto"
                  >
                    <Link href="/docs" target="_blank">
                      <BookOpen className="size-4 shrink-0" />
                      <span>Documentation</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={onOpenCommandPalette}
                    tooltip="Command Menu"
                    className="rounded-lg text-xs font-medium cursor-pointer text-muted-foreground hover:text-foreground group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:mx-auto"
                  >
                    <Command className="size-4 shrink-0" />
                    <span>Command Menu</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </SidebarContent>

      {/* ========================================================= */}
      {/* Zone C — Fixed Bottom: User Profile Menu                 */}
      {/* ========================================================= */}
      <SidebarFooter className="p-2 pb-3 border-t border-border/80 shrink-0 bg-sidebar group-data-[collapsible=icon]:p-1.5 group-data-[collapsible=icon]:pb-3">
        {/* User Card with Dynamic Initials and Clean Single-Line Email */}
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  tooltip={user?.name || user?.fullName || "User Account"}
                  className="rounded-xl p-1.5 hover:bg-sidebar-accent transition-colors cursor-pointer group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:mx-auto"
                >
                  <Avatar className="size-8 rounded-lg shrink-0 border border-sidebar-border">
                    {user?.image ? (
                      <AvatarImage src={user.image} alt={user?.name || user?.fullName || "User"} />
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
