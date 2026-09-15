import { useState, useEffect } from "react";

// Event name untuk broadcast session expired dari manapun
export const sessionExpiredEvent = "auth:session-expired";

export interface AuthUser {
  id: number;
  username: string;
  fullName: string;
  role: string;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  // Dengerin event session expired dari global interceptor
  useEffect(() => {
    const handler = () => {
      setUser(null);
    };
    window.addEventListener(sessionExpiredEvent, handler);
    return () => window.removeEventListener(sessionExpiredEvent, handler);
  }, []);

  const login = async (username: string, password: string): Promise<{ ok: boolean; error?: string }> => {
    const r = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });
    if (r.ok) {
      const data = await r.json();
      setUser(data);
      return { ok: true };
    }
    const err = await r.json().catch(() => ({ error: "Login gagal" }));
    return { ok: false, error: err.error ?? "Login gagal" };
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setUser(null);
  };

  return { user, loading, login, logout };
}
