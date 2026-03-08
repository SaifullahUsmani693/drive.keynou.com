import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Globe2, Link2, Zap, Shield, Crown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const features = [
  { icon: Link2, title: "Custom Short Links", desc: "Create branded, memorable links that boost click-through rates." },
  { icon: BarChart3, title: "Deep Analytics", desc: "Track clicks, referrers, devices, and geographic data in real-time." },
  { icon: Globe2, title: "World Map Tracking", desc: "Visualize your link traffic across the globe with interactive maps." },
  { icon: Zap, title: "Instant Redirects", desc: "Lightning-fast redirects with 99.9% uptime guarantee." },
  { icon: Shield, title: "Custom Domains", desc: "Connect your own domain for fully branded short links." },
  { icon: Crown, title: "White Label", desc: "Remove our branding and add your company logo on Pro plan." },
];

const Index = () => {
  const [url, setUrl] = useState("");

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 glass">
        <div className="container mx-auto flex items-center justify-between h-16 px-6">
          <Link to="/" className="font-display text-xl font-bold text-foreground">
            short<span className="text-primary">.keynou</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link to="/signup">
              <Button size="sm" className="bg-gradient-primary hover:opacity-90 transition-opacity">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-40" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px] animate-pulse-glow" />
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.7 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-sm text-primary mb-8">
              <Zap className="w-3.5 h-3.5" />
              Trusted by 10,000+ marketers
            </div>
            <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
              Short links,{" "}
              <span className="text-gradient">big impact</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl mx-auto">
              The modern URL shortener with powerful analytics, custom domains, and branded redirects for growing businesses.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
              <Input
                placeholder="Paste your long URL here..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="h-12 bg-secondary/50 border-border/50 text-base"
              />
              <Link to="/signup">
                <Button className="h-12 px-8 bg-gradient-primary hover:opacity-90 transition-opacity whitespace-nowrap">
                  Shorten URL <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-20 max-w-5xl mx-auto"
          >
            <div className="glass rounded-2xl p-1 glow-primary">
              <div className="bg-card rounded-xl p-6 md:p-8">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-3 h-3 rounded-full bg-destructive/60" />
                  <div className="w-3 h-3 rounded-full bg-accent/60" />
                  <div className="w-3 h-3 rounded-full bg-primary/60" />
                  <span className="ml-4 text-xs text-muted-foreground font-mono">dashboard.short.keynou.com</span>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {[
                    { label: "Total Clicks", value: "124,892", change: "+12.5%" },
                    { label: "Active Links", value: "1,247", change: "+8.3%" },
                    { label: "Countries", value: "89", change: "+4.1%" },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-secondary/30 rounded-lg p-4">
                      <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                      <p className="font-display text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-accent">{stat.change}</p>
                    </div>
                  ))}
                </div>
                <div className="h-40 bg-secondary/20 rounded-lg flex items-center justify-center">
                  <div className="flex gap-1 items-end h-24">
                    {[40, 65, 45, 80, 55, 70, 90, 60, 75, 85, 50, 95].map((h, i) => (
                      <div
                        key={i}
                        className="w-6 md:w-10 rounded-t bg-gradient-primary opacity-70"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
              Everything you need to <span className="text-gradient">grow</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              Powerful tools to shorten, brand, track, and optimize every link.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-xl p-6 hover:border-primary/30 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">Simple pricing</h2>
            <p className="text-muted-foreground text-lg">Start free, upgrade when you need more.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass rounded-2xl p-8"
            >
              <h3 className="font-display text-xl font-semibold mb-2">Free</h3>
              <p className="text-4xl font-display font-bold mb-1">$0<span className="text-base font-normal text-muted-foreground">/mo</span></p>
              <p className="text-sm text-muted-foreground mb-6">Perfect for getting started</p>
              <ul className="space-y-3 mb-8">
                {["50 short links", "Basic analytics", "short.keynou.com branding", "Community support"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-accent" /> {item}
                  </li>
                ))}
              </ul>
              <Link to="/signup">
                <Button variant="outline" className="w-full">Get Started Free</Button>
              </Link>
            </motion.div>

            {/* Pro */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative glass rounded-2xl p-8 border-primary/40"
            >
              <div className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-gradient-primary text-xs font-semibold text-primary-foreground">
                Popular
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">Pro</h3>
              <p className="text-4xl font-display font-bold mb-1">$15<span className="text-base font-normal text-muted-foreground">/mo</span></p>
              <p className="text-sm text-muted-foreground mb-6">For serious marketers</p>
              <ul className="space-y-3 mb-8">
                {[
                  "Unlimited short links",
                  "Advanced analytics & geo tracking",
                  "Custom domain support",
                  "Your branding & logo",
                  "Priority support",
                  "API access",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-accent" /> {item}
                  </li>
                ))}
              </ul>
              <Link to="/signup">
                <Button className="w-full bg-gradient-primary hover:opacity-90 transition-opacity">
                  Start Pro Trial
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-display font-bold">short<span className="text-primary">.keynou</span></p>
          <p className="text-sm text-muted-foreground">© 2026 short.keynou.com. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
