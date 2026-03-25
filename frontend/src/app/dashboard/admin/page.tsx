"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock, Loader2, RefreshCcw, ShieldCheck, Users } from "lucide-react";
import { toast } from "sonner";

import AuthGuard from "@/components/providers/AuthGuard";
import AdminGuard from "@/components/providers/AdminGuard";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { adminApi } from "@/lib/api";
import { type AdminListQuery } from "@/lib/api/admin";

type AdminTab = "manage" | "lifecycle";

type ProfileRow = {
  id: number | string;
  email: string;
  subscription_active: boolean;
  subscription_tier: string;
  link_limit: number;
  subscription_expires_at?: string | null;
  requested_subscription?: string;
  active_request_status?: string;
  created_at: string;
};

type SubscriptionRequestRow = {
  id: number | string;
  name: string;
  email: string;
  requested_subscription: string;
  message: string;
  status: "pending" | "approved" | "declined";
  admin_notes?: string;
  subscription_expires_at?: string | null;
  created_at: string;
};

type PaginatedResult<T> = {
  items: T[];
  page: number;
  pages: number;
  total: number;
  page_size: number;
};

const displayPageSizes = [5, 10, 20, 50];

function createEmptyPaginated<T>(pageSize = 10): PaginatedResult<T> {
  return { items: [], page: 1, pages: 1, total: 0, page_size: pageSize };
}

function useDebouncedValue<T>(value: T, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedValue(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

type PaginatedHookResult<T> = {
  query: AdminListQuery;
  data: PaginatedResult<T>;
  loading: boolean;
  searchValue: string;
  setSearchValue: (value: string) => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setOrdering: (ordering: string) => void;
  refresh: () => void;
  setStatus?: (status: AdminListQuery["subscription_status"]) => void;
};

function usePaginatedProfiles(initialQuery: AdminListQuery): PaginatedHookResult<ProfileRow> {
  const [query, setQuery] = useState<AdminListQuery>(initialQuery);
  const [data, setData] = useState<PaginatedResult<ProfileRow>>(createEmptyPaginated(initialQuery.page_size ?? 10));
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState(initialQuery.search ?? "");
  const debouncedSearch = useDebouncedValue(searchValue);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setQuery((prev) => ({ ...prev, page: 1, search: debouncedSearch }));
  }, [debouncedSearch]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    adminApi
      .listProfiles(query)
      .then((response) => {
        if (!active) return;
        const payload = response.data?.data ?? {};
        setData({
          items: payload.items ?? [],
          page: payload.page ?? 1,
          pages: payload.pages ?? 1,
          total: payload.total ?? 0,
          page_size: payload.page_size ?? query.page_size ?? 10,
        });
      })
      .catch((error) => {
        toast.error(error?.response?.data?.message || "Unable to load profiles");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [
    query.page,
    query.page_size,
    query.ordering,
    query.search,
    query.subscription_status,
    query.subscription_tier,
    refreshKey,
  ]);

  return {
    query,
    data,
    loading,
    searchValue,
    setSearchValue,
    setPage: (page) => setQuery((prev) => ({ ...prev, page })),
    setPageSize: (size) => setQuery((prev) => ({ ...prev, page_size: size, page: 1 })),
    setOrdering: (ordering) => setQuery((prev) => ({ ...prev, ordering, page: 1 })),
    refresh: () => setRefreshKey((prev) => prev + 1),
    setStatus: (status) => setQuery((prev) => ({ ...prev, subscription_status: status, page: 1 })),
  };
}

function usePaginatedRequests(initialQuery: AdminListQuery): PaginatedHookResult<SubscriptionRequestRow> {
  const [query, setQuery] = useState<AdminListQuery>(initialQuery);
  const [data, setData] = useState<PaginatedResult<SubscriptionRequestRow>>(createEmptyPaginated(initialQuery.page_size ?? 10));
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState(initialQuery.search ?? "");
  const debouncedSearch = useDebouncedValue(searchValue);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setQuery((prev) => ({ ...prev, page: 1, search: debouncedSearch }));
  }, [debouncedSearch]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    adminApi
      .listSubscriptionRequests(query)
      .then((response) => {
        if (!active) return;
        const payload = response.data?.data ?? {};
        setData({
          items: payload.items ?? [],
          page: payload.page ?? 1,
          pages: payload.pages ?? 1,
          total: payload.total ?? 0,
          page_size: payload.page_size ?? query.page_size ?? 10,
        });
      })
      .catch((error) => {
        toast.error(error?.response?.data?.message || "Unable to load requests");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [query.page, query.page_size, query.ordering, query.search, query.status, query.requested_subscription, refreshKey]);

  return {
    query,
    data,
    loading,
    searchValue,
    setSearchValue,
    setPage: (page) => setQuery((prev) => ({ ...prev, page })),
    setPageSize: (size) => setQuery((prev) => ({ ...prev, page_size: size, page: 1 })),
    setOrdering: (ordering) => setQuery((prev) => ({ ...prev, ordering, page: 1 })),
    refresh: () => setRefreshKey((prev) => prev + 1),
  };
}

type TableToolbarProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  ordering: string;
  onOrderingChange: (value: string) => void;
  orderingOptions: Array<{ value: string; label: string }>;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  children?: React.ReactNode;
};

function TableToolbar({
  searchValue,
  onSearchChange,
  ordering,
  onOrderingChange,
  orderingOptions,
  pageSize,
  onPageSizeChange,
  children,
}: TableToolbarProps) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-3">
      <input
        type="search"
        placeholder="Search..."
        className="flex-1 min-w-[180px] rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-black"
        value={searchValue}
        onChange={(event) => onSearchChange(event.target.value)}
      />
      {children}
      <select
        className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-black"
        value={ordering}
        onChange={(event) => onOrderingChange(event.target.value)}
      >
        {orderingOptions.map((option) => (
          <option key={option.value} value={option.value} className="text-black">
            {option.label}
          </option>
        ))}
      </select>
      <select
        className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-black"
        value={String(pageSize)}
        onChange={(event) => onPageSizeChange(Number(event.target.value))}
      >
        {displayPageSizes.map((size) => (
          <option key={size} value={size} className="text-black">
            {size} / page
          </option>
        ))}
      </select>
    </div>
  );
}

type PaginationControlsProps = {
  page: number;
  pages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
};

function PaginationControls({ page, pages, total, pageSize, onPageChange }: PaginationControlsProps) {
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-black/70">
      <p>
        Page {page} of {pages} • Showing {pageSize} per page • {total} total
      </p>
      <div className="flex items-center gap-2 text-black">
        <button
          className="rounded-full border border-black/10 px-3 py-1 text-black disabled:border-black/10 disabled:opacity-40"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
        >
          Prev
        </button>
        <button
          className="rounded-full border border-black/10 px-3 py-1 text-black disabled:border-black/10 disabled:opacity-40"
          onClick={() => onPageChange(Math.min(pages, page + 1))}
          disabled={page >= pages}
        >
          Next
        </button>
      </div>
    </div>
  );
}

function formatDate(value?: string | null) {
  if (!value) return "No expiry";
  const date = new Date(value);
  return date.toLocaleDateString();
}

function formatRelativeDays(value?: string | null) {
  if (!value) return "";
  const date = new Date(value).getTime();
  const diffDays = Math.ceil((date - Date.now()) / (1000 * 60 * 60 * 24));
  if (Number.isNaN(diffDays)) return "";
  if (diffDays < 0) return "Expired";
  if (diffDays === 0) return "Expires today";
  return `In ${diffDays}d`;
}

function extractRequestedCap(message?: string | null) {
  if (!message) return undefined;
  const match = /Requested cap:\s*([^\n]+)/i.exec(message);
  const capLine = match?.[1]?.trim();
  if (!capLine) return undefined;
  const numberMatch = capLine.match(/\d+/);
  if (!numberMatch) return undefined;
  return Number(numberMatch[0]);
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>("manage");
  const [savingRequestId, setSavingRequestId] = useState<number | string | null>(null);
  const [savingProfileId, setSavingProfileId] = useState<number | string | null>(null);
  const [requestLimitDrafts, setRequestLimitDrafts] = useState<Record<string, number>>({});
  const [profileLimitDrafts, setProfileLimitDrafts] = useState<Record<string, number>>({});

  const pendingRequests = usePaginatedRequests({
    page: 1,
    page_size: 10,
    ordering: "-created_at",
    status: "pending",
  });
  const allProfiles = usePaginatedProfiles({
    page: 1,
    page_size: 10,
    ordering: "-created_at",
    subscription_status: "all",
  });
  const expiringProfiles = usePaginatedProfiles({
    page: 1,
    page_size: 10,
    ordering: "subscription_expires_at",
    subscription_status: "expiring",
  });
  const resetProfiles = usePaginatedProfiles({
    page: 1,
    page_size: 10,
    ordering: "-updated_at",
    subscription_status: "reset",
  });

  useEffect(() => {
    setRequestLimitDrafts((prev) => {
      const next = { ...prev };
      pendingRequests.data.items.forEach((request) => {
        const key = String(request.id);
        if (next[key] === undefined) {
          const requestedCap = extractRequestedCap(request.message);
          next[key] = requestedCap ?? 10;
        }
      });
      return next;
    });
  }, [pendingRequests.data.items]);

  useEffect(() => {
    setProfileLimitDrafts((prev) => {
      const next = { ...prev };
      allProfiles.data.items.forEach((profile) => {
        const key = String(profile.id);
        if (next[key] === undefined) {
          next[key] = profile.link_limit;
        }
      });
      return next;
    });
  }, [allProfiles.data.items]);

  const handleRequestAction = async (request: SubscriptionRequestRow, action: "approve" | "decline") => {
    const desiredLimit = requestLimitDrafts[String(request.id)] ?? 10;
    setSavingRequestId(request.id);
    try {
      const payload: any = {
        status: action === "approve" ? "approved" : "declined",
        admin_notes: request.admin_notes,
        assign_subscription: action === "approve",
      };
      if (action === "approve") {
        payload.assign_subscription_tier = request.requested_subscription;
        payload.assign_link_limit = desiredLimit;
      }
      await adminApi.updateSubscriptionRequest(request.id, payload);
      toast.success(`Request ${action === "approve" ? "approved" : "declined"}`);
      pendingRequests.refresh();
      allProfiles.refresh();
      expiringProfiles.refresh();
      resetProfiles.refresh();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Unable to update request");
    } finally {
      setSavingRequestId(null);
    }
  };

  const handleProfileSave = async (profile: ProfileRow, payload: Record<string, unknown>) => {
    setSavingProfileId(profile.id);
    try {
      await adminApi.updateProfile(profile.id, payload);
      toast.success("Profile updated");
      allProfiles.refresh();
      expiringProfiles.refresh();
      resetProfiles.refresh();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Unable to update profile");
    } finally {
      setSavingProfileId(null);
    }
  };

  const manageTabContent = (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-emerald-300" />
          <div>
            <h2 className="text-lg font-semibold">Pending subscription requests</h2>
            <p className="text-sm text-black/60">Approve to boost link limits or decline suspicious asks.</p>
          </div>
        </div>

        <TableToolbar
          searchValue={pendingRequests.searchValue}
          onSearchChange={pendingRequests.setSearchValue}
          ordering={pendingRequests.query.ordering || "-created_at"}
          onOrderingChange={pendingRequests.setOrdering}
          orderingOptions={[
            { value: "-created_at", label: "Newest" },
            { value: "created_at", label: "Oldest" },
            { value: "name", label: "Name A-Z" },
            { value: "-name", label: "Name Z-A" },
          ]}
          pageSize={pendingRequests.data.page_size}
          onPageSizeChange={pendingRequests.setPageSize}
        />

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm text-black/80">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-black/50">
                <th className="p-3 text-left">Requester</th>
                <th className="p-3 text-left">Requested tier</th>
                <th className="p-3 text-left">Message</th>
                <th className="p-3 text-left">Limit</th>
                <th className="p-3 text-left">Expiry</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingRequests.loading ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-black/70">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  </td>
                </tr>
              ) : pendingRequests.data.items.length ? (
                pendingRequests.data.items.map((request) => {
                  const requestedCap = extractRequestedCap(request.message);
                  const limitValue = requestLimitDrafts[String(request.id)] ?? requestedCap ?? 10;
                  return (
                    <tr key={request.id} className="border-t border-white/5">
                      <td className="p-3">
                        <p className="font-medium text-black">{request.name}</p>
                        <p className="text-xs text-black/60">{request.email}</p>
                      </td>
                      <td className="p-3 capitalize">{request.requested_subscription}</td>
                      <td className="p-3 text-black/70">{request.message}</td>
                      <td className="p-3">
                        <input
                          type="number"
                          min={2}
                          className="w-24 rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-sm text-black"
                          value={limitValue}
                          onChange={(event) =>
                            setRequestLimitDrafts((prev) => ({
                              ...prev,
                              [request.id]: Number(event.target.value),
                            }))
                          }
                        />
                        {requestedCap !== undefined && (
                          <p className="mt-1 text-[11px] text-black/50">Requested: {requestedCap}</p>
                        )}
                      </td>
                      <td className="p-3">
                        <p>{formatDate(request.subscription_expires_at)}</p>
                        <p className="text-xs text-black/50">{formatRelativeDays(request.subscription_expires_at)}</p>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <button
                            className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-semibold text-emerald-200"
                            disabled={savingRequestId === request.id}
                            onClick={() => handleRequestAction(request, "approve")}
                          >
                            {savingRequestId === request.id ? "Saving" : "Approve"}
                          </button>
                          <button
                            className="rounded-full border border-white/15 px-3 py-1 text-xs"
                            disabled={savingRequestId === request.id}
                            onClick={() => handleRequestAction(request, "decline")}
                          >
                            Decline
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-black/60">
                    No pending requests.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <PaginationControls
          page={pendingRequests.data.page}
          pages={pendingRequests.data.pages}
          total={pendingRequests.data.total}
          pageSize={pendingRequests.data.page_size}
          onPageChange={pendingRequests.setPage}
        />
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-center gap-3">
          <Users className="h-5 w-5 text-emerald-300" />
          <div>
            <h2 className="text-lg font-semibold">All customers</h2>
            <p className="text-sm text-black/60">Search, sort, and adjust any account’s link allowance.</p>
          </div>
        </div>

        <TableToolbar
          searchValue={allProfiles.searchValue}
          onSearchChange={allProfiles.setSearchValue}
          ordering={allProfiles.query.ordering || "-created_at"}
          onOrderingChange={allProfiles.setOrdering}
          orderingOptions={[
            { value: "-created_at", label: "Newest" },
            { value: "created_at", label: "Oldest" },
            { value: "email", label: "Email A-Z" },
            { value: "-email", label: "Email Z-A" },
            { value: "-link_limit", label: "Highest limit" },
          ]}
          pageSize={allProfiles.data.page_size}
          onPageSizeChange={allProfiles.setPageSize}
        >
          <select
            className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-black"
            value={allProfiles.query.subscription_status || "all"}
            onChange={(event) => allProfiles.setStatus?.(event.target.value as AdminListQuery["subscription_status"])}
          >
            {["all", "active", "inactive", "expiring", "expired", "reset"].map((value) => (
              <option key={value} value={value} className="text-black">
                {value.charAt(0).toUpperCase() + value.slice(1)}
              </option>
            ))}
          </select>
        </TableToolbar>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm text-black/80">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-black/50">
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Tier</th>
                <th className="p-3 text-left">Limit</th>
                <th className="p-3 text-left">Expires</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {allProfiles.loading ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-black/70">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  </td>
                </tr>
              ) : allProfiles.data.items.length ? (
                allProfiles.data.items.map((profile) => {
                  const limitValue = profileLimitDrafts[String(profile.id)] ?? profile.link_limit;
                  return (
                    <tr key={profile.id} className="border-t border-white/5">
                      <td className="p-3">
                        <p className="font-medium text-black">{profile.email}</p>
                        <span
                          className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] ${
                            profile.subscription_active ? "bg-emerald-400/20 text-emerald-200" : "bg-white/10 text-black/70"
                          }`}
                        >
                          {profile.subscription_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="p-3 capitalize">{profile.subscription_tier}</td>
                      <td className="p-3">
                        <input
                          type="number"
                          min={2}
                          className="w-24 rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-sm text-black"
                          value={limitValue}
                          onChange={(event) =>
                            setProfileLimitDrafts((prev) => ({
                              ...prev,
                              [profile.id]: Number(event.target.value),
                            }))
                          }
                        />
                      </td>
                      <td className="p-3">
                        <p>{formatDate(profile.subscription_expires_at)}</p>
                        <p className="text-xs text-black/50">{formatRelativeDays(profile.subscription_expires_at)}</p>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            className="rounded-full border border-white/15 px-3 py-1 text-xs"
                            disabled={savingProfileId === profile.id}
                            onClick={() =>
                              handleProfileSave(profile, {
                                link_limit: limitValue,
                              })
                            }
                          >
                            Save limit
                          </button>
                          <button
                            className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-semibold text-emerald-200"
                            disabled={savingProfileId === profile.id}
                            onClick={() =>
                              handleProfileSave(profile, {
                                subscription_active: !profile.subscription_active,
                                link_limit: limitValue,
                              })
                            }
                          >
                            {profile.subscription_active ? "Disable" : "Enable"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-black/60">
                    No profiles match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <PaginationControls
          page={allProfiles.data.page}
          pages={allProfiles.data.pages}
          total={allProfiles.data.total}
          pageSize={allProfiles.data.page_size}
          onPageChange={allProfiles.setPage}
        />
      </div>
    </div>
  );

  const lifecycleTabContent = (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-amber-300" />
          <div>
            <h2 className="text-lg font-semibold">Expiring within 7 days</h2>
            <p className="text-sm text-black/60">Reach out before their boosted cap disappears.</p>
          </div>
        </div>

        <TableToolbar
          searchValue={expiringProfiles.searchValue}
          onSearchChange={expiringProfiles.setSearchValue}
          ordering={expiringProfiles.query.ordering || "subscription_expires_at"}
          onOrderingChange={expiringProfiles.setOrdering}
          orderingOptions={[
            { value: "subscription_expires_at", label: "Soonest expiry" },
            { value: "-subscription_expires_at", label: "Latest expiry" },
            { value: "email", label: "Email A-Z" },
          ]}
          pageSize={expiringProfiles.data.page_size}
          onPageSizeChange={expiringProfiles.setPageSize}
        />

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm text-black/80">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-black/50">
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Cap</th>
                <th className="p-3 text-left">Expires</th>
              </tr>
            </thead>
            <tbody>
              {expiringProfiles.loading ? (
                <tr>
                  <td colSpan={3} className="p-6 text-center text-black/70">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  </td>
                </tr>
              ) : expiringProfiles.data.items.length ? (
                expiringProfiles.data.items.map((profile) => (
                  <tr key={profile.id} className="border-t border-white/5">
                    <td className="p-3">
                      <p className="font-medium text-black">{profile.email}</p>
                      <p className="text-xs text-black/50">{profile.subscription_tier}</p>
                    </td>
                    <td className="p-3">{profile.link_limit}</td>
                    <td className="p-3">
                      <p>{formatDate(profile.subscription_expires_at)}</p>
                      <p className="text-xs text-black/50">{formatRelativeDays(profile.subscription_expires_at)}</p>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="p-6 text-center text-black/60">
                    No subscriptions expiring this week.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <PaginationControls
          page={expiringProfiles.data.page}
          pages={expiringProfiles.data.pages}
          total={expiringProfiles.data.total}
          pageSize={expiringProfiles.data.page_size}
          onPageChange={expiringProfiles.setPage}
        />
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-center gap-3">
          <RefreshCcw className="h-5 w-5 text-sky-300" />
          <div>
            <h2 className="text-lg font-semibold">Recently reset to free tier</h2>
            <p className="text-sm text-black/60">Follow up with users whose caps dropped back to 2 links.</p>
          </div>
        </div>

        <TableToolbar
          searchValue={resetProfiles.searchValue}
          onSearchChange={resetProfiles.setSearchValue}
          ordering={resetProfiles.query.ordering || "-updated_at"}
          onOrderingChange={resetProfiles.setOrdering}
          orderingOptions={[
            { value: "-updated_at", label: "Newest resets" },
            { value: "updated_at", label: "Oldest resets" },
            { value: "email", label: "Email A-Z" },
          ]}
          pageSize={resetProfiles.data.page_size}
          onPageSizeChange={resetProfiles.setPageSize}
        />

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm text-black/80">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-black/50">
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Current cap</th>
                <th className="p-3 text-left">Last expiry</th>
              </tr>
            </thead>
            <tbody>
              {resetProfiles.loading ? (
                <tr>
                  <td colSpan={3} className="p-6 text-center text-black/70">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  </td>
                </tr>
              ) : resetProfiles.data.items.length ? (
                resetProfiles.data.items.map((profile) => (
                  <tr key={profile.id} className="border-t border-white/5">
                    <td className="p-3">
                      <p className="font-medium text-black">{profile.email}</p>
                      <p className="text-xs text-black/50">Reset</p>
                    </td>
                    <td className="p-3">{profile.link_limit}</td>
                    <td className="p-3">
                      <p>{formatDate(profile.subscription_expires_at)}</p>
                      <p className="text-xs text-black/50">{formatRelativeDays(profile.subscription_expires_at)}</p>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="p-6 text-center text-black/60">
                    No accounts have been reset recently.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <PaginationControls
          page={resetProfiles.data.page}
          pages={resetProfiles.data.pages}
          total={resetProfiles.data.total}
          pageSize={resetProfiles.data.page_size}
          onPageChange={resetProfiles.setPage}
        />
      </div>
    </div>
  );

  return (
    <AuthGuard>
      <AdminGuard>
        <DashboardShell>
          <header className="flex flex-col gap-3">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">Admin</p>
            <div className="flex flex-col gap-1">
              <h1 className="text-3xl font-semibold">Subscription control center</h1>
              <p className="text-sm text-black/70">Approve upgrades, tune link limits, and monitor renewals.</p>
            </div>
            <div className="mt-2 inline-flex rounded-full bg-white/10 p-1">
              {["manage", "lifecycle"].map((tab) => (
                <button
                  key={tab}
                  className={`px-4 py-2 text-sm font-semibold rounded-full transition ${
                    activeTab === tab ? "bg-white text-black" : "text-black/60"
                  }`}
                  onClick={() => setActiveTab(tab as AdminTab)}
                >
                  {tab === "manage" ? "Manage access" : "Lifecycle alerts"}
                </button>
              ))}
            </div>
          </header>

          <section className="mt-8 space-y-6">
            {activeTab === "manage" ? manageTabContent : lifecycleTabContent}
          </section>
        </DashboardShell>
      </AdminGuard>
    </AuthGuard>
  );
}