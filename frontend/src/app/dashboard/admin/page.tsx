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
    <div className="rounded-3ಜಿ
