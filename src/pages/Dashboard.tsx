import DashboardLayout from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, Link2, MousePointerClick, Globe2, TrendingUp, Plus, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const stats = [
  { label: "Total Clicks", value: "24,892", change: "+12.5%", up: true, icon: MousePointerClick },
  { label: "Active Links", value: "147", change: "+8.3%", up: true, icon: Link2 },
  { label: "Countries", value: "42", change: "+4.1%", up: true, icon: Globe2 },
  { label: "CTR", value: "4.8%", change: "-0.3%", up: false, icon: TrendingUp },
];

const recentLinks = [
   { short: "drive.keynou.com/launch", original: "https://example.com/very-long-url-launch-page", clicks: 1284, created: "2h ago" },
  { short: "drive.keynou.com/promo", original: "https://example.com/summer-promo-2024", clicks: 892, created: "5h ago" },
  { short: "drive.keynou.com/blog", original: "https://example.com/blog/how-to-grow", clicks: 456, created: "1d ago" },
  { short: "drive.keynou.com/app", original: "https://example.com/download-app", clicks: 321, created: "2d ago" },
];

const Dashboard = () => {
  const [newUrl, setNewUrl] = useState("");

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold mb-1">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your link performance</p>
      </div>

      {/* Quick Shorten */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-xl p-4 mb-8"
      >
        <div className="flex gap-3">
          <Input
            placeholder="Paste a long URL to shorten..."
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            className="h-11 bg-secondary/30"
          />
          <Button className="h-11 px-6 bg-gradient-primary hover:opacity-90 gap-2">
            <Plus className="w-4 h-4" /> Shorten
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <stat.icon className="w-4 h-4 text-muted-foreground" />
              <span className={`text-xs font-medium flex items-center gap-0.5 ${stat.up ? "text-accent" : "text-destructive"}`}>
                {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.change}
              </span>
            </div>
            <p className="font-display text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Chart placeholder */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-xl p-6 mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold">Click Analytics</h2>
          <div className="flex gap-2">
            {["7d", "30d", "90d"].map((p) => (
              <button
                key={p}
                className="text-xs px-3 py-1 rounded-md bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <div className="h-48 flex items-end gap-1">
          {Array.from({ length: 30 }, (_, i) => {
            const h = 20 + Math.sin(i * 0.5) * 30 + Math.random() * 30;
            return (
              <div
                key={i}
                className="flex-1 rounded-t bg-gradient-primary opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
                style={{ height: `${h}%` }}
              />
            );
          })}
        </div>
      </motion.div>

      {/* World Map Placeholder */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-xl p-6 mb-8"
      >
        <h2 className="font-display font-semibold mb-4">Geographic Distribution</h2>
        <div className="h-64 rounded-lg bg-secondary/20 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            {/* Simplified world map dots */}
            {Array.from({ length: 50 }, (_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-primary animate-pulse-glow"
                style={{
                  left: `${10 + Math.random() * 80}%`,
                  top: `${10 + Math.random() * 80}%`,
                  animationDelay: `${Math.random() * 3}s`,
                }}
              />
            ))}
          </div>
          <div className="relative z-10 text-center">
            <Globe2 className="w-12 h-12 text-primary/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">World map visualization</p>
            <p className="text-xs text-muted-foreground/60">Connect backend to see live data</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {[
            { country: "United States", pct: "34%" },
            { country: "United Kingdom", pct: "18%" },
            { country: "Germany", pct: "12%" },
            { country: "India", pct: "9%" },
          ].map((c) => (
            <div key={c.country} className="bg-secondary/20 rounded-lg p-3">
              <p className="text-sm font-medium">{c.country}</p>
              <p className="text-xs text-muted-foreground">{c.pct} of traffic</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recent Links */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="glass rounded-xl overflow-hidden"
      >
        <div className="p-5 border-b border-border">
          <h2 className="font-display font-semibold">Recent Links</h2>
        </div>
        <div className="divide-y divide-border">
          {recentLinks.map((link) => (
            <div key={link.short} className="p-4 flex items-center justify-between hover:bg-secondary/20 transition-colors">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-primary truncate">{link.short}</p>
                  <button className="text-muted-foreground hover:text-foreground">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button className="text-muted-foreground hover:text-foreground">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{link.original}</p>
              </div>
              <div className="text-right ml-4">
                <p className="text-sm font-semibold">{link.clicks.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{link.created}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Dashboard;
