import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/categories")({
  component: CategoriesPage,
});

function CategoriesPage() {
  const { isAdmin } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const { data: cats = [], isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.get("/categories"),
  });

  const save = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") || "").trim();
    if (!name) return toast.error("Name required");
    try {
      await api.post("/categories", { name, description: String(fd.get("description") || "") });
      toast.success("Created");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["categories"] });
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete category?")) return;
    try {
      await api.del(`/categories/${id}`);
      qc.invalidateQueries({ queryKey: ["categories"] });
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-display font-semibold">Categories</h1>
          <p className="text-muted-foreground mt-1">Organize your products.</p>
        </div>
        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2"/>New category</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New category</DialogTitle></DialogHeader>
              <form onSubmit={save} className="space-y-3">
                <div><Label>Name</Label><Input name="name" required/></div>
                <div><Label>Description</Label><Textarea name="description" rows={2}/></div>
                <DialogFooter><Button type="submit">Create</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading && <Card className="p-6">Loading…</Card>}
        {cats.map((c: any) => (
          <Card key={c.id} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display text-lg font-semibold">{c.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{c.description || "—"}</p>
              </div>
              {isAdmin && <Button size="icon" variant="ghost" onClick={() => remove(c.id)}><Trash2 className="h-4 w-4"/></Button>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
