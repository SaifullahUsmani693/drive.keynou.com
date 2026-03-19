import api from "@/lib/api/axios";

export type LoginPayload = {
  identifier: string;
  password: string;
};

export type RegisterPayload = {
  email: string;
  username?: string;
  password: string;
  company_name?: string;
};

export const accountsApi = {
  me: () => api.get("/api/accounts/me/"),
  login: (payload: LoginPayload) => api.post("/api/accounts/login/", payload),
  register: (payload: RegisterPayload) => api.post("/api/accounts/register/", payload),
  logout: () => api.post("/api/accounts/logout/"),
};
