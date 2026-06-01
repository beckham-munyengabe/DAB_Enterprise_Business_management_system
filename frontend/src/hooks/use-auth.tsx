import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api, setToken, clearToken, getToken } from "@/lib/api-client";

export type AppRole = "admin" | "sales_manager" | "store_keeper";

export type AppUser = {
  id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  roles: AppRole[];
};

type AuthCtx = {
  user: AppUser | null;
  roles: AppRole[];
  loading: boolean;
  isAdmin: boolean;
  isSalesManager: boolean;
  isStoreKeeper: boolean;
  signIn: (email: string, password: string, role?: AppRole) => Promise<void>;
  signUp: (input: {
    full_name: string;
    email: string;
    password: string;
    phone?: string;
    role?: AppRole;
  }) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const loadMe = async () => {
    if (!getToken()) {
      setUser(null);
      return;
    }
    try {
      const { user: u } = await api.get<{ user: AppUser }>("/auth/me");
      setUser(u);
    } catch {
      clearToken();
      setUser(null);
    }
  };

  useEffect(() => {
    loadMe().finally(() => setLoading(false));
  }, []);

  const signIn: AuthCtx["signIn"] = async (email, password, role) => {
    const { user: u, token } = await api.post<{ user: AppUser; token: string }>(
      "/auth/login",
      { email, password, ...(role ? { role } : {}) }
    );
    setToken(token);
    setUser(u);
  };

  const signUp: AuthCtx["signUp"] = async (input) => {
    const { user: u, token } = await api.post<{ user: AppUser; token: string }>(
      "/auth/register",
      input
    );
    setToken(token);
    setUser(u);
  };

  const roles = user?.roles ?? [];

  const value: AuthCtx = {
    user,
    roles,
    loading,
    isAdmin: roles.includes("admin"),
    isSalesManager: roles.includes("sales_manager") || roles.includes("admin"),
    isStoreKeeper: roles.includes("store_keeper") || roles.includes("admin"),
    signIn,
    signUp,
    signOut: async () => {
      clearToken();
      setUser(null);
    },
    refreshUser: loadMe,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be inside AuthProvider");
  return v;
}
