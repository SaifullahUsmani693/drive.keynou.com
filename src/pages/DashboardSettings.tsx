import DashboardLayout from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Crown, Upload, CreditCard } from "lucide-react";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DashboardSettings = () => {
  const [companyName, setCompanyName] = useState("");
  const isPro = false;

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
          <TabsTrigger value="billing">Billing</TabsTrigger>
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
                  <Crown className="w-3 h-3" /> Pro Required
                </span>
              )}
            </div>
            
            {!isPro && (
              <div className="glass rounded-lg p-4 border-primary/20 mb-6">
                <p className="text-sm mb-2">Free plan shows <strong>short.keynou.com</strong> branding on redirect pages.</p>
                <p className="text-xs text-muted-foreground mb-3">Upgrade to Pro to display your company name and logo instead.</p>
                <Button size="sm" className="bg-gradient-primary hover:opacity-90">Upgrade to Pro — $15/mo</Button>
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
                <p className="text-xs text-muted-foreground">Shown on redirect pages instead of short.keynou branding</p>
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
                    {isPro && companyName ? companyName : <>short<span className="text-primary">.keynou</span></>}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">Redirecting in 3 seconds...</p>
                </div>
              </div>
              <Button className="bg-gradient-primary hover:opacity-90" disabled={!isPro}>Save Branding</Button>
            </form>
          </motion.div>
        </TabsContent>

        {/* Billing */}
        <TabsContent value="billing">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-xl p-6 max-w-2xl">
            <h2 className="font-display text-lg font-semibold mb-6">Billing & Subscription</h2>
            
            <div className="glass rounded-lg p-5 mb-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-semibold">Free Plan</p>
                  <p className="text-sm text-muted-foreground">50 links, basic analytics</p>
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-secondary text-muted-foreground">Current</span>
              </div>
              <Separator className="my-3" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold flex items-center gap-2">
                    Pro Plan <Crown className="w-4 h-4 text-primary" />
                  </p>
                  <p className="text-sm text-muted-foreground">Unlimited links, custom domains, your branding</p>
                </div>
                <p className="font-display text-xl font-bold">$15<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
              </div>
            </div>

            <Button className="bg-gradient-primary hover:opacity-90 gap-2">
              <CreditCard className="w-4 h-4" /> Upgrade to Pro
            </Button>
            <p className="text-xs text-muted-foreground mt-2">Secure payment via 2Checkout. Cancel anytime.</p>
          </motion.div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default DashboardSettings;
