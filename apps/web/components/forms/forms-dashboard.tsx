"use client";

import * as React from "react";
import {
  IconAlertCircle,
  IconCheck,
  IconCopy,
  IconDotsVertical,
  IconEdit,
  IconFileText,
  IconGlobe,
  IconLock,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconTrash,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { type FormItem, useForms } from "~/hooks/api/form";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import { Input } from "~/components/ui/input";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { CreateFormDialog } from "./create-form-dialog";
import { EditFormDialog } from "./edit-form-dialog";
import { DeleteFormDialog } from "./delete-form-dialog";

export function FormsDashboard() {
  const { forms, isLoading, isError, error, refetch, isFetching } = useForms();

  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [copiedShareId, setCopiedShareId] = React.useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [editingForm, setEditingForm] = React.useState<FormItem | null>(null);
  const [deletingForm, setDeletingForm] = React.useState<FormItem | null>(null);

  // Filtered forms based on search and status
  const filteredForms = React.useMemo(() => {
    return forms.filter((form) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        form.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (form.description &&
          form.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === "all" || form.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [forms, searchQuery, statusFilter]);

  // Metrics calculation
  const totalCount = forms.length;
  const publishedCount = forms.filter((f) => f.status === "published").length;
  const draftCount = forms.filter((f) => f.status === "draft").length;
  const publicCount = forms.filter((f) => f.visibility === "public").length;

  const handleCopyLink = async (shareId: string) => {
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const shareUrl = `${origin}/f/${shareId}`;
      await navigator.clipboard.writeText(shareUrl);
      setCopiedShareId(shareId);
      toast.success("Share link copied to clipboard");
      setTimeout(() => setCopiedShareId(null), 2000);
    } catch {
      toast.error("Failed to copy link to clipboard");
    }
  };

  const getStatusBadge = (status: FormItem["status"]) => {
    switch (status) {
      case "published":
        return (
          <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 font-medium">
            <span className="size-1.5 rounded-full bg-white animate-pulse" />
            Published
          </Badge>
        );
      case "draft":
        return <Badge variant="secondary">Draft</Badge>;
      case "closed":
        return <Badge variant="outline" className="text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-800">Closed</Badge>;
      case "archived":
        return <Badge variant="outline" className="text-muted-foreground">Archived</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-6 py-4 md:py-6">
      {/* 1. Dynamic Stats Cards */}
      <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Total Forms</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {isLoading ? <Skeleton className="h-8 w-16" /> : totalCount}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">All</Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="text-xs text-muted-foreground">
            Total active forms created by you
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Published Forms</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums text-emerald-600 dark:text-emerald-400 @[250px]/card:text-3xl">
              {isLoading ? <Skeleton className="h-8 w-16" /> : publishedCount}
            </CardTitle>
            <CardAction>
              <Badge variant="outline" className="border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400">
                Live
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="text-xs text-muted-foreground">
            Forms currently open for responses
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Draft Forms</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {isLoading ? <Skeleton className="h-8 w-16" /> : draftCount}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">In Progress</Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="text-xs text-muted-foreground">
            Unpublished forms in preparation
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Public Forms</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {isLoading ? <Skeleton className="h-8 w-16" /> : publicCount}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">Public</Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="text-xs text-muted-foreground">
            Forms discoverable and public
          </CardFooter>
        </Card>
      </div>

      {/* 2. Main Forms List Section */}
      <div className="px-4 lg:px-6">
        <Card className="overflow-hidden border">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
            <div>
              <CardTitle className="text-xl font-bold tracking-tight">Forms</CardTitle>
              <CardDescription>
                Create, customize, and manage your forms and share links.
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isFetching}
                className="gap-1.5"
              >
                <IconRefresh className={`size-4 ${isFetching ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>

              <CreateFormDialog
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                trigger={
                  <Button size="sm" className="gap-2">
                    <IconPlus className="size-4" />
                    <span>Create Form</span>
                  </Button>
                }
              />
            </div>
          </CardHeader>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-6 py-3 border-y bg-muted/20">
            <div className="relative flex-1 max-w-sm">
              <IconSearch className="absolute left-2.5 top-2.5 size-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search forms by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto text-xs">
              {(["all", "published", "draft", "closed", "archived"] as const).map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                  className="capitalize h-8 px-2.5"
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>

          <CardContent className="p-0">
            {/* Loading State */}
            {isLoading && (
              <div className="p-6 flex flex-col gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b last:border-b-0">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-72" />
                    </div>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error State */}
            {!isLoading && isError && (
              <div className="p-8 flex flex-col items-center justify-center gap-3 text-center">
                <div className="rounded-full bg-destructive/10 p-3 text-destructive">
                  <IconAlertCircle className="size-6" />
                </div>
                <h3 className="text-base font-semibold">Failed to load forms</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  {error?.message || "An unexpected error occurred while fetching your forms."}
                </p>
                <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2 mt-2">
                  <IconRefresh className="size-4" />
                  Try Again
                </Button>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !isError && filteredForms.length === 0 && (
              <div className="py-12 px-4">
                <Empty>
                  <EmptyMedia variant="icon">
                    <IconFileText className="size-6 text-muted-foreground" />
                  </EmptyMedia>
                  <EmptyHeader>
                    <EmptyTitle>
                      {forms.length === 0 ? "No forms yet" : "No matching forms found"}
                    </EmptyTitle>
                    <EmptyDescription>
                      {forms.length === 0
                        ? "You haven't created any forms yet. Create your first form to start collecting responses."
                        : `No forms match your current filter "${statusFilter}" or search query.`}
                    </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    {forms.length === 0 ? (
                      <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
                        <IconPlus className="size-4" />
                        Create Your First Form
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchQuery("");
                          setStatusFilter("all");
                        }}
                      >
                        Clear Filters
                      </Button>
                    )}
                  </EmptyContent>
                </Empty>
              </div>
            )}

            {/* Forms Table */}
            {!isLoading && !isError && filteredForms.length > 0 && (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[300px]">Form</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Visibility</TableHead>
                      <TableHead>Submissions</TableHead>
                      <TableHead>Share Link</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead className="w-[50px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredForms.map((form) => (
                      <TableRow key={form.id} className="group">
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                              {form.title}
                            </span>
                            {form.description && (
                              <span className="text-xs text-muted-foreground line-clamp-1">
                                {form.description}
                              </span>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>{getStatusBadge(form.status)}</TableCell>

                        <TableCell>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            {form.visibility === "public" ? (
                              <>
                                <IconGlobe className="size-3.5 text-primary" />
                                <span>Public</span>
                              </>
                            ) : (
                              <>
                                <IconLock className="size-3.5 text-muted-foreground" />
                                <span>Unlisted</span>
                              </>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <span className="text-xs text-muted-foreground">
                            {form.maxSubmissions ? `Limit: ${form.maxSubmissions}` : "Unlimited"}
                          </span>
                        </TableCell>

                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyLink(form.shareId)}
                            className="h-8 gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground"
                            title="Copy public link"
                          >
                            {copiedShareId === form.shareId ? (
                              <>
                                <IconCheck className="size-3.5 text-emerald-500" />
                                <span className="text-emerald-600 dark:text-emerald-400 font-sans">Copied!</span>
                              </>
                            ) : (
                              <>
                                <IconCopy className="size-3.5" />
                                <span>{form.shareId}</span>
                              </>
                            )}
                          </Button>
                        </TableCell>

                        <TableCell>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {form.updatedAt
                              ? new Date(form.updatedAt).toLocaleDateString(undefined, {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })
                              : "—"}
                          </span>
                        </TableCell>

                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="size-8">
                                <IconDotsVertical className="size-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem
                                onClick={() => setEditingForm(form)}
                                className="gap-2 cursor-pointer"
                              >
                                <IconEdit className="size-4" />
                                <span>Edit</span>
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() => handleCopyLink(form.shareId)}
                                className="gap-2 cursor-pointer"
                              >
                                <IconCopy className="size-4" />
                                <span>Copy Link</span>
                              </DropdownMenuItem>

                              <DropdownMenuSeparator />

                              <DropdownMenuItem
                                onClick={() => setDeletingForm(form)}
                                className="gap-2 text-destructive focus:text-destructive cursor-pointer"
                              >
                                <IconTrash className="size-4" />
                                <span>Delete</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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
    </div>
  );
}

