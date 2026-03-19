"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, Globe2, Link2, Loader2, MousePointerClick } from "lucide-react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

import { analyticsApi } from "@/lib/api";
import AuthGuard from "@/components/providers/AuthGuard";
import DashboardShell from "@/components/dashboard/DashboardShell";

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const countryData = useMemo(() => {
    const list = (analytics?.country_counts ?? []) as Array<{
      country_code?: string;
      country?: string;
      total?: number;
    }>;
    return list.reduce((acc, item) => {
      if (!item?.country_code) return acc;
      acc[item.country_code] = {
        total: Number(item.total) || 0,
        country: item.country || item.country_code,
      };
      return acc;
    }, {} as Record<string, { total: number; country: string }>);
  }, [analytics]);

  const maxCount = useMemo(() => {
    const totals = Object.values(countryData).map((item) => item.total);
    return totals.length ? Math.max(...totals) : 0;
  }, [countryData]);

  const stats = useMemo(() => {
    const totalClicks = analytics?.total_clicks ?? 0;
    const recentClicks = analytics?.recent_clicks ?? 0;
    const uniqueLinks = analytics?.unique_links ?? 0;
    const countries = analytics?.countries ?? analytics?.total_countries ?? 0;

    return [
      { label: "Total Clicks", value: totalClicks.toLocaleString(), icon: MousePointerClick },
      { label: "Clicks (7 days)", value: recentClicks.toLocaleString(), icon: BarChart3 },
      { label: "Unique Links", value: uniqueLinks.toLocaleString(), icon: Link2 },
      { label: "Countries", value: countries.toLocaleString(), icon: Globe2 },
    ];
  }, [analytics]);

  useEffect(() => {
    let isMounted = true;
    const loadAnalytics = async () => {
      setIsLoading(true);
      try {
        const response = await analyticsApi.summary();
        if (isMounted) {
          setAnalytics(response.data?.data ?? null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadAnalytics();
    const refresh = setInterval(loadAnalytics, 10000);

    return () => {
      isMounted = false;
      clearInterval(refresh);
    };
  }, []);

  return (
    <AuthGuard>
      <DashboardShell>
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold mb-1">Analytics</h1>
          <p className="text-sm text-muted-foreground">A quick snapshot of link performance</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="glass rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <stat.icon className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="font-display text-2xl font-bold">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : stat.value}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-lg font-semibold">Global click map</h2>
              <p className="text-xs text-muted-foreground">Clicks by country (last 7 days)</p>
            </div>
            <Globe2 className="w-4 h-4 text-muted-foreground" />
          </div>
          {isLoading ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="w-full overflow-hidden rounded-lg bg-secondary/20 p-4">
              <ComposableMap projectionConfig={{ scale: 140 }} width={800} height={380}>
                <Geographies geography="https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json">
                  {({ geographies }: { geographies: any[] }) =>
                    geographies.map((geo: any) => {
                      const iso = geo.properties.ISO_A2;
                      const data = iso ? countryData[iso] : undefined;
                      const intensity = data && maxCount ? data.total / maxCount : 0;
                      const fill = data
                        ? `rgba(8, 183, 185, ${0.25 + intensity * 0.75})`
                        : "rgba(255,255,255,0.06)";
                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          fill={fill}
                          stroke="rgba(255,255,255,0.08)"
                          style={{
                            default: { outline: "none" },
                            hover: { outline: "none", fill: "rgba(8, 183, 185, 0.9)" },
                            pressed: { outline: "none" },
                          }}
                        />
                      );
                    })
                  }
                </Geographies>
              </ComposableMap>
              <div className="mt-4 grid gap-2 text-xs text-muted-foreground">
                <p>
                  Highlighted countries: {analytics?.total_countries ?? 0}. Darker regions mean more clicks.
                </p>
              </div>
            </div>
          )}
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
