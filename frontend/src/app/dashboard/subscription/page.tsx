"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import AuthGuard from "@/components/providers/AuthGuard";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAppSelector } from "@/lib/hooks";
import { driveApi } from "@/lib/api";

export default function SubscriptionPage() {
  const user = useAppSelector((state) => state.auth.user);
  const [capAmount, setCapAmount] = useState("");
  const [capMessage, setCapMessage] = useState("");
  const [capPhone, setCapPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
  }, [user]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;
    if (!capAmount) {
      toast.error("Tell us how many links you need.");
      return;
    }
    setIsSubmitting(true);
    try {
      await driveApi.createSubscriptionRequest({
        name: user.username || user.email || "User",
        email: user.email || "",
        phone: capPhone,
        message: `Requested cap: ${capAmount}${capMessage ? `\n${capMessage}` : ""}`,
      });
      toast.success("Subscription request sent.");
      setCapAmount("");
      setCapMessage("");
      setCapPhone("");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Unable to send request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthGuard>
      <DashboardShell>
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold mb-1">Subscription</h1>
          <p className="text-sm text-muted-foreground">
            Request a subscription and tell us how many links you need. We’ll set your cap and price your plan based on that.
          </p>
        </div>

        <div className="glass rounded-xl p-6 max-w-2xl">
          <h2 className="font-display text-lg font-semibold mb-2">Request a premium plan</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Share the link cap you need, the team size, and how you’ll use it. We’ll reply with pricing and enable access.
          </p>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              value={capAmount}
              onChange={(event) => setCapAmount(event.target.value)}
              placeholder="Requested cap (e.g. 50 links, 200 links, unlimited)"
              className="h-11 bg-secondary/30"
              required
            />
            <Input
              value={capPhone}
              onChange={(event) => setCapPhone(event.target.value)}
              placeholder="Phone (optional)"
              className="h-11 bg-secondary/30"
            />
            <Textarea
              value={capMessage}
              onChange={(event) => setCapMessage(event.target.value)}
              placeholder="Tell us about your team, usage, and any timeline (optional)"
              rows={5}
              className="bg-secondary/30"
            />
            <Button
              type="submit"
              className="h-11 px-6 bg-gradient-primary hover:opacity-90"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send subscription request"}
            </Button>
          </form>
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
