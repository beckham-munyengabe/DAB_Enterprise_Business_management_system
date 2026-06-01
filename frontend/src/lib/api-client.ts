// ============================================================
//  Frontend API client for the DAB Enterprise MongoDB backend
// ============================================================
// All data now comes from the Express + MongoDB REST API (the
// `backend/` folder) instead of Supabase. Set the API base URL
// with VITE_API_URL in your frontend .env (defaults to the local
// backend on port 5000).
// ============================================================

const API_URL =
  (import.meta.env.VITE_API_URL as string) || "http://localhost:5000/api";

const TOKEN_KEY = "dab_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string) {
  if (typeof window !== "undefined") window.localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken() {
  if (typeof window !== "undefined") window.localStorage.removeItem(TOKEN_KEY);
}

async function request<T = any>(
  path: string,
  options: { method?: string; body?: unknown } = {}
): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    let message = res.statusText;
    try {
      const data = await res.json();
      message = data.message || message;
    } catch {
      /* ignore non-JSON error bodies */
    }
    throw new Error(message || "Request failed");
  }

  if (res.status === 204) return null as T;
  return res.json();
}

export const api = {
  get: <T = any>(path: string) => request<T>(path),
  post: <T = any>(path: string, body?: unknown) => request<T>(path, { method: "POST", body }),
  put: <T = any>(path: string, body?: unknown) => request<T>(path, { method: "PUT", body }),
  del: <T = any>(path: string, body?: unknown) => request<T>(path, { method: "DELETE", body }),
};
