import DashboardLayout from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Upload, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateSubscriptionRequest, useMySubscriptionRequests, useProfileAccess } from "@/hooks/useProfileAccess";

const DashboardSettings = () => {
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const { user } = useAuth();
  const { data: profile } = useProfileAccess();
  const { data: requests } = useMySubscriptionRequests();
  const createSubscriptionRequest = useCreateSubscriptionRequest();
  const isPro = !!profile?.subscription_active;

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createSubscriptionRequest.mutate({
      name: profile?.display_name || user?.user_metadata?.full_name || "",
      email: user?.email || "",
      phone,
      message,
    }, {
      onSuccess: () => {
        setPhone("");
        setMessage("");
      },
    });
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold mb-1">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-secondary/30">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>

        {/* Profile */}
        <TabsContent value="profile">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-xl p-6 max-w-2xl">
            <h2 className="font-display text-lg font-semibold mb-6">Profile Information</h2>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First name</Label>
                  <Input placeholder="John" className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label>Last name</Label>
                  <Input placeholder="Doe" className="h-11" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="you@example.com" className="h-11" disabled />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>
              <Button className="bg-gradient-primary hover:opacity-90">Save Changes</Button>
            </form>
          </motion.div>
        </TabsContent>

        {/* Branding */}
        <TabsContent value="branding">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-xl p-6 max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="font-display text-lg font-semibold">Branding</h2>
              {!isPro && (
                <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                  <ShieldCheck className="w-3 h-3" /> Admin Approval Required
                </span>
              )}
            </div>
            
            {!isPro && (
              <div className="glass rounded-lg p-4 border-primary/20 mb-6">
                <p className="text-sm mb-2">Free plan shows <strong>drive.keynou.com</strong> branding on redirect pages.</p>
                <p className="text-xs text-muted-foreground mb-3">Contact you for approval to enable branding and higher caps manually.</p>
                <Button size="sm" className="bg-gradient-primary hover:opacity-90" onClick={() => document.querySelector('[data-state="inactive"][value="contact"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))}>Request Access Change</Button>
              </div>
            )}

            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-2">
                <Label>Company Name</Label>
                <Input
                  placeholder="Your Company Inc."
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="h-11"
                  disabled={!isPro}
                />
                <p className="text-xs text-muted-foreground">Shown on redirect pages instead of keynou drive branding</p>
              </div>
              <div className="space-y-2">
                <Label>Company Logo</Label>
                <div className={`border-2 border-dashed border-border rounded-lg p-8 text-center ${!isPro ? "opacity-50" : "hover:border-primary/50 transition-colors cursor-pointer"}`}>
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                  <p className="text-xs text-muted-foreground/60">PNG, JPG up to 2MB</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Redirect Page Preview</Label>
                <div className="bg-secondary/20 rounded-lg p-6 text-center">
                  <p className="text-xs text-muted-foreground mb-2">You are being redirected by</p>
                  <p className="font-display text-lg font-bold">
                    {isPro && companyName ? companyName : <>keynou<span className="text-primary"> drive</span></>}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">Redirecting in 3 seconds...</p>
                </div>
              </div>
              <Button className="bg-gradient-primary hover:opacity-90" disabled={!isPro}>Save Branding</Button>
            </form>
          </motion.div>
        </TabsContent>

        {/* Contact */}
        <TabsContent value="contact">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-xl p-6 max-w-2xl">
            <h2 className="font-display text-lg font-semibold mb-6">Contact & Manual Access</h2>

            <div className="glass rounded-lg p-5 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <p className="font-semibold">Current access</p>
              </div>
              <div className="space-y-2 text-sm">
                <p>Status: <span className="font-medium">{profile?.subscription_active ? "Enabled" : "Pending manual approval"}</span></p>
                <p>Link cap: <span className="font-medium">{profile?.link_limit ?? 50} links</span></p>
              </div>
              <Separator className="my-4" />
              <div className="text-sm text-muted-foreground">
                You take payment personally, then manually enable or disable access from the admin panel.
              </div>
            </div>

            <form className="space-y-4" onSubmit={handleRequestSubmit}>
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={profile?.display_name || user?.user_metadata?.full_name || ""} className="h-11" disabled />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={user?.email || ""} className="h-11" disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-11" placeholder="Your phone number" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask for a cap increase or access change."
                  rows={5}
                  required
                />
              </div>
              <Button className="bg-gradient-primary hover:opacity-90 gap-2" disabled={createSubscriptionRequest.isPending}>
                Send Request
              </Button>
            </form>

            <div className="mt-6">
              <h3 className="font-semibold mb-3">Recent requests</h3>
              <div className="space-y-3">
                {(requests ?? []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No requests submitted yet.</p>
                ) : (
                  (requests ?? []).slice(0, 5).map((request) => (
                    <div key={request.id} className="rounded-lg border border-border p-4">
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <p className="text-sm font-medium">{request.phone}</p>
                        <span className="text-[10px] px-2 py-1 rounded-full bg-secondary text-muted-foreground uppercase tracking-wide">{request.status}</span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{request.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default DashboardSettings;
