"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import {
  IconAlertCircle,
  IconArrowsSort,
  IconCheck,
  IconLayoutGrid,
  IconLayoutList,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconX,
} from "@tabler/icons-react";
import { type FormItem, useForms } from "~/hooks/api/form";
import { useMe } from "~/hooks/api/auth";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Skeleton } from "~/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { FormsMetrics } from "./forms-metrics";
import { FormRow } from "./form-row";
import { FormSubmissionsSheet } from "./form-submissions-sheet";
import { EmptyFormsState } from "./empty-forms-state";
import { CreateFormDialog } from "./create-form-dialog";
import { EditFormDialog } from "./edit-form-dialog";
import { DeleteFormDialog } from "./delete-form-dialog";

export function FormsDashboard() {
  const searchParams = useSearchParams();
  const urlStatus = searchParams?.get("status");

  const { forms, isLoading, isError, error, refetch, isFetching } = useForms();
  const { data: user } = useMe();

  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>(urlStatus || "all");
  const [sortBy, setSortBy] = React.useState<"updated" | "title" | "created">("updated");
  const [viewMode, setViewMode] = React.useState<"list" | "grid">("list");

  // Dialog & Sheet States
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [starterTitle, setStarterTitle] = React.useState("");
  const [starterDescription, setStarterDescription] = React.useState("");

  const [submissionsForm, setSubmissionsForm] = React.useState<FormItem | null>(null);
  const [editingForm, setEditingForm] = React.useState<FormItem | null>(null);
  const [deletingForm, setDeletingForm] = React.useState<FormItem | null>(null);

  // Sync status filter from URL if changed
  React.useEffect(() => {
    if (urlStatus && ["all", "published", "draft", "closed", "archived"].includes(urlStatus)) {
      setStatusFilter(urlStatus);
    }
  }, [urlStatus]);

  // Keyboard shortcut "/" to focus search input
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Time-of-day personalized greeting
  const greeting = React.useMemo(() => {
    const hour = new Date().getHours();
    let timeGreet = "Good morning";
    if (hour >= 12 && hour < 17) timeGreet = "Good afternoon";
    else if (hour >= 17) timeGreet = "Good evening";

    const name = user?.name ? user.name.trim().split(/\s+/)[0] : "there";
    return `${timeGreet}, ${name}`;
  }, [user?.name]);

  // Counts for filter pills
  const counts = React.useMemo(() => {
    const total = forms.length;
    const published = forms.filter((f) => f.status === "published").length;
    const draft = forms.filter((f) => f.status === "draft").length;
    const closed = forms.filter((f) => f.status === "closed").length;
    const archived = forms.filter((f) => f.status === "archived").length;
    return { all: total, published, draft, closed, archived };
  }, [forms]);

  // Filtered and sorted forms
  const filteredForms = React.useMemo(() => {
    const result = forms.filter((form) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        form.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (form.description &&
          form.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === "all" || form.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === "created") {
        const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return db - da;
      }
      // default: updated
      const da = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const db = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return db - da;
    });

    return result;
  }, [forms, searchQuery, statusFilter, sortBy]);

  const handleSelectStarter = (title: string, description: string) => {
    setStarterTitle(title);
    setStarterDescription(description);
    setIsCreateOpen(true);
  };

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
      {/* 1. Executive Welcome & Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {greeting}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Here is an overview of your forms, response activity, and public links.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            onClick={() => {
              setStarterTitle("");
              setStarterDescription("");
              setIsCreateOpen(true);
            }}
            className="gap-2 rounded-xl text-xs font-medium px-4 h-9 shadow-xs"
          >
            <IconPlus className="size-4" />
            <span>Create Form</span>
            <kbd className="hidden sm:inline-flex h-4 items-center rounded border border-primary-foreground/30 px-1 text-[10px] font-mono opacity-80">
              C
            </kbd>
          </Button>
        </div>
      </div>

      {/* 2. Overview Metrics Bar */}
      <FormsMetrics forms={forms} isLoading={isLoading} />

      {/* 3. Forms Workspace Section */}
      <div className="space-y-4">
        {/* Section Header with Controls */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 pt-2">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {(["all", "published", "draft", "closed", "archived"] as const).map((status) => {
              const count = counts[status];
              const isSelected = statusFilter === status;
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize cursor-pointer shrink-0 ${
                    isSelected
                      ? "bg-foreground text-background shadow-2xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }`}
                >
                  <span>{status}</span>
                  <span
                    className={`inline-flex items-center justify-center rounded-full px-1.5 text-[10px] tabular-nums font-mono ${
                      isSelected
                        ? "bg-background/20 text-background"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Controls: Search, Sort & View Mode */}
          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <IconSearch className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground pointer-events-none" />
              <Input
                ref={searchInputRef}
                placeholder="Filter by title... (/)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-7 h-8.5 text-xs rounded-lg bg-card/80 border-border/60"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  <IconX className="size-3.5" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8.5 text-xs gap-1.5 rounded-lg border-border/60 text-muted-foreground hover:text-foreground px-2.5"
                  title="Sort forms"
                >
                  <IconArrowsSort className="size-3.5" />
                  <span className="hidden sm:inline">
                    {sortBy === "updated"
                      ? "Recent"
                      : sortBy === "title"
                      ? "A-Z"
                      : "Newest"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36 text-xs p-1 rounded-xl">
                <DropdownMenuItem
                  onClick={() => setSortBy("updated")}
                  className="gap-2 cursor-pointer py-1.5"
                >
                  {sortBy === "updated" && <IconCheck className="size-3 text-primary" />}
                  <span className={sortBy === "updated" ? "font-medium" : "pl-5"}>
                    Recently Updated
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSortBy("title")}
                  className="gap-2 cursor-pointer py-1.5"
                >
                  {sortBy === "title" && <IconCheck className="size-3 text-primary" />}
                  <span className={sortBy === "title" ? "font-medium" : "pl-5"}>
                    Title (A to Z)
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSortBy("created")}
                  className="gap-2 cursor-pointer py-1.5"
                >
                  {sortBy === "created" && <IconCheck className="size-3 text-primary" />}
                  <span className={sortBy === "created" ? "font-medium" : "pl-5"}>
                    Newest Created
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* View Mode Toggle (List vs Grid) */}
            <div className="flex items-center rounded-lg border border-border/60 bg-muted/20 p-0.5">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  viewMode === "list"
                    ? "bg-background text-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="List View"
              >
                <IconLayoutList className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-background text-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Grid View"
              >
                <IconLayoutGrid className="size-3.5" />
              </button>
            </div>

            {/* Refresh */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => refetch()}
              disabled={isFetching}
              className="size-8.5 rounded-lg border-border/60 text-muted-foreground hover:text-foreground"
              title="Refresh forms"
            >
              <IconRefresh className={`size-3.5 ${isFetching ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {/* 4. Content Area */}
        {/* Loading State */}
        {isLoading && (
          <div className="space-y-3 pt-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 rounded-xl border border-border/40 bg-card/40"
              >
                <div className="space-y-2">
                  <Skeleton className="h-4.5 w-48" />
                  <Skeleton className="h-3.5 w-72" />
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-6 w-18 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!isLoading && isError && (
          <div className="p-8 rounded-2xl border border-destructive/20 bg-destructive/5 flex flex-col items-center justify-center gap-3 text-center my-6">
            <div className="rounded-full bg-destructive/10 p-3 text-destructive">
              <IconAlertCircle className="size-6" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">
              Failed to load forms
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              {error?.message || "An unexpected error occurred while fetching your forms."}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="gap-2 mt-2 text-xs rounded-lg"
            >
              <IconRefresh className="size-3.5" />
              Try Again
            </Button>
          </div>
        )}

        {/* Empty State: Zero Total Forms */}
        {!isLoading && !isError && forms.length === 0 && (
          <div className="rounded-2xl border border-border/60 bg-card/40 my-4">
            <EmptyFormsState
              onCreateForm={() => {
                setStarterTitle("");
                setStarterDescription("");
                setIsCreateOpen(true);
              }}
              onSelectStarter={handleSelectStarter}
            />
          </div>
        )}

        {/* Empty State: Filter / Search with 0 matches */}
        {!isLoading && !isError && forms.length > 0 && filteredForms.length === 0 && (
          <div className="rounded-2xl border border-border/60 bg-card/40 p-12 text-center my-4 space-y-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-muted mx-auto text-muted-foreground">
              <IconSearch className="size-5" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">
              No matching forms found
            </h3>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              No forms match your current search &ldquo;{searchQuery}&rdquo; and filter &ldquo;{statusFilter}&rdquo;.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
              }}
              className="text-xs rounded-lg mt-2"
            >
              Clear Search & Filters
            </Button>
          </div>
        )}

        {/* Form List / Grid Content */}
        {!isLoading && !isError && filteredForms.length > 0 && (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1"
                : "flex flex-col gap-2.5 pt-1"
            }
          >
            {filteredForms.map((form) => (
              <FormRow
                key={form.id}
                form={form}
                viewMode={viewMode}
                onEdit={(f) => setEditingForm(f)}
                onDelete={(f) => setDeletingForm(f)}
                onViewSubmissions={(f) => setSubmissionsForm(f)}
              />
            ))}
          </div>
        )}
      </div>

      {/* 5. Modals & Sheets */}
      {/* Submissions Slide-out Inspector */}
      <FormSubmissionsSheet
        form={submissionsForm}
        open={Boolean(submissionsForm)}
        onOpenChange={(open) => {
          if (!open) setSubmissionsForm(null);
        }}
      />

      {/* Edit Form Dialog */}
      <EditFormDialog
        form={editingForm}
        open={Boolean(editingForm)}
        onOpenChange={(open) => {
          if (!open) setEditingForm(null);
        }}
      />

      {/* Delete Form Dialog */}
      <DeleteFormDialog
        form={deletingForm}
        open={Boolean(deletingForm)}
        onOpenChange={(open) => {
          if (!open) setDeletingForm(null);
        }}
      />

      {/* Create Form Dialog */}
      <CreateFormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        initialTitle={starterTitle}
        initialDescription={starterDescription}
      />
    </div>
  );
}
