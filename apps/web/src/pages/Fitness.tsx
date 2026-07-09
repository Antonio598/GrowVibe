import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, Scale, Flame, HeartPulse, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { api } from "../lib/apiClient";
import { ActivityLevel, DietGoal, Sex, type FitnessLog } from "shared";
import { Button, IconButton, Card, StatTile, Field, Input, Select, Modal, ConfirmDialog, EmptyState, PageHeader } from "../components/ui";
import { ProgressRing } from "../components/ui";
import { shortDate, forDateInput, dateInputToIso } from "../lib/format";

const activityLabels: Record<ActivityLevel, string> = {
  sedentary: "Sedentario", light: "Ligero", moderate: "Moderado", active: "Activo", very_active: "Muy activo",
};
const goalLabels: Record<DietGoal, string> = { lose: "Perder peso", maintain: "Mantener", gain: "Ganar músculo" };

export function Fitness() {
  const qc = useQueryClient();
  const { data: logs } = useQuery({ queryKey: ["fitness", "logs"], queryFn: () => api.fitness.logs() });
  const { data: plan } = useQuery({ queryKey: ["fitness", "diet-plan", "latest"], queryFn: () => api.fitness.latestDietPlan() });
  const [editing, setEditing] = useState<FitnessLog | null>(null);
  const [deleting, setDeleting] = useState<FitnessLog | null>(null);
  const invalidate = () => qc.invalidateQueries({ queryKey: ["fitness"] });

  const remove = useMutation({
    mutationFn: (id: string) => api.fitness.deleteLog(id),
    onSuccess: () => { setDeleting(null); invalidate(); toast.success("Registro borrado"); },
  });

  const sorted = [...(logs ?? [])].sort((a, b) => +new Date(a.date) - +new Date(b.date));
  const chartData = sorted.filter((l) => l.weightKg != null).map((l) => ({ date: shortDate(l.date), peso: l.weightKg }));
  const latestWeight = sorted.filter((l) => l.weightKg != null).at(-1)?.weightKg;
  const compliances = (logs ?? []).map((l) => l.routineCompliance).filter((c): c is number => c != null);
  const avgCompliance = compliances.length ? Math.round(compliances.reduce((a, b) => a + b, 0) / compliances.length) : 0;

  return (
    <div>
      <PageHeader title="Salud y Físico" subtitle="Registra tu progreso y ve cómo creces." />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile label="Peso actual" value={latestWeight ? `${latestWeight} kg` : "—"} accent="primary" icon={<Scale size={18} />} />
        <StatTile label="Objetivo diario" value={plan ? `${plan.targetCalories}` : "—"} hint={plan ? "kcal" : "Calcula tu plan"} accent="coral" icon={<Flame size={18} />} />
        <Card className="flex items-center gap-4 p-5">
          <ProgressRing value={avgCompliance} size={64} />
          <div>
            <p className="text-sm font-medium text-muted">Cumplimiento</p>
            <p className="text-xs text-muted">Promedio de rutina</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <NewLogForm onCreated={invalidate} />
          <Card className="p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-medium text-muted"><TrendingUp size={15} /> Evolución de peso</h3>
            {chartData.length < 2 ? (
              <p className="py-6 text-center text-sm text-muted">Registra al menos 2 pesos para ver tu evolución.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData} margin={{ left: -20, right: 8, top: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EAE7DF" />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#5B6B63" }} />
                  <YAxis tick={{ fontSize: 12, fill: "#5B6B63" }} domain={["dataMin - 1", "dataMax + 1"]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="peso" stroke="#15A06B" strokeWidth={2.5} dot={{ r: 3, fill: "#15A06B" }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Card>
          <div className="space-y-2">
            {(logs ?? []).length === 0 ? (
              <EmptyState icon={<HeartPulse size={22} />} title="Sin registros" hint="Añade tu primer registro diario arriba." />
            ) : (
              (logs ?? []).map((l) => (
                <Card key={l.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary-dark"><Scale size={16} /></div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-ink">{l.weightKg ? `${l.weightKg} kg` : "Registro"}</p>
                    <div className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-muted">
                      <span>{shortDate(l.date)}</span>
                      {l.routineCompliance != null && <span>Rutina {l.routineCompliance}%</span>}
                      {l.measurements && Object.entries(l.measurements).map(([k, v]) => <span key={k}>{k}: {v}</span>)}
                    </div>
                  </div>
                  <div className="flex shrink-0">
                    <IconButton label="Editar" onClick={() => setEditing(l)}><Pencil size={16} /></IconButton>
                    <IconButton label="Borrar" variant="danger" onClick={() => setDeleting(l)}><Trash2 size={16} /></IconButton>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        <DietCalculator onCalculated={invalidate} plan={plan ?? null} />
      </div>

      {editing && <EditLogModal log={editing} onClose={() => setEditing(null)} onSaved={invalidate} />}
      <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)} onConfirm={() => deleting && remove.mutate(deleting.id)} title="Borrar registro" message="¿Borrar este registro de salud?" loading={remove.isPending} />
    </div>
  );
}

function NewLogForm({ onCreated }: { onCreated: () => void }) {
  const [weight, setWeight] = useState("");
  const [compliance, setCompliance] = useState("");
  const [waist, setWaist] = useState("");
  const create = useMutation({
    mutationFn: () =>
      api.fitness.createLog({
        date: new Date().toISOString(),
        weightKg: weight ? Number(weight) : undefined,
        routineCompliance: compliance ? Number(compliance) : undefined,
        measurements: waist ? { cintura: Number(waist) } : undefined,
      } as Partial<FitnessLog>),
    onSuccess: () => { setWeight(""); setCompliance(""); setWaist(""); onCreated(); toast.success("Registro guardado"); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Error"),
  });
  function onSubmit(e: FormEvent) { e.preventDefault(); create.mutate(); }
  return (
    <Card className="p-4">
      <form onSubmit={onSubmit} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="Peso (kg)" />
        <Input type="number" value={waist} onChange={(e) => setWaist(e.target.value)} placeholder="Cintura (cm)" />
        <Input type="number" min={0} max={100} value={compliance} onChange={(e) => setCompliance(e.target.value)} placeholder="Rutina %" />
        <Button type="submit" icon={<Plus size={16} />}>Registrar</Button>
      </form>
    </Card>
  );
}

function EditLogModal({ log, onClose, onSaved }: { log: FitnessLog; onClose: () => void; onSaved: () => void }) {
  const [weight, setWeight] = useState(log.weightKg != null ? String(log.weightKg) : "");
  const [compliance, setCompliance] = useState(log.routineCompliance != null ? String(log.routineCompliance) : "");
  const [date, setDate] = useState(forDateInput(log.date));
  const save = useMutation({
    mutationFn: () => api.fitness.updateLog(log.id, {
      date: dateInputToIso(date),
      weightKg: weight ? Number(weight) : undefined,
      routineCompliance: compliance ? Number(compliance) : undefined,
    } as Partial<FitnessLog>),
    onSuccess: () => { onSaved(); onClose(); toast.success("Registro actualizado"); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Error"),
  });
  return (
    <Modal open onClose={onClose} title="Editar registro" footer={<><Button variant="secondary" onClick={onClose}>Cancelar</Button><Button onClick={() => save.mutate()} disabled={save.isPending}>Guardar</Button></>}>
      <div className="space-y-4">
        <Field label="Fecha"><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Peso (kg)"><Input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} /></Field>
          <Field label="Rutina %"><Input type="number" min={0} max={100} value={compliance} onChange={(e) => setCompliance(e.target.value)} /></Field>
        </div>
      </div>
    </Modal>
  );
}

function DietCalculator({ onCalculated, plan }: { onCalculated: () => void; plan: { bmr: number; tdee: number; targetCalories: number } | null }) {
  const [ageYears, setAge] = useState("30");
  const [sex, setSex] = useState<Sex>("male");
  const [heightCm, setHeight] = useState("170");
  const [weightKg, setWeight] = useState("70");
  const [activityLevel, setActivity] = useState<ActivityLevel>("moderate");
  const [goal, setGoal] = useState<DietGoal>("maintain");

  const calc = useMutation({
    mutationFn: () => api.fitness.createDietPlan({ ageYears: +ageYears, sex, heightCm: +heightCm, weightKg: +weightKg, activityLevel, goal }),
    onSuccess: () => { onCalculated(); toast.success("Plan calculado"); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Error"),
  });

  return (
    <Card className="h-fit p-5">
      <h3 className="mb-1 text-sm font-medium text-ink">Calculadora de dieta</h3>
      <p className="mb-4 text-xs text-muted">Fórmula Mifflin-St Jeor</p>
      <form onSubmit={(e) => { e.preventDefault(); calc.mutate(); }} className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <Field label="Edad"><Input type="number" value={ageYears} onChange={(e) => setAge(e.target.value)} /></Field>
          <Field label="Sexo"><Select value={sex} onChange={(e) => setSex(e.target.value as Sex)}><option value="male">Masculino</option><option value="female">Femenino</option></Select></Field>
          <Field label="Altura (cm)"><Input type="number" value={heightCm} onChange={(e) => setHeight(e.target.value)} /></Field>
          <Field label="Peso (kg)"><Input type="number" value={weightKg} onChange={(e) => setWeight(e.target.value)} /></Field>
        </div>
        <Field label="Actividad"><Select value={activityLevel} onChange={(e) => setActivity(e.target.value as ActivityLevel)}>{ActivityLevel.map((a) => <option key={a} value={a}>{activityLabels[a]}</option>)}</Select></Field>
        <Field label="Objetivo"><Select value={goal} onChange={(e) => setGoal(e.target.value as DietGoal)}>{DietGoal.map((g) => <option key={g} value={g}>{goalLabels[g]}</option>)}</Select></Field>
        <Button type="submit" className="w-full" disabled={calc.isPending}>Calcular plan</Button>
      </form>
      {plan && (
        <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-primary-soft/40 p-3 text-center">
          <div><p className="text-xs text-muted">BMR</p><p className="tabular font-semibold text-ink">{plan.bmr}</p></div>
          <div><p className="text-xs text-muted">TDEE</p><p className="tabular font-semibold text-ink">{plan.tdee}</p></div>
          <div><p className="text-xs text-muted">Meta</p><p className="tabular font-semibold text-primary-dark">{plan.targetCalories}</p></div>
        </div>
      )}
    </Card>
  );
}
