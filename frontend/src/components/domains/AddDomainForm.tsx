"use client";

import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AddDomainFormProps {
  form: { domain: string; is_primary: boolean };
  setForm: (updater: (prev: { domain: string; is_primary: boolean }) => { domain: string; is_primary: boolean }) => void;
  isSubmitting: boolean;
  onSubmit: (event: React.FormEvent) => void;
}

export function AddDomainForm({ form, setForm, isSubmitting, onSubmit }: AddDomainFormProps) {
  return (
    <div className="glass rounded-3xl p-6 space-y-4">
      <h2 className="text-lg font-semibold">Add a domain</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="text-xs text-muted-foreground">Domain</label>
          <Input
            placeholder="links.yourcompany.com"
            value={form.domain}
            onChange={(event) => setForm((prev) => ({ ...prev, domain: event.target.value }))}
            required
            className="mt-1"
          />
        </div>
        <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={form.is_primary}
            onChange={(event) => setForm((prev) => ({ ...prev, is_primary: event.target.checked }))}
          />
          Mark as primary domain
        </label>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full gap-2"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {isSubmitting ? "Adding..." : "Add domain"}
        </Button>
      </form>
    </div>
  );
}
