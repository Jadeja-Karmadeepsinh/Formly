"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { Inbox } from "lucide-react";

interface AnalyticsChartProps {
  timeSeries: Array<{ date: string; started: number; completed: number }>;
  isLoading?: boolean;
}

const chartConfig = {
  started: {
    label: "Starts",
    color: "hsl(var(--muted-foreground))",
  },
  completed: {
    label: "Completed",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export function AnalyticsChart({ timeSeries, isLoading }: AnalyticsChartProps) {
  if (isLoading) {
    return (
      <Card className="border-border/60 bg-card/75 shadow-2xs">
        <CardHeader className="p-4 sm:p-5 pb-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-3.5 w-64 mt-1" />
        </CardHeader>
        <CardContent className="p-4 sm:p-5 pt-0">
          <Skeleton className="h-[280px] w-full rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  const hasData = timeSeries.length > 0 && timeSeries.some((d) => d.started > 0 || d.completed > 0);

  const formattedData = React.useMemo(() => {
    return timeSeries.map((item) => {
      const parts = item.date.split("-");
      const shortDate = parts.length === 3 ? `${parts[1]}/${parts[2]}` : item.date;
      return {
        ...item,
        shortDate,
      };
    });
  }, [timeSeries]);

  return (
    <Card className="border-border/60 bg-card/75 shadow-2xs">
      <CardHeader className="p-4 sm:p-5 pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="text-base font-semibold text-foreground">
              Activity Over Time
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Daily respondent starts and successful submissions.
            </CardDescription>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-primary" />
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-muted-foreground/40" />
              <span>Starts</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 pt-2">
        {!hasData ? (
          <div className="flex flex-col items-center justify-center h-[260px] text-center border border-dashed border-border/60 rounded-xl bg-muted/10 p-6">
            <div className="size-10 rounded-full bg-muted/30 flex items-center justify-center text-muted-foreground mb-3">
              <Inbox className="size-5" />
            </div>
            <h4 className="text-xs sm:text-sm font-medium text-foreground">
              No submission activity in this range
            </h4>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              When respondents visit and submit your published forms, submission activity and completion trends will appear here.
            </p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[280px] w-full">
            <AreaChart
              data={formattedData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="fillCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-completed)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--color-completed)" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="fillStarted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-started)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--color-started)" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/40" />
              <XAxis
                dataKey="shortDate"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                className="text-[11px] font-mono"
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                className="text-[11px] font-mono"
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Area
                type="monotone"
                dataKey="started"
                stroke="var(--color-started)"
                strokeWidth={1.5}
                fill="url(#fillStarted)"
              />
              <Area
                type="monotone"
                dataKey="completed"
                stroke="var(--color-completed)"
                strokeWidth={2}
                fill="url(#fillCompleted)"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

