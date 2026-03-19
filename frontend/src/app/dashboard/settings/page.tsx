"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import AuthGuard from "@/components/providers/AuthGuard";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { tenantsApi } from "@/lib/api";

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [tenantName, setTenantName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("");
  const [textColor, setTextColor] = useState("");

  useEffect(() => {
    let isMounted = true;
    const loadBranding = async () => {
      setIsLoading(true);
      try {
        const response = await tenantsApi.getBranding();
        if (!isMounted) return;
        const data = response.data?.data || {};
        setTenantName(data.name || "");
        setLogoUrl(data.brand_logo_url || "");
        setPrimaryColor(data.brand_primary_color || "");
        setTextColor(data.brand_text_color || "");
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Unable to load branding settings");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadBranding();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await tenantsApi.updateBranding({
        name: tenantName,
        brand_logo_url: logoUrl,
        brand_primary_color: primaryColor,
        brand_text_color: textColor,
      });
      toast.success("Branding updated");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Unable to update branding");
    } finally {
      setIsSaving(false);
    }
  };

  const previewPrimary = primaryColor || "hsl(var(--primary))";
  const previewText = textColor || "hsl(var(--foreground))";
  const previewLogo = logoUrl || "/keynou_drove_logo.png";

  return (
    <AuthGuard>
      <DashboardShell>
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold mb-1">Settings</h1>
          <p className="text-sm text-muted-foreground">Control the branding shown on your short links</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="glass rounded-xl p-6 space-y-5">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Tenant name</label>
              <Input
                value={tenantName}
                onChange={(event) => setTenantName(event.target.value)}
                placeholder="Tenant name"
                className="h-11 bg-secondary/30"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Logo URL</label>
              <Input
                value={logoUrl}
                onChange={(event) => setLogoUrl(event.target.value)}
                placeholder="https://.../logo.png"
                className="h-11 bg-secondary/30"
              />
              <p className="text-xs text-muted-foreground">Used on the branded redirect splash.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Primary color</label>
                <Input
                  value={primaryColor}
                  onChange={(event) => setPrimaryColor(event.target.value)}
                  placeholder="#7c3aed or hsl(...)"
                  className="h-11 bg-secondary/30"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Text color</label>
                <Input
                  value={textColor}
                  onChange={(event) => setTextColor(event.target.value)}
                  placeholder="#0f172a or hsl(...)"
                  className="h-11 bg-secondary/30"
                />
              </div>
            </div>

            <Button
              onClick={handleSave}
              disabled={isSaving || isLoading}
              className="h-11 px-6 bg-gradient-primary hover:opacity-90 gap-2"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSaving ? "Saving" : "Save changes"}
            </Button>
          </div>

          <div className="glass rounded-xl p-6">
            <h2 className="text-sm font-semibold mb-4">Splash preview</h2>
            {isLoading ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading preview
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-background p-6 flex flex-col items-center gap-4">
                {previewLogo ? (
                  <img src={previewLogo} alt="Logo preview" className="h-12 w-12 rounded-full object-contain" />
                ) : null}
                <p className="text-sm font-semibold" style={{ color: previewText }}>
                  {tenantName || "Keynou Drive"}
                </p>
                <div className="h-1 w-24 rounded-full bg-muted overflow-hidden">
                  <div className="h-full" style={{ background: previewPrimary }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
