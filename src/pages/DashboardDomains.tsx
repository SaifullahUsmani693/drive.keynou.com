import DashboardLayout from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { Plus, Globe2, CheckCircle, AlertCircle, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const mockDomains = [
  { domain: "drive.keynou.com", status: "active", links: 147, isPrimary: true },
];

const DashboardDomains = () => {
  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold mb-1">Custom Domains</h1>
          <p className="text-sm text-muted-foreground">Connect your own domain for branded links</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:opacity-90 gap-2">
              <Plus className="w-4 h-4" /> Add Domain
            </Button>
          </DialogTrigger>
          <DialogContent className="glass">
            <DialogHeader>
              <DialogTitle className="font-display">Add Custom Domain</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="glass rounded-lg p-4 border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold">Pro Feature</span>
                </div>
                <p className="text-xs text-muted-foreground">Custom domains are available on the Pro plan ($15/mo). Upgrade to connect your own domain.</p>
              </div>
              <div className="space-y-2">
                <Label>Domain</Label>
                <Input placeholder="links.yourcompany.com" className="h-11" />
              </div>
              <div className="bg-secondary/30 rounded-lg p-4">
                <p className="text-sm font-medium mb-2">DNS Configuration</p>
                <p className="text-xs text-muted-foreground mb-3">Add the following CNAME record to your DNS provider:</p>
                <div className="bg-card rounded p-3 font-mono text-xs">
                  <p><span className="text-muted-foreground">Type:</span> CNAME</p>
                  <p><span className="text-muted-foreground">Name:</span> links</p>
                  <p><span className="text-muted-foreground">Value:</span> cname.short.keynou.com</p>
                </div>
              </div>
              <Button className="w-full h-11 bg-gradient-primary hover:opacity-90">Verify & Add Domain</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        {mockDomains.map((d) => (
          <motion.div
            key={d.domain}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-5 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <Globe2 className="w-5 h-5 text-primary" />
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{d.domain}</p>
                  {d.isPrimary && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">Primary</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{d.links} links</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {d.status === "active" ? (
                <span className="flex items-center gap-1 text-xs text-accent"><CheckCircle className="w-3.5 h-3.5" /> Active</span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-destructive"><AlertCircle className="w-3.5 h-3.5" /> Pending</span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default DashboardDomains;
