"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Copy, Globe2, Loader2, Trash2, XCircle } from "lucide-react";

import AuthGuard from "@/components/providers/AuthGuard";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { tenantsApi } from "@/lib/api";

const initialForm = { domain: "", is_primary: false };
const initialToken = { token: "" };

export default function DomainsPage() {
  const [domains, setDomains] = useState<Array<any>>([]);
  const [form, setForm] = useState(initialForm);
  const [tokenForm, setTokenForm] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifyingId, setIsVerifyingId] = useState<number | null>(null);
  const [isRemovingId, setIsRemovingId] = useState<number | null>(null);

  const targetHost = useMemo(() => {
    if (typeof window === "undefined") return "localhost";
    return process.env.NEXT_PUBLIC_CUSTOM_DOMAIN_TARGET || window.location.hostname;
  }, []);

  useEffect(() => {
    const loadDomains = async () => {
      setIsLoading(true);
      try {
        const response = await tenantsApi.listDomains();
        setDomains(response.data?.data ?? []);
      } finally {
        setIsLoading(false);
      }
    };

    loadDomains();
  }, []);

  const handleAddDomain = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await tenantsApi.addDomain(form);
      setDomains((prev) => [response.data?.data, ...prev]);
      setForm(initialForm);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async (domainId: number) => {
    setIsVerifyingId(domainId);
    try {
      const response = await tenantsApi.verifyDomain(domainId, { token: tokenForm[domainId] || "" });
      const updated = response.data?.data;
      setDomains((prev) => prev.map((item) => (item.id === domainId ? updated : item)));
    } finally {
      setIsVerifyingId(null);
    }
  };

  const handleRemove = async (domainId: number) => {
    setIsRemovingId(domainId);
    try {
      await tenantsApi.removeDomain(domainId);
      setDomains((prev) => prev.filter((item) => item.id !== domainId));
    } finally {
      setIsRemovingId(null);
    }
  };

  return (
    <AuthGuard>
      <DashboardShell>
        <header className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.3em] text-primary">Domains</p>
          <h1 className="text-3xl font-semibold">Custom domain onboarding</h1>
          <p className="text-sm text-muted-foreground">Add a domain, point DNS, then verify ownership.</p>
        </header>

        <section className="mt-8 grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
          <div className="glass rounded-3xl p-6">
            <h2 className="text-lg font-semibold">Add a domain</h2>
            <form onSubmit={handleAddDomain} className="mt-4 space-y-4">
              <input
                className="w-full rounded-2xl border border-border bg-secondary/30 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground"
                placeholder="links.yourcompany.com"
                value={form.domain}
                onChange={(event) => setForm((prev) => ({ ...prev, domain: event.target.value }))}
                required
              />
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={form.is_primary}
                  onChange={(event) => setForm((prev) => ({ ...prev, is_primary: event.target.checked }))}
                />
                Mark as primary domain
              </label>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {isSubmitting ? "Adding..." : "Add domain"}
              </button>
            </form>
          </div>

          <div className="glass rounded-3xl p-6">
            <h2 className="text-lg font-semibold">DNS configuration</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Create a CNAME record that points to the host below. Once propagated, verify using your token.
            </p>
            <div className="mt-4 rounded-2xl border border-border bg-secondary/30 p-4 text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Target</span>
                <button
                  className="inline-flex items-center gap-1 text-primary"
                  onClick={() => navigator.clipboard.writeText(targetHost)}
                >
                  <Copy className="h-3 w-3" /> Copy
                </button>
              </div>
              <p className="mt-2 font-mono text-sm text-foreground">{targetHost}</p>
            </div>
          </div>
        </section>

        <section className="mt-8 glass rounded-3xl p-6">
          <h2 className="text-lg font-semibold">Connected domains</h2>
          {isLoading ? (
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading domains...
            </div>
          ) : domains.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No domains yet.</p>
          ) : (
            <div className="mt-4 space-y-4">
              {domains.map((domain) => (
                <div key={domain.id} className="rounded-2xl border border-border bg-secondary/30 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Globe2 className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-sm font-semibold text-foreground">{domain.domain}</p>
                        <p className="text-xs text-muted-foreground">
                          {domain.is_verified ? "Verified" : "Pending verification"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      {domain.is_verified ? (
                        <span className="inline-flex items-center gap-1 text-accent">
                          <CheckCircle2 className="h-3 w-3" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-500">
                          <XCircle className="h-3 w-3" /> Pending
                        </span>
                      )}
                      <button
                        onClick={() => handleRemove(domain.id)}
                        className="inline-flex items-center gap-1 text-muted-foreground"
                        disabled={isRemovingId === domain.id}
                      >
                        <Trash2 className="h-3 w-3" /> {isRemovingId === domain.id ? "Removing" : "Remove"}
                      </button>
                    </div>
                  </div>

                  {!domain.is_verified ? (
                    <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
                      <input
                        className="rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground"
                        placeholder="Verification token"
                        value={tokenForm[domain.id] || ""}
                        onChange={(event) =>
                          setTokenForm((prev) => ({
                            ...prev,
                            [domain.id]: event.target.value,
                          }))
                        }
                      />
                      <button
                        className="rounded-xl border border-primary/40 bg-primary/10 px-4 py-2 text-xs text-primary"
                        onClick={() => handleVerify(domain.id)}
                        disabled={isVerifyingId === domain.id}
                      >
                        {isVerifyingId === domain.id ? "Verifying..." : "Verify"}
                      </button>
                    </div>
                  ) : null}

                  <div className="mt-3 rounded-xl border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
                    Token: <span className="font-mono text-foreground/80">{domain.verification_token}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </DashboardShell>
    </AuthGuard>
  );
}
