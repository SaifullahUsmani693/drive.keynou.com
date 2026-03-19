"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, Copy, Link2, Loader2, ShieldCheck } from "lucide-react";

import { analyticsApi, driveApi } from "@/lib/api";
import { useAppSelector } from "@/lib/hooks";

const initialForm = { name: "", email: "", phone: "", message: "" };
const initialLink = { destination_url: "", short_code: "" };
const shortBaseUrl = process.env.NEXT_PUBLIC_SHORT_BASE_URL || "http://localhost:8000/api/drive/r";

export default function DashboardPage() {
  const user = useAppSelector((state) => state.auth.user);
  const profile = user?.profile;
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [links, setLinks] = useState<Array<any>>([]);
  const [requests, setRequests] = useState<Array<any>>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [linkForm, setLinkForm] = useState(initialLink);
  const [isLoadingLinks, setIsLoadingLinks] = useState(false);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [isCreatingLink, setIsCreatingLink] = useState(false);

  const statusLabel = useMemo(() => {
    if (!profile) return "Pending";
    return profile.subscription_active ? "Enabled" : "Pending";
  }, [profile]);

  const handleChange = (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleLinkChange = (field: keyof typeof linkForm) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setLinkForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  useEffect(() => {
    const loadLinks = async () => {
      setIsLoadingLinks(true);
      try {
        const response = await driveApi.listLinks();
        setLinks(response.data?.data ?? []);
      } finally {
        setIsLoadingLinks(false);
      }
    };

    const loadRequests = async () => {
      setIsLoadingRequests(true);
      try {
        const response = await driveApi.listSubscriptionRequests();
        setRequests(response.data?.data ?? []);
      } finally {
        setIsLoadingRequests(false);
      }
    };

    const loadAnalytics = async () => {
      setIsLoadingAnalytics(true);
      try {
        const response = await analyticsApi.summary();
        setAnalytics(response.data?.data ?? null);
      } finally {
        setIsLoadingAnalytics(false);
      }
    };

    loadLinks();
    loadRequests();
    loadAnalytics();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await driveApi.createSubscriptionRequest(form);
      setForm(initialForm);
      const response = await driveApi.listSubscriptionRequests();
      setRequests(response.data?.data ?? []);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateLink = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsCreatingLink(true);
    try {
      await driveApi.createLink(linkForm);
      setLinkForm(initialLink);
      const response = await driveApi.listLinks();
      setLinks(response.data?.data ?? []);
    } finally {
      setIsCreatingLink(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-10">
        <header className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">Dashboard</p>
          <h1 className="text-3xl font-semibold">Manual access overview</h1>
          <p className="text-sm text-white/70">
            Your account status and cap requests are managed manually. Submit a request when you need higher limits.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Access status",
              value: statusLabel,
              note: profile?.subscription_active ? "You can shorten links." : "Awaiting admin approval.",
              icon: ShieldCheck,
            },
            {
              title: "Link cap",
              value: profile ? `${profile.link_limit} links` : "—",
              note: "Caps are adjusted manually.",
              icon: Link2,
            },
            {
              title: "Analytics",
              value: "Enabled",
              note: "IP + geo tracking is on.",
              icon: BarChart3,
            },
          ].map((card) => (
            <div key={card.title} className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <card.icon className="h-6 w-6 text-emerald-300" />
              <p className="mt-4 text-sm text-white/60">{card.title}</p>
              <p className="text-2xl font-semibold">{card.value}</p>
              <p className="mt-2 text-xs text-white/50">{card.note}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">Shorten a link</h2>
            <p className="mt-2 text-sm text-white/70">
              Create branded short links with tenant-aware limits.
            </p>
            <form onSubmit={handleCreateLink} className="mt-6 space-y-4">
              <input
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40"
                placeholder="Destination URL"
                value={linkForm.destination_url}
                onChange={handleLinkChange("destination_url")}
                required
              />
              <input
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40"
                placeholder="Short code (e.g. promo)"
                value={linkForm.short_code}
                onChange={handleLinkChange("short_code")}
                required
              />
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-slate-950"
                disabled={isCreatingLink}
              >
                {isCreatingLink ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {isCreatingLink ? "Creating..." : "Create short link"}
              </button>
            </form>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">Analytics summary</h2>
            <p className="mt-2 text-sm text-white/70">Snapshot of the last 7 days.</p>
            {isLoadingAnalytics ? (
              <div className="mt-6 flex items-center gap-2 text-sm text-white/70">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading analytics...
              </div>
            ) : (
              <div className="mt-6 grid gap-4 text-sm">
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <span>Total clicks</span>
                  <span className="font-semibold">{analytics?.total_clicks ?? 0}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <span>Recent clicks</span>
                  <span className="font-semibold">{analytics?.recent_clicks ?? 0}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <span>Unique links</span>
                  <span className="font-semibold">{analytics?.unique_links ?? 0}</span>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-xs text-white/50">Top links</p>
                  <ul className="mt-2 space-y-2">
                    {(analytics?.top_links ?? []).map((item: any) => (
                      <li key={item.link_id} className="flex items-center justify-between text-sm">
                        <span>{item.link__short_code}</span>
                        <span className="text-white/60">{item.total}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Your links</h2>
              <p className="text-sm text-white/70">Manage and share your most recent short links.</p>
            </div>
          </div>
          {isLoadingLinks ? (
            <div className="mt-6 flex items-center gap-2 text-sm text-white/70">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading links...
            </div>
          ) : links.length === 0 ? (
            <p className="mt-6 text-sm text-white/60">No links yet. Create your first short link above.</p>
          ) : (
            <div className="mt-6 divide-y divide-white/10">
              {links.map((link) => {
                const shortUrl = `${shortBaseUrl}/${link.short_code}`;
                return (
                  <div key={link.id} className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-emerald-200">{shortUrl}</p>
                      <p className="text-xs text-white/50">{link.destination_url}</p>
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText(shortUrl)}
                      className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs text-white/70 hover:border-white/40"
                    >
                      <Copy className="h-3 w-3" /> Copy
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">Request a cap increase</h2>
            <p className="mt-2 text-sm text-white/70">
              Submit details and we will manually approve your requested access or cap change.
            </p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <input
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40"
                placeholder="Full name"
                value={form.name}
                onChange={handleChange("name")}
                required
              />
              <input
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40"
                placeholder="Email"
                type="email"
                value={form.email}
                onChange={handleChange("email")}
                required
              />
              <input
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40"
                placeholder="Phone"
                value={form.phone}
                onChange={handleChange("phone")}
              />
              <textarea
                className="min-h-[120px] w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40"
                placeholder="Tell us what cap or access change you need"
                value={form.message}
                onChange={handleChange("message")}
                required
              />
              <button
                type="submit"
                className="rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-slate-950"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending request..." : "Send request"}
              </button>
            </form>
          </div>

          <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-6">
            <h3 className="text-lg font-semibold">Admin review timeline</h3>
            <p className="mt-2 text-sm text-white/70">
              Requests are reviewed manually in Django admin. You will receive access after approval.
            </p>
            <div className="mt-6 space-y-3 text-sm text-white/70">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase text-white/40">Step 1</p>
                <p>Request submitted</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase text-white/40">Step 2</p>
                <p>Manual review + payment confirmation</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase text-white/40">Step 3</p>
                <p>Access enabled + cap updated</p>
              </div>
            </div>
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
              <p className="text-xs uppercase text-white/40">Recent requests</p>
              {isLoadingRequests ? (
                <div className="mt-3 flex items-center gap-2 text-xs text-white/60">
                  <Loader2 className="h-3 w-3 animate-spin" /> Loading...
                </div>
              ) : requests.length === 0 ? (
                <p className="mt-3 text-xs text-white/60">No requests yet.</p>
              ) : (
                <ul className="mt-3 space-y-2 text-xs">
                  {requests.slice(0, 3).map((request) => (
                    <li key={request.id} className="flex items-center justify-between">
                      <span>{request.message.slice(0, 24)}...</span>
                      <span className="text-white/50">{request.status}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
