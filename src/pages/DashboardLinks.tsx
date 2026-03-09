import DashboardLayout from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { Plus, Search, Copy, ExternalLink, MoreHorizontal, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useLinks, useCreateLink, useUpdateLink, useDeleteLink, generateShortCode } from "@/hooks/useLinks";
import { toast } from "sonner";
import { format } from "date-fns";

const DashboardLinks = () => {
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState("");
  const [url, setUrl] = useState("");
  const [alias, setAlias] = useState("");

  const { data: links, isLoading } = useLinks();
  const createLink = useCreateLink();
  const updateLink = useUpdateLink();
  const deleteLink = useDeleteLink();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    const shortCode = alias || generateShortCode();
    createLink.mutate({ destinationUrl: url, shortCode }, {
      onSuccess: () => {
        setUrl("");
        setAlias("");
        setCreateOpen(false);
      },
    });
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    updateLink.mutate({ id: editId, destinationUrl: url, shortCode: alias }, {
      onSuccess: () => {
        setUrl("");
        setAlias("");
        setEditOpen(false);
      },
    });
  };

  const openEdit = (link: any) => {
    setEditId(link.id);
    setUrl(link.destination_url);
    setAlias(link.short_code);
    setEditOpen(true);
  };

  const filtered = links?.filter(
    (l) =>
      l.short_code.toLowerCase().includes(search.toLowerCase()) ||
      l.destination_url.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold mb-1">Links</h1>
          <p className="text-sm text-muted-foreground">Manage all your shortened URLs</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:opacity-90 gap-2">
              <Plus className="w-4 h-4" /> Create Link
            </Button>
          </DialogTrigger>
          <DialogContent className="glass">
            <DialogHeader>
              <DialogTitle className="font-display">Create New Link</DialogTitle>
            </DialogHeader>
            <form className="space-y-4 mt-4" onSubmit={handleCreate}>
              <div className="space-y-2">
                <Label>Destination URL</Label>
                <Input placeholder="https://example.com/very-long-url" className="h-11" value={url} onChange={(e) => setUrl(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Custom alias (optional)</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">drive.keynou.com/</span>
                  <Input placeholder="my-link" className="h-11" value={alias} onChange={(e) => setAlias(e.target.value)} />
                </div>
              </div>
              <Button className="w-full h-11 bg-gradient-primary hover:opacity-90" disabled={createLink.isPending}>
                {createLink.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Link"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="glass">
          <DialogHeader>
            <DialogTitle className="font-display">Edit Link</DialogTitle>
          </DialogHeader>
          <form className="space-y-4 mt-4" onSubmit={handleEdit}>
            <div className="space-y-2">
              <Label>Destination URL</Label>
              <Input placeholder="https://example.com" className="h-11" value={url} onChange={(e) => setUrl(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Alias</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">drive.keynou.com/</span>
                <Input className="h-11" value={alias} onChange={(e) => setAlias(e.target.value)} required />
              </div>
            </div>
            <Button className="w-full h-11 bg-gradient-primary hover:opacity-90" disabled={updateLink.isPending}>
              {updateLink.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

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
        {isLoading ? (
          <div className="p-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-sm">
            {links?.length === 0 ? "No links yet. Create your first one!" : "No links match your search."}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((link, i) => (
              <motion.div
                key={link.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="p-4 flex items-center justify-between hover:bg-secondary/20 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-primary">drive.keynou.com/{link.short_code}</p>
                    <button onClick={() => { navigator.clipboard.writeText(`drive.keynou.com/${link.short_code}`); toast.success("Copied!"); }} className="text-muted-foreground hover:text-foreground"><Copy className="w-3.5 h-3.5" /></button>
                    <a href={link.destination_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground"><ExternalLink className="w-3.5 h-3.5" /></a>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{link.destination_url}</p>
                </div>
                <div className="flex items-center gap-6 ml-4">
                  <div className="text-right">
                    <p className="text-sm font-semibold">{(link.clicks || 0).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">clicks</p>
                  </div>
                  <span className="text-xs text-muted-foreground hidden sm:block">{format(new Date(link.created_at), "MMM d, yyyy")}</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="text-muted-foreground hover:text-foreground p-1"><MoreHorizontal className="w-4 h-4" /></button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="gap-2" onClick={() => openEdit(link)}><Pencil className="w-3.5 h-3.5" /> Edit</DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 text-destructive" onClick={() => deleteLink.mutate(link.id)}><Trash2 className="w-3.5 h-3.5" /> Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DashboardLinks;
