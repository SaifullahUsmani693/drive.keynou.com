import api from "@/lib/api/axios";

export const accountsApi = {
  me: () => api.get("/api/accounts/me/"),
};
