import { createFileRoute, Outlet, Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, Boxes, Tags, Users, ShoppingCart, PackagePlus, UserCog, BarChart3, LogOut, Menu
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

const NAV = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/app/products", label: "Products", icon: Boxes },
  { to: "/app/categories", label: "Categories", icon: Tags, admin: true },
  { to: "/app/customers", label: "Customers", icon: Users },
  { to: "/app/sales", label: "Sales", icon: ShoppingCart },
  { to: "/app/purchases", label: "Purchases", icon: PackagePlus },
  { to: "/app/employees", label: "Employees", icon: UserCog, admin: true },
  { to: "/app/reports", label: "Reports", icon: BarChart3 },
];

function AppLayout() {
  const { user, loading, signOut, isAdmin, roles } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading…</div>;
  }

  const items = NAV.filter(n => !n.admin || isAdmin);
  const roleLabel = roles[0]?.replace("_", " ") ?? "user";

  return (
    <div className="min-h-screen flex bg-secondary/30">
      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:sticky top-0 z-40 h-screen w-64 shrink-0 bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-transform",
        open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex h-16 items-center gap-2 px-5 border-b border-sidebar-border">
          <div className="h-8 w-8 rounded-lg bg-sidebar-primary grid place-items-center text-sidebar-primary-foreground font-display font-bold">D</div>
          <div>
            <div className="font-display font-semibold leading-none">DAB Enterprise</div>
            <div className="text-[10px] uppercase tracking-widest text-sidebar-foreground/60 mt-1">Retail OS</div>
          </div>
        </div>
        <nav className="p-3 space-y-1">
          {items.map(({ to, label, icon: Icon, exact }) => {
            const active = exact ? location.pathname === to : location.pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4"/>{label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 inset-x-0 p-3 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="h-9 w-9 rounded-full bg-sidebar-accent grid place-items-center text-sm font-semibold">
              {user.email?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm truncate">{user.email}</div>
              <div className="text-[10px] uppercase tracking-widest text-sidebar-foreground/60">{roleLabel}</div>
            </div>
            <Button size="icon" variant="ghost" className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent" onClick={() => { signOut(); navigate({ to: "/" }); }}>
              <LogOut className="h-4 w-4"/>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0">
        <header className="lg:hidden sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background px-4">
          <Button size="icon" variant="ghost" onClick={() => setOpen(o => !o)}><Menu className="h-5 w-5"/></Button>
          <span className="font-display font-semibold">DAB Enterprise</span>
        </header>
        <main className="p-6 lg:p-10 max-w-7xl mx-auto">
          <Outlet/>
        </main>
      </div>
    </div>
  );
}
