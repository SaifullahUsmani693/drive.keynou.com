import DashboardLayout from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { ArrowUpRight, Link2, MousePointerClick, Globe2, TrendingUp, Plus, Copy, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useLinks, useCreateLink, generateShortCode } from "@/hooks/useLinks";
import { useDashboardStats } from "@/hooks/useAnalytics";
import { toast } from "sonner";
import { useProfileAccess } from "@/hooks/useProfileAccess";

const Dashboard = () => {
  const [newUrl, setNewUrl] = useState("");
  const { data: links, isLoading: linksLoading } = useLinks();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const createLink = useCreateLink();
  const { data: profile } = useProfileAccess();

  const handleShorten = () => {
    if (!newUrl) return;
    createLink.mutate({ destinationUrl: newUrl, shortCode: generateShortCode() }, {
      onSuccess: () => setNewUrl(""),
    });
  };

  const statCards = [
    { label: "Total Clicks", value: stats?.totalClicks?.toLocaleString() ?? "0", icon: MousePointerClick },
    { label: "Active Links", value: stats?.activeLinks?.toLocaleString() ?? "0", icon: Link2 },
    { label: "Countries", value: stats?.countries?.toLocaleString() ?? "0", icon: Globe2 },
    { label: "Total Links", value: stats?.totalLinks?.toLocaleString() ?? "0", icon: TrendingUp },
  ];

  const recentLinks = (links ?? []).slice(0, 5);

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold mb-1">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your link performance</p>
      </div>

      {/* Quick Shorten */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl p-4 mb-8">
        <div className="flex gap-3">
          <Input
            placeholder="Paste a long URL to shorten..."
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            className="h-11 bg-secondary/30"
            onKeyDown={(e) => e.key === "Enter" && handleShorten()}
          />
          <Button onClick={handleShorten} disabled={createLink.isPending} className="h-11 px-6 bg-gradient-primary hover:opacity-90 gap-2">
            {createLink.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> Shorten</>}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          {profile?.subscription_active
            ? `Access enabled. You are using ${(links ?? []).length} of ${profile.link_limit} allowed links.`
            : "Access is currently disabled. Contact admin to enable your account or raise your cap."}
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <stat.icon className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="font-display text-2xl font-bold">
              {statsLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : stat.value}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Links */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="glass rounded-xl overflow-hidden">
        <div className="p-5 border-b border-border">
          <h2 className="font-display font-semibold">Recent Links</h2>
        </div>
        {linksLoading ? (
          <div className="p-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
        ) : recentLinks.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-sm">No links yet. Shorten your first URL above!</div>
        ) : (
          <div className="divide-y divide-border">
            {recentLinks.map((link) => (
              <div key={link.id} className="p-4 flex items-center justify-between hover:bg-secondary/20 transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-primary truncate">drive.keynou.com/{link.short_code}</p>
                    <button onClick={() => { navigator.clipboard.writeText(`drive.keynou.com/${link.short_code}`); toast.success("Copied!"); }} className="text-muted-foreground hover:text-foreground">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <a href={link.destination_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
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
            ))}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default Dashboard;
