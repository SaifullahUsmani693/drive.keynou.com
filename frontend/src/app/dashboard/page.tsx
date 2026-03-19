"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Copy,
  ExternalLink,
  Globe2,
  Link2,
  Loader2,
  MousePointerClick,
  Plus,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

import { analyticsApi, driveApi } from "@/lib/api";
import DashboardShell from "@/components/dashboard/DashboardShell";
import Link from "next/link";
import AuthGuard from "@/components/providers/AuthGuard";
import { useAppSelector } from "@/lib/hooks";
import { Button } from "@/components/ui/button";

const fallbackSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function DashboardPage() {
  const user = useAppSelector((state) => state.auth.user);
  const profile = user?.profile;
  const [links, setLinks] = useState<Array<any>>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoadingLinks, setIsLoadingLinks] = useState(false);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  const stats = useMemo(() => {
    const totalClicks = analytics?.total_clicks ?? 0;
    const activeLinks = analytics?.active_links ?? links.length;
    const countries = analytics?.countries ?? analytics?.total_countries ?? 0;
    const totalLinks = analytics?.total_links ?? links.length;

    return [
      { label: "Total Clicks", value: totalClicks.toLocaleString(), icon: MousePointerClick },
      { label: "Active Links", value: activeLinks.toLocaleString(), icon: Link2 },
      { label: "Countries", value: countries.toLocaleString(), icon: Globe2 },
      { label: "Total Links", value: totalLinks.toLocaleString(), icon: TrendingUp },
    ];
  }, [analytics, links.length]);

  const recentLinks = links.slice(0, 5);

  useEffect(() => {
    let isMounted = true;
    const loadLinks = async () => {
      setIsLoadingLinks(true);
      try {
        const response = await driveApi.listLinks();
        if (isMounted) {
          setLinks(response.data?.data ?? []);
        }
      } finally {
        if (isMounted) {
          setIsLoadingLinks(false);
        }
      }
    };

    const loadAnalytics = async () => {
      setIsLoadingAnalytics(true);
      try {
        const response = await analyticsApi.summary();
        if (isMounted) {
          setAnalytics(response.data?.data ?? null);
        }
      } finally {
        if (isMounted) {
          setIsLoadingAnalytics(false);
        }
      }
    };

    loadLinks();
    loadAnalytics();
    const refresh = setInterval(() => {
      loadLinks();
      loadAnalytics();
    }, 10000);

    return () => {
      isMounted = false;
      clearInterval(refresh);
    };
  }, []);

  return (
    <AuthGuard>
      <DashboardShell>
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold mb-1">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Overview of your link performance</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {[
            { label: "Manage Links", href: "/dashboard/links", icon: Link2 },
            { label: "Analytics", href: "/dashboard/analytics", icon: MousePointerClick },
            { label: "Domains", href: "/dashboard/domains", icon: Globe2 },
            { label: "Settings", href: "/dashboard/settings", icon: ArrowUpRight },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="glass rounded-xl p-4 flex items-center justify-between hover:bg-secondary/20 transition-colors"
              title={item.label}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-semibold text-foreground">{item.label}</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
            </Link>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl p-4 mb-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold">Create a short link</h2>
              <p className="text-xs text-muted-foreground">Head to the links page to create and manage URLs.</p>
            </div>
            <Button className="h-11 px-6 bg-gradient-primary hover:opacity-90 gap-2" asChild>
              <Link href="/dashboard/links">
                <Plus className="w-4 h-4" /> New link
              </Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            {profile?.subscription_active
              ? `Access enabled. You are using ${links.length} of ${profile.link_limit} allowed links.`
              : "Access is currently disabled. Contact admin to enable your account or raise your cap."}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass rounded-xl p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <stat.icon className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="font-display text-2xl font-bold">
                {isLoadingAnalytics ? <Loader2 className="w-5 h-5 animate-spin" /> : stat.value}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-xl overflow-hidden"
        >
          <div className="p-5 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="font-display font-semibold">Recent Links</h2>
              <p className="text-xs text-muted-foreground">Your latest shortened URLs</p>
            </div>
            <Button variant="ghost" size="sm" className="text-xs" asChild>
              <a href="/dashboard" className="flex items-center gap-1">
                View all <ArrowUpRight className="w-3 h-3" />
              </a>
            </Button>
          </div>
          {isLoadingLinks ? (
            <div className="p-12 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : recentLinks.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground text-sm">
              No links yet. Shorten your first URL above!
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentLinks.map((link) => {
                const baseUrl = typeof window !== "undefined" ? window.location.origin : fallbackSiteUrl;
                const shortUrl = `${baseUrl}/${link.tenant}/${link.short_code}`;
                return (
                  <div key={link.id} className="p-4 flex items-center justify-between hover:bg-secondary/20 transition-colors">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-primary truncate">{shortUrl}</p>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(shortUrl);
                            toast.success("Copied!");
                          }}
                          className="text-muted-foreground hover:text-foreground"
                          aria-label="Copy short link"
                          title="Copy short link"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <a
                          href={link.destination_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground"
                          aria-label="Open destination URL"
                          title="Open destination URL"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{link.destination_url}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-sm font-semibold">{(link.clicks || 0).toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">clicks</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </DashboardShell>
    </AuthGuard>
  );
}
