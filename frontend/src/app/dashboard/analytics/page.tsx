"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, Globe2, Link2, Loader2, MousePointerClick } from "lucide-react";

import { analyticsApi } from "@/lib/api";
import AuthGuard from "@/components/providers/AuthGuard";
import DashboardShell from "@/components/dashboard/DashboardShell";

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

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

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
      </DashboardShell>
    </AuthGuard>
  );
}
