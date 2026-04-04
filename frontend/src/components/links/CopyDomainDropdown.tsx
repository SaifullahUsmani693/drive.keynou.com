"use client";

import { Copy, Globe } from "lucide-react";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface CopyDomainDropdownProps {
  shortCode: string;
  currentBaseUrl: string;
  verifiedDomains: Array<{ domain: string; is_primary?: boolean }>;
  fallbackHost?: string;
}

export function CopyDomainDropdown({
  shortCode,
  currentBaseUrl,
  verifiedDomains,
  fallbackHost = "localhost:3000",
}: CopyDomainDropdownProps) {
  const handleCopy = async (domain: string) => {
    const url = `https://${domain}/${shortCode}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success(`Copied ${domain}/${shortCode}`);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleCopyCurrent = async () => {
    try {
      await navigator.clipboard.writeText(`${currentBaseUrl}/${shortCode}`);
      toast.success("Copied link");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const domains = [
    // Always include current base URL if it’s not already in verified domains
    ...(verifiedDomains.some((d) => currentBaseUrl.includes(d.domain))
      ? []
      : [{ domain: new URL(currentBaseUrl).host || fallbackHost, is_primary: false }]),
    // Sort: primary first, then alphabetically
    ...verifiedDomains.sort((a, b) => {
      if (a.is_primary && !b.is_primary) return -1;
      if (!a.is_primary && b.is_primary) return 1;
      return a.domain.localeCompare(b.domain);
    }),
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          aria-label="Copy link with different domains"
          title="Copy link with different domains"
        >
          <Copy className="w-3.5 h-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={handleCopyCurrent}>
          <Copy className="mr-2 h-4 w-4" />
          Copy current link
        </DropdownMenuItem>
        {domains.map((domain) => (
          <DropdownMenuItem key={domain.domain} onClick={() => handleCopy(domain.domain)}>
            <Globe className="mr-2 h-4 w-4" />
            {domain.is_primary ? `${domain.domain} (primary)` : domain.domain}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
