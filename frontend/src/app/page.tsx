"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Check,
  Crown,
  Globe2,
  Link2,
  Mail,
  MessageSquare,
  Phone,
  Shield,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { driveApi } from "@/lib/api";

const features = [
  { icon: Link2, title: "Global short links", desc: "Create compact, globally unique short codes that never collide." },
  { icon: Shield, title: "Branded splash pages", desc: "Show your logo, colors, and loading splash before every redirect." },
  { icon: Globe2, title: "Custom domains", desc: "Map multiple domains to the same workspace and swap instantly." },
  { icon: BarChart3, title: "Live click analytics", desc: "Track clicks, referrers, devices, and geo in real time." },
  { icon: Zap, title: "Instant redirects", desc: "Fast caching and 60-minute resolve TTL for stable performance." },
  { icon: Crown, title: "Team-ready controls", desc: "Manual access controls, cap approvals, and admin review flows." },
];

const reviews = [
  {
    quote: "We moved 4 teams over in a day. The branded splash pages alone doubled trust on outbound links.",
    name: "Ayesha K.",
    role: "Growth Lead",
  },
  {
    quote: "Short links finally feel premium. Global codes, custom domains, and live analytics in one place.",
    name: "Daniel R.",
    role: "Head of Marketing Ops",
  },
  {
    quote: "Cap controls and manual approvals let us run enterprise clients without overbuilding billing.",
    name: "Nadia S.",
    role: "Founder",
  },
];

const faqs = [
  {
    question: "How is Keynou Drive different from other shorteners?",
    answer:
      "You get branded splash screens, global short codes, multi-domain support, and real-time analytics without extra tools.",
  },
  {
    question: "Can I use my own domain?",
    answer: "Yes. Connect and verify multiple domains, then choose the default for every link you create.",
  },
  {
    question: "Do you support custom aliases?",
    answer: "Yes. Create human-friendly slugs with a 255 character limit and guaranteed uniqueness.",
  },
  {
    question: "Is there a free tier?",
    answer: "Yes. Free accounts have a small cap. You can request higher caps from the dashboard at any time.",
  },
];

export default function Home() {
  const [url, setUrl] = useState("");
  const [contact, setContact] = useState({ name: "", email: "", phone: "", message: "" });
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);

  const handleContactSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!contact.name || !contact.email || !contact.phone || !contact.message) {
      toast.error("Please fill out all contact fields.");
      return;
    }

    setIsSubmittingContact(true);
    try {
      await driveApi.createSubscriptionRequest(contact);
      toast.success("Your request has been sent.");
      setContact({ name: "", email: "", phone: "", message: "" });
    } finally {
      setIsSubmittingContact(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 z-50 w-full glass">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <Link href="/" className="flex items-center">
            <img src="/keynou_drove_logo.png" alt="Keynou Drive" className="h-9 w-auto" />
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              title="Jump to features"
            >
              Features
            </a>
            <a
              href="#reviews"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              title="Jump to reviews"
            >
              Reviews
            </a>
            <a
              href="#faq"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              title="Jump to FAQ"
            >
              FAQ
            </a>
            <a
              href="#contact"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              title="Jump to contact form"
            >
              Contact
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-gradient-primary hover:opacity-90 transition-opacity">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden pb-24 pt-32">
        <div className="absolute inset-0 grid-pattern opacity-40" />
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[120px] animate-pulse-glow" />

        <div className="container relative z-10 mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-sm text-primary">
              <Zap className="h-3.5 w-3.5" />
              Built for modern teams shipping branded links
            </div>
            <h1 className="font-display text-5xl font-bold tracking-tight leading-[1.1] md:text-7xl">
              Short links that <span className="text-gradient">feel premium</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground md:text-xl">
              Launch branded, global short links with live analytics, custom domains, and a polished redirect splash that
              looks like your product.
            </p>

            <div className="mx-auto mt-10 flex max-w-xl flex-col gap-3 sm:flex-row">
              <Input
                type="url"
                placeholder="Paste your long URL here..."
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                className="h-12 bg-secondary/50 border-border/50 text-base"
                aria-label="Paste a long URL to shorten"
              />
              <Link href="/signup">
                <Button className="h-12 px-8 bg-gradient-primary hover:opacity-90 transition-opacity whitespace-nowrap">
                  Launch my short links <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mx-auto mt-20 max-w-5xl"
          >
            <div className="glow-primary rounded-2xl p-1 glass">
              <div className="rounded-xl bg-card p-6 md:p-8">
                <div className="mb-6 flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-destructive/60" />
                  <div className="h-3 w-3 rounded-full bg-accent/60" />
                  <div className="h-3 w-3 rounded-full bg-primary/60" />
                  <span className="ml-4 font-mono text-xs text-muted-foreground">dashboard.drive.keynou.com</span>
                </div>
                <div className="mb-6 grid grid-cols-3 gap-4">
                  {[
                    { label: "Total Clicks", value: "124,892", change: "+12.5%" },
                    { label: "Active Links", value: "1,247", change: "+8.3%" },
                    { label: "Countries", value: "89", change: "+4.1%" },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-lg bg-secondary/30 p-4">
                      <p className="mb-1 text-xs text-muted-foreground">{stat.label}</p>
                      <p className="font-display text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-accent">{stat.change}</p>
                    </div>
                  ))}
                </div>
                <div className="flex h-40 items-center justify-center rounded-lg bg-secondary/20">
                  <div className="flex h-24 items-end gap-1">
                    {[40, 65, 45, 80, 55, 70, 90, 60, 75, 85, 50, 95].map((height, index) => (
                      <div
                        key={index}
                        className="w-6 rounded-t bg-gradient-primary opacity-70 md:w-10"
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="reviews" className="py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="font-display text-3xl font-bold md:text-5xl">Loved by teams shipping links fast</h2>
            <p className="mx-auto mt-4 max-w-md text-lg text-muted-foreground">
              Trusted by growth, product, and ops teams who need reliable branded links without busywork.
            </p>
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-3">
            {reviews.map((review, index) => (
              <motion.div
                key={review.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-2xl p-6"
              >
                <p className="text-sm text-muted-foreground">“{review.quote}”</p>
                <div className="mt-6">
                  <p className="text-sm font-semibold">{review.name}</p>
                  <p className="text-xs text-muted-foreground">{review.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="font-display text-3xl font-bold md:text-5xl">FAQ</h2>
            <p className="mx-auto mt-4 max-w-md text-lg text-muted-foreground">
              Quick answers before you launch your next short link.
            </p>
          </motion.div>

          <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="glass rounded-2xl p-6"
              >
                <h3 className="font-display text-lg font-semibold">{faq.question}</h3>
                <p className="mt-3 text-sm text-muted-foreground">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="font-display text-3xl font-bold md:text-5xl">
              Everything you need to <span className="text-gradient">grow</span>
            </h2>
            <p className="mx-auto mt-4 max-w-md text-lg text-muted-foreground">
              Powerful tools to shorten, brand, track, and optimize every link.
            </p>
          </motion.div>

          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-xl p-6 transition-colors hover:border-primary/30 group"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="font-display text-3xl font-bold md:text-5xl">Launch with the right cap</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Tell us the volume you need and we’ll enable the exact cap for your team. No hidden upgrades.
            </p>
          </motion.div>

          <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass rounded-2xl p-8"
            >
              <h3 className="font-display text-xl font-semibold">Current caps stay in place</h3>
              <p className="mb-6 mt-2 text-sm text-muted-foreground">
                You’re no longer sending users through pricing or checkout. Instead, users request changes and you enable
                or disable access manually.
              </p>
              <ul className="mb-8 space-y-3">
                {[
                  "Users keep their current link caps",
                  "Requests can ask for higher limits",
                  "You collect payment personally",
                  "You manually allow or disallow access from the admin panel",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-accent" /> {item}
                  </li>
                ))}
              </ul>
              <div className="grid gap-3 sm:grid-cols-3">
                {[{ icon: Mail, label: "Manual review" }, { icon: Phone, label: "Direct follow-up" }, { icon: MessageSquare, label: "Cap increase requests" }].map(
                  ({ icon: Icon, label }) => (
                    <div key={label} className="rounded-xl bg-secondary/30 p-4">
                      <Icon className="mb-2 h-4 w-4 text-primary" />
                      <p className="text-sm font-medium">{label}</p>
                    </div>
                  ),
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass relative rounded-2xl border-primary/40 p-8"
            >
              <h3 className="font-display mb-6 text-xl font-semibold">Request a cap increase</h3>
              <form className="space-y-4" onSubmit={handleContactSubmit}>
                <Input
                  placeholder="Your name"
                  value={contact.name}
                  onChange={(event) => setContact((current) => ({ ...current, name: event.target.value }))}
                  className="h-11"
                  autoComplete="name"
                  aria-label="Your name"
                  required
                />
                <Input
                  type="email"
                  placeholder="Email address"
                  value={contact.email}
                  onChange={(event) => setContact((current) => ({ ...current, email: event.target.value }))}
                  className="h-11"
                  autoComplete="email"
                  aria-label="Email address"
                  required
                />
                <Input
                  placeholder="Phone number"
                  value={contact.phone}
                  onChange={(event) => setContact((current) => ({ ...current, phone: event.target.value }))}
                  className="h-11"
                  autoComplete="tel"
                  aria-label="Phone number"
                  required
                />
                <Textarea
                  placeholder="Tell us what cap or access change you need."
                  value={contact.message}
                  onChange={(event) => setContact((current) => ({ ...current, message: event.target.value }))}
                  rows={5}
                  aria-label="Request details"
                  required
                />
                <div className="flex flex-col items-stretch gap-3 sm:flex-row">
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-primary hover:opacity-90 transition-opacity"
                    disabled={isSubmittingContact}
                  >
                    {isSubmittingContact ? "Sending Request..." : "Send Request"}
                  </Button>
                  <Link href="/login" className="flex-1">
                    <Button variant="outline" className="w-full">
                      Log In
                    </Button>
                  </Link>
                </div>
                <p className="text-xs text-muted-foreground">
                  Users can also submit requests from inside their dashboard, where they appear in your admin panel for
                  manual review.
                </p>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-12">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-6 md:flex-row">
          <img src="/keynou_drove_logo.png" alt="Keynou Drive" className="h-8 w-auto" />
          <p className="text-sm text-muted-foreground">© 2026 drive.keynou.com. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
