import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Profile } from "shared";
import { api, clearSession, hasSession, persistSession } from "../lib/apiClient";

interface AuthContextValue {
  user: Profile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  acceptInvite: (token: string, name: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasSession()) {
      setLoading(false);
      return;
    }
    api.auth
      .me()
      .then(setUser)
      .catch(() => clearSession())
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const session = await api.auth.login(email, password);
    persistSession(session.accessToken, session.refreshToken);
    setUser(session.user);
  }

  async function acceptInvite(token: string, name: string, password: string) {
    const session = await api.auth.acceptInvite(token, name, password);
    persistSession(session.accessToken, session.refreshToken);
    setUser(session.user);
  }

  function logout() {
    clearSession();
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
