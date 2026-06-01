import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";

export const Route = createFileRoute("/app/reports")({
  component: ReportsPage,
});

const fmt = (n: number) => new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(n || 0);

function ReportsPage() {
  const { data } = useQuery({
    queryKey: ["reports"],
    queryFn: async () => {
      const [summary, monthly, top, stock] = await Promise.all([
        api.get("/reports/dashboard"),
        api.get("/reports/monthly-revenue"),
        api.get("/reports/top-customers?limit=5"),
        api.get("/reports/stock"),
      ]);

      const monthlySeries = [...(monthly ?? [])]
        .reverse()
        .map((r: any) => ({ month: format(new Date(r.month + "-01"), "MMM yy"), total: Number(r.revenue || 0) }));

      const topSeries = (top ?? []).map((c: any) => ({ name: c.full_name, total: Number(c.spent || 0) }));
      const lowStock = (stock ?? []).filter((p: any) => p.stock <= p.reorder_level);
      const stockValue = (stock ?? []).reduce((s: number, p: any) => s + Number(p.stock_value || 0), 0);

      return {
        monthTotal: summary.total_revenue ?? 0,
        monthCount: summary.total_sales ?? 0,
        products: stock ?? [],
        lowStock,
        stockValue,
        monthly: monthlySeries,
        top: topSeries,
      };
    },
  });

  const COLORS = ["var(--color-primary)", "var(--color-accent)", "var(--color-chart-3)", "var(--color-chart-4)", "var(--color-chart-5)"];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-semibold">Reports</h1>
        <p className="text-muted-foreground mt-1">Monthly income, stock and customers — generated automatically.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          ["Total revenue", fmt(data?.monthTotal ?? 0), `${data?.monthCount ?? 0} invoices`],
          ["Stock value", fmt(data?.stockValue ?? 0), `${data?.products.length ?? 0} SKUs`],
          ["Low stock items", `${data?.lowStock.length ?? 0}`, "Need reorder"],
          ["Top customers", `${data?.top.length ?? 0}`, "Tracked"],
        ].map(([l, v, s]) => (
          <Card key={l} className="p-5">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">{l}</div>
            <div className="text-2xl font-display font-semibold mt-2">{v}</div>
            <div className="text-xs text-muted-foreground mt-1">{s}</div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="font-display text-lg font-semibold">Monthly income</h2>
          <div className="h-72 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.monthly ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)"/>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="var(--color-muted-foreground)"/>
                <YAxis tick={{ fontSize: 12 }} stroke="var(--color-muted-foreground)"/>
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }}/>
                <Bar dataKey="total" fill="var(--color-primary)" radius={[6,6,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-display text-lg font-semibold">Top customers</h2>
          {(data?.top.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground mt-4">No customer sales yet.</p>
          ) : (
            <div className="h-72 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data?.top ?? []} dataKey="total" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={2}>
                    {(data?.top ?? []).map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }}/>
                  <Legend/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-6 border-b"><h2 className="font-display text-lg font-semibold">Stock report</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-widest text-muted-foreground">
              <tr><th className="text-left p-3">Product</th><th className="text-right p-3">Stock</th><th className="text-right p-3">Reorder at</th><th className="text-right p-3">Status</th></tr>
            </thead>
            <tbody>
              {(data?.products ?? []).map((p: any) => (
                <tr key={p.id} className="border-t">
                  <td className="p-3">{p.name}</td>
                  <td className="p-3 text-right tabular-nums">{p.stock}</td>
                  <td className="p-3 text-right tabular-nums text-muted-foreground">{p.reorder_level}</td>
                  <td className={`p-3 text-right text-xs font-medium ${p.stock <= p.reorder_level ? "text-destructive" : "text-success"}`}>
                    {p.stock <= p.reorder_level ? "REORDER" : "OK"}
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
