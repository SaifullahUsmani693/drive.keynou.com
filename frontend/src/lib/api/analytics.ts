import api from "@/lib/api/axios";

export const analyticsApi = {
  summary: () => api.get("/api/analytics/summary/"),
};
