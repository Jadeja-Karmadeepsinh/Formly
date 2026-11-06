"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForms } from "~/hooks/api/form";
import { useAnalytics } from "~/hooks/api/form-submission";
import { AnalyticsHeader } from "./analytics-header";
import { AnalyticsMetrics } from "./analytics-metrics";
import { AnalyticsChart } from "./analytics-chart";
import { FormsPerformanceTable } from "./forms-performance-table";
import { QuestionInsightsSection } from "./question-insights-section";
import { TechnologyBreakdown } from "./technology-breakdown";

export function AnalyticsView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialFormId = searchParams?.get("formId") || undefined;

  const [selectedFormId, setSelectedFormId] = React.useState<string | undefined>(initialFormId);
  const [dateRange, setDateRange] = React.useState<"7d" | "30d" | "90d" | "all">("30d");

  // Keep state synced with URL query parameter
  React.useEffect(() => {
    const urlFormId = searchParams?.get("formId") || undefined;
    if (urlFormId !== selectedFormId) {
      setSelectedFormId(urlFormId);
    }
  }, [searchParams]);

  // Calculate ISO dates for range
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

  const { forms = [], isLoading: isFormsLoading } = useForms();
  const {
    analytics,
    overview,
    timeSeries,
    formsPerformance,
    isLoading: isAnalyticsLoading,
    isFetching,
    refetch,
  } = useAnalytics({
    formId: selectedFormId,
    startDate,
    endDate,
  });

  const handleSelectFormId = (formId: string | undefined) => {
    setSelectedFormId(formId);
    if (formId) {
      router.push(`/dashboard/analytics?formId=${formId}`);
    } else {
      router.push(`/dashboard/analytics`);
    }
  };

  return (
    <div className="space-y-7 max-w-6xl mx-auto pb-12">
      {/* 1. Executive Header */}
      <AnalyticsHeader
        forms={forms}
        selectedFormId={selectedFormId}
        onSelectFormId={handleSelectFormId}
        dateRange={dateRange}
        onChangeDateRange={setDateRange}
        isRefreshing={isFetching}
        onRefresh={() => refetch()}
      />

      {/* 2. Key Metrics Row (At a Glance) */}
      <AnalyticsMetrics
        overview={overview}
        isLoading={isAnalyticsLoading}
      />

      {/* 3. Trend Time-Series Chart */}
      <AnalyticsChart
        timeSeries={timeSeries}
        isLoading={isAnalyticsLoading}
      />

      {/* 4. Form Performance Ranked Breakdown */}
      <FormsPerformanceTable
        formsPerformance={formsPerformance}
        onSelectForm={(id) => handleSelectFormId(id)}
        selectedFormId={selectedFormId}
      />

      {/* 5. Question-Level Insights (Exploration or Form Deep Dive) */}
      <QuestionInsightsSection
        formId={selectedFormId}
        forms={forms}
        onSelectFormId={handleSelectFormId}
      />

      {/* 6. Technology & Audience Breakdown */}
      <TechnologyBreakdown
        deviceBreakdown={overview?.deviceBreakdown ?? []}
        browserBreakdown={overview?.browserBreakdown ?? []}
        countryBreakdown={overview?.countryBreakdown ?? []}
      />
    </div>
  );
}
