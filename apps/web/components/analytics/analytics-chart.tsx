"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Activity, BarChart2, Inbox, TrendingUp } from "lucide-react";

interface AnalyticsChartProps {
  timeSeries: Array<{ date: string; started: number; completed: number }>;
  isLoading?: boolean;
}

export function AnalyticsChart({ timeSeries, isLoading }: AnalyticsChartProps) {
  const [chartType, setChartType] = React.useState<"area" | "bar">("area");

  const formattedData = React.useMemo(() => {
    return timeSeries.map((item) => {
      // Parse ISO date string (YYYY-MM-DD)
      const parts = item.date.split("-");
      let shortDate = item.date;
      let fullDateStr = item.date;

      if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const d = new Date(year, month, day);
        shortDate = d.toLocaleDateString("en-US", { month: "numeric", day: "numeric" });
        fullDateStr = d.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      }

      return {
        ...item,
        shortDate,
        fullDateStr,
      };
    });
  }, [timeSeries]);

  // Determine tick interval for X-axis so labels don't crowd
  const tickInterval = React.useMemo(() => {
    if (formattedData.length > 60) return 6;
    if (formattedData.length > 25) return 3;
    if (formattedData.length > 10) return 2;
    return 0; // show all
  }, [formattedData.length]);

  if (isLoading) {
    return (
      <Card className="border-border/60 bg-card/75 shadow-2xs">
        <CardHeader className="p-4 sm:p-5 pb-3">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-3.5 w-64 mt-1" />
        </CardHeader>
        <CardContent className="p-4 sm:p-5 pt-0">
          <Skeleton className="h-[320px] w-full rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  const totalCompleted = timeSeries.reduce((acc, curr) => acc + curr.completed, 0);
  const totalStarted = timeSeries.reduce((acc, curr) => acc + curr.started, 0);
  const hasData = timeSeries.length > 0 && (totalStarted > 0 || totalCompleted > 0);

  return (
    <Card className="border-border/60 bg-card/75 shadow-2xs">
      <CardHeader className="p-4 sm:p-5 pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="size-4 text-primary" />
              <CardTitle className="text-base font-semibold text-foreground">
                Submission Activity
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Daily trend of completed submissions versus tracked form starts.
            </CardDescription>
          </div>

          <div className="flex items-center gap-3">
            {/* Legend Pills with live totals */}
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                <span className="size-2.5 rounded-full bg-emerald-500" />
                <span>Completed</span>
                <span className="font-mono text-muted-foreground text-[11px]">
                  ({totalCompleted})
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <span className="size-2.5 rounded-full bg-muted-foreground/40 border border-border" />
                <span>Starts</span>
                <span className="font-mono text-[11px]">
                  ({totalStarted})
                </span>
              </div>
            </div>

            {/* View Switcher (Area vs Bar) */}
            <Tabs
              value={chartType}
              onValueChange={(val) => setChartType(val as "area" | "bar")}
              className="hidden sm:block"
            >
              <TabsList className="h-7 p-0.5 bg-muted/60 border border-border/60 rounded-lg">
                <TabsTrigger
                  value="area"
                  className="h-6 px-2 text-[11px] gap-1 data-[state=active]:bg-background data-[state=active]:text-foreground rounded-md cursor-pointer"
                  title="Smooth trend curve"
                >
                  <Activity className="size-3" />
                  <span>Trend</span>
                </TabsTrigger>
                <TabsTrigger
                  value="bar"
                  className="h-6 px-2 text-[11px] gap-1 data-[state=active]:bg-background data-[state=active]:text-foreground rounded-md cursor-pointer"
                  title="Daily volume bars"
                >
                  <BarChart2 className="size-3" />
                  <span>Bars</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 pt-1">
        {!hasData ? (
          <div className="flex flex-col items-center justify-center h-[280px] sm:h-[320px] text-center border border-dashed border-border/70 rounded-xl bg-muted/10 p-6">
            <div className="size-10 rounded-full bg-muted/40 flex items-center justify-center text-muted-foreground mb-3">
              <Inbox className="size-5" />
            </div>
            <h4 className="text-sm font-semibold text-foreground">
              No submission activity in this period
            </h4>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm leading-relaxed">
              When respondents visit and submit your published forms, daily volume trends, completions, and starts will appear on this timeline.
            </p>
          </div>
        ) : (
          <div className="h-[320px] w-full min-w-0 relative">
            <ResponsiveContainer width="100%" height={320} minWidth={0}>
              {chartType === "area" ? (
                <AreaChart
                  data={formattedData}
                  margin={{ top: 12, right: 12, left: -20, bottom: 4 }}
                >
                  <defs>
                    <linearGradient id="fillCompleted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="fillStarted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
                  <XAxis
                    dataKey="shortDate"
                    tickLine={false}
                    axisLine={false}
                    interval={tickInterval}
                    tickMargin={8}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontFamily: "monospace" }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontFamily: "monospace" }}
                  />
                  <Tooltip
                    cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }}
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const data = payload[0]?.payload;
                      if (!data) return null;
                      const completed = Number(data.completed || 0);
                      const started = Number(data.started || 0);
                      const rate = started > 0 ? ((completed / started) * 100).toFixed(0) : "—";

                      return (
                        <div className="rounded-xl border border-border/80 bg-popover/95 p-3 shadow-md backdrop-blur-sm text-xs min-w-[170px] space-y-1.5">
                          <p className="font-semibold text-foreground text-[11px] border-b border-border/40 pb-1">
                            {data.fullDateStr}
                          </p>
                          <div className="flex items-center justify-between text-foreground">
                            <span className="flex items-center gap-1.5">
                              <span className="size-2 rounded-full bg-emerald-500" />
                              <span>Completed</span>
                            </span>
                            <span className="font-mono font-semibold">{completed}</span>
                          </div>
                          <div className="flex items-center justify-between text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <span className="size-2 rounded-full bg-muted-foreground/40" />
                              <span>Starts</span>
                            </span>
                            <span className="font-mono">{started}</span>
                          </div>
                          {started > 0 && (
                            <div className="pt-1 border-t border-border/40 flex items-center justify-between text-[11px]">
                              <span className="text-muted-foreground">Conversion</span>
                              <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                                {rate}%
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="started"
                    stroke="#94a3b8"
                    strokeWidth={1.5}
                    strokeDasharray="3 3"
                    fill="url(#fillStarted)"
                    dot={false}
                    activeDot={{ r: 4, stroke: "hsl(var(--background))", strokeWidth: 1.5 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="completed"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#fillCompleted)"
                    dot={({ cx, cy, payload }) => {
                      if (payload && payload.completed > 0) {
                        return (
                          <circle
                            key={`dot-${payload.date}`}
                            cx={cx}
                            cy={cy}
                            r={3}
                            fill="#10b981"
                            stroke="hsl(var(--background))"
                            strokeWidth={1.5}
                          />
                        );
                      }
                      return null;
                    }}
                    activeDot={{ r: 5, stroke: "hsl(var(--background))", strokeWidth: 2 }}
                  />
                </AreaChart>
              ) : (
                <BarChart
                  data={formattedData}
                  margin={{ top: 12, right: 12, left: -20, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
                  <XAxis
                    dataKey="shortDate"
                    tickLine={false}
                    axisLine={false}
                    interval={tickInterval}
                    tickMargin={8}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontFamily: "monospace" }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontFamily: "monospace" }}
                  />
                  <Tooltip
                    cursor={{ fill: "hsl(var(--muted) / 0.3)" }}
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const data = payload[0]?.payload;
                      if (!data) return null;
                      const completed = Number(data.completed || 0);
                      const started = Number(data.started || 0);
                      const rate = started > 0 ? ((completed / started) * 100).toFixed(0) : "—";

                      return (
                        <div className="rounded-xl border border-border/80 bg-popover/95 p-3 shadow-md backdrop-blur-sm text-xs min-w-[170px] space-y-1.5">
                          <p className="font-semibold text-foreground text-[11px] border-b border-border/40 pb-1">
                            {data.fullDateStr}
                          </p>
                          <div className="flex items-center justify-between text-foreground">
                            <span className="flex items-center gap-1.5">
                              <span className="size-2 rounded-full bg-emerald-500" />
                              <span>Completed</span>
                            </span>
                            <span className="font-mono font-semibold">{completed}</span>
                          </div>
                          <div className="flex items-center justify-between text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <span className="size-2 rounded-full bg-muted-foreground/40" />
                              <span>Starts</span>
                            </span>
                            <span className="font-mono">{started}</span>
                          </div>
                          {started > 0 && (
                            <div className="pt-1 border-t border-border/40 flex items-center justify-between text-[11px]">
                              <span className="text-muted-foreground">Conversion</span>
                              <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                                {rate}%
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    }}
                  />
                  <Bar
                    dataKey="started"
                    fill="#94a3b8"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={30}
                    opacity={0.5}
                  />
                  <Bar
                    dataKey="completed"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={30}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
