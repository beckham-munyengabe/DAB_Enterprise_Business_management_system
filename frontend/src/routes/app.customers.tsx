import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Search, Pencil, Trash2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/customers")({
  component: CustomersPage,
});

function CustomersPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [history, setHistory] = useState<any>(null);

  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: () => api.get("/customers"),
  });

  const filtered = customers.filter((c: any) =>
    !q || [c.full_name, c.email, c.phone].some((v) => v?.toLowerCase().includes(q.toLowerCase()))
  );

  const save = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      full_name: String(fd.get("full_name") || "").trim(),
      email: String(fd.get("email") || "") || null,
      phone: String(fd.get("phone") || "") || null,
      address: String(fd.get("address") || "") || null,
    };
    if (!payload.full_name) return toast.error("Name required");
    try {
      if (editing) await api.put(`/customers/${editing.id}`, payload);
      else await api.post("/customers", payload);
      toast.success("Saved");
      setOpen(false); setEditing(null);
      qc.invalidateQueries({ queryKey: ["customers"] });
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this customer?")) return;
    try {
      await api.del(`/customers/${id}`);
      qc.invalidateQueries({ queryKey: ["customers"] });
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const openHistory = async (c: any) => {
    try {
      const sales = await api.get(`/customers/${c.id}/history`);
      setHistory({ customer: c, sales: sales ?? [] });
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-display font-semibold">Customers</h1>
          <p className="text-muted-foreground mt-1">Register, edit and view purchase history.</p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
          <DialogTrigger asChild><Button onClick={() => setEditing(null)}><Plus className="h-4 w-4 mr-2"/>New customer</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit customer" : "New customer"}</DialogTitle></DialogHeader>
            <form onSubmit={save} className="space-y-3">
              <div><Label>Full name</Label><Input name="full_name" defaultValue={editing?.full_name} required/></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Email</Label><Input name="email" type="email" defaultValue={editing?.email ?? ""}/></div>
                <div><Label>Phone</Label><Input name="phone" defaultValue={editing?.phone ?? ""}/></div>
              </div>
              <div><Label>Address</Label><Textarea name="address" rows={2} defaultValue={editing?.address ?? ""}/></div>
              <DialogFooter><Button type="submit">{editing ? "Save" : "Create"}</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
            <Input className="pl-9" placeholder="Search customers" value={q} onChange={(e) => setQ(e.target.value)}/>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-widest text-muted-foreground">
              <tr><th className="text-left p-3">Name</th><th className="text-left p-3">Email</th><th className="text-left p-3">Phone</th><th className="p-3"></th></tr>
            </thead>
            <tbody>
              {filtered.map((c: any) => (
                <tr key={c.id} className="border-t hover:bg-muted/30">
                  <td className="p-3 font-medium">{c.full_name}</td>
                  <td className="p-3 text-muted-foreground">{c.email || "—"}</td>
                  <td className="p-3 text-muted-foreground">{c.phone || "—"}</td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openHistory(c)}><ShoppingBag className="h-4 w-4"/></Button>
                      <Button size="icon" variant="ghost" onClick={() => { setEditing(c); setOpen(true); }}><Pencil className="h-4 w-4"/></Button>
                      <Button size="icon" variant="ghost" onClick={() => remove(c.id)}><Trash2 className="h-4 w-4"/></Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">No customers yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={!!history} onOpenChange={(o) => !o && setHistory(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{history?.customer.full_name} — purchase history</DialogTitle></DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto space-y-3">
            {(history?.sales ?? []).length === 0 && <p className="text-sm text-muted-foreground">No purchases recorded.</p>}
            {history?.sales.map((s: any) => (
              <div key={s.id} className="border rounded-lg p-3">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{s.invoice_no}</span>
                  <span className="text-muted-foreground">{new Date(s.created_at).toLocaleString()}</span>
                </div>
                <div className="mt-2 flex justify-between border-t pt-2 font-semibold">
                  <span>Total</span><span>${Number(s.total).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
