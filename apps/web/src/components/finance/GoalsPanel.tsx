import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Trash2, Target, Minus } from "lucide-react";
import { api } from "../../lib/apiClient";
import type { SavingsGoal } from "shared";
import { Button, IconButton, Card, Input, ProgressRing, Badge, EmptyState } from "../ui";
import { money, shortDate, dateInputToIso } from "../../lib/format";

export function GoalsPanel() {
  const qc = useQueryClient();
  const { data: goals } = useQuery({ queryKey: ["finance", "goals"], queryFn: () => api.finance.goals() });
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [due, setDue] = useState("");
  const invalidate = () => qc.invalidateQueries({ queryKey: ["finance", "goals"] });

  const create = useMutation({
    mutationFn: () => api.finance.createGoal({ name, targetAmount: Number(target), dueDate: dateInputToIso(due) } as Partial<SavingsGoal>),
    onSuccess: () => { setName(""); setTarget(""); setDue(""); invalidate(); toast.success("Meta creada"); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Error"),
  });
  const contribute = useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) => api.finance.contributeGoal(id, amount),
    onSuccess: (g) => { invalidate(); if (g.reachedAt) toast.success(`¡Meta "${g.name}" alcanzada! 🎉`); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Error"),
  });
  const remove = useMutation({ mutationFn: (id: string) => api.finance.deleteGoal(id), onSuccess: () => { invalidate(); toast.success("Meta borrada"); } });

  function onSubmit(e: FormEvent) { e.preventDefault(); if (name.trim() && Number(target) > 0) create.mutate(); }

  return (
    <div>
      <Card className="mb-4 p-4">
        <form onSubmit={onSubmit} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Input className="col-span-2 sm:col-span-1" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre (ej. Viaje)" />
          <Input type="number" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="Objetivo $" />
          <Input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
          <Button type="submit" icon={<Plus size={16} />}>Crear</Button>
        </form>
      </Card>

      {(goals ?? []).length === 0 ? (
        <EmptyState icon={<Target size={22} />} title="Sin metas de ahorro" hint="Define un objetivo y ve crecer tu progreso." />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {(goals ?? []).map((g) => {
            const pct = g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0;
            return (
              <Card key={g.id} className="flex items-center gap-4 p-4">
                <ProgressRing value={pct} size={68} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium text-ink">{g.name}</p>
                    {g.reachedAt && <Badge tone="lime">Lograda</Badge>}
                  </div>
                  <p className="tabular text-sm text-muted">{money(g.currentAmount)} de {money(g.targetAmount)}</p>
                  {g.dueDate && <p className="text-xs text-muted">Meta: {shortDate(g.dueDate)}</p>}
                  <div className="mt-2 flex items-center gap-1.5">
                    <Button size="sm" variant="lime" icon={<Plus size={14} />} onClick={() => contribute.mutate({ id: g.id, amount: 50 })}>50</Button>
                    <IconButton label="Retirar 50" onClick={() => contribute.mutate({ id: g.id, amount: -50 })}><Minus size={15} /></IconButton>
                    <IconButton label="Borrar" variant="danger" onClick={() => remove.mutate(g.id)}><Trash2 size={15} /></IconButton>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
