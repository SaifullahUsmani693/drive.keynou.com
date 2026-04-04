"use client";

import { CheckCircle2, Copy, Globe2, Loader2, Star, Trash2, XCircle } from "lucide-react";
import { toast } from "sonner";
import Swal from "sweetalert2";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DomainVerificationGuide } from "@/components/domains/DomainVerificationGuide";

interface DomainCardProps {
  domain: {
    id: number;
    domain: string;
    is_verified: boolean;
    verification_token: string;
    is_primary?: boolean;
  };
  tokenForm: Record<number, string>;
  setTokenForm: (updater: (prev: Record<number, string>) => Record<number, string>) => void;
  isVerifyingId: number | null;
  isRemovingId: number | null;
  isSettingPrimaryId: number | null;
  targetIp: string;
  onVerify: (id: number) => void;
  onRemove: (id: number) => void;
  onSetPrimary: (id: number) => void;
}

export function DomainCard({
  domain,
  tokenForm,
  setTokenForm,
  isVerifyingId,
  isRemovingId,
  isSettingPrimaryId,
  targetIp,
  onVerify,
  onRemove,
  onSetPrimary,
}: DomainCardProps) {
  const tokenValue = tokenForm[domain.id] ?? domain.verification_token ?? "";

  const copyToken = () => {
    navigator.clipboard.writeText(tokenValue);
    toast.success("Token copied");
  };

  const handleSetPrimary = async () => {
    if (domain.is_primary) return;
    const result = await Swal.fire({
      title: "Set as primary domain?",
      html: `Make <strong>${domain.domain}</strong> the primary domain for all new short links?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Set as primary",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#3b82f6",
    });
    if (result.isConfirmed) {
      onSetPrimary(domain.id);
    }
  };

  const handleRemove = async () => {
    const result = await Swal.fire({
      title: "Remove domain?",
      html: `Are you sure you want to remove <strong>${domain.domain}</strong>? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Remove",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ef4444",
    });
    if (result.isConfirmed) {
      onRemove(domain.id);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-secondary/30 p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Globe2 className="h-4 w-4 text-primary" />
          <div>
            <p className="text-sm font-semibold text-foreground">{domain.domain}</p>
            <div className="flex items-center gap-2 text-xs">
              {domain.is_verified ? (
                <span className="inline-flex items-center gap-1 text-accent">
                  <CheckCircle2 className="h-3 w-3" /> Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-amber-500">
                  <XCircle className="h-3 w-3" /> Pending
                </span>
              )}
              {domain.is_primary && (
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium">
                  Primary
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {domain.is_verified && !domain.is_primary && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSetPrimary}
              disabled={isSettingPrimaryId === domain.id}
              className="text-muted-foreground hover:text-primary"
              title="Set as primary"
            >
              {isSettingPrimaryId === domain.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Star className="h-3 w-3" />}
              {isSettingPrimaryId === domain.id ? "Setting" : "Primary"}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            disabled={isRemovingId === domain.id}
            className="text-muted-foreground hover:text-destructive"
          >
            {isRemovingId === domain.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
            {isRemovingId === domain.id ? "Removing" : "Remove"}
          </Button>
        </div>
      </div>

      {!domain.is_verified && (
        <>
          <DomainVerificationGuide
            domain={domain.domain}
            token={tokenValue}
            targetIp={targetIp}
          />
          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <div className="relative">
              <Input
                placeholder="Verification token"
                value={tokenValue}
                onChange={(event) =>
                  setTokenForm((prev) => ({
                    ...prev,
                    [domain.id]: event.target.value,
                  }))
                }
                className="pr-8 text-xs"
              />
              <button
                type="button"
                onClick={copyToken}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                title="Copy token"
              >
                <Copy className="h-3 w-3" />
              </button>
            </div>
            <Button
              size="sm"
              onClick={() => onVerify(domain.id)}
              disabled={isVerifyingId === domain.id}
              className="text-xs"
            >
              {isVerifyingId === domain.id ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
              {isVerifyingId === domain.id ? "Verifying" : "Verify"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
