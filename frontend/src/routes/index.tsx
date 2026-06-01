import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowRight, Boxes, ShieldCheck, BarChart3, Users, ShoppingCart, PackagePlus } from "lucide-react";
import hero from "@/assets/hero-warehouse.jpg";
import catElec from "@/assets/cat-electronics.jpg";
import catOffice from "@/assets/cat-office.jpg";
import catHome from "@/assets/cat-home.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DAB Enterprise — Business Management System" },
      { name: "description", content: "Manage products, sales, purchases, customers and employees for DAB Enterprise Ltd." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="absolute top-0 inset-x-0 z-20">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-5">
          <Link to="/" className="flex items-center gap-2 text-white">
            <div className="h-8 w-8 rounded-lg bg-primary grid place-items-center font-display font-bold">D</div>
            <span className="font-display font-semibold tracking-tight">DAB Enterprise</span>
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm text-white/70">
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#modules" className="hover:text-white">Modules</a>
            <a href="#roles" className="hover:text-white">Roles</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/auth"><Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white">Sign in</Button></Link>
            <Link to="/auth"><Button className="bg-primary hover:bg-primary/90">Get started <ArrowRight className="ml-1 h-4 w-4"/></Button></Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative min-h-[92vh] flex items-end overflow-hidden">
        <img src={hero} alt="DAB Enterprise warehouse with electronics and office stock" width={1600} height={1000} className="absolute inset-0 h-full w-full object-cover"/>
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background"/>
        <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-40 text-white">
          <span className="inline-flex items-center rounded-full border border-white/20 bg-white/5 backdrop-blur px-3 py-1 text-xs uppercase tracking-widest">DAB Enterprise Ltd · Retail OS</span>
          <h1 className="mt-6 max-w-3xl text-5xl md:text-7xl font-display font-bold leading-[1.05]">
            Run electronics, office, and home equipment <span className="text-accent">in one system.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-white/70">
            Manage customers, stock and sales securely. Auto-generate invoices and reports. Built for administrators, sales managers and store keepers.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/auth"><Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">Open the dashboard <ArrowRight className="ml-2 h-4 w-4"/></Button></Link>
            <a href="#modules"><Button size="lg" variant="outline" className="border-white/30 bg-white/5 text-white hover:bg-white/10 hover:text-white">Explore modules</Button></a>
          </div>
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl">
            {[
              ["6+", "Modules"],
              ["3", "User roles"],
              ["RLS", "Secure by default"],
              ["Auto", "Reports & invoices"],
            ].map(([n, l]) => (
              <div key={l} className="border-l border-white/15 pl-4">
                <div className="text-3xl font-display font-semibold text-accent">{n}</div>
                <div className="text-xs uppercase tracking-widest text-white/60">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="features" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">What we sell</p>
              <h2 className="mt-2 text-3xl md:text-4xl font-display font-semibold">Three categories. One system.</h2>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { img: catElec, name: "Electronics", desc: "Phones, laptops, accessories, audio gear." },
              { img: catOffice, name: "Office Supplies", desc: "Stationery, paper, pens, organizers." },
              { img: catHome, name: "Home Equipment", desc: "Kitchen, cleaning, appliances." },
            ].map((c) => (
              <div key={c.name} className="group relative overflow-hidden rounded-2xl border bg-card">
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={c.img} alt={c.name} loading="lazy" width={800} height={600} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"/>
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-display font-semibold">{c.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modules */}
      <section id="modules" className="py-24 bg-secondary/40 border-y">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">System modules</p>
          <h2 className="mt-2 text-3xl md:text-4xl font-display font-semibold">Everything your team needs.</h2>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { i: ShieldCheck, t: "Authentication", d: "Secure login, registration, password encryption and role-based access control." },
              { i: Boxes, t: "Products & Stock", d: "Add, update, delete products. View available stock and reorder levels." },
              { i: Users, t: "Customers", d: "Register, edit, search and view full purchase history." },
              { i: ShoppingCart, t: "Sales & Invoices", d: "Record transactions, auto-calculate totals, generate invoices." },
              { i: PackagePlus, t: "Purchases", d: "Record incoming stock. Quantities update automatically." },
              { i: BarChart3, t: "Reports", d: "Daily sales, monthly income, stock and customer reports — instantly." },
            ].map(({ i: Icon, t, d }) => (
              <div key={t} className="rounded-2xl border bg-card p-6 hover:shadow-md transition-shadow">
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary grid place-items-center"><Icon className="h-5 w-5"/></div>
                <h3 className="mt-4 font-display text-lg font-semibold">{t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="py-24">
        <div className="mx-auto max-w-7xl px-6 grid lg:grid-cols-3 gap-6">
          {[
            { t: "Administrator", d: "Manages all system activity, employees, and generates reports." },
            { t: "Sales Manager", d: "Records sales, views stock, generates invoices." },
            { t: "Store Keeper", d: "Updates stock, records purchases, monitors inventory." },
          ].map((r) => (
            <div key={r.t} className="rounded-2xl border p-8 bg-gradient-to-br from-card to-secondary/30">
              <div className="text-xs uppercase tracking-widest text-accent">Role</div>
              <h3 className="mt-2 text-2xl font-display font-semibold">{r.t}</h3>
              <p className="mt-3 text-muted-foreground">{r.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-sidebar text-sidebar-foreground">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-display font-semibold">Ready to run DAB Enterprise smarter?</h2>
          <p className="mt-4 text-sidebar-foreground/70">Sign in or create your administrator account to get started in seconds.</p>
          <Link to="/auth"><Button size="lg" className="mt-8 bg-accent text-accent-foreground hover:bg-accent/90">Open the system</Button></Link>
        </div>
      </section>

      <footer className="border-t py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} DAB Enterprise Ltd. All rights reserved.
      </footer>
    </div>
  );
}
