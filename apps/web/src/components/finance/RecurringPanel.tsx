import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Trash2, Repeat, TrendingUp, TrendingDown } from "lucide-react";
import { api } from "../../lib/apiClient";
import { RecurrenceInterval, type Category, type RecurringTransaction } from "shared";
import { Button, IconButton, Card, Input, Select, Badge, EmptyState } from "../ui";
import { money, shortDate } from "../../lib/format";

const intervalLabels: Record<string, string> = { daily: "Diario", weekly: "Semanal", monthly: "Mensual" };

export function RecurringPanel() {
  const qc = useQueryClient();
  const { data: items } = useQuery({ queryKey: ["finance", "recurring"], queryFn: () => api.finance.recurring() });
  const { data: categories } = useQuery({ queryKey: ["finance", "categories"], queryFn: () => api.finance.categories() });
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [interval, setInterval] = useState<"daily" | "weekly" | "monthly">("monthly");
  const [categoryId, setCategoryId] = useState("");
  const invalidate = () => qc.invalidateQueries({ queryKey: ["finance", "recurring"] });

  const create = useMutation({
    mutationFn: () => api.finance.createRecurring({ type, amount: Number(amount), note: note || undefined, interval, categoryId: categoryId || null } as Partial<RecurringTransaction>),
    onSuccess: () => { setAmount(""); setNote(""); invalidate(); toast.success("Recurrente creada"); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Error"),
  });
  const toggle = useMutation({ mutationFn: (r: RecurringTransaction) => api.finance.updateRecurring(r.id, { active: !r.active }), onSuccess: invalidate });
  const remove = useMutation({ mutationFn: (id: string) => api.finance.deleteRecurring(id), onSuccess: () => { invalidate(); toast.success("Recurrente borrada"); } });

  function onSubmit(e: FormEvent) { e.preventDefault(); if (Number(amount) > 0) create.mutate(); }
  const cats = (categories ?? []).filter((c: Category) => c.type === type);

  return (
    <div>
      <Card className="mb-4 p-4">
        <form onSubmit={onSubmit} className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Select value={type} onChange={(e) => setType(e.target.value as "income" | "expense")}>
            <option value="expense">Gasto</option>
            <option value="income">Ingreso</option>
          </Select>
          <Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Monto" />
          <Select value={interval} onChange={(e) => setInterval(e.target.value as "daily" | "weekly" | "monthly")}>
            {RecurrenceInterval.map((i) => <option key={i} value={i}>{intervalLabels[i]}</option>)}
          </Select>
          <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">Sin categoría</option>
            {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <Input className="col-span-1" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Nota (ej. Netflix)" />
          <Button type="submit" icon={<Plus size={16} />}>Crear</Button>
        </form>
      </Card>

      {(items ?? []).length === 0 ? (
        <EmptyState icon={<Repeat size={22} />} title="Sin recurrentes" hint="Automatiza suscripciones, renta o sueldo. Se registran solas cada periodo." />
      ) : (
        <div className="space-y-2">
          {(items ?? []).map((r) => (
            <Card key={r.id} className="flex items-center gap-3 px-4 py-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${r.type === "income" ? "bg-primary-soft text-primary-dark" : "bg-coral-soft text-coral"}`}>
                {r.type === "income" ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-ink">{r.note || (r.type === "income" ? "Ingreso" : "Gasto")}</p>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-muted">
                  <Badge tone="neutral">{intervalLabels[r.interval]}</Badge>
                  <span>Próximo: {shortDate(r.nextRun)}</span>
                </div>
              </div>
              <span className={`tabular font-semibold ${r.type === "income" ? "text-primary-dark" : "text-coral"}`}>{money(r.amount)}</span>
              <button onClick={() => toggle.mutate(r)} className={`rounded-lg px-2.5 py-1 text-xs font-medium ${r.active ? "bg-primary-soft text-primary-dark" : "bg-line/60 text-muted"}`}>
                {r.active ? "Activa" : "Pausada"}
              </button>
              <IconButton label="Borrar" variant="danger" onClick={() => remove.mutate(r.id)}><Trash2 size={15} /></IconButton>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
