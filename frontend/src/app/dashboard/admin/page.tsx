"use client";

import { useEffect, useState } from "react";
import { Loader2, ShieldCheck, Users } from "lucide-react";

import AuthGuard from "@/components/providers/AuthGuard";
import AdminGuard from "@/components/providers/AdminGuard";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { adminApi } from "@/lib/api";

type LegacyProfileRow = {
  id: number | string;
  email: string;
  link_limit: number;
  subscription_active: boolean;
};

type LegacyRequestRow = {
  id: number | string;
  name: string;
  email: string;
  status: "pending" | "approved" | "declined";
  admin_notes?: string;
  subscription_expires_at?: string | null;
  message: string;
};

type PaginatedResponse<T> = {
  items?: T[];
  total?: number;
  page?: number;
  pages?: number;
};

function toArray<T>(payload: PaginatedResponse<T> | T[] | undefined): T[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  return Array.isArray(payload.items) ? payload.items : [];
}

export default function AdminPage() {
  const [profiles, setProfiles] = useState<LegacyProfileRow[]>([]);
  const [requests, setRequests] = useState<LegacyRequestRow[]>([]);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [savingProfileId, setSavingProfileId] = useState<number | string | null>(null);
  const [savingRequestId, setSavingRequestId] = useState<number | string | null>(null);

  useEffect(() => {
    const loadProfiles = async () => {
      setIsLoadingProfiles(true);
      try {
        const response = await adminApi.listProfiles();
        const payload = response.data?.data as PaginatedResponse<LegacyProfileRow> | LegacyProfileRow[] | undefined;
        setProfiles(toArray(payload));
      } finally {
        setIsLoadingProfiles(false);
      }
    };

    const loadRequests = async () => {
      setIsLoadingRequests(true);
      try {
        const response = await adminApi.listSubscriptionRequests();
        const payload = response.data?.data as PaginatedResponse<LegacyRequestRow> | LegacyRequestRow[] | undefined;
        setRequests(toArray(payload));
      } finally {
        setIsLoadingRequests(false);
      }
    };

    loadProfiles();
    loadRequests();
  }, []);

  const updateProfile = async (profileId: number | string, values: { subscription_active: boolean; link_limit: number }) => {
    setSavingProfileId(profileId);
    try {
      const response = await adminApi.updateProfile(profileId, values);
      const updated = response.data?.data;
      setProfiles((prev) => prev.map((profile) => (profile.id === profileId ? updated : profile)));
    } finally {
      setSavingProfileId(null);
    }
  };

  const updateRequest = async (
    requestId: number | string,
    values: { status: "pending" | "approved" | "declined"; admin_notes?: string; subscription_expires_at?: string | null },
  ) => {
    setSavingRequestId(requestId);
    try {
      const response = await adminApi.updateSubscriptionRequest(requestId, values);
      const updated = response.data?.data;
      setRequests((prev) => prev.map((request) => (request.id === requestId ? updated : request)));
    } finally {
      setSavingRequestId(null);
    }
  };

  return (
    <AuthGuard>
      <AdminGuard>
        <DashboardShell>
        <header className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">Admin</p>
          <h1 className="text-3xl font-semibold">Manual subscription control</h1>
          <p className="text-sm text-white/70">Enable access, update caps, and respond to requests.</p>
        </header>

        <section className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-emerald-300" />
              <h2 className="text-lg font-semibold">Profiles</h2>
            </div>
            {isLoadingProfiles ? (
              <div className="mt-6 flex items-center gap-2 text-sm text-white/70">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading profiles...
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {profiles.map((profile) => (
                  <div key={profile.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold">{profile.email}</p>
                        <p className="text-xs text-white/50">Cap: {profile.link_limit}</p>
                      </div>
                      <span className="text-xs text-white/50">{profile.subscription_active ? "Enabled" : "Disabled"}</span>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <input
                        type="number"
                        min={0}
                        className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white"
                        value={profile.link_limit}
                        onChange={(event) =>
                          setProfiles((prev) =>
                            prev.map((item) =>
                              item.id === profile.id
                                ? { ...item, link_limit: Number(event.target.value) }
                                : item,
                            ),
                          )
                        }
                      />
                      <button
                        className="rounded-xl border border-emerald-400/40 bg-emerald-400/10 px-3 py-2 text-xs"
                        disabled={savingProfileId === profile.id}
                        onClick={() =>
                          updateProfile(profile.id, {
                            subscription_active: !profile.subscription_active,
                            link_limit: Number(profile.link_limit),
                          })
                        }
                      >
                        {savingProfileId === profile.id ? "Saving..." : profile.subscription_active ? "Disable" : "Enable"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-emerald-300" />
              <h2 className="text-lg font-semibold">Requests</h2>
            </div>
            {isLoadingRequests ? (
              <div className="mt-6 flex items-center gap-2 text-sm text-white/70">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading requests...
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {requests.map((request) => {
                  const expiresAt = request.subscription_expires_at
                    ? new Date(request.subscription_expires_at)
                    : null;
                  const daysLeft = expiresAt
                    ? Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                    : null;
                  const expiryLabel =
                    daysLeft === null
                      ? ""
                      : daysLeft < 0
                        ? "Expired"
                        : `Expires in ${daysLeft}d`;

                  return (
                    <div key={request.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold">{request.name}</p>
                        <p className="text-xs text-white/50">{request.email}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs text-white/50">{request.status}</span>
                        {expiryLabel ? (
                          <span className="text-[10px] uppercase tracking-wide text-amber-200">{expiryLabel}</span>
                        ) : null}
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-white/70">{request.message}</p>
                    <input
                      type="date"
                      className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white"
                      value={request.subscription_expires_at?.split("T")[0] || ""}
                      onChange={(event) =>
                        setRequests((prev) =>
                          prev.map((item) =>
                            item.id === request.id
                              ? {
                                  ...item,
                                  subscription_expires_at: event.target.value || null,
                                }
                              : item,
                          ),
                        )
                      }
                    />
                    <input
                      className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white"
                      placeholder="Admin notes"
                      value={request.admin_notes || ""}
                      onChange={(event) =>
                        setRequests((prev) =>
                          prev.map((item) =>
                            item.id === request.id ? { ...item, admin_notes: event.target.value } : item,
                          ),
                        )
                      }
                    />
                    <div className="mt-3 flex gap-2">
                      {(["approved", "declined", "pending"] as const).map((status) => (
                        <button
                          key={status}
                          className="rounded-xl border border-white/10 px-3 py-2 text-xs"
                          disabled={savingRequestId === request.id}
                          onClick={() =>
                            updateRequest(request.id, {
                              status,
                              admin_notes: request.admin_notes,
                              subscription_expires_at: request.subscription_expires_at,
                            })
                          }
                        >
                          {savingRequestId === request.id ? "Saving..." : status}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
              </div>
            )}
          </div>
        </section>
        </DashboardShell>
      </AdminGuard>
    </AuthGuard>
  );
}
