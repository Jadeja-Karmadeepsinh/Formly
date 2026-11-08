"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowUpDown,
  Check,
  LayoutGrid,
  List,
  Plus,
  RotateCw,
  Search,
  X,
} from "lucide-react";
import { type FormItem, useForms } from "~/hooks/api/form";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Skeleton } from "~/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
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

  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>(urlStatus || "all");
  const [sortBy, setSortBy] = React.useState<"updated" | "created" | "title-asc" | "title-desc">("updated");
  const [viewMode, setViewMode] = React.useState<"list" | "grid">("list");

  // Dialog & Sheet States
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
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

    // Sorting options: recently updated, newest created, title A-Z, title Z-A
    result.sort((a, b) => {
      if (sortBy === "title-asc") {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === "title-desc") {
        return b.title.localeCompare(a.title);
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

  const sortLabel = React.useMemo(() => {
    switch (sortBy) {
      case "updated":
        return "Recently updated";
      case "created":
        return "Recently created";
      case "title-asc":
        return "Name: A–Z";
      case "title-desc":
        return "Name: Z–A";
      default:
        return "Sort";
    }
  }, [sortBy]);

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
      {/* 1. Page Title & Primary CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight text-foreground">
            Overview
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground font-normal">
            Create and manage forms, collect submissions, and monitor activity.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Button
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="gap-2 rounded-lg text-xs font-semibold px-4 h-9 shadow-2xs active:scale-[0.98] transition-all cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="size-4" />
            <span>New form</span>
          </Button>
        </div>
      </div>

      {/* 2. Overview Metrics Command Rail */}
      <FormsMetrics
        forms={forms}
        isLoading={isLoading}
        onSelectStatus={(status) => setStatusFilter(status)}
        activeStatus={statusFilter}
      />

      {/* 3. Forms Workspace Directory Section */}
      <div className="space-y-4">
        {/* Section Controls Toolbar */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 pt-1">
          {/* Status Tabs Segmented Control */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none bg-muted/40 p-1 rounded-xl border border-border/70">
            {(["all", "published", "draft", "closed", "archived"] as const).map((status) => {
              const count = counts[status];
              const isSelected = statusFilter === status;
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize cursor-pointer shrink-0 ${
                    isSelected
                      ? "bg-background text-foreground shadow-2xs font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  <span>{status}</span>
                  <span
                    className={`inline-flex items-center justify-center rounded-full px-1.5 py-0.2 text-[10px] tabular-nums font-mono ${
                      isSelected
                        ? "bg-muted text-foreground font-semibold"
                        : "bg-muted/60 text-muted-foreground"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Toolbar Controls (Standardized Height: 36px / h-9) */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Search Input with Dedicated / Shortcut Badge */}
            <div className="relative flex-1 sm:w-64 min-w-[200px]">
              <Search className="absolute left-3 top-2.5 size-3.5 text-muted-foreground pointer-events-none" />
              <Input
                ref={searchInputRef}
                placeholder="Search forms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8.5 pr-8 h-9 text-xs rounded-xl bg-card border-border/80 shadow-2xs"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="size-3.5" />
                </button>
              ) : (
                <kbd className="absolute right-2.5 top-2.5 pointer-events-none hidden sm:inline-flex h-4 items-center justify-center rounded border border-border/70 bg-muted/40 px-1.5 text-[10px] font-mono text-muted-foreground">
                  /
                </kbd>
              )}
            </div>

            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 text-xs gap-1.5 rounded-xl border-border/80 text-muted-foreground hover:text-foreground px-3 cursor-pointer shadow-2xs shrink-0"
                  title="Sort forms"
                >
                  <ArrowUpDown className="size-3.5" />
                  <span className="hidden sm:inline font-medium text-foreground">
                    {sortLabel}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 text-xs p-1 rounded-xl shadow-md">
                <DropdownMenuItem
                  onClick={() => setSortBy("updated")}
                  className="gap-2 cursor-pointer py-1.5"
                >
                  {sortBy === "updated" && <Check className="size-3 text-primary" />}
                  <span className={sortBy === "updated" ? "font-semibold" : "pl-5"}>
                    Recently updated
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSortBy("created")}
                  className="gap-2 cursor-pointer py-1.5"
                >
                  {sortBy === "created" && <Check className="size-3 text-primary" />}
                  <span className={sortBy === "created" ? "font-semibold" : "pl-5"}>
                    Recently created
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSortBy("title-asc")}
                  className="gap-2 cursor-pointer py-1.5"
                >
                  {sortBy === "title-asc" && <Check className="size-3 text-primary" />}
                  <span className={sortBy === "title-asc" ? "font-semibold" : "pl-5"}>
                    Name: A–Z
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSortBy("title-desc")}
                  className="gap-2 cursor-pointer py-1.5"
                >
                  {sortBy === "title-desc" && <Check className="size-3 text-primary" />}
                  <span className={sortBy === "title-desc" ? "font-semibold" : "pl-5"}>
                    Name: Z–A
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* View Mode Segmented Switcher (List vs Grid) */}
            <TooltipProvider delayDuration={200}>
              <div className="flex items-center rounded-xl border border-border/80 bg-muted/30 p-0.5 h-9 shadow-2xs shrink-0">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => setViewMode("list")}
                      className={`h-7.5 w-7.5 flex items-center justify-center rounded-lg transition-all cursor-pointer ${
                        viewMode === "list"
                          ? "bg-background text-foreground shadow-2xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      aria-label="List view"
                    >
                      <List className="size-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    List view
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => setViewMode("grid")}
                      className={`h-7.5 w-7.5 flex items-center justify-center rounded-lg transition-all cursor-pointer ${
                        viewMode === "grid"
                          ? "bg-background text-foreground shadow-2xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      aria-label="Grid view"
                    >
                      <LayoutGrid className="size-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    Grid view
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>

            {/* Refresh Button with Tooltip */}
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => refetch()}
                    disabled={isFetching}
                    className="size-9 rounded-xl border-border/80 text-muted-foreground hover:text-foreground cursor-pointer shadow-2xs shrink-0"
                    aria-label="Refresh forms"
                  >
                    <RotateCw className={`size-3.5 ${isFetching ? "animate-spin text-primary" : ""}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  Refresh forms
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* 4. Form Directory Content Area */}
        {/* Loading State */}
        {isLoading && (
          <div className="space-y-3 pt-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 rounded-2xl border border-border/60 bg-card/60"
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
              <AlertCircle className="size-6" />
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
              className="gap-2 mt-2 text-xs rounded-xl cursor-pointer border-border/80"
            >
              <RotateCw className="size-3.5" />
              Try Again
            </Button>
          </div>
        )}

        {/* Empty State: Zero Total Forms in Workspace */}
        {!isLoading && !isError && forms.length === 0 && (
          <div className="rounded-2xl border border-border/70 bg-card/60 my-4">
            <EmptyFormsState
              onCreateForm={() => setIsCreateOpen(true)}
              onSelectStarter={() => {
                setIsCreateOpen(true);
              }}
            />
          </div>
        )}

        {/* Empty State: Filter / Search with 0 matches */}
        {!isLoading && !isError && forms.length > 0 && filteredForms.length === 0 && (
          <div className="rounded-2xl border border-border/70 bg-card/40 p-12 text-center my-4 space-y-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-muted mx-auto text-muted-foreground">
              <Search className="size-5" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">
              No matching forms found
            </h3>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              No forms match your current search &ldquo;{searchQuery}&rdquo; and status &ldquo;{statusFilter}&rdquo;.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
              }}
              className="text-xs rounded-xl mt-2 cursor-pointer border-border/70"
            >
              Clear Search & Filters
            </Button>
          </div>
        )}

        {/* Form List / Grid Content */}
        {!isLoading && !isError && filteredForms.length > 0 && (
          viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
              {filteredForms.map((form) => (
                <FormRow
                  key={form.id}
                  form={form}
                  viewMode="grid"
                  onEdit={(f) => setEditingForm(f)}
                  onDelete={(f) => setDeletingForm(f)}
                  onViewSubmissions={(f) => setSubmissionsForm(f)}
                />
              ))}
            </div>
          ) : (
            <div className="panel-highlight rounded-2xl border border-border/80 bg-card overflow-hidden shadow-2xs divide-y divide-border/60">
              {/* Table Column Header: Clean 12-Column Grid */}
              <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 bg-muted/20 border-b border-border/60 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground select-none">
                <div className="col-span-5">Form</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Visibility</div>
                <div className="col-span-2">Share Link</div>
                <div className="col-span-1 text-right">Actions</div>
              </div>
              <div className="divide-y divide-border/50">
                {filteredForms.map((form) => (
                  <FormRow
                    key={form.id}
                    form={form}
                    viewMode="list"
                    onEdit={(f) => setEditingForm(f)}
                    onDelete={(f) => setDeletingForm(f)}
                    onViewSubmissions={(f) => setSubmissionsForm(f)}
                  />
                ))}
              </div>
            </div>
          )
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
      />
    </div>
  );
}
