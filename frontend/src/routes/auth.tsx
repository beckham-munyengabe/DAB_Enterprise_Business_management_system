import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth, type AppRole } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { z } from "zod";
import authBg from "@/assets/auth-bg.jpg";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — DAB Enterprise" }] }),
  component: AuthPage,
});

const ROLES: { value: AppRole; label: string }[] = [
  { value: "admin", label: "Administrator" },
  { value: "sales_manager", label: "Sales Manager" },
  { value: "store_keeper", label: "Store Keeper" },
];

const loginSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(6).max(72),
});
const signupSchema = loginSchema.extend({
  full_name: z.string().trim().min(2).max(100),
});

function AuthPage() {
  const { user, loading, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [loginRole, setLoginRole] = useState<AppRole | "">("");
  const [signupRole, setSignupRole] = useState<AppRole | "">("");

  useEffect(() => {
    if (!loading && user) navigate({ to: "/app" });
  }, [loading, user, navigate]);

  const onLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = loginSchema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setBusy(true);
    try {
      await signIn(parsed.data.email, parsed.data.password, loginRole || undefined);
      toast.success("Welcome back");
      navigate({ to: "/app" });
    } catch (err: any) {
      toast.error(err.message || "Sign in failed");
    } finally {
      setBusy(false);
    }
  };

  const onSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = signupSchema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    if (!signupRole) return toast.error("Please choose a role");
    setBusy(true);
    try {
      await signUp({
        full_name: parsed.data.full_name,
        email: parsed.data.email,
        password: parsed.data.password,
        role: signupRole,
      });
      toast.success("Account created. Signing you in…");
      navigate({ to: "/app" });
    } catch (err: any) {
      toast.error(err.message || "Sign up failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <img src={authBg} alt="" className="absolute inset-0 h-full w-full object-cover" width={1200} height={1600}/>
        <div className="absolute inset-0 bg-gradient-to-br from-sidebar/80 via-sidebar/40 to-transparent"/>
        <div className="relative h-full flex flex-col justify-between p-12 text-white">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-primary grid place-items-center font-display font-bold">D</div>
            <span className="font-display text-lg font-semibold">DAB Enterprise</span>
          </Link>
          <div>
            <h2 className="font-display text-4xl font-semibold leading-tight">One system for sales, stock, and people.</h2>
            <p className="mt-3 text-white/70 max-w-md">Secure, role-based access for administrators, sales managers and store keepers.</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 lg:p-12 bg-background">
        <div className="w-full max-w-md">
          <h1 className="font-display text-3xl font-semibold">Welcome</h1>
          <p className="mt-1 text-muted-foreground">Sign in to access your dashboard.</p>

          <Tabs defaultValue="login" className="mt-8">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="login">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Create account</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={onLogin} className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" required autoComplete="email"/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" name="password" type="password" required autoComplete="current-password"/>
                </div>
                <div className="space-y-2">
                  <Label>Role (optional)</Label>
                  <Select value={loginRole} onValueChange={(v) => setLoginRole(v as AppRole)}>
                    <SelectTrigger><SelectValue placeholder="Sign in with any of my roles"/></SelectTrigger>
                    <SelectContent>
                      {ROLES.map((r) => (
                        <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" disabled={busy} className="w-full">{busy ? "Signing in…" : "Sign in"}</Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={onSignup} className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full name</Label>
                  <Input id="full_name" name="full_name" required/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="su_email">Email</Label>
                  <Input id="su_email" name="email" type="email" required autoComplete="email"/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="su_password">Password</Label>
                  <Input id="su_password" name="password" type="password" required minLength={6} autoComplete="new-password"/>
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={signupRole} onValueChange={(v) => setSignupRole(v as AppRole)}>
                    <SelectTrigger><SelectValue placeholder="Choose your role"/></SelectTrigger>
                    <SelectContent>
                      {ROLES.map((r) => (
                        <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" disabled={busy} className="w-full">{busy ? "Creating…" : "Create account"}</Button>
              </form>
            </TabsContent>
          </Tabs>

          <Link to="/" className="mt-8 inline-block text-sm text-muted-foreground hover:text-foreground">← Back to home</Link>
        </div>
      </div>
    </div>
  );
}
