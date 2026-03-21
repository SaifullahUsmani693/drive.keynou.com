"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Save, Upload, X } from "lucide-react";
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
  const [showLogoModal, setShowLogoModal] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

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

  useEffect(() => {
    if (!logoFile) {
      setLogoPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(logoFile);
    setLogoPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [logoFile]);

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

  const previewPrimary = useMemo(() => primaryColor || "hsl(var(--primary))", [primaryColor]);
  const previewText = useMemo(() => textColor || "hsl(var(--foreground))", [textColor]);
  const previewLogo = logoUrl || "/keynou_drove_logo.png";
  const primaryHexFallback = primaryColor?.startsWith("#") ? primaryColor : "#7c3aed";
  const textHexFallback = textColor?.startsWith("#") ? textColor : "#0f172a";

  const handleLogoUpload = async () => {
    if (!logoFile) {
      toast.error("Choose a logo first");
      return;
    }
    setIsUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append("logo", logoFile);
      const response = await tenantsApi.uploadLogo(formData);
      const uploadedUrl = response.data?.data?.brand_logo_url;
      if (!uploadedUrl) {
        throw new Error("Missing upload URL");
      }
      setLogoUrl(uploadedUrl);
      setShowLogoModal(false);
      setLogoFile(null);
      toast.success("Logo uploaded");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "Unable to upload logo");
    } finally {
      setIsUploadingLogo(false);
    }
  };

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
              <div className="flex items-center justify-between gap-3">
                <label className="text-xs text-muted-foreground">Logo</label>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="h-8 gap-1 rounded-full bg-white/10 text-white hover:bg-white/20"
                  onClick={() => setShowLogoModal(true)}
                >
                  <Upload className="h-3.5 w-3.5" /> Upload
                </Button>
              </div>
              <Input
                value={logoUrl}
                onChange={(event) => setLogoUrl(event.target.value)}
                placeholder="https://.../logo.png"
                className="h-11 bg-secondary/30"
              />
              <p className="text-xs text-muted-foreground">Paste a URL or upload a file via the modal.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Primary color</label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={primaryHexFallback}
                    onChange={(event) => setPrimaryColor(event.target.value)}
                    className="h-11 w-16 cursor-pointer rounded-xl border border-white/10 bg-transparent"
                  />
                  <Input
                    value={primaryColor}
                    onChange={(event) => setPrimaryColor(event.target.value)}
                    placeholder="#7c3aed or hsl(...)"
                    className="h-11 flex-1 bg-secondary/30"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Text color</label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={textHexFallback}
                    onChange={(event) => setTextColor(event.target.value)}
                    className="h-11 w-16 cursor-pointer rounded-xl border border-white/10 bg-transparent"
                  />
                  <Input
                    value={textColor}
                    onChange={(event) => setTextColor(event.target.value)}
                    placeholder="#0f172a or hsl(...)"
                    className="h-11 flex-1 bg-secondary/30"
                  />
                </div>
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
      {showLogoModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md space-y-5 rounded-2xl border border-white/10 bg-[#0B1120] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Upload logo</p>
                <p className="text-xs text-white/60">PNG, JPG, or SVG up to 5MB.</p>
              </div>
              <button
                type="button"
                className="rounded-full p-1 text-white/60 hover:bg-white/10"
                onClick={() => {
                  setShowLogoModal(false);
                  setLogoFile(null);
                }}
                aria-label="Close upload modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 rounded-2xl border border-dashed border-white/15 bg-white/5 p-4 text-center">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo preview" className="mx-auto h-16 w-16 rounded-full object-contain" />
              ) : previewLogo ? (
                <img src={previewLogo} alt="Current logo" className="mx-auto h-16 w-16 rounded-full object-contain" />
              ) : (
                <div className="text-xs text-white/50">No logo selected</div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(event) => setLogoFile(event.target.files?.[0] ?? null)}
                className="w-full cursor-pointer text-xs text-white/80"
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                className="text-white/70"
                onClick={() => {
                  setShowLogoModal(false);
                  setLogoFile(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={isUploadingLogo}
                onClick={handleLogoUpload}
                className="gap-2"
              >
                {isUploadingLogo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {isUploadingLogo ? "Uploading" : "Upload"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </AuthGuard>
  );
}
