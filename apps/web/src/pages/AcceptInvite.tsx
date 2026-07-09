import { FormEvent, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Sprout } from "lucide-react";
import { useAuth } from "../store/auth";
import { Button, Field, Input } from "../components/ui";

export function AcceptInvite() {
  const { acceptInvite } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [token, setToken] = useState(params.get("token") ?? "");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await acceptInvite(token, name, password);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al aceptar la invitación");
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
            <h1 className="text-2xl font-semibold text-ink">Únete a GrowVibe</h1>
            <p className="text-sm text-muted">Crea tu cuenta con la invitación que recibiste.</p>
          </div>
        </div>
        <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-line bg-surface p-6 shadow-card">
          <Field label="Token de invitación">
            <Input required value={token} onChange={(e) => setToken(e.target.value)} />
          </Field>
          <Field label="Nombre">
            <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" />
          </Field>
          <Field label="Contraseña">
            <Input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 8 caracteres" />
          </Field>
          {error && <p className="text-sm text-coral">{error}</p>}
          <Button type="submit" size="lg" disabled={loading} className="w-full">
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </Button>
        </form>
      </div>
    </div>
  );
}
