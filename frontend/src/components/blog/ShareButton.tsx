"use client";

import { Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShareButtonProps {
  title: string;
  excerpt: string;
  url: string;
  className?: string;
}

export function ShareButton({ title, excerpt, url, className }: ShareButtonProps) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: excerpt, url });
        return;
      } catch (error) {
        if ((error as DOMException)?.name === "AbortError") {
          return;
        }
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    } catch (clipboardError) {
      console.error("Failed to copy", clipboardError);
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className={cn(
        "inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100",
        className,
      )}
    >
      <Share2 className="w-5 h-5" />
      Share
    </button>
  );
}
