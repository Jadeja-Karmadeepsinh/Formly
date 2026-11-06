"use client";

import * as React from "react";
import { Chrome, Compass, Globe, Laptop, Monitor, Smartphone, Tablet } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import type { BreakdownItem } from "~/hooks/api/form-submission";

interface TechnologyBreakdownProps {
  deviceBreakdown: BreakdownItem[];
  browserBreakdown: BreakdownItem[];
  countryBreakdown: BreakdownItem[];
}

export function TechnologyBreakdown({
  deviceBreakdown,
  browserBreakdown,
  countryBreakdown,
}: TechnologyBreakdownProps) {
  const totalDeviceCount = deviceBreakdown.reduce((acc, curr) => acc + curr.count, 0);
  const totalBrowserCount = browserBreakdown.reduce((acc, curr) => acc + curr.count, 0);
  const totalCountryCount = countryBreakdown.reduce((acc, curr) => acc + curr.count, 0);

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case "mobile":
        return <Smartphone className="size-3.5 text-primary" />;
      case "tablet":
        return <Tablet className="size-3.5 text-primary" />;
      default:
        return <Monitor className="size-3.5 text-primary" />;
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
          Audience & Technology
        </h2>
        <span className="text-[11px] text-muted-foreground">
          Device platforms, browsers, and geographic presence
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Device Breakdown */}
        <Card className="panel-highlight border-border/80 bg-card shadow-2xs">
          <CardHeader className="p-4 sm:p-5 pb-3">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Monitor className="size-4 text-primary" />
              <span>Device Types</span>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Form respondent hardware category
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 pt-0">
            {deviceBreakdown.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-3 text-center">
                No device data recorded yet
              </p>
            ) : (
              <div className="space-y-3">
                {deviceBreakdown.map((item) => {
                  const pct = totalDeviceCount > 0 ? (item.count / totalDeviceCount) * 100 : 0;
                  return (
                    <div key={item.key} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 capitalize text-foreground font-medium">
                          {getDeviceIcon(item.key)}
                          <span>{item.key}</span>
                        </span>
                        <span className="font-mono text-muted-foreground text-[11px]">
                          {item.count} ({pct.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="w-full bg-muted/40 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-primary h-full rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Browser Breakdown */}
        <Card className="panel-highlight border-border/80 bg-card shadow-2xs">
          <CardHeader className="p-4 sm:p-5 pb-3">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Compass className="size-4 text-primary" />
              <span>Web Browsers</span>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Respondent browsing software
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 pt-0">
            {browserBreakdown.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-3 text-center">
                No browser data recorded yet
              </p>
            ) : (
              <div className="space-y-3">
                {browserBreakdown.slice(0, 5).map((item) => {
                  const pct = totalBrowserCount > 0 ? (item.count / totalBrowserCount) * 100 : 0;
                  return (
                    <div key={item.key} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-foreground font-medium truncate max-w-[150px]">
                          {item.key}
                        </span>
                        <span className="font-mono text-muted-foreground text-[11px]">
                          {item.count} ({pct.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="w-full bg-muted/40 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-primary/80 h-full rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Country Breakdown */}
        <Card className="panel-highlight border-border/80 bg-card shadow-2xs">
          <CardHeader className="p-4 sm:p-5 pb-3">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Globe className="size-4 text-primary" />
              <span>Geography</span>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Regional distribution of responses
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 pt-0">
            {countryBreakdown.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-3 text-center">
                No location data recorded yet
              </p>
            ) : (
              <div className="space-y-3">
                {countryBreakdown.slice(0, 5).map((item) => {
                  const pct = totalCountryCount > 0 ? (item.count / totalCountryCount) * 100 : 0;
                  return (
                    <div key={item.key} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-foreground font-mono font-medium">
                          {item.key}
                        </span>
                        <span className="font-mono text-muted-foreground text-[11px]">
                          {item.count} ({pct.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="w-full bg-muted/40 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-primary/70 h-full rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
