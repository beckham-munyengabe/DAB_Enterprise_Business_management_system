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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/products")({
  component: ProductsPage,
});

function ProductsPage() {
  const { isAdmin, isStoreKeeper } = useAuth();
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => api.get("/products"),
  });

  const { data: cats = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.get("/categories"),
  });

  const filtered = products.filter((p: any) =>
    !q || p.name?.toLowerCase().includes(q.toLowerCase()) || p.sku?.toLowerCase().includes(q.toLowerCase())
  );

  const remove = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      await api.del(`/products/${id}`);
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["products"] });
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const save = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload: any = {
      name: String(fd.get("name") || "").trim(),
      sku: String(fd.get("sku") || "").trim() || null,
      category_id: String(fd.get("category_id") || "") || null,
      description: String(fd.get("description") || ""),
      price: Number(fd.get("price") || 0),
      cost: Number(fd.get("cost") || 0),
      stock: Number(fd.get("stock") || 0),
      reorder_level: Number(fd.get("reorder_level") || 5),
    };
    if (!payload.name) return toast.error("Name required");
    try {
      if (editing) await api.put(`/products/${editing.id}`, payload);
      else await api.post("/products", payload);
      toast.success(editing ? "Updated" : "Created");
      setOpen(false); setEditing(null);
      qc.invalidateQueries({ queryKey: ["products"] });
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-display font-semibold">Products</h1>
          <p className="text-muted-foreground mt-1">Manage your catalog and available stock.</p>
        </div>
        {(isAdmin || isStoreKeeper) && (
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditing(null)}><Plus className="h-4 w-4 mr-2"/>New product</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>{editing ? "Edit product" : "New product"}</DialogTitle></DialogHeader>
              <form onSubmit={save} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2"><Label>Name</Label><Input name="name" defaultValue={editing?.name} required/></div>
                  <div><Label>SKU</Label><Input name="sku" defaultValue={editing?.sku ?? ""}/></div>
                  <div>
                    <Label>Category</Label>
                    <Select name="category_id" defaultValue={editing?.category_id ?? undefined}>
                      <SelectTrigger><SelectValue placeholder="Select"/></SelectTrigger>
                      <SelectContent>
                        {cats.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Price</Label><Input name="price" type="number" step="0.01" defaultValue={editing?.price ?? 0}/></div>
                  <div><Label>Cost</Label><Input name="cost" type="number" step="0.01" defaultValue={editing?.cost ?? 0}/></div>
                  <div><Label>Stock</Label><Input name="stock" type="number" defaultValue={editing?.stock ?? 0}/></div>
                  <div><Label>Reorder level</Label><Input name="reorder_level" type="number" defaultValue={editing?.reorder_level ?? 5}/></div>
                </div>
                <div><Label>Description</Label><Textarea name="description" defaultValue={editing?.description ?? ""} rows={2}/></div>
                <DialogFooter><Button type="submit">{editing ? "Save changes" : "Create"}</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
            <Input className="pl-9" placeholder="Search by name or SKU" value={q} onChange={(e) => setQ(e.target.value)}/>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-widest text-muted-foreground">
              <tr><th className="text-left p-3">Product</th><th className="text-left p-3">Category</th><th className="text-right p-3">Price</th><th className="text-right p-3">Stock</th><th className="p-3"></th></tr>
            </thead>
            <tbody>
              {isLoading && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Loading…</td></tr>}
              {!isLoading && filtered.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No products yet.</td></tr>}
              {filtered.map((p: any) => (
                <tr key={p.id} className="border-t hover:bg-muted/30">
                  <td className="p-3">
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.sku || "—"}</div>
                  </td>
                  <td className="p-3 text-muted-foreground">{p.category_name ?? "—"}</td>
                  <td className="p-3 text-right tabular-nums">${Number(p.price).toFixed(2)}</td>
                  <td className="p-3 text-right">
                    <Badge variant={p.stock <= p.reorder_level ? "destructive" : "secondary"}>{p.stock}</Badge>
                  </td>
                  <td className="p-3 text-right">
                    {(isAdmin || isStoreKeeper) && (
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => { setEditing(p); setOpen(true); }}><Pencil className="h-4 w-4"/></Button>
                        {isAdmin && <Button size="icon" variant="ghost" onClick={() => remove(p.id)}><Trash2 className="h-4 w-4"/></Button>}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
