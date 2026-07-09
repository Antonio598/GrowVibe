import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sprout } from "lucide-react";
import { useAuth } from "../store/auth";
import { Button, Field, Input } from "../components/ui";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-lime text-white shadow-card">
            <Sprout size={28} />
          </span>
          <div>
            <h1 className="text-2xl font-semibold text-ink">GrowVibe</h1>
            <p className="text-sm text-muted">Tu vida, en orden y creciendo.</p>
          </div>
        </div>
        <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-line bg-surface p-6 shadow-card">
          <Field label="Email">
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" />
          </Field>
          <Field label="Contraseña">
            <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </Field>
          {error && <p className="text-sm text-coral">{error}</p>}
          <Button type="submit" size="lg" disabled={loading} className="w-full">
            {loading ? "Ingresando..." : "Ingresar"}
          </Button>
        </form>
      </div>
    </div>
  );
}
