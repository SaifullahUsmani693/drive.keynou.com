"use client";

import { AlertCircle, CheckCircle2, Copy, Globe2, Info, Timer } from "lucide-react";
import { toast } from "sonner";

interface DomainVerificationGuideProps {
  domain: string;
  token: string;
  targetIp: string;
}

export function DomainVerificationGuide({ domain, token, targetIp }: DomainVerificationGuideProps) {
  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const isApex = !domain.includes(".");
  const recordType = isApex ? "A" : "CNAME";
  const recordValue = isApex ? targetIp : targetIp;

  return (
    <div className="rounded-2xl border border-amber-500/30 bg-amber-50/20 p-4 space-y-3">
      <div className="flex items-start gap-2">
        <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
        <div className="text-xs">
          <p className="font-medium text-amber-900">Verification required</p>
          <p className="text-amber-700 mt-1">
            Add the following DNS record to verify ownership of <strong>{domain}</strong>. DNS changes can take a few minutes to propagate.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between rounded-lg bg-background p-2">
          <div className="text-xs">
            <p className="font-mono font-semibold text-foreground">{recordType}</p>
            <p className="text-muted-foreground">Type</p>
          </div>
          <button
            onClick={() => copy(recordType)}
            className="text-muted-foreground hover:text-foreground"
            title="Copy"
          >
            <Copy className="h-3 w-3" />
          </button>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-background p-2">
          <div className="text-xs">
            <p className="font-mono font-semibold text-foreground">{domain}</p>
            <p className="text-muted-foreground">Host/Name</p>
          </div>
          <button
            onClick={() => copy(domain)}
            className="text-muted-foreground hover:text-foreground"
            title="Copy"
          >
            <Copy className="h-3 w-3" />
          </button>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-background p-2">
          <div className="text-xs">
            <p className="font-mono font-semibold text-foreground break-all">{recordValue}</p>
            <p className="text-muted-foreground">Value/Points to</p>
          </div>
          <button
            onClick={() => copy(recordValue)}
            className="text-muted-foreground hover:text-foreground"
            title="Copy"
          >
            <Copy className="h-3 w-3" />
          </button>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-background p-2">
          <div className="text-xs">
            <p className="font-mono font-semibold text-foreground">{token}</p>
            <p className="text-muted-foreground">Verification token (for dashboard)</p>
          </div>
          <button
            onClick={() => copy(token)}
            className="text-muted-foreground hover:text-foreground"
            title="Copy"
          >
            <Copy className="h-3 w-3" />
          </button>
        </div>
      </div>

      <div className="flex items-start gap-2 text-xs text-muted-foreground">
        <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
        <div>
          <p>After adding the DNS record, wait a few minutes for propagation, then paste the token above and click Verify.</p>
          <p className="mt-1">If you use Cloudflare, make sure DNS-only (grey cloud) is selected for this record.</p>
        </div>
      </div>
    </div>
  );
}
