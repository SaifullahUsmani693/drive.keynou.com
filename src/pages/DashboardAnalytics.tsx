import DashboardLayout from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { Globe2, Monitor, Smartphone, Tablet } from "lucide-react";

const topLinks = [
  { name: "short.keynou.com/launch", clicks: 1284 },
  { name: "short.keynou.com/promo", clicks: 892 },
  { name: "short.keynou.com/blog", clicks: 456 },
  { name: "short.keynou.com/app", clicks: 321 },
  { name: "short.keynou.com/docs", clicks: 198 },
];

const topCountries = [
  { name: "United States", clicks: 8432, pct: 34 },
  { name: "United Kingdom", clicks: 4467, pct: 18 },
  { name: "Germany", clicks: 2973, pct: 12 },
  { name: "India", clicks: 2230, pct: 9 },
  { name: "Brazil", clicks: 1735, pct: 7 },
  { name: "Canada", clicks: 1487, pct: 6 },
];

const devices = [
  { name: "Desktop", pct: 52, icon: Monitor },
  { name: "Mobile", pct: 38, icon: Smartphone },
  { name: "Tablet", pct: 10, icon: Tablet },
];

const referrers = [
  { name: "Twitter/X", clicks: 4521 },
  { name: "Google", clicks: 3892 },
  { name: "Facebook", clicks: 2134 },
  { name: "LinkedIn", clicks: 1567 },
  { name: "Direct", clicks: 6234 },
];

const DashboardAnalytics = () => {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold mb-1">Analytics</h1>
        <p className="text-sm text-muted-foreground">Detailed performance insights</p>
      </div>

      {/* Chart */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-xl p-6 mb-8">
        <h2 className="font-display font-semibold mb-4">Clicks Over Time</h2>
        <div className="h-48 flex items-end gap-0.5">
          {Array.from({ length: 60 }, (_, i) => {
            const h = 15 + Math.sin(i * 0.3) * 25 + Math.random() * 35;
            return (
              <div
                key={i}
                className="flex-1 rounded-t bg-gradient-primary opacity-50 hover:opacity-100 transition-opacity"
                style={{ height: `${h}%` }}
              />
            );
          })}
        </div>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* World Map */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="glass rounded-xl p-6">
          <h2 className="font-display font-semibold mb-4 flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-primary" /> Top Countries
          </h2>
          <div className="space-y-3">
            {topCountries.map((c) => (
              <div key={c.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{c.name}</span>
                  <span className="text-muted-foreground">{c.clicks.toLocaleString()} ({c.pct}%)</span>
                </div>
                <div className="h-2 bg-secondary/30 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-primary rounded-full" style={{ width: `${c.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Links */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="glass rounded-xl p-6">
          <h2 className="font-display font-semibold mb-4">Top Performing Links</h2>
          <div className="space-y-3">
            {topLinks.map((l, i) => (
              <div key={l.name} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-semibold">
                    {i + 1}
                  </span>
                  <span className="text-sm text-primary">{l.name}</span>
                </div>
                <span className="text-sm font-semibold">{l.clicks.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Devices */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="glass rounded-xl p-6">
          <h2 className="font-display font-semibold mb-4">Devices</h2>
          <div className="space-y-4">
            {devices.map((d) => (
              <div key={d.name} className="flex items-center gap-4">
                <d.icon className="w-5 h-5 text-muted-foreground" />
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span>{d.name}</span>
                    <span className="text-muted-foreground">{d.pct}%</span>
                  </div>
                  <div className="h-2 bg-secondary/30 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-accent rounded-full" style={{ width: `${d.pct}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Referrers */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="glass rounded-xl p-6">
          <h2 className="font-display font-semibold mb-4">Top Referrers</h2>
          <div className="space-y-3">
            {referrers.map((r) => (
              <div key={r.name} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <span className="text-sm">{r.name}</span>
                <span className="text-sm font-semibold">{r.clicks.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardAnalytics;
