import api from "@/lib/api/axios";

export type LinkCreatePayload = {
  destination_url: string;
  short_code?: string;
};

export type LinkUpdatePayload = {
  destination_url?: string;
  short_code?: string;
  is_active?: boolean;
};

export type SubscriptionRequestPayload = {
  name: string;
  email: string;
  phone?: string;
  message: string;
};

export const driveApi = {
  listLinks: () => api.get("/api/drive/links/"),
  createLink: (payload: LinkCreatePayload) => api.post("/api/drive/links/", payload),
  updateLink: (id: number | string, payload: LinkUpdatePayload) => api.patch(`/api/drive/links/${id}/`, payload),
  deleteLink: (id: number | string) => api.delete(`/api/drive/links/${id}/`),
  bulkDeleteLinks: (ids: Array<number | string>) => api.post("/api/drive/links/bulk-delete/", { ids }),
  listSubscriptionRequests: () => api.get("/api/drive/subscription-requests/"),
  createSubscriptionRequest: (payload: SubscriptionRequestPayload) =>
    api.post("/api/drive/subscription-requests/", payload),
};
