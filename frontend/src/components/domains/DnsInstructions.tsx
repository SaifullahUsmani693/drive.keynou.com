"use client";

import { Copy, Globe2, Info } from "lucide-react";
import { toast } from "sonner";

interface DnsInstructionsProps {
  targetIp: string;
}

export function DnsInstructions({ targetIp }: DnsInstructionsProps) {
  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="glass rounded-3xl p-6 space-y-4">
      <h2 className="text-lg font-semibold">DNS configuration</h2>
      <p className="text-sm text-muted-foreground">
        After adding a domain, create a DNS record to point it to our servers. Use the details below.
      </p>

      <div className="space-y-3">
        <div className="rounded-2xl border border-border bg-secondary/30 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">IP Address (A record)</span>
            <button
              className="inline-flex items-center gap-1 text-primary hover:text-primary/80"
              onClick={() => copy(targetIp)}
              title="Copy IP"
            >
              <Copy className="h-3 w-3" /> Copy
            </button>
          </div>
          <p className="font-mono text-sm text-foreground break-all">{targetIp}</p>
        </div>

        <div className="rounded-2xl border border-amber-500/30 bg-amber-50/20 p-4">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs space-y-1">
              <p className="font-medium text-amber-900">Quick guide</p>
              <ul className="text-amber-700 list-disc list-inside space-y-1">
                <li>For <strong>subdomains</strong> (e.g., links.yourcompany.com), use a <strong>CNAME</strong> record pointing to <code className="bg-amber-100 px-1 rounded">{targetIp}</code></li>
                <li>For <strong>apex domains</strong> (e.g., yourcompany.com), use an <strong>A</strong> record pointing to the IP above</li>
                <li>If you use Cloudflare, select <strong>DNS-only</strong> (grey cloud) for this record</li>
                <li>DNS changes can take a few minutes to propagate</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
