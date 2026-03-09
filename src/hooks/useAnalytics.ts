import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useDashboardStats = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["dashboard-stats", user?.id],
    queryFn: async () => {
      const { data: links, error: linksError } = await supabase
        .from("links")
        .select("id, clicks, status");
      if (linksError) throw linksError;

      const totalClicks = links.reduce((sum, l) => sum + (l.clicks || 0), 0);
      const activeLinks = links.filter((l) => l.status === "active").length;

      const { data: clickEvents, error: ceError } = await supabase
        .from("click_events")
        .select("country");
      if (ceError) throw ceError;

      const uniqueCountries = new Set(clickEvents.map((e) => e.country).filter(Boolean)).size;

      return {
        totalClicks,
        activeLinks,
        countries: uniqueCountries,
        totalLinks: links.length,
      };
    },
    enabled: !!user,
  });
};

export const useClickEvents = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["click-events", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("click_events")
        .select("*")
        .order("clicked_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useAnalyticsData = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["analytics-data", user?.id],
    queryFn: async () => {
      const { data: clickEvents, error } = await supabase
        .from("click_events")
        .select("*, links!click_events_link_id_fkey(short_code, destination_url)")
        .order("clicked_at", { ascending: false });
      if (error) throw error;

      // Top countries
      const countryCounts: Record<string, number> = {};
      clickEvents.forEach((e) => {
        if (e.country) countryCounts[e.country] = (countryCounts[e.country] || 0) + 1;
      });
      const totalClicks = clickEvents.length;
      const topCountries = Object.entries(countryCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([name, clicks]) => ({
          name,
          clicks,
          pct: totalClicks > 0 ? Math.round((clicks / totalClicks) * 100) : 0,
        }));

      // Top links
      const linkCounts: Record<string, { name: string; clicks: number }> = {};
      clickEvents.forEach((e) => {
        const link = e.links as any;
        const shortCode = link?.short_code || "unknown";
        const key = shortCode;
        if (!linkCounts[key]) linkCounts[key] = { name: `drive.keynou.com/${shortCode}`, clicks: 0 };
        linkCounts[key].clicks++;
      });
      const topLinks = Object.values(linkCounts)
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, 5);

      // Devices
      const deviceCounts: Record<string, number> = {};
      clickEvents.forEach((e) => {
        const device = e.device || "Unknown";
        deviceCounts[device] = (deviceCounts[device] || 0) + 1;
      });
      const devices = Object.entries(deviceCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name, count]) => ({
          name,
          pct: totalClicks > 0 ? Math.round((count / totalClicks) * 100) : 0,
        }));

      // Referrers
      const referrerCounts: Record<string, number> = {};
      clickEvents.forEach((e) => {
        const ref = e.referrer || "Direct";
        referrerCounts[ref] = (referrerCounts[ref] || 0) + 1;
      });
      const referrers = Object.entries(referrerCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, clicks]) => ({ name, clicks }));

      // Clicks over time (last 30 days)
      const now = new Date();
      const clicksByDay: Record<string, number> = {};
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        clicksByDay[d.toISOString().split("T")[0]] = 0;
      }
      clickEvents.forEach((e) => {
        const day = e.clicked_at.split("T")[0];
        if (clicksByDay[day] !== undefined) clicksByDay[day]++;
      });
      const clicksOverTime = Object.entries(clicksByDay).map(([date, clicks]) => ({ date, clicks }));

      return { topCountries, topLinks, devices, referrers, clicksOverTime, totalClicks };
    },
    enabled: !!user,
  });
};
