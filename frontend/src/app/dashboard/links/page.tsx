"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, ExternalLink, Link2, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { driveApi, tenantsApi } from "@/lib/api";
import AuthGuard from "@/components/providers/AuthGuard";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const fallbackSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function LinksPage() {
  const [newUrl, setNewUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [links, setLinks] = useState<Array<any>>([]);
  const [domains, setDomains] = useState<Array<any>>([]);
  const [selectedDomain, setSelectedDomain] = useState("");
  const [isLoadingLinks, setIsLoadingLinks] = useState(false);
  const [isCreatingLink, setIsCreatingLink] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editSlug, setEditSlug] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [editActive, setEditActive] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

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

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === recentLinks.length) {
      setSelectedIds(new Set());
      return;
    }
    setSelectedIds(new Set(recentLinks.map((link) => link.id)));
  };

  const handleDelete = async (id: number) => {
    try {
      await driveApi.deleteLink(id);
      toast.success("Link deleted");
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      await loadLinks();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Unable to delete link");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    try {
      await driveApi.bulkDeleteLinks(Array.from(selectedIds));
      toast.success("Links deleted");
      setSelectedIds(new Set());
      await loadLinks();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Unable to delete links");
    }
  };

  const startEdit = (link: any) => {
    setEditingId(link.id);
    setEditSlug(link.short_code || "");
    setEditUrl(link.destination_url || "");
    setEditActive(Boolean(link.is_active));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditSlug("");
    setEditUrl("");
    setEditActive(true);
  };

  const handleUpdate = async (id: number) => {
    try {
      await driveApi.updateLink(id, {
        short_code: editSlug.trim() || undefined,
        destination_url: editUrl.trim() || undefined,
        is_active: editActive,
      });
      toast.success("Link updated");
      cancelEdit();
      await loadLinks();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Unable to update link");
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
          setSelectedDomain(verified[0].domain.replace("driveapi", "drive"));
        }
      } catch {
        if (isMounted) {
          setDomains([]);
        }
      }
    };

    fetchLinks();
    fetchDomains();
    return () => {
      isMounted = false;
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
    return fallbackSiteUrl;
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

  const normalizeSlugInput = (value: string) => value.replace(/\s+/g, "-").toLowerCase();

  return (
    <AuthGuard>
      <DashboardShell>
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold mb-1">Links</h1>
          <p className="text-sm text-muted-foreground">Manage and share your shortened URLs</p>
        </div>

        <div className="glass rounded-xl overflow-hidden">
          <div className="p-5 border-b border-border flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display font-semibold">All Links</h2>
              <p className="text-xs text-muted-foreground">Every link you have created so far</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="gap-2 bg-gradient-primary text-white"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus className="w-4 h-4" /> Create link
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkDelete}
                disabled={selectedIds.size === 0}
                className="gap-2"
                title="Delete selected links"
                aria-label="Delete selected links"
              >
                <Trash2 className="w-4 h-4" /> Delete selected
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={loadLinks}
                disabled={isLoadingLinks}
                className="gap-2"
                title="Refresh links"
                aria-label="Refresh links"
              >
                {isLoadingLinks ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Refresh
              </Button>
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
              <div className="px-4 py-3 flex items-center gap-3 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={selectedIds.size === recentLinks.length && recentLinks.length > 0}
                  onChange={toggleSelectAll}
                  className="h-4 w-4"
                  aria-label="Select all links"
                  title="Select all links"
                />
                <span>Select all</span>
              </div>
              {recentLinks.map((link) => {
                const shortUrl = `${resolvedBaseUrl}/${link.short_code}`;
                const isEditing = editingId === link.id;
                return (
                  <div key={link.id} className="p-4 flex items-center justify-between hover:bg-secondary/20 transition-colors">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(link.id)}
                          onChange={() => toggleSelect(link.id)}
                          className="h-4 w-4"
                          aria-label={`Select link ${link.short_code}`}
                          title={`Select link ${link.short_code}`}
                        />
                        <Link2 className="w-4 h-4 text-muted-foreground" />
                        <div className="min-w-0 flex-1">
                          {isEditing ? (
                            <div className="flex flex-col gap-2">
                              <Input
                                value={editSlug}
                                onChange={(event) => setEditSlug(normalizeSlugInput(event.target.value))}
                                className="h-9 bg-secondary/30"
                                placeholder="Short code"
                              />
                              <Input
                                value={editUrl}
                                onChange={(event) => setEditUrl(event.target.value)}
                                className="h-9 bg-secondary/30"
                                placeholder="Destination URL"
                              />
                              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                                <input
                                  type="checkbox"
                                  checked={editActive}
                                  onChange={(event) => setEditActive(event.target.checked)}
                                  className="h-4 w-4"
                                />
                                Active
                              </label>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-primary truncate">{shortUrl}</p>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(shortUrl);
                                    toast.success("Copied!");
                                  }}
                                  className="text-muted-foreground hover:text-foreground"
                                  aria-label="Copy short link"
                                  title="Copy short link"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                <a
                                  href={link.destination_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-muted-foreground hover:text-foreground"
                                  aria-label="Open destination URL"
                                  title="Open destination URL"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              </div>
                              <p className="text-xs text-muted-foreground truncate mt-0.5">
                                {link.destination_url}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-4 flex flex-col items-end gap-2">
                      <div className="text-right">
                        <p className="text-sm font-semibold">{(link.clicks || 0).toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">clicks</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {isEditing ? (
                          <>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleUpdate(link.id)}
                              className="h-8 w-8"
                              title="Save changes"
                              aria-label="Save changes"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={cancelEdit}
                              className="h-8 w-8"
                              title="Cancel edit"
                              aria-label="Cancel edit"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => startEdit(link)}
                              className="h-8 w-8"
                              title="Edit link"
                              aria-label="Edit link"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDelete(link.id)}
                              className="h-8 w-8 text-destructive"
                              title="Delete link"
                              aria-label="Delete link"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DashboardShell>
      {showCreateModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-semibold text-foreground">Create short link</p>
                <p className="text-xs text-muted-foreground">Paste a long URL and optionally customize the slug.</p>
              </div>
              <button
                type="button"
                className="rounded-full p-1 text-muted-foreground hover:bg-secondary/60"
                onClick={() => setShowCreateModal(false)}
                aria-label="Close create link modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-6 space-y-4">
              <Input
                placeholder="Paste a long URL to shorten..."
                value={newUrl}
                onChange={(event) => setNewUrl(event.target.value)}
                className="h-11 bg-secondary/40"
                onKeyDown={(event) => event.key === "Enter" && handleShorten()}
              />
              {verifiedDomains.length > 1 ? (
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Short link domain</label>
                  <select
                    value={selectedDomain}
                    onChange={(event) => setSelectedDomain(event.target.value)}
                    className="h-11 w-full rounded-xl border border-border px-3 text-sm text-foreground bg-secondary/30"
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
              <div className="space-y-1">
                <Input
                  placeholder="Custom slug (optional)"
                  value={customSlug}
                  onChange={(event) => setCustomSlug(normalizeSlugInput(event.target.value))}
                  className="h-11 bg-secondary/40"
                />
                <p className="text-[11px] text-muted-foreground">
                  Lowercase letters only. Spaces will become dashes automatically.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                className="text-muted-foreground"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  await handleShorten();
                  if (!isCreatingLink) {
                    setShowCreateModal(false);
                  }
                }}
                disabled={isCreatingLink}
                className="gap-2 bg-gradient-primary"
              >
                {isCreatingLink ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {isCreatingLink ? "Creating" : "Create"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </AuthGuard>
  );
}
