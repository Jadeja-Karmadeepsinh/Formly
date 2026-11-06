"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  Command,
  FilePenLine,
  Inbox,
  LayoutDashboard,
  LogOut,
  Moon,
  MoreVertical,
  Plus,
  Settings,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
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
import { Button } from "~/components/ui/button";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  onOpenCreateForm?: () => void;
  onOpenCommandPalette?: () => void;
}

export function AppSidebar({
  onOpenCreateForm,
  onOpenCommandPalette,
  ...props
}: AppSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentStatus = searchParams?.get("status");

  const { data: user } = useMe();
  const { forms } = useForms();
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);
  const { logout, isPending: isLoggingOut } = useLogout();

  const totalCount = forms?.length ?? 0;
  const publishedCount = forms?.filter((f) => f.status === "published").length ?? 0;
  const draftCount = forms?.filter((f) => f.status === "draft").length ?? 0;

  const initials = React.useMemo(() => {
    if (!user?.name) return "U";
    const parts = user.name.trim().split(/\s+/);
    if (parts.length >= 2 && parts[0]?.[0] && parts[1]?.[0]) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return user.name.slice(0, 2).toUpperCase() || "U";
  }, [user?.name]);

  const isOverviewActive = pathname === "/dashboard" && !currentStatus;
  const isResponsesActive = pathname.startsWith("/dashboard/responses");
  const isAnalyticsActive = pathname.startsWith("/dashboard/analytics");
  const isPublishedActive = pathname === "/dashboard" && currentStatus === "published";
  const isDraftsActive = pathname === "/dashboard" && currentStatus === "draft";
  const isSettingsActive = pathname.startsWith("/dashboard/settings");

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar" {...props}>
      {/* 1. Brand Header */}
      <SidebarHeader className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center justify-between gap-2 px-1.5 py-1">
              <Link
                href="/dashboard"
                className="flex items-center gap-2.5 transition-opacity hover:opacity-85"
                title="Formly Dashboard"
              >
                <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-foreground text-background">
                  <FormlySymbol size={16} />
                </div>
                <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                  <span className="text-sm font-semibold tracking-tight text-foreground leading-none">
                    Formly
                  </span>
                  <span className="text-[11px] text-muted-foreground mt-0.5">
                    Workspace
                  </span>
                </div>
              </Link>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* Quick New Form Button */}
        <div className="pt-2 px-1 group-data-[collapsible=icon]:hidden">
          <Button
            size="sm"
            onClick={onOpenCreateForm}
            className="w-full justify-between h-8.5 rounded-lg text-xs font-medium shadow-xs"
          >
            <span className="flex items-center gap-1.5">
              <Plus className="size-3.5" />
              <span>New Form</span>
            </span>
            <kbd className="inline-flex h-4 items-center rounded border border-primary-foreground/30 px-1 text-[10px] font-mono opacity-80">
              C
            </kbd>
          </Button>
        </div>
      </SidebarHeader>

      <SidebarSeparator className="mx-2 my-1" />

      {/* 2. Main Navigation Content */}
      <SidebarContent className="px-2">
        {/* Workspace Section */}
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
                {totalCount > 0 && (
                  <SidebarMenuBadge className="text-[11px] text-muted-foreground font-mono">
                    {totalCount}
                  </SidebarMenuBadge>
                )}
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

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isPublishedActive}
                  tooltip="Published Forms"
                  className="rounded-lg text-xs font-medium"
                >
                  <Link href="/dashboard?status=published">
                    <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span>Published</span>
                  </Link>
                </SidebarMenuButton>
                {publishedCount > 0 && (
                  <SidebarMenuBadge className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
                    {publishedCount}
                  </SidebarMenuBadge>
                )}
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isDraftsActive}
                  tooltip="Draft Forms"
                  className="rounded-lg text-xs font-medium"
                >
                  <Link href="/dashboard?status=draft">
                    <FilePenLine className="size-4 shrink-0" />
                    <span>Drafts</span>
                  </Link>
                </SidebarMenuButton>
                {draftCount > 0 && (
                  <SidebarMenuBadge className="text-[11px] text-muted-foreground font-mono">
                    {draftCount}
                  </SidebarMenuBadge>
                )}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-2 mx-1" />

        {/* Preferences & Help */}
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
                  tooltip="Account & Security"
                  className="rounded-lg text-xs font-medium"
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
                  className="rounded-lg text-xs font-medium"
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
                  tooltip="Command Palette"
                  className="rounded-lg text-xs font-medium cursor-pointer"
                >
                  <Command className="size-4 shrink-0" />
                  <span>Command Menu</span>
                  <kbd className="ml-auto inline-flex h-4 items-center rounded border border-sidebar-border px-1 text-[10px] font-mono text-muted-foreground group-data-[collapsible=icon]:hidden">
                    ⌘K
                  </kbd>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* 3. Footer: Theme Toggle & User Menu */}
      <SidebarFooter className="p-2 border-t border-sidebar-border gap-1.5">
        {/* Subtle Theme Toggle Row */}
        <div className="flex items-center justify-between px-2 py-1 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
          <span className="text-[11px]">Theme</span>
          <button
            type="button"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs text-foreground transition-colors hover:bg-sidebar-accent cursor-pointer"
            title="Toggle theme"
          >
            {mounted && resolvedTheme === "dark" ? (
              <>
                <Sun className="size-3.5 text-amber-400" />
                <span className="text-[11px]">Light</span>
              </>
            ) : (
              <>
                <Moon className="size-3.5 text-muted-foreground" />
                <span className="text-[11px]">Dark</span>
              </>
            )}
          </button>
        </div>

        {/* User Card with Real Data */}
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="rounded-lg p-1.5 hover:bg-sidebar-accent transition-colors"
                >
                  <Avatar className="size-8 rounded-lg shrink-0 border border-sidebar-border">
                    {user?.image ? (
                      <AvatarImage src={user.image} alt={user.name ?? "User"} />
                    ) : null}
                    <AvatarFallback className="rounded-lg bg-muted text-xs font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-xs leading-tight min-w-0 group-data-[collapsible=icon]:hidden">
                    <span className="truncate font-semibold text-foreground">
                      {user?.name || "Gemini"}
                    </span>
                    <span className="truncate text-[11px] text-muted-foreground">
                      {user?.email || "Signed In"}
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
                      {user?.name || "Gemini"}
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
                <DropdownMenuItem
                  onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                  className="gap-2 cursor-pointer text-xs rounded-lg py-1.5"
                >
                  {resolvedTheme === "dark" ? (
                    <>
                      <Sun className="size-3.5" />
                      <span>Light Theme</span>
                    </>
                  ) : (
                    <>
                      <Moon className="size-3.5" />
                      <span>Dark Theme</span>
                    </>
                  )}
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
