import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Package, CheckCircle2, Circle, Trash2, CalendarClock } from "lucide-react";
import { api } from "../lib/apiClient";
import type { Deliverable } from "shared";
import { Button, IconButton, Card, Input, Badge, EmptyState } from "./ui";
import { cn } from "./ui/cn";
import { shortDate, dateInputToIso, relativeDay } from "../lib/format";

export function Deliverables({ projectId }: { projectId: string }) {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["deliverables", projectId], queryFn: () => api.deliverables.list(projectId) });
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("");
  const invalidate = () => qc.invalidateQueries({ queryKey: ["deliverables", projectId] });

  const create = useMutation({
    mutationFn: () => api.deliverables.create(projectId, { title, dueDate: dateInputToIso(due) } as Partial<Deliverable>),
    onSuccess: () => { setTitle(""); setDue(""); invalidate(); toast.success("Entrega creada"); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Error"),
  });
  const toggle = useMutation({
    mutationFn: (d: Deliverable) => api.deliverables.update(projectId, d.id, { status: d.status === "delivered" ? "pending" : "delivered" }),
    onSuccess: invalidate,
  });
  const remove = useMutation({ mutationFn: (id: string) => api.deliverables.remove(projectId, id), onSuccess: () => { invalidate(); toast.success("Entrega borrada"); } });

  function onAdd(e: FormEvent) { e.preventDefault(); if (title.trim()) create.mutate(); }

  return (
    <div>
      <form onSubmit={onAdd} className="mb-4 flex flex-wrap gap-2">
        <Input className="min-w-[180px] flex-1" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nueva entrega…" />
        <Input type="date" className="w-auto" value={due} onChange={(e) => setDue(e.target.value)} />
        <Button type="submit" icon={<Plus size={16} />}>Añadir</Button>
      </form>

      {(data ?? []).length === 0 ? (
        <EmptyState icon={<Package size={22} />} title="Sin entregas" hint="Registra los entregables del proyecto y su fecha objetivo." />
      ) : (
        <div className="space-y-2">
          {(data ?? []).map((d) => (
            <Card key={d.id} className="flex items-center gap-3 px-4 py-3">
              <button onClick={() => toggle.mutate(d)} className={cn("shrink-0", d.status === "delivered" ? "text-primary" : "text-muted hover:text-primary")}>
                {d.status === "delivered" ? <CheckCircle2 size={20} /> : <Circle size={20} />}
              </button>
              <div className="min-w-0 flex-1">
                <p className={cn("font-medium", d.status === "delivered" ? "text-muted line-through" : "text-ink")}>{d.title}</p>
                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted">
                  {d.dueDate && <span className="inline-flex items-center gap-1"><CalendarClock size={12} /> {relativeDay(d.dueDate)}</span>}
                  {d.status === "delivered" && d.deliveredAt && <Badge tone="primary">Entregado {shortDate(d.deliveredAt)}</Badge>}
                </div>
              </div>
              <IconButton label="Borrar" variant="danger" onClick={() => remove.mutate(d.id)}><Trash2 size={16} /></IconButton>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
