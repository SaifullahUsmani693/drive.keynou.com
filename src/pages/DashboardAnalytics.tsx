import DashboardLayout from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { Globe2, Monitor, Smartphone, Tablet, Loader2 } from "lucide-react";
import { useAnalyticsData } from "@/hooks/useAnalytics";

const deviceIcons: Record<string, any> = { Desktop: Monitor, Mobile: Smartphone, Tablet: Tablet };

const DashboardAnalytics = () => {
  const { data, isLoading } = useAnalyticsData();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
      </DashboardLayout>
    );
  }

  const { topCountries = [], topLinks = [], devices = [], referrers = [], clicksOverTime = [], totalClicks = 0 } = data ?? {};
  const maxDayClicks = Math.max(...clicksOverTime.map((d) => d.clicks), 1);

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold mb-1">Analytics</h1>
        <p className="text-sm text-muted-foreground">Detailed performance insights</p>
      </div>

      {totalClicks === 0 ? (
        <div className="glass rounded-xl p-12 text-center text-muted-foreground text-sm">
          No click data yet. Share your links to start seeing analytics!
        </div>
      ) : (
        <>
          {/* Chart */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-xl p-6 mb-8">
            <h2 className="font-display font-semibold mb-4">Clicks Over Time (Last 30 Days)</h2>
            <div className="h-48 flex items-end gap-0.5">
              {clicksOverTime.map((d) => (
                <div
                  key={d.date}
                  className="flex-1 rounded-t bg-gradient-primary opacity-50 hover:opacity-100 transition-opacity"
                  style={{ height: `${Math.max((d.clicks / maxDayClicks) * 100, 2)}%` }}
                  title={`${d.date}: ${d.clicks} clicks`}
                />
              ))}
            </div>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Top Countries */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="glass rounded-xl p-6">
              <h2 className="font-display font-semibold mb-4 flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-primary" /> Top Countries
              </h2>
              {topCountries.length === 0 ? (
                <p className="text-sm text-muted-foreground">No country data yet</p>
              ) : (
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
              )}
            </motion.div>

            {/* Top Links */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="glass rounded-xl p-6">
              <h2 className="font-display font-semibold mb-4">Top Performing Links</h2>
              {topLinks.length === 0 ? (
                <p className="text-sm text-muted-foreground">No link data yet</p>
              ) : (
                <div className="space-y-3">
                  {topLinks.map((l, i) => (
                    <div key={l.name} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-semibold">{i + 1}</span>
                        <span className="text-sm text-primary">{l.name}</span>
                      </div>
                      <span className="text-sm font-semibold">{l.clicks.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Devices */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="glass rounded-xl p-6">
              <h2 className="font-display font-semibold mb-4">Devices</h2>
              {devices.length === 0 ? (
                <p className="text-sm text-muted-foreground">No device data yet</p>
              ) : (
                <div className="space-y-4">
                  {devices.map((d) => {
                    const Icon = deviceIcons[d.name] || Monitor;
                    return (
                      <div key={d.name} className="flex items-center gap-4">
                        <Icon className="w-5 h-5 text-muted-foreground" />
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
                    );
                  })}
                </div>
              )}
            </motion.div>

            {/* Referrers */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="glass rounded-xl p-6">
              <h2 className="font-display font-semibold mb-4">Top Referrers</h2>
              {referrers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No referrer data yet</p>
              ) : (
                <div className="space-y-3">
                  {referrers.map((r) => (
                    <div key={r.name} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                      <span className="text-sm">{r.name}</span>
                      <span className="text-sm font-semibold">{r.clicks.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default DashboardAnalytics;
