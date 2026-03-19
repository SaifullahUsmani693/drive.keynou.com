"use client";

import { useEffect, useMemo, useState } from "react";
import { Copy, ExternalLink, Link2, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import { driveApi, tenantsApi } from "@/lib/api";
import AuthGuard from "@/components/providers/AuthGuard";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const shortBaseUrl = process.env.NEXT_PUBLIC_SHORT_BASE_URL || "http://localhost:8000/api/drive/r";

export default function LinksPage() {
  const [newUrl, setNewUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [links, setLinks] = useState<Array<any>>([]);
  const [domains, setDomains] = useState<Array<any>>([]);
  const [selectedDomain, setSelectedDomain] = useState("");
  const [isLoadingLinks, setIsLoadingLinks] = useState(false);
  const [isCreatingLink, setIsCreatingLink] = useState(false);

  const recentLinks = useMemo(() => links, [links]);

  const loadLinks = async () => {
    setIsLoadingLinks(true);
    try {
      const response = await driveApi.listLinks();
      setLinks(response.data?.data ?? []);
    } finally {
      setIsLoadingLinks(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const fetchLinks = async () => {
      await loadLinks();
    };
    const fetchDomains = async () => {
      try {
        const response = await tenantsApi.listDomains();
        if (!isMounted) return;
        const data = response.data?.data ?? [];
        setDomains(data);
        const verified = data.filter((domain: any) => domain.is_verified);
        if (verified.length === 1) {
          setSelectedDomain(verified[0].domain);
        }
      } catch {
        if (isMounted) {
          setDomains([]);
        }
      }
    };

    fetchLinks();
    fetchDomains();
    const refresh = setInterval(() => {
      if (isMounted) {
        fetchLinks();
      }
    }, 10000);
    return () => {
      isMounted = false;
      clearInterval(refresh);
    };
  }, []);

  const verifiedDomains = useMemo(() => domains.filter((domain) => domain.is_verified), [domains]);
  const resolvedBaseUrl = useMemo(() => {
    if (selectedDomain) {
      return `https://${selectedDomain}`;
    }
    if (verifiedDomains.length === 1) {
      return `https://${verifiedDomains[0].domain}`;
    }
    if (typeof window !== "undefined") {
      return window.location.origin;
    }
    return shortBaseUrl;
  }, [selectedDomain, verifiedDomains]);

  const handleShorten = async () => {
    if (!newUrl) return;
    setIsCreatingLink(true);
    try {
      await driveApi.createLink({
        destination_url: newUrl,
        short_code: customSlug.trim() || undefined,
      });
      setNewUrl("");
      setCustomSlug("");
      await loadLinks();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Unable to create link");
    } finally {
      setIsCreatingLink(false);
    }
  };

  return (
    <AuthGuard>
      <DashboardShell>
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold mb-1">Links</h1>
          <p className="text-sm text-muted-foreground">Manage and share your shortened URLs</p>
        </div>

        <div className="glass rounded-xl p-4 mb-8">
          <div className="flex flex-col gap-3">
            <Input
              placeholder="Paste a long URL to shorten..."
              value={newUrl}
              onChange={(event) => setNewUrl(event.target.value)}
              className="h-11 bg-secondary/30"
              onKeyDown={(event) => event.key === "Enter" && handleShorten()}
            />
            {verifiedDomains.length > 1 ? (
              <div className="flex flex-col gap-2">
                <label className="text-xs text-muted-foreground">Short link domain</label>
                <select
                  value={selectedDomain}
                  onChange={(event) => setSelectedDomain(event.target.value)}
                  className="h-11 rounded-md border border-border bg-secondary/30 px-3 text-sm text-foreground"
                >
                  <option value="">Use {typeof window !== "undefined" ? window.location.host : "default"}</option>
                  {verifiedDomains.map((domain) => (
                    <option key={domain.id} value={domain.domain}>
                      {domain.domain}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                placeholder="Custom slug (optional)"
                value={customSlug}
                onChange={(event) => setCustomSlug(event.target.value)}
                className="h-11 bg-secondary/30 sm:max-w-xs"
              />
              <Button
                onClick={handleShorten}
                disabled={isCreatingLink}
                className="h-11 px-6 bg-gradient-primary hover:opacity-90 gap-2"
              >
                {isCreatingLink ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {isCreatingLink ? "Shortening" : "Shorten"}
              </Button>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="font-display font-semibold">All Links</h2>
              <p className="text-xs text-muted-foreground">Every link you have created so far</p>
            </div>
          </div>
          {isLoadingLinks ? (
            <div className="p-12 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : recentLinks.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground text-sm">No links yet.</div>
          ) : (
            <div className="divide-y divide-border">
              {recentLinks.map((link) => {
                const shortUrl = `${resolvedBaseUrl}/${link.short_code}`;
                return (
                  <div key={link.id} className="p-4 flex items-center justify-between hover:bg-secondary/20 transition-colors">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Link2 className="w-4 h-4 text-muted-foreground" />
                        <p className="text-sm font-medium text-primary truncate">{shortUrl}</p>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(shortUrl);
                            toast.success("Copied!");
                          }}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <a
                          href={link.destination_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground"
                        >
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
                );
              })}
            </div>
          )}
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
