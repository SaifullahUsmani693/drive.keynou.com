"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, Globe2, LayoutDashboard, Link2, LogOut, Menu, Settings, ShieldCheck, X } from "lucide-react";

import { accountsApi, driveApi } from "@/lib/api";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setUser } from "@/lib/features/authSlice";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Link2, label: "Links", path: "/dashboard/links" },
  { icon: BarChart3, label: "Analytics", path: "/dashboard/analytics" },
  { icon: Globe2, label: "Domains", path: "/dashboard/domains" },
  { icon: ShieldCheck, label: "Subscription", path: "/dashboard/subscription" },
  { icon: Settings, label: "Settings", path: "/dashboard/settings" },
];

interface DashboardShellProps {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export default function DashboardShell({ children, className, contentClassName }: DashboardShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const profile = user?.profile;
  const [linkCount, setLinkCount] = useState(0);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const usageLimit = useMemo(() => {
    if (!profile) return 2;
    return profile.subscription_active ? profile.link_limit : 2;
  }, [profile]);

  const usagePercent = useMemo(() => {
    if (!usageLimit) return 0;
    return Math.min(1, linkCount / usageLimit);
  }, [linkCount, usageLimit]);

  const sidebarItems = profile?.is_admin
    ? [...navItems, { icon: ShieldCheck, label: "Admin", path: "/admin" }]
    : navItems;

  const handleLogout = async () => {
    await accountsApi.logout();
    dispatch(setUser(null));
    router.replace("/login");
  };


  useEffect(() => {
    if (!user) return;
    const loadLinks = async () => {
      try {
        const response = await driveApi.listLinks();
        const data = response.data?.data ?? [];
        setLinkCount(data.length);
      } catch {
        setLinkCount(0);
      }
    };
    loadLinks();
  }, [user]);

  return (
    <div className={cn("min-h-screen flex bg-background text-foreground", className)}>
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card/50">
        <div className="p-6">
          <Link href="/" className="flex items-center">
            <img src="/keynou_drove_logo.png" alt="Keynou Drive" className="h-16 w-auto drop-shadow" />
          </Link>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {sidebarItems.map((item) => (
            <Link
              key={item.path + item.label}
              href={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                pathname === item.path
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4">
          <div className="glass rounded-xl p-4 mb-3">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold">Premium Access</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              {profile?.subscription_active
                ? `Access enabled · Cap: ${profile.link_limit} links`
                : "Want more than the free limit? Request a subscription and tell us how many links you need."}
            </p>
            <div className="text-xs text-muted-foreground mb-3">
              Usage: {linkCount} / {usageLimit}
            </div>
            <Button
              size="sm"
              className="w-full bg-gradient-primary hover:opacity-90 text-xs"
              onClick={() => router.push("/dashboard/subscription")}
              type="button"
            >
              Subscribe to premium
            </Button>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground w-full px-3 py-2"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>

      <main className={cn("flex-1 overflow-auto", contentClassName)}>
        <header className="md:hidden flex items-center justify-between p-4 border-b border-border">
          <Link href="/" className="flex items-center">
            <img src="/keynou_drove_logo.png" alt="Keynou Drive" className="h-12 w-auto drop-shadow" />
          </Link>
          <button
            type="button"
            onClick={() => setIsMobileOpen(true)}
            className="rounded-full border border-border p-2 text-muted-foreground"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </header>
        <div className="p-6 md:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
      <div className="fixed bottom-6 right-6 hidden md:flex items-center gap-3 rounded-full border border-border bg-card/80 px-4 py-3 shadow-lg backdrop-blur">
        <div
          className="relative flex h-12 w-12 items-center justify-center rounded-full"
          style={{
            background: `conic-gradient(hsl(var(--primary)) ${usagePercent * 360}deg, hsl(var(--muted)) 0deg)`,
          }}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-background text-xs font-semibold">
            {linkCount}/{usageLimit}
          </div>
        </div>
        <div className="text-xs">
          <p className="font-semibold text-foreground">Link usage</p>
          <p className="text-muted-foreground">
            {usagePercent >= 1 ? "Cap reached" : "Free cap"}
          </p>
        </div>
      </div>
      {isMobileOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-background/70"
            onClick={() => setIsMobileOpen(false)}
            aria-label="Close menu"
          />
          <aside className="absolute left-0 top-0 h-full w-72 bg-card shadow-2xl border-r border-border p-6 flex flex-col">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center">
                <img src="/keynou_drove_logo.png" alt="Keynou Drive" className="h-12 w-auto drop-shadow" />
              </Link>
              <button
                type="button"
                onClick={() => setIsMobileOpen(false)}
                className="rounded-full border border-border p-2 text-muted-foreground"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav className="mt-6 flex-1 space-y-1">
              {sidebarItems.map((item) => (
                <Link
                  key={`mobile-${item.path}-${item.label}`}
                  href={item.path}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                    pathname === item.path
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="glass rounded-xl p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold">Premium Access</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                {profile?.subscription_active
                  ? `Access enabled · Cap: ${profile.link_limit} links`
                  : "Want more than the free limit? Request a subscription and tell us how many links you need."}
              </p>
              <div className="text-xs text-muted-foreground mb-3">
                Usage: {linkCount} / {usageLimit}
              </div>
              <Button
                size="sm"
                className="w-full bg-gradient-primary hover:opacity-90 text-xs"
                onClick={() => {
                  setIsMobileOpen(false);
                  router.push("/dashboard/subscription");
                }}
                type="button"
              >
                Subscribe to premium
              </Button>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground w-full px-3 py-2"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
