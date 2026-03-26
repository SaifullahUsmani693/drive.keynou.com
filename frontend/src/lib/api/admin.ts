import api from "@/lib/api/axios";

export type AdminListQuery = {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  subscription_status?: "all" | "active" | "inactive" | "expiring" | "expired" | "reset";
  subscription_tier?: "all" | "free" | "limited" | "custom" | "unlimited";
  status?: "all" | "pending" | "approved" | "declined";
  requested_subscription?: "all" | "free" | "limited" | "custom" | "unlimited";
};

export type AdminProfileUpdatePayload = {
  subscription_active?: boolean;
  subscription_tier?: "free" | "limited" | "custom" | "unlimited";
  link_limit?: number;
  subscription_expires_at?: string | null;
};

export type AdminRequestUpdatePayload = {
  status?: "pending" | "approved" | "declined";
  requested_subscription?: "free" | "limited" | "custom" | "unlimited";
  assign_subscription?: boolean;
  assign_subscription_tier?: "free" | "limited" | "custom" | "unlimited";
  assign_link_limit?: number;
  admin_notes?: string;
  subscription_expires_at?: string | null;
};

export const adminApi = {
  listProfiles: (params?: AdminListQuery) => api.get("/api/admin/profiles/", { params }),
  updateProfile: (id: number | string, payload: AdminProfileUpdatePayload) =>
    api.patch(`/api/admin/profiles/${id}/`, payload),
  listSubscriptionRequests: (params?: AdminListQuery) => api.get("/api/admin/subscription-requests/", { params }),
  updateSubscriptionRequest: (id: number | string, payload: AdminRequestUpdatePayload) =>
    api.patch(`/api/admin/subscription-requests/${id}/`, payload),
};
