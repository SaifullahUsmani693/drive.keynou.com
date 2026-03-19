import Link from "next/link";
import { BarChart3, ShieldCheck, Users, Link2, ArrowUpRight } from "lucide-react";

const highlights = [
  {
    title: "Manual access control",
    description: "Approve access and caps manually from the admin panel. No automated billing to manage.",
    icon: ShieldCheck,
  },
  {
    title: "Multi-tenant ready",
    description: "Support multiple domains and teams with a tenant-aware backend architecture.",
    icon: Users,
  },
  {
    title: "Analytics-friendly",
    description: "Capture click events, IP, and geo metadata with optimized queries.",
    icon: BarChart3,
  },
];

const workflow = [
  "Users request access or higher caps",
  "You review requests in Django admin",
  "Enable access and set link caps",
  "Teams shorten links and track performance",
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <header className="flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
            <Link2 className="h-5 w-5 text-emerald-300" />
          </div>
          <span className="text-lg font-semibold tracking-wide">Keynou Drive</span>
        </div>
        <nav className="hidden items-center gap-6 text-sm text-white/70 md:flex">
          <a href="#features" className="hover:text-white">
            Features
          </a>
          <a href="#workflow" className="hover:text-white">
            Workflow
          </a>
          <a href="#contact" className="hover:text-white">
            Contact
          </a>
        </nav>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm hover:border-white/50"
        >
          Open Dashboard <ArrowUpRight className="h-4 w-4" />
        </Link>
      </header>

      <main className="flex-1 px-8 pb-20 pt-8">
        <section className="grid gap-12 md:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.4em] text-emerald-200">Manual subscription access</p>
            <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
              Control access, caps, and branding without automated billing.
            </h1>
            <p className="text-lg text-white/70">
              Keynou Drive combines a Next.js frontend with a Django + DRF backend so you can manually approve
              subscriptions, manage caps, and serve multiple domains with full analytics visibility.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="#contact"
                className="rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-slate-950"
              >
                Request Access
              </Link>
              <Link
                href="/dashboard"
                className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white"
              >
                View Dashboard
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_0_60px_rgba(16,185,129,0.25)]">
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                <p className="text-sm text-white/70">Current access</p>
                <p className="text-2xl font-semibold">Pending approval</p>
                <p className="text-xs text-white/50">Cap: 50 links · Domain: drive.keynou.com</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                <p className="text-sm text-white/70">Next action</p>
                <p className="text-lg font-semibold">Review request → Enable access</p>
              </div>
              <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-4">
                <p className="text-sm text-emerald-100">Admin control</p>
                <p className="text-lg font-semibold text-emerald-50">Approve caps in seconds</p>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="mt-20 grid gap-6 md:grid-cols-3">
          {highlights.map((item) => (
            <div key={item.title} className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <item.icon className="h-6 w-6 text-emerald-300" />
              <h3 className="mt-4 text-xl font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-white/70">{item.description}</p>
            </div>
          ))}
        </section>

        <section id="workflow" className="mt-20 grid gap-10 md:grid-cols-[0.6fr_0.4fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-semibold">Manual workflow</h2>
            <p className="mt-2 text-sm text-white/70">
              Every access change is intentional and audited. No automated billing hooks required.
            </p>
            <ol className="mt-6 space-y-3 text-sm text-white/80">
              {workflow.map((step, index) => (
                <li key={step} className="flex items-start gap-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/20 via-transparent to-transparent p-6">
            <h3 className="text-xl font-semibold">Stack highlight</h3>
            <p className="mt-2 text-sm text-white/70">
              Django Admin, DRF services, Redis caching, and a tenant-aware analytics pipeline.
            </p>
            <div className="mt-6 flex flex-wrap gap-2 text-xs text-white/60">
              <span className="rounded-full border border-white/20 px-3 py-1">DRF Services</span>
              <span className="rounded-full border border-white/20 px-3 py-1">Multi-domain</span>
              <span className="rounded-full border border-white/20 px-3 py-1">Redis Cache</span>
              <span className="rounded-full border border-white/20 px-3 py-1">IP/Geo Logging</span>
            </div>
          </div>
        </section>

        <section id="contact" className="mt-20 rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Request higher caps</h2>
              <p className="mt-2 text-sm text-white/70">
                Reach out to request a cap increase or custom domain access. We approve requests manually.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950"
            >
              Go to dashboard
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
