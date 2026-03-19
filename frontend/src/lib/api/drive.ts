import api from "@/lib/api/axios";

export type LinkCreatePayload = {
  destination_url: string;
  short_code?: string;
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
  listSubscriptionRequests: () => api.get("/api/drive/subscription-requests/"),
  createSubscriptionRequest: (payload: SubscriptionRequestPayload) =>
    api.post("/api/drive/subscription-requests/", payload),
};
