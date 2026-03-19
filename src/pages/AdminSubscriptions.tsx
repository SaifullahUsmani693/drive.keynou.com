import { useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Loader2, ShieldCheck, Users, Mail } from "lucide-react";
import {
  useAdminProfiles,
  useAdminSubscriptionRequests,
  useUpdateProfileAccess,
  useUpdateSubscriptionRequest,
} from "@/hooks/useProfileAccess";

const ProfileAccessCard = ({
  profile,
  isPending,
  onUpdate,
}: {
  profile: {
    id: string;
    user_id: string;
    display_name: string | null;
    subscription_active: boolean;
    link_limit: number;
  };
  isPending: boolean;
  onUpdate: (values: { id: string; subscription_active: boolean; link_limit: number }) => void;
}) => {
  const [localLimit, setLocalLimit] = useState(String(profile.link_limit));

  return (
    <div className="rounded-lg border border-border p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="font-medium">{profile.display_name || "Unnamed user"}</p>
          <p className="text-xs text-muted-foreground break-all">{profile.user_id}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Access: {profile.subscription_active ? "Enabled" : "Disabled"} · Current cap: {profile.link_limit} links
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
          <div className="space-y-2 min-w-32">
            <Label htmlFor={`limit-${profile.id}`}>Link cap</Label>
            <Input
              id={`limit-${profile.id}`}
              type="number"
              min="0"
              value={localLimit}
              onChange={(event) => setLocalLimit(event.target.value)}
              className="h-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={profile.subscription_active ? "outline" : "default"}
              className={!profile.subscription_active ? "bg-gradient-primary hover:opacity-90" : ""}
              disabled={isPending}
              onClick={() => onUpdate({
                id: profile.id,
                subscription_active: true,
                link_limit: Number(localLimit) || 0,
              })}
            >
              Allow Access
            </Button>
            <Button
              variant="outline"
              disabled={isPending}
              onClick={() => onUpdate({
                id: profile.id,
                subscription_active: false,
                link_limit: Number(localLimit) || 0,
              })}
            >
              Disallow
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SubscriptionRequestCard = ({
  request,
  isPending,
  onUpdate,
}: {
  request: {
    id: string;
    name: string;
    email: string;
    phone: string;
    message: string;
    status: string;
    admin_notes: string | null;
  };
  isPending: boolean;
  onUpdate: (values: { id: string; status: "pending" | "approved" | "declined"; adminNotes: string }) => void;
}) => {
  const [notes, setNotes] = useState(request.admin_notes ?? "");

  return (
    <div className="rounded-lg border border-border p-4">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <p className="font-medium">{request.name}</p>
          <p className="text-xs text-muted-foreground">{request.email}</p>
          <p className="text-xs text-muted-foreground">{request.phone}</p>
        </div>
        <span className="text-[10px] px-2 py-1 rounded-full bg-secondary text-muted-foreground uppercase tracking-wide">{request.status}</span>
      </div>
      <p className="text-sm mb-4 whitespace-pre-wrap">{request.message}</p>
      <Separator className="my-4" />
      <div className="space-y-2 mb-3">
        <Label htmlFor={`request-notes-${request.id}`}>Admin notes</Label>
        <Textarea
          id={`request-notes-${request.id}`}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={4}
        />
      </div>
      <div className="flex gap-2">
        <Button
          className="bg-gradient-primary hover:opacity-90"
          disabled={isPending}
          onClick={() => onUpdate({ id: request.id, status: "approved", adminNotes: notes })}
        >
          Approve
        </Button>
        <Button
          variant="outline"
          disabled={isPending}
          onClick={() => onUpdate({ id: request.id, status: "declined", adminNotes: notes })}
        >
          Decline
        </Button>
      </div>
    </div>
  );
};

const AdminSubscriptions = () => {
  const { data: profiles, isLoading: profilesLoading } = useAdminProfiles();
  const { data: requests, isLoading: requestsLoading } = useAdminSubscriptionRequests();
  const updateProfileAccess = useUpdateProfileAccess();
  const updateSubscriptionRequest = useUpdateSubscriptionRequest();

  const pendingRequests = useMemo(
    () => (requests ?? []).filter((request) => request.status === "pending"),
    [requests]
  );

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold mb-1">Admin Panel</h1>
        <p className="text-sm text-muted-foreground">Manually approve access, adjust caps, and respond to increase requests.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <div className="glass rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-primary" />
            <p className="text-sm font-medium">Accounts</p>
          </div>
          <p className="font-display text-3xl font-bold">{profiles?.length ?? 0}</p>
        </div>
        <div className="glass rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <p className="text-sm font-medium">Active subscriptions</p>
          </div>
          <p className="font-display text-3xl font-bold">{(profiles ?? []).filter((profile) => profile.subscription_active).length}</p>
        </div>
        <div className="glass rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="w-4 h-4 text-primary" />
            <p className="text-sm font-medium">Pending requests</p>
          </div>
          <p className="font-display text-3xl font-bold">{pendingRequests.length}</p>
        </div>
      </div>

      <div className="grid xl:grid-cols-[1.2fr_0.8fr] gap-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-xl p-6">
          <h2 className="font-display text-lg font-semibold mb-4">Manual subscription access</h2>
          <p className="text-sm text-muted-foreground mb-6">Turn access on or off and set the max number of links allowed for each account.</p>
          <div className="space-y-4">
            {profilesLoading ? (
              <div className="py-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
            ) : (profiles ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No accounts found.</p>
            ) : (
              (profiles ?? []).map((profile) => (
                <ProfileAccessCard
                  key={profile.id}
                  profile={profile}
                  isPending={updateProfileAccess.isPending}
                  onUpdate={(values) => updateProfileAccess.mutate(values)}
                />
              ))
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-xl p-6">
          <h2 className="font-display text-lg font-semibold mb-4">Contact requests</h2>
          <p className="text-sm text-muted-foreground mb-6">Review cap increase requests and leave internal notes.</p>
          <div className="space-y-4 max-h-[900px] overflow-auto pr-1">
            {requestsLoading ? (
              <div className="py-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
            ) : (requests ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No requests yet.</p>
            ) : (
              (requests ?? []).map((request) => (
                <SubscriptionRequestCard
                  key={request.id}
                  request={request}
                  isPending={updateSubscriptionRequest.isPending}
                  onUpdate={(values) => updateSubscriptionRequest.mutate(values)}
                />
              ))
            )}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default AdminSubscriptions;
