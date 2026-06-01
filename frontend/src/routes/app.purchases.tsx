import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/purchases")({
  component: PurchasesPage,
});

type Line = { product_id: string; quantity: number; unit_cost: number };

function PurchasesPage() {
  const { isStoreKeeper } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [supplier, setSupplier] = useState("");
  const [lines, setLines] = useState<Line[]>([{ product_id: "", quantity: 1, unit_cost: 0 }]);

  const { data: purchases = [] } = useQuery({
    queryKey: ["purchases"],
    queryFn: () => api.get("/purchases"),
  });
  const { data: products = [] } = useQuery({
    queryKey: ["products-lite"],
    queryFn: () => api.get("/products"),
  });

  const total = useMemo(() => lines.reduce((s, l) => s + (Number(l.quantity) || 0) * (Number(l.unit_cost) || 0), 0), [lines]);

  const submit = async () => {
    const clean = lines.filter(l => l.product_id && l.quantity > 0);
    if (clean.length === 0) return toast.error("Add at least one product");
    try {
      const p = await api.post("/purchases", {
        supplier: supplier || null,
        items: clean.map(l => ({
          product_id: l.product_id,
          quantity: Number(l.quantity),
          unit_cost: Number(l.unit_cost),
        })),
      });
      toast.success(`Purchase ${p.reference_no} recorded — stock updated`);
      setOpen(false);
      setSupplier(""); setLines([{ product_id: "", quantity: 1, unit_cost: 0 }]);
      qc.invalidateQueries({ queryKey: ["purchases"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["products-lite"] });
    } catch (err: any) {
      toast.error(err.message || "Failed");
    }
  };

  const setLine = (i: number, patch: Partial<Line>) => setLines(ls => ls.map((l, x) => x === i ? { ...l, ...patch } : l));

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-display font-semibold">Purchases</h1>
          <p className="text-muted-foreground mt-1">Record incoming stock. Quantities update automatically.</p>
        </div>
        {isStoreKeeper && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2"/>New purchase</Button></DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>Record purchase</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Supplier</Label><Input value={supplier} onChange={(e) => setSupplier(e.target.value)} placeholder="Optional"/></div>
                <div className="space-y-2">
                  <Label>Items</Label>
                  {lines.map((l, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-6">
                        <Select value={l.product_id} onValueChange={(v) => {
                          const prod: any = products.find((x: any) => x.id === v);
                          setLine(i, { product_id: v, unit_cost: prod?.cost ?? 0 });
                        }}>
                          <SelectTrigger><SelectValue placeholder="Product"/></SelectTrigger>
                          <SelectContent>
                            {products.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2"><Input type="number" min={1} value={l.quantity} onChange={(e) => setLine(i, { quantity: Number(e.target.value) })}/></div>
                      <div className="col-span-3"><Input type="number" step="0.01" value={l.unit_cost} onChange={(e) => setLine(i, { unit_cost: Number(e.target.value) })}/></div>
                      <div className="col-span-1"><Button type="button" size="icon" variant="ghost" onClick={() => setLines(ls => ls.filter((_, x) => x !== i))}><Trash2 className="h-4 w-4"/></Button></div>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => setLines(ls => [...ls, { product_id: "", quantity: 1, unit_cost: 0 }])}><Plus className="h-4 w-4 mr-1"/>Add item</Button>
                </div>
                <div className="flex justify-between items-center border-t pt-3">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="text-2xl font-display font-semibold">${total.toFixed(2)}</span>
                </div>
              </div>
              <DialogFooter><Button onClick={submit}>Record purchase</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-widest text-muted-foreground">
              <tr><th className="text-left p-3">Reference</th><th className="text-left p-3">Supplier</th><th className="text-left p-3">Items</th><th className="text-left p-3">Date</th><th className="text-right p-3">Total</th></tr>
            </thead>
            <tbody>
              {purchases.map((p: any) => (
                <tr key={p.id} className="border-t hover:bg-muted/30">
                  <td className="p-3 font-medium">{p.reference_no}</td>
                  <td className="p-3 text-muted-foreground">{p.supplier || "—"}</td>
                  <td className="p-3 text-muted-foreground">{(p.items ?? []).length}</td>
                  <td className="p-3 text-muted-foreground">{new Date(p.created_at).toLocaleString()}</td>
                  <td className="p-3 text-right tabular-nums">${Number(p.total).toFixed(2)}</td>
                </tr>
              ))}
              {purchases.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No purchases recorded.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
