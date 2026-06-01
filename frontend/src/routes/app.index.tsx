import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Boxes, Users, ShoppingCart, DollarSign, AlertTriangle, TrendingUp } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { format } from "date-fns";

export const Route = createFileRoute("/app/")({
  component: Dashboard,
});

function fmtMoney(n: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(n || 0);
}

function Dashboard() {
  const { user, roles } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [summary, daily, stock] = await Promise.all([
        api.get("/reports/dashboard"),
        api.get("/reports/daily-revenue?days=14"),
        api.get("/reports/stock"),
      ]);
      const series = (daily ?? []).map((r: any) => ({
        day: format(new Date(r.day), "MMM dd"),
        total: Number(r.revenue || 0),
      }));
      const low = (stock ?? []).filter((p: any) => p.stock <= p.reorder_level);
      return {
        products: summary.total_products ?? 0,
        customers: summary.total_customers ?? 0,
        salesCount: summary.total_sales ?? 0,
        revenue: summary.total_revenue ?? 0,
        low,
        series,
      };
    },
  });

  const cards = [
    { label: "Products", value: stats?.products ?? "—", icon: Boxes },
    { label: "Customers", value: stats?.customers ?? "—", icon: Users },
    { label: "Sales", value: stats?.salesCount ?? "—", icon: ShoppingCart },
    { label: "Revenue", value: stats ? fmtMoney(stats.revenue) : "—", icon: DollarSign },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Welcome back</p>
        <h1 className="text-3xl font-display font-semibold mt-1">{user?.email}</h1>
        <p className="text-muted-foreground mt-1">Signed in as <span className="capitalize">{roles[0]?.replace("_"," ") ?? "user"}</span>.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
                <div className="text-2xl font-display font-semibold mt-2">{value}</div>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary grid place-items-center"><Icon className="h-5 w-5"/></div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-lg font-semibold">Revenue — last 14 days</h2>
              <p className="text-sm text-muted-foreground">Daily totals from completed sales.</p>
            </div>
            <TrendingUp className="h-5 w-5 text-primary"/>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.series ?? []}>
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.4}/>
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)"/>
                <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="var(--color-muted-foreground)"/>
                <YAxis tick={{ fontSize: 12 }} stroke="var(--color-muted-foreground)"/>
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }}/>
                <Area type="monotone" dataKey="total" stroke="var(--color-primary)" fill="url(#g)" strokeWidth={2}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-accent"/>
            <h2 className="font-display text-lg font-semibold">Low stock</h2>
          </div>
          <div className="space-y-3">
            {(stats?.low ?? []).length === 0 && <p className="text-sm text-muted-foreground">All products above reorder level.</p>}
            {stats?.low.map((p: any) => (
              <div key={p.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                <div className="text-sm">{p.name}</div>
                <div className="text-xs text-accent font-medium">{p.stock} left</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
