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

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case "mobile":
        return <Smartphone className="size-4" />;
      case "tablet":
        return <Tablet className="size-4" />;
      default:
        return <Monitor className="size-4" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Device Breakdown */}
      <Card className="border-border/60 bg-card/75 shadow-2xs">
        <CardHeader className="p-4 sm:p-5 pb-3">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Monitor className="size-4 text-muted-foreground" />
            <span>Devices</span>
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Respondent device category
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-5 pt-0">
          {deviceBreakdown.length === 0 ? (
            <p className="text-xs text-muted-foreground italic py-3">No device data yet</p>
          ) : (
            <div className="space-y-2.5">
              {deviceBreakdown.map((item) => {
                const pct = totalDeviceCount > 0 ? (item.count / totalDeviceCount) * 100 : 0;
                return (
                  <div key={item.key} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 capitalize text-foreground">
                        {getDeviceIcon(item.key)}
                        <span>{item.key}</span>
                      </span>
                      <span className="font-mono text-muted-foreground">
                        {item.count} ({pct.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full bg-muted/40 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full transition-all"
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
      <Card className="border-border/60 bg-card/75 shadow-2xs">
        <CardHeader className="p-4 sm:p-5 pb-3">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Compass className="size-4 text-muted-foreground" />
            <span>Browsers</span>
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Top respondent web browsers
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-5 pt-0">
          {browserBreakdown.length === 0 ? (
            <p className="text-xs text-muted-foreground italic py-3">No browser data yet</p>
          ) : (
            <div className="space-y-2">
              {browserBreakdown.slice(0, 5).map((item) => (
                <div key={item.key} className="flex items-center justify-between text-xs py-1 border-b border-border/40 last:border-none">
                  <span className="text-foreground">{item.key}</span>
                  <span className="font-mono text-muted-foreground">{item.count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Country Breakdown */}
      <Card className="border-border/60 bg-card/75 shadow-2xs">
        <CardHeader className="p-4 sm:p-5 pb-3">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Globe className="size-4 text-muted-foreground" />
            <span>Geography</span>
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Respondent regional distribution
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-5 pt-0">
          {countryBreakdown.length === 0 ? (
            <p className="text-xs text-muted-foreground italic py-3">No location data yet</p>
          ) : (
            <div className="space-y-2">
              {countryBreakdown.slice(0, 5).map((item) => (
                <div key={item.key} className="flex items-center justify-between text-xs py-1 border-b border-border/40 last:border-none">
                  <span className="text-foreground font-mono">{item.key}</span>
                  <span className="font-mono text-muted-foreground">{item.count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

