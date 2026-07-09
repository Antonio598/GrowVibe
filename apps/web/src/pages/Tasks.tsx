import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Circle, CircleDot, CheckCircle2, CalendarClock, User } from "lucide-react";
import { api } from "../lib/apiClient";
import { TaskPriority, TaskStatus, type Task } from "shared";
import {
  Button,
  IconButton,
  Card,
  Field,
  Input,
  Textarea,
  Select,
  Modal,
  ConfirmDialog,
  PriorityBadge,
  EmptyState,
  PageHeader,
} from "../components/ui";
import { cn } from "../components/ui/cn";
import { dateInputToIso, forDateInput, relativeDay } from "../lib/format";

const statusLabels: Record<TaskStatus, string> = { pending: "Pendiente", in_progress: "En progreso", done: "Hecho" };
const priorityLabels: Record<TaskPriority, string> = { high: "Alta", medium: "Media", low: "Baja" };
const statusIcon = { pending: Circle, in_progress: CircleDot, done: CheckCircle2 };
const statusOrder: TaskStatus[] = ["in_progress", "pending", "done"];

export function Tasks() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  const [scope, setScope] = useState<"" | "me">("");
  const [title, setTitle] = useState("");
  const [editing, setEditing] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState<Task | null>(null);

  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (statusFilter) p.set("status", statusFilter);
    if (priorityFilter) p.set("priority", priorityFilter);
    if (scope) p.set("assignee", scope);
    const s = p.toString();
    return s ? `?${s}` : "";
  }, [statusFilter, priorityFilter, scope]);

  const { data: tasks, isLoading } = useQuery({ queryKey: ["tasks", query], queryFn: () => api.tasks.list(query) });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["tasks"] });

  const createTask = useMutation({
    mutationFn: () => api.tasks.create({ title, priority: "medium" }),
    onSuccess: () => {
      setTitle("");
      invalidate();
      toast.success("Tarea creada");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Error"),
  });

  const cycleStatus = useMutation({
    mutationFn: (task: Task) => {
      const next: TaskStatus = task.status === "pending" ? "in_progress" : task.status === "in_progress" ? "done" : "pending";
      return api.tasks.update(task.id, { status: next });
    },
    onSuccess: invalidate,
  });

  const removeTask = useMutation({
    mutationFn: (id: string) => api.tasks.remove(id),
    onSuccess: () => {
      setDeleting(null);
      invalidate();
      toast.success("Tarea borrada");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Error"),
  });

  function onQuickAdd(e: FormEvent) {
    e.preventDefault();
    if (title.trim()) createTask.mutate();
  }

  const grouped = statusOrder
    .map((s) => ({ status: s, items: (tasks ?? []).filter((t) => t.status === s) }))
    .filter((g) => g.items.length > 0);

  return (
    <div>
      <PageHeader title="Tareas" subtitle="Captura rápida, prioriza y avanza." />

      <form onSubmit={onQuickAdd} className="mb-5 flex gap-2">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="¿Qué necesitas hacer?" />
        <Button type="submit" icon={<Plus size={16} />}>Agregar</Button>
      </form>

      <div className="mb-5 flex flex-wrap gap-2">
        <Select value={scope} onChange={(e) => setScope(e.target.value as "" | "me")} className="w-auto">
          <option value="">Todas mis tareas</option>
          <option value="me">Asignadas a mí</option>
        </Select>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-auto">
          <option value="">Cualquier estado</option>
          {TaskStatus.map((s) => <option key={s} value={s}>{statusLabels[s]}</option>)}
        </Select>
        <Select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="w-auto">
          <option value="">Cualquier prioridad</option>
          {TaskPriority.map((p) => <option key={p} value={p}>{priorityLabels[p]}</option>)}
        </Select>
      </div>

      {isLoading ? (
        <p className="text-muted">Cargando…</p>
      ) : grouped.length === 0 ? (
        <EmptyState icon={<CheckCircle2 size={22} />} title="Sin tareas" hint="Agrega tu primera tarea arriba para empezar a ordenar tu día." />
      ) : (
        <div className="space-y-6">
          {grouped.map(({ status, items }) => {
            const Icon = statusIcon[status];
            return (
              <div key={status}>
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-muted">
                  <Icon size={15} /> {statusLabels[status]} <span className="text-muted/60">· {items.length}</span>
                </div>
                <div className="space-y-2">
                  {items.map((task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      onToggle={() => cycleStatus.mutate(task)}
                      onEdit={() => setEditing(task)}
                      onDelete={() => setDeleting(task)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editing && <TaskEditModal task={editing} onClose={() => setEditing(null)} onSaved={invalidate} />}
      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && removeTask.mutate(deleting.id)}
        title="Borrar tarea"
        message={`¿Borrar "${deleting?.title}"? Esta acción no se puede deshacer.`}
        loading={removeTask.isPending}
      />
    </div>
  );
}

function TaskRow({ task, onToggle, onEdit, onDelete }: { task: Task; onToggle: () => void; onEdit: () => void; onDelete: () => void }) {
  const Icon = statusIcon[task.status];
  return (
    <Card className="flex items-center gap-3 px-4 py-3">
      <button onClick={onToggle} aria-label="Cambiar estado" className={cn("shrink-0 transition-colors", task.status === "done" ? "text-primary" : "text-muted hover:text-primary")}>
        <Icon size={20} />
      </button>
      <div className="min-w-0 flex-1">
        <p className={cn("truncate font-medium", task.status === "done" ? "text-muted line-through" : "text-ink")}>{task.title}</p>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
          {task.dueDate && (
            <span className="inline-flex items-center gap-1"><CalendarClock size={12} /> {relativeDay(task.dueDate)}</span>
          )}
          {task.assigneeName && (
            <span className="inline-flex items-center gap-1"><User size={12} /> {task.assigneeName}</span>
          )}
        </div>
      </div>
      <PriorityBadge priority={task.priority} />
      <div className="flex shrink-0">
        <IconButton label="Editar" onClick={onEdit}><Pencil size={16} /></IconButton>
        <IconButton label="Borrar" variant="danger" onClick={onDelete}><Trash2 size={16} /></IconButton>
      </div>
    </Card>
  );
}

function TaskEditModal({ task, onClose, onSaved }: { task: Task; onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [dueDate, setDueDate] = useState(forDateInput(task.dueDate));

  const save = useMutation({
    mutationFn: () =>
      api.tasks.update(task.id, {
        title,
        description: description || undefined,
        status,
        priority,
        dueDate: dateInputToIso(dueDate) ?? null,
      } as Partial<Task>),
    onSuccess: () => {
      onSaved();
      onClose();
      toast.success("Tarea actualizada");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Error"),
  });

  return (
    <Modal
      open
      onClose={onClose}
      title="Editar tarea"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending || !title.trim()}>Guardar</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Título"><Input value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
        <Field label="Descripción"><Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detalles opcionales" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Estado">
            <Select value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)}>
              {TaskStatus.map((s) => <option key={s} value={s}>{statusLabels[s]}</option>)}
            </Select>
          </Field>
          <Field label="Prioridad">
            <Select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}>
              {TaskPriority.map((p) => <option key={p} value={p}>{priorityLabels[p]}</option>)}
            </Select>
          </Field>
        </div>
        <Field label="Fecha límite"><Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></Field>
      </div>
    </Modal>
  );
}
