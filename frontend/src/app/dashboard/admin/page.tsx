"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, ShieldCheck, Users } from "lucide-react";
import { toast } from "sonner";

import AuthGuard from "@/components/providers/AuthGuard";
import AdminGuard from "@/components/providers/AdminGuard";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { adminApi, type AdminListQuery } from "@/lib/api/admin";

type SubscriptionTier = "free" | "limited" | "custom" | "unlimited";
type RequestStatus = "pending" | "approved" | "declined";

type ProfileRow = {
  id: number | string;
  email: string;
  subscription_active: boolean;
  subscription_tier: SubscriptionTier;
  link_limit: number;
  subscription_expires_at?: string | null;
  requested_subscription?: string;
  active_request_id?: number | string | null;
  active_request_status?: RequestStatus | "";
  active_request_notes?: string;
};

type PaginatedResponse<T> = {
  items: T[];
  page: number;
  page_size: number;
  total: number;
  pages: number;
};

const tierOptions: Array<{ value: SubscriptionTier | "all"; label: string }> = [
  { value: "all", label: "All tiers" },
  { value: "free", label: "Free" },
  { value: "limited", label: "Limited" },
  { value: "custom", label: "Custom" },
  { value: "unlimited", label: "Unlimited" },
];

const profileOrderingOptions = [
  { value: "-created_at", label: "Newest" },
  { value: "email", label: "Email A-Z" },
  { value: "-email", label: "Email Z-A" },
  { value: "-subscription_expires_at", label: "Latest expiry" },
  { value: "subscription_expires_at", label: "Soonest expiry" },
  { value: "-link_limit", label: "Highest cap" },
];

function useDebouncedValue<T>(value: T, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedValue(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

function formatExpiry(value?: string | null) {
  if (!value) return "No expiry";
  return new Date(value).toLocaleDateString();
}

function toDateInput(value?: string | null) {
  return value ? value.split("T")[0] : "";
}

function toIsoOrNull(value: string) {
  return value ? `${value}T00:00:00Z` : null;
}

function ProfileTable({
  title,
  description,
  fixedStatus,
  refreshKey,
}: {
  title: string;
  description: string;
  fixedStatus: "active" | "expiring" | "expired";
  refreshKey: number;
}) {
  const [rows, setRows] = useState<ProfileRow[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const [tier, setTier] = useState<SubscriptionTier | "all">("all");
  const [ordering, setOrdering] = useState("-subscription_expires_at");
  const [isLoading, setIsLoading] = useState(false);
  const debouncedSearch = useDebouncedValue(search);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, tier, ordering, fixedStatus]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setIsLoading(true);
      try {
        const response = await adminApi.listProfiles({
          page,
          page_size: 10,
          search: debouncedSearch,
          ordering,
          subscription_status: fixedStatus,
          subscription_tier: tier,
        });
        const payload = (response.data?.data ?? {}) as PaginatedResponse<ProfileRow>;
        if (!active) return;
        setRows(payload.items ?? []);
        setPages(payload.pages ?? 1);
      } catch (error: any) {
        if (active) {
          toast.error(error?.response?.data?.message || "Unable to load subscriptions");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [page, debouncedSearch, ordering, tier, fixedStatus, refreshKey]);

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-white/60">{description}</p>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search email or company"
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
        />
        <select
          value={tier}
          onChange={(event) => setTier(event.target.value as SubscriptionTier | "all")}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
        >
          {tierOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          value={ordering}
          onChange={(event) => setOrdering(event.target.value)}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
        >
          {profileOrderingOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-white/50">
            <tr className="border-b border-white/10">
              <th className="px-3 py-3">User</th>
              <th className="px-3 py-3">Tier</th>
              <th className="px-3 py-3">Cap</th>
              <th className="px-3 py-3">Expiry</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-3 py-8 text-center text-white/60">
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading...
                  </span>
                </td>
              </tr>
            ) : rows.length ? (
              rows.map((row) => (
                <tr key={row.id} className="border-b border-white/5 align-top">
                  <td className="px-3 py-3 font-medium text-white">{row.email}</td>
                  <td className="px-3 py-3 capitalize text-white/80">{row.subscription_tier}</td>
                  <td className="px-3 py-3 text-white/80">{row.link_limit}</td>
                  <td className="px-3 py-3 text-white/70">{formatExpiry(row.subscription_expires_at)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-3 py-8 text-center text-white/40">
                  No users in this bucket.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center justify-between text-xs text-white/60">
        <span>Page {page} of {pages}</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page <= 1}
            className="rounded-lg border border-white/10 px-3 py-2 disabled:opacity-40"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => setPage((current) => Math.min(pages, current + 1))}
            disabled={page >= pages}
            className="rounded-lg border border-white/10 px-3 py-2 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardAdminPage() {
  const [activeTab, setActiveTab] = useState<"requests" | "subscriptions">("requests");
  const [rows, setRows] = useState<ProfileRow[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const [tier, setTier] = useState<SubscriptionTier | "all">("all");
  const [ordering, setOrdering] = useState("-created_at");
  const [isLoading, setIsLoading] = useState(false);
  const [savingId, setSavingId] = useState<number | string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const debouncedSearch = useDebouncedValue(search);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, tier, ordering]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setIsLoading(true);
      try {
        const query: AdminListQuery = {
          page,
          page_size: 10,
          search: debouncedSearch,
          ordering,
          subscription_status: "all",
          subscription_tier: tier,
        };
        const response = await adminApi.listProfiles(query);
        const payload = (response.data?.data ?? {}) as PaginatedResponse<ProfileRow>;
        if (!active) return;
        setRows(payload.items ?? []);
        setPages(payload.pages ?? 1);
      } catch (error: any) {
        if (active) {
          toast.error(error?.response?.data?.message || "Unable to load admin users");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [page, debouncedSearch, tier, ordering, refreshKey]);

  const updateRow = (id: number | string, updater: (current: ProfileRow) => ProfileRow) => {
    setRows((current) => current.map((row) => (row.id === id ? updater(row) : row)));
  };

  const saveAssignment = async (row: ProfileRow) => {
    setSavingId(row.id);
    try {
      if (row.active_request_id) {
        await adminApi.updateSubscriptionRequest(row.active_request_id, {
          status: row.active_request_status || "approved",
          assign_subscription: row.subscription_tier !== "free",
          assign_subscription_tier: row.subscription_tier,
          assign_link_limit: Number(row.link_limit),
          subscription_expires_at: toIsoOrNull(toDateInput(row.subscription_expires_at)),
          admin_notes: row.active_request_notes || "",
        });
      } else {
        await adminApi.updateProfile(row.id, {
          subscription_active: row.subscription_tier !== "free",
          subscription_tier: row.subscription_tier,
          link_limit: Number(row.link_limit),
          subscription_expires_at: toIsoOrNull(toDateInput(row.subscription_expires_at)),
        });
      }
      toast.success("Subscription updated");
      setRefreshKey((current) => current + 1);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Unable to update subscription");
    } finally {
      setSavingId(null);
    }
  };

  const removeAssignment = async (row: ProfileRow) => {
    setSavingId(row.id);
    try {
      if (row.active_request_id) {
        await adminApi.updateSubscriptionRequest(row.active_request_id, {
          status: row.active_request_status || "declined",
          assign_subscription: false,
          subscription_expires_at: null,
          admin_notes: row.active_request_notes || "",
        });
      } else {
        await adminApi.updateProfile(row.id, {
          subscription_active: false,
          subscription_tier: "free",
          subscription_expires_at: null,
        });
      }
      toast.success("Subscription removed");
      setRefreshKey((current) => current + 1);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Unable to remove subscription");
    } finally {
      setSavingId(null);
    }
  };

  const requestSummary = useMemo(() => `${rows.length} users loaded on this page`, [rows.length]);

  return (
    <AuthGuard>
      <AdminGuard>
        <DashboardShell>
          <header className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">Admin</p>
            <h1 className="text-3xl font-semibold">Subscription control center</h1>
            <p className="text-sm text-white/70">Assign, change, or remove subscriptions for any user and audit active, expiring, and expired access.</p>
          </header>

          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={() => setActiveTab("requests")}
              className={`rounded-2xl px-4 py-2 text-sm ${activeTab === "requests" ? "bg-emerald-400/15 text-emerald-200 border border-emerald-400/30" : "border border-white/10 text-white/60"}`}
            >
              Requests & manual control
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("subscriptions")}
              className={`rounded-2xl px-4 py-2 text-sm ${activeTab === "subscriptions" ? "bg-emerald-400/15 text-emerald-200 border border-emerald-400/30" : "border border-white/10 text-white/60"}`}
            >
              Subscription status tables
            </button>
          </div>

          {activeTab === "requests" ? (
            <section className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-emerald-300" />
                  <div>
                    <h2 className="text-lg font-semibold">All users with manual subscription controls</h2>
                    <p className="text-sm text-white/60">{requestSummary}. This table shows all users, their latest request, and lets you assign or remove access directly.</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-3">
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search email or company"
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                />
                <select
                  value={tier}
                  onChange={(event) => setTier(event.target.value as SubscriptionTier | "all")}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                >
                  {tierOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <select
                  value={ordering}
                  onChange={(event) => setOrdering(event.target.value)}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                >
                  {profileOrderingOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-5 overflow-x-auto">
                <table className="min-w-[1300px] w-full text-left text-sm">
                  <thead className="border-b border-white/10 text-white/50">
                    <tr>
                      <th className="px-3 py-3">User</th>
                      <th className="px-3 py-3">Requested</th>
                      <th className="px-3 py-3">Request status</th>
                      <th className="px-3 py-3">Assign tier</th>
                      <th className="px-3 py-3">Cap</th>
                      <th className="px-3 py-3">Expiry</th>
                      <th className="px-3 py-3">Notes</th>
                      <th className="px-3 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={8} className="px-3 py-8 text-center text-white/60">
                          <span className="inline-flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" /> Loading users...
                          </span>
                        </td>
                      </tr>
                    ) : rows.length ? (
                      rows.map((row) => (
                        <tr key={row.id} className="border-b border-white/5 align-top">
                          <td className="px-3 py-3">
                            <div className="font-medium text-white">{row.email}</div>
                            <div className="text-xs text-white/50">Current: {row.subscription_tier}{row.subscription_active ? " enabled" : " disabled"}</div>
                          </td>
                          <td className="px-3 py-3 text-white/70 capitalize">{row.requested_subscription || "No request"}</td>
                          <td className="px-3 py-3">
                            <select
                              value={row.active_request_status || "pending"}
                              onChange={(event) => updateRow(row.id, (current) => ({ ...current, active_request_status: event.target.value as RequestStatus }))}
                              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                            >
                              <option value="pending">Pending</option>
                              <option value="approved">Approved</option>
                              <option value="declined">Declined</option>
                            </select>
                          </td>
                          <td className="px-3 py-3">
                            <select
                              value={row.subscription_tier}
                              onChange={(event) => updateRow(row.id, (current) => ({ ...current, subscription_tier: event.target.value as SubscriptionTier }))}
                              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                            >
                              {tierOptions.filter((option) => option.value !== "all").map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-3">
                            <input
                              type="number"
                              min={0}
                              value={row.link_limit}
                              onChange={(event) => updateRow(row.id, (current) => ({ ...current, link_limit: Number(event.target.value) }))}
                              className="w-28 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                            />
                          </td>
                          <td className="px-3 py-3">
                            <input
                              type="date"
                              value={toDateInput(row.subscription_expires_at)}
                              onChange={(event) => updateRow(row.id, (current) => ({ ...current, subscription_expires_at: toIsoOrNull(event.target.value) }))}
                              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                            />
                          </td>
                          <td className="px-3 py-3">
                            <input
                              value={row.active_request_notes || ""}
                              onChange={(event) => updateRow(row.id, (current) => ({ ...current, active_request_notes: event.target.value }))}
                              placeholder="Admin notes"
                              className="w-full min-w-[220px] rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                            />
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex flex-col gap-2">
                              <button
                                type="button"
                                onClick={() => saveAssignment(row)}
                                disabled={savingId === row.id}
                                className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-xs text-emerald-100 disabled:opacity-50"
                              >
                                {savingId === row.id ? "Saving..." : "Save assignment"}
                              </button>
                              <button
                                type="button"
                                onClick={() => removeAssignment(row)}
                                disabled={savingId === row.id}
                                className="rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-2 text-xs text-red-100 disabled:opacity-50"
                              >
                                Remove subscription
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="px-3 py-8 text-center text-white/40">
                          No users found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-white/60">
                <span>Page {page} of {pages}</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    disabled={page <= 1}
                    className="rounded-lg border border-white/10 px-3 py-2 disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((current) => Math.min(pages, current + 1))}
                    disabled={page >= pages}
                    className="rounded-lg border border-white/10 px-3 py-2 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            </section>
          ) : (
            <section className="mt-6 grid gap-6">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-emerald-300" />
                  <div>
                    <h2 className="text-lg font-semibold">Subscription health tables</h2>
                    <p className="text-sm text-white/60">Each table below has its own debounced search, backend filtering, sorting, and pagination.</p>
                  </div>
                </div>
              </div>
              <ProfileTable
                title="Upcoming expirations in 7 days"
                description="Users whose subscription will expire soon and may need renewal or reassignment."
                fixedStatus="expiring"
                refreshKey={refreshKey}
              />
              <ProfileTable
                title="Expired subscriptions"
                description="Users whose subscription expiry has already passed."
                fixedStatus="expired"
                refreshKey={refreshKey}
              />
              <ProfileTable
                title="Active subscriptions"
                description="Users who currently have active access."
                fixedStatus="active"
                refreshKey={refreshKey}
              />
            </section>
          )}
        </DashboardShell>
      </AdminGuard>
    </AuthGuard>
  );
}
