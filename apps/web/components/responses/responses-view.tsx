"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useForms } from "~/hooks/api/form";
import { useAllSubmissions, useExportSubmissions } from "~/hooks/api/form-submission";
import { ResponsesHeader } from "./responses-header";
import { ResponsesFilterBar } from "./responses-filter-bar";
import { ResponsesTable } from "./responses-table";
import { ResponseDetailSheet } from "./response-detail-sheet";
import { downloadCsvFile } from "./export-csv";

export function ResponsesView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialFormId = searchParams?.get("formId") || undefined;

  const [selectedFormId, setSelectedFormId] = React.useState<string | undefined>(initialFormId);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"all" | "completed" | "in_progress">("all");
  const [dateRange, setDateRange] = React.useState<"all" | "7d" | "30d" | "90d">("all");
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(20);

  // Active inspected submission state
  const [inspectedSubmissionId, setInspectedSubmissionId] = React.useState<string | null>(null);
  const [isExporting, setIsExporting] = React.useState(false);

  // Debounce search query
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset page on search change
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Compute ISO dates for date range
  const { startDate, endDate } = React.useMemo(() => {
    if (dateRange === "all") {
      return { startDate: undefined, endDate: undefined };
    }
    const end = new Date();
    const start = new Date();
    const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90;
    start.setDate(end.getDate() - days);

    return {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    };
  }, [dateRange]);

  const { forms = [] } = useForms();
  const { exportData } = useExportSubmissions();

  const {
    items,
    totalCount,
    totalPages,
    isLoading,
  } = useAllSubmissions({
    formId: selectedFormId,
    status: statusFilter,
    search: debouncedSearch || undefined,
    startDate,
    endDate,
    page,
    limit,
  });

  const handleSelectFormId = (formId: string | undefined) => {
    setSelectedFormId(formId);
    setPage(1);
    if (formId) {
      router.push(`/dashboard/responses?formId=${formId}`);
    } else {
      router.push(`/dashboard/responses`);
    }
  };

  const handleResetFilters = () => {
    setSelectedFormId(undefined);
    setSearchQuery("");
    setDebouncedSearch("");
    setStatusFilter("all");
    setDateRange("all");
    setPage(1);
    router.push(`/dashboard/responses`);
  };

  const isFiltered = Boolean(selectedFormId || searchQuery || statusFilter !== "all" || dateRange !== "all");

  // Previous & Next navigation for inspected submission
  const currentInspectIndex = React.useMemo(() => {
    if (!inspectedSubmissionId) return -1;
    return items.findIndex((item) => item.id === inspectedSubmissionId);
  }, [inspectedSubmissionId, items]);

  const hasPrev = currentInspectIndex > 0;
  const hasNext = currentInspectIndex >= 0 && currentInspectIndex < items.length - 1;

  const handleNavigatePrev = () => {
    if (hasPrev) {
      setInspectedSubmissionId(items[currentInspectIndex - 1]?.id ?? null);
    }
  };

  const handleNavigateNext = () => {
    if (hasNext) {
      setInspectedSubmissionId(items[currentInspectIndex + 1]?.id ?? null);
    }
  };

  // CSV Export action
  const handleExport = async () => {
    try {
      setIsExporting(true);
      const data = await exportData({
        formId: selectedFormId,
        status: statusFilter === "in_progress" ? "in_progress" : "completed",
        startDate,
        endDate,
      });

      if (!data || data.rows.length === 0) {
        toast.info("No completed submissions available to export in this range.");
        return;
      }

      downloadCsvFile(data.filename, data.columns, data.rows);
      toast.success(`Exported ${data.rows.length} submissions to CSV`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to export submissions");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* 1. Header with Export */}
      <ResponsesHeader
        totalCount={totalCount}
        onExport={handleExport}
        isExporting={isExporting}
      />

      {/* 2. Filter Bar */}
      <ResponsesFilterBar
        forms={forms}
        selectedFormId={selectedFormId}
        onSelectFormId={handleSelectFormId}
        searchQuery={searchQuery}
        onChangeSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        onChangeStatusFilter={(st) => {
          setStatusFilter(st);
          setPage(1);
        }}
        dateRange={dateRange}
        onChangeDateRange={(dr) => {
          setDateRange(dr);
          setPage(1);
        }}
        onResetFilters={handleResetFilters}
        isFiltered={isFiltered}
      />

      {/* 3. Submissions Table & Pagination */}
      <ResponsesTable
        items={items}
        totalCount={totalCount}
        page={page}
        limit={limit}
        totalPages={totalPages}
        isLoading={isLoading}
        onPageChange={setPage}
        onLimitChange={(newLimit) => {
          setLimit(newLimit);
          setPage(1);
        }}
        onInspectSubmission={(id) => setInspectedSubmissionId(id)}
      />

      {/* 4. Individual Submission Detail Sheet */}
      <ResponseDetailSheet
        submissionId={inspectedSubmissionId}
        open={Boolean(inspectedSubmissionId)}
        onOpenChange={(open) => {
          if (!open) setInspectedSubmissionId(null);
        }}
        onNavigatePrev={handleNavigatePrev}
        onNavigateNext={handleNavigateNext}
        hasPrev={hasPrev}
        hasNext={hasNext}
      />
    </div>
  );
}

