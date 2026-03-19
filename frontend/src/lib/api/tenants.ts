import api from "@/lib/api/axios";

export type TenantDomain = {
  id: number;
  domain: string;
  is_primary: boolean;
  is_verified: boolean;
  verification_token: string;
  verified_at: string | null;
  created_at: string;
};

export type TenantBranding = {
  id: number;
  name: string;
  brand_logo_url: string;
  brand_primary_color: string;
  brand_text_color: string;
};

export const tenantsApi = {
  listDomains: () => api.get("/api/tenants/domains/"),
  addDomain: (payload: { domain: string; is_primary?: boolean }) => api.post("/api/tenants/domains/", payload),
  verifyDomain: (id: number | string, payload: { token: string }) =>
    api.post(`/api/tenants/domains/${id}/verify/`, payload),
  removeDomain: (id: number | string) => api.delete(`/api/tenants/domains/${id}/`),
  getBranding: () => api.get("/api/tenants/branding/"),
  updateBranding: (payload: Partial<TenantBranding>) => api.patch("/api/tenants/branding/", payload),
};
