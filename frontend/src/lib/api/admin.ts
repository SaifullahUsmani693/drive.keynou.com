import api from "@/lib/api/axios";

export type AdminProfileUpdatePayload = {
  subscription_active: boolean;
  link_limit: number;
};

export type AdminRequestUpdatePayload = {
  status: "pending" | "approved" | "declined";
  admin_notes?: string;
};

export const adminApi = {
  listProfiles: () => api.get("/api/admin/profiles/"),
  updateProfile: (id: number | string, payload: AdminProfileUpdatePayload) =>
    api.patch(`/api/admin/profiles/${id}/`, payload),
  listSubscriptionRequests: () => api.get("/api/admin/subscription-requests/"),
  updateSubscriptionRequest: (id: number | string, payload: AdminRequestUpdatePayload) =>
    api.patch(`/api/admin/subscription-requests/${id}/`, payload),
};
