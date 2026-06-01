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
import { Plus, Trash2, Receipt, FileText } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/sales")({
  component: SalesPage,
});

type Line = { product_id: string; quantity: number; unit_price: number };

function SalesPage() {
  const { isSalesManager } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [invoice, setInvoice] = useState<any>(null);
  const [customerId, setCustomerId] = useState<string>("");
  const [lines, setLines] = useState<Line[]>([{ product_id: "", quantity: 1, unit_price: 0 }]);

  const { data: sales = [] } = useQuery({
    queryKey: ["sales"],
    queryFn: () => api.get("/sales"),
  });
  const { data: products = [] } = useQuery({
    queryKey: ["products-lite"],
    queryFn: () => api.get("/products"),
  });
  const { data: customers = [] } = useQuery({
    queryKey: ["customers-lite"],
    queryFn: () => api.get("/customers"),
  });

  const total = useMemo(() => lines.reduce((s, l) => s + (Number(l.quantity) || 0) * (Number(l.unit_price) || 0), 0), [lines]);

  const setLine = (i: number, patch: Partial<Line>) => {
    setLines((ls) => ls.map((l, idx) => idx === i ? { ...l, ...patch } : l));
  };

  const submit = async () => {
    const clean = lines.filter(l => l.product_id && l.quantity > 0);
    if (clean.length === 0) return toast.error("Add at least one product");
    try {
      const sale = await api.post("/sales", {
        customer_id: customerId || null,
        items: clean.map(l => ({
          product_id: l.product_id,
          quantity: Number(l.quantity),
          unit_price: Number(l.unit_price),
        })),
      });
      toast.success(`Invoice ${sale.invoice_no} recorded`);
      setOpen(false);
      setLines([{ product_id: "", quantity: 1, unit_price: 0 }]);
      setCustomerId("");
      qc.invalidateQueries({ queryKey: ["sales"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["products-lite"] });
    } catch (err: any) {
      toast.error(err.message || "Failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-display font-semibold">Sales</h1>
          <p className="text-muted-foreground mt-1">Record transactions and generate invoices.</p>
        </div>
        {isSalesManager && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2"/>New sale</Button></DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>Record sale</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Customer (optional)</Label>
                  <Select value={customerId} onValueChange={setCustomerId}>
                    <SelectTrigger><SelectValue placeholder="Walk-in"/></SelectTrigger>
                    <SelectContent>
                      {customers.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Items</Label>
                  {lines.map((l, i) => {
                    const p = products.find((x: any) => x.id === l.product_id);
                    return (
                      <div key={i} className="grid grid-cols-12 gap-2 items-end">
                        <div className="col-span-6">
                          <Select value={l.product_id} onValueChange={(v) => {
                            const prod: any = products.find((x: any) => x.id === v);
                            setLine(i, { product_id: v, unit_price: prod?.price ?? 0 });
                          }}>
                            <SelectTrigger><SelectValue placeholder="Product"/></SelectTrigger>
                            <SelectContent>
                              {products.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name} ({p.stock} left)</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-2">
                          <Input type="number" min={1} max={p?.stock ?? 9999} value={l.quantity} onChange={(e) => setLine(i, { quantity: Number(e.target.value) })}/>
                        </div>
                        <div className="col-span-3">
                          <Input type="number" step="0.01" value={l.unit_price} onChange={(e) => setLine(i, { unit_price: Number(e.target.value) })}/>
                        </div>
                        <div className="col-span-1">
                          <Button type="button" size="icon" variant="ghost" onClick={() => setLines(ls => ls.filter((_, x) => x !== i))}><Trash2 className="h-4 w-4"/></Button>
                        </div>
                      </div>
                    );
                  })}
                  <Button type="button" variant="outline" size="sm" onClick={() => setLines(ls => [...ls, { product_id: "", quantity: 1, unit_price: 0 }])}><Plus className="h-4 w-4 mr-1"/>Add item</Button>
                </div>

                <div className="flex justify-between items-center border-t pt-3">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="text-2xl font-display font-semibold">${total.toFixed(2)}</span>
                </div>
              </div>
              <DialogFooter><Button onClick={submit}>Record sale</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-widest text-muted-foreground">
              <tr><th className="text-left p-3">Invoice</th><th className="text-left p-3">Customer</th><th className="text-left p-3">Date</th><th className="text-right p-3">Total</th><th className="p-3"></th></tr>
            </thead>
            <tbody>
              {sales.map((s: any) => (
                <tr key={s.id} className="border-t hover:bg-muted/30">
                  <td className="p-3 font-medium">{s.invoice_no}</td>
                  <td className="p-3 text-muted-foreground">{s.customer_name || "Walk-in"}</td>
                  <td className="p-3 text-muted-foreground">{new Date(s.created_at).toLocaleString()}</td>
                  <td className="p-3 text-right tabular-nums">${Number(s.total).toFixed(2)}</td>
                  <td className="p-3 text-right"><Button size="icon" variant="ghost" onClick={() => setInvoice(s)}><Receipt className="h-4 w-4"/></Button></td>
                </tr>
              ))}
              {sales.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No sales recorded.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={!!invoice} onOpenChange={(o) => !o && setInvoice(null)}>
        <DialogContent className="max-w-lg print:shadow-none">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-display text-2xl font-semibold">DAB Enterprise Ltd</div>
                <div className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Tax Invoice</div>
              </div>
              <FileText className="h-8 w-8 text-primary"/>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm border-t border-b py-3">
              <div><div className="text-muted-foreground text-xs uppercase tracking-widest">Invoice</div><div className="font-medium">{invoice?.invoice_no}</div></div>
              <div><div className="text-muted-foreground text-xs uppercase tracking-widest">Date</div><div>{invoice && new Date(invoice.created_at).toLocaleString()}</div></div>
              <div className="col-span-2"><div className="text-muted-foreground text-xs uppercase tracking-widest">Bill to</div><div>{invoice?.customer_name || "Walk-in customer"}</div></div>
            </div>
            <div>
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-widest text-muted-foreground">
                  <tr><th className="py-1">Item</th><th className="text-right">Qty</th><th className="text-right">Price</th><th className="text-right">Subtotal</th></tr>
                </thead>
                <tbody>
                  {(invoice?.items ?? []).map((i: any, idx: number) => (
                    <tr key={idx} className="border-t">
                      <td className="py-2">{i.product_name}</td>
                      <td className="text-right">{i.quantity}</td>
                      <td className="text-right">${Number(i.unit_price).toFixed(2)}</td>
                      <td className="text-right">${Number(i.subtotal).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between border-t pt-3 text-lg font-semibold">
              <span>Total</span><span>${Number(invoice?.total ?? 0).toFixed(2)}</span>
            </div>
            <Button className="w-full" onClick={() => window.print()}>Print invoice</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
