import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Profile } from "shared";
import { api, clearSession, hasSession, persistSession } from "../lib/apiClient";

interface AuthContextValue {
  user: Profile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  acceptInvite: (token: string, name: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!(await hasSession())) {
        setLoading(false);
        return;
      }
      try {
        setUser(await api.auth.me());
      } catch {
        await clearSession();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function login(email: string, password: string) {
    const session = await api.auth.login(email, password);
    await persistSession(session.accessToken, session.refreshToken);
    setUser(session.user);
  }

  async function acceptInvite(token: string, name: string, password: string) {
    const session = await api.auth.acceptInvite(token, name, password);
    await persistSession(session.accessToken, session.refreshToken);
    setUser(session.user);
  }

  async function logout() {
    await clearSession();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, acceptInvite, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
