import DashboardLayout from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { Plus, Search, Copy, ExternalLink, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useState } from "react";

const mockLinks = [
  { id: "1", short: "launch", url: "https://example.com/product-launch-2024", clicks: 1284, status: "active", created: "Mar 1, 2026" },
  { id: "2", short: "promo", url: "https://example.com/summer-promo", clicks: 892, status: "active", created: "Feb 28, 2026" },
  { id: "3", short: "blog", url: "https://example.com/blog/growth-tips", clicks: 456, status: "active", created: "Feb 25, 2026" },
  { id: "4", short: "app", url: "https://example.com/download", clicks: 321, status: "active", created: "Feb 20, 2026" },
  { id: "5", short: "docs", url: "https://example.com/documentation/getting-started", clicks: 198, status: "active", created: "Feb 15, 2026" },
];

const DashboardLinks = () => {
  const [search, setSearch] = useState("");

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold mb-1">Links</h1>
          <p className="text-sm text-muted-foreground">Manage all your shortened URLs</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:opacity-90 gap-2">
              <Plus className="w-4 h-4" /> Create Link
            </Button>
          </DialogTrigger>
          <DialogContent className="glass">
            <DialogHeader>
              <DialogTitle className="font-display">Create New Link</DialogTitle>
            </DialogHeader>
            <form className="space-y-4 mt-4" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-2">
                <Label>Destination URL</Label>
                <Input placeholder="https://example.com/very-long-url" className="h-11" />
              </div>
              <div className="space-y-2">
                <Label>Custom alias (optional)</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">drive.keynou.com/</span>
                  <Input placeholder="my-link" className="h-11" />
                </div>
              </div>
              <Button className="w-full h-11 bg-gradient-primary hover:opacity-90">Create Link</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search links..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-11 bg-secondary/30"
        />
      </div>

      {/* Links list */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="divide-y divide-border">
          {mockLinks.map((link, i) => (
            <motion.div
              key={link.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="p-4 flex items-center justify-between hover:bg-secondary/20 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-primary">short.keynou.com/{link.short}</p>
                  <button className="text-muted-foreground hover:text-foreground"><Copy className="w-3.5 h-3.5" /></button>
                  <button className="text-muted-foreground hover:text-foreground"><ExternalLink className="w-3.5 h-3.5" /></button>
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{link.url}</p>
              </div>
              <div className="flex items-center gap-6 ml-4">
                <div className="text-right">
                  <p className="text-sm font-semibold">{link.clicks.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">clicks</p>
                </div>
                <span className="text-xs text-muted-foreground hidden sm:block">{link.created}</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="text-muted-foreground hover:text-foreground p-1"><MoreHorizontal className="w-4 h-4" /></button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="gap-2"><Pencil className="w-3.5 h-3.5" /> Edit</DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 text-destructive"><Trash2 className="w-3.5 h-3.5" /> Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardLinks;
