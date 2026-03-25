"use client";

import { useEffect, useMemo, useState } from "react";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import { BarChart3, Globe2, Link2, Loader2, MousePointerClick } from "lucide-react";

import { analyticsApi } from "@/lib/api";
import AuthGuard from "@/components/providers/AuthGuard";
import DashboardShell from "@/components/dashboard/DashboardShell";

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [worldGeos, setWorldGeos] = useState<any[]>([]);
  const [mapLoadFailed, setMapLoadFailed] = useState(false);
  const [hoveredCountry, setHoveredCountry] = useState<{
    name: string;
    total: number;
    hasData: boolean;
    x: number;
    y: number;
  } | null>(null);

  const countryData = useMemo(() => {
    const list = (analytics?.country_counts ?? []) as Array<{
      country_code?: string;
      country?: string;
      total?: number;
    }>;
    return list.reduce((acc, item) => {
      if (!item) return acc;
      const total = Number(item.total) || 0;
      const isoKey = (item.country_code || "").toUpperCase();
      const nameKey = (item.country || "").toUpperCase();
      const payload = {
        total,
        country: item.country || item.country_code || "Unknown",
      };
      if (isoKey) {
        acc[isoKey] = payload;
      }
      if (nameKey && nameKey !== isoKey) {
        acc[nameKey] = payload;
      }
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

  useEffect(() => {
    let active = true;
    const loadMap = async () => {
      try {
        const response = await fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json");
        if (!response.ok) {
          throw new Error("Unable to load map topology");
        }
        const topology = await response.json();
        const countries = feature(topology, topology.objects.countries) as any;
        if (active) {
          setWorldGeos(countries.features || []);
          setMapLoadFailed(false);
        }
      } catch {
        if (active) {
          setWorldGeos([]);
          setMapLoadFailed(true);
        }
      }
    };
    loadMap();
    return () => {
      active = false;
    };
  }, []);

  const mapPath = useMemo(() => {
    if (!worldGeos.length) return null;
    const projection = geoNaturalEarth1().fitSize([800, 380], {
      type: "FeatureCollection",
      features: worldGeos,
    } as any);
    return geoPath(projection);
  }, [worldGeos]);

  const handleRegionHover = (
    event: React.MouseEvent<SVGPathElement, MouseEvent>,
    displayName: string,
    data: { total: number; country: string } | undefined,
  ) => {
    const { clientX, clientY } = event.nativeEvent;
    setHoveredCountry({
      name: data?.country || displayName || "No data",
      total: data?.total ?? 0,
      hasData: Boolean(data),
      x: clientX + 12,
      y: clientY + 12,
    });
  };

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
              {mapPath && worldGeos.length ? (
                <div className="relative">
                  <svg
                    viewBox="0 0 800 380"
                    className="w-full h-[380px]"
                    onMouseLeave={() => setHoveredCountry(null)}
                  >
                    {worldGeos.map((geo: any) => {
                      const props = geo.properties || {};
                      const iso = (props.ISO_A2 || props.iso_a2 || props.ISO_A2_EH || "").toUpperCase();
                      const nameKey = (props.name || props.NAME || "").toUpperCase();
                      const data = countryData[iso] || countryData[nameKey];
                      const intensity = data && maxCount ? data.total / maxCount : 0;
                      const fill = data
                        ? `rgba(8, 183, 185, ${0.25 + intensity * 0.75})`
                        : "rgba(255,255,255,0.06)";
                      return (
                        <path
                          key={geo.id || iso}
                          d={mapPath(geo) || undefined}
                          fill={fill}
                          stroke="rgba(255,255,255,0.08)"
                          onMouseEnter={(event) =>
                            handleRegionHover(event, props.name || props.NAME || iso || "Unknown", data)
                          }
                          onMouseMove={(event) =>
                            handleRegionHover(event, props.name || props.NAME || iso || "Unknown", data)
                          }
                        />
                      );
                    })}
                  </svg>
                  {hoveredCountry ? (
                    <div
                      className="pointer-events-none fixed z-50 rounded-lg border border-white/20 bg-background/90 px-3 py-2 shadow-lg backdrop-blur"
                      style={{ left: hoveredCountry.x, top: hoveredCountry.y }}
                    >
                      <p className="text-xs font-semibold text-foreground">{hoveredCountry.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {hoveredCountry.total.toLocaleString()} click{hoveredCountry.total === 1 ? "" : "s"}
                      </p>
                      {!hoveredCountry.hasData ? (
                        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">No tracked clicks</p>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="flex h-[220px] items-center justify-center rounded-lg border border-white/10 bg-black/10 text-center text-sm text-muted-foreground">
                  {mapLoadFailed
                    ? "Map background could not load on localhost, but country totals are still listed below."
                    : "No country map data yet. Open a short link to generate click locations."}
                </div>
              )}
              <div className="mt-4 grid gap-2 text-xs text-muted-foreground">
                <p>
                  Highlighted countries: {analytics?.total_countries ?? 0}. Darker regions mean more clicks.
                </p>
                {(analytics?.country_counts ?? []).length ? (
                  <div className="grid gap-2 pt-2 sm:grid-cols-2 lg:grid-cols-3">
                    {(analytics?.country_counts ?? []).map((item: any) => (
                      <div key={`${item.country_code}-${item.country}`} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                        <div className="font-medium text-foreground">{item.country || item.country_code}</div>
                        <div>{item.total ?? 0} clicks</div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
