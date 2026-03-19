"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

type ResolvePayload = {
  destination_url: string;
  tenant_id: number;
  tenant_name: string;
  is_paid: boolean;
  branding?: {
    logo_url?: string;
    primary_color?: string;
    text_color?: string;
  };
};

export default function PublicRedirectPage() {
  const params = useParams<{ short_code?: string[] }>();
  const [payload, setPayload] = useState<ResolvePayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const shortCodeParts = Array.isArray(params?.short_code) ? params.short_code : [];
  const slug = shortCodeParts.join("/");

  const branding = payload?.branding ?? {};
  const primaryColor = branding.primary_color || "hsl(var(--primary))";
  const textColor = branding.text_color || "hsl(var(--foreground))";

  useEffect(() => {
    if (!slug) return;
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
    const controller = new AbortController();
    fetch(`${apiBase}/api/drive/resolve/${slug}/`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data?.message || "Link not found");
        }
        return response.json();
      })
      .then((data) => {
        const resolved = data?.data as ResolvePayload;
        setPayload(resolved);
        const delay = resolved?.is_paid ? 1000 : 5000;
        window.setTimeout(() => {
          window.location.replace(resolved.destination_url);
        }, delay);
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        setError(err?.message || "Unable to resolve link");
      });

    return () => controller.abort();
  }, [slug]);

  const logoUrl = useMemo(() => {
    if (payload?.is_paid && branding.logo_url) {
      return branding.logo_url;
    }
    return "/keynou_drove_logo.png";
  }, [payload, branding.logo_url]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="flex flex-col items-center gap-4">
        {logoUrl ? (
          <img onClick={()=>!payload?.is_paid && window.open("https://drive.keynou.com")} src={logoUrl} alt="Brand logo" className="cursor-pointer h-28 w-28 rounded-full object-contain" />
        ) : null}
        <div className="text-center">
          <p className="text-sm font-semibold" style={{ color: textColor }}>
            {payload?.tenant_name}
          </p>
          <p className="text-xs text-muted-foreground">
            {error ? error : "Redirecting…"}
          </p>
        </div>
        <div className="h-1 w-32 rounded-full bg-muted overflow-hidden">
          <div className="h-full animate-pulse" style={{ background: primaryColor }} />
        </div>
      </div>
    </div>
  );
}
