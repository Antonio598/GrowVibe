import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragEndEvent,
} from "@dnd-kit/core";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, User } from "lucide-react";
import { api } from "../lib/apiClient";
import { TaskPriority, TaskStatus, type GroupMember, type Task } from "shared";
import { Button, IconButton, Input, Select, Modal, Field, Textarea, ConfirmDialog, PriorityBadge, Avatar } from "./ui";
import { cn } from "./ui/cn";
import { forDateInput, dateInputToIso } from "../lib/format";

const COLUMNS: { id: TaskStatus; label: string }[] = [
  { id: "pending", label: "Pendiente" },
  { id: "in_progress", label: "En progreso" },
  { id: "done", label: "Hecho" },
];
const priorityLabels: Record<TaskPriority, string> = { high: "Alta", medium: "Media", low: "Baja" };
const statusLabels: Record<TaskStatus, string> = { pending: "Pendiente", in_progress: "En progreso", done: "Hecho" };

export function Kanban({ projectId, members }: { projectId: string; members: GroupMember[] }) {
  const qc = useQueryClient();
  const { data: tasks } = useQuery({ queryKey: ["project-tasks", projectId], queryFn: () => api.tasks.list(`?projectId=${projectId}`) });
  const [title, setTitle] = useState("");
  const [editing, setEditing] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState<Task | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const invalidate = () => qc.invalidateQueries({ queryKey: ["project-tasks", projectId] });

  const create = useMutation({
    mutationFn: () => api.tasks.create({ title, projectId, priority: "medium" } as Partial<Task>),
    onSuccess: () => { setTitle(""); invalidate(); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Error"),
  });
  const move = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) => api.tasks.update(id, { status }),
    onSuccess: invalidate,
    onError: (e) => toast.error(e instanceof Error ? e.message : "Error"),
  });
  const remove = useMutation({
    mutationFn: (id: string) => api.tasks.remove(id),
    onSuccess: () => { setDeleting(null); invalidate(); toast.success("Tarea borrada"); },
  });

  function onDragEnd(e: DragEndEvent) {
    const status = e.over?.id as TaskStatus | undefined;
    const task = tasks?.find((t) => t.id === e.active.id);
    if (status && task && task.status !== status) move.mutate({ id: task.id, status });
  }

  function onAdd(e: FormEvent) { e.preventDefault(); if (title.trim()) create.mutate(); }

  return (
    <div>
      <form onSubmit={onAdd} className="mb-4 flex gap-2">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nueva tarea del proyecto…" />
        <Button type="submit" icon={<Plus size={16} />}>Añadir</Button>
      </form>

      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {COLUMNS.map((col) => (
            <Column key={col.id} id={col.id} label={col.label} count={(tasks ?? []).filter((t) => t.status === col.id).length}>
              {(tasks ?? []).filter((t) => t.status === col.id).map((t) => (
                <KanbanCard key={t.id} task={t} onEdit={() => setEditing(t)} onDelete={() => setDeleting(t)} />
              ))}
            </Column>
          ))}
        </div>
      </DndContext>

      {editing && <TaskModal task={editing} projectId={projectId} members={members} onClose={() => setEditing(null)} onSaved={invalidate} />}
      <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)} onConfirm={() => deleting && remove.mutate(deleting.id)} title="Borrar tarea" message={`¿Borrar "${deleting?.title}"?`} loading={remove.isPending} />
    </div>
  );
}

function Column({ id, label, count, children }: { id: string; label: string; count: number; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className={cn("rounded-2xl border border-line bg-canvas/60 p-2.5 transition-colors", isOver && "border-primary/50 bg-primary-soft/40")}>
      <div className="mb-2 flex items-center gap-2 px-1.5 text-sm font-medium text-muted">
        <span className={cn("h-2 w-2 rounded-full", id === "done" ? "bg-primary" : id === "in_progress" ? "bg-gold" : "bg-muted/50")} />
        {label} <span className="text-muted/60">· {count}</span>
      </div>
      <div className="min-h-[60px] space-y-2">{children}</div>
    </div>
  );
}

function KanbanCard({ task, onEdit, onDelete }: { task: Task; onEdit: () => void; onDelete: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id });
  return (
    <div
      ref={setNodeRef}
      style={transform ? { transform: `translate(${transform.x}px, ${transform.y}px)` } : undefined}
      className={cn("rounded-xl border border-line bg-surface p-3 shadow-sm", isDragging && "opacity-50")}
    >
      <div className="flex items-start gap-2">
        <div {...listeners} {...attributes} className="min-w-0 flex-1 cursor-grab active:cursor-grabbing">
          <p className="text-sm font-medium text-ink">{task.title}</p>
        </div>
        <div className="flex shrink-0">
          <IconButton label="Editar" onClick={onEdit}><Pencil size={14} /></IconButton>
          <IconButton label="Borrar" variant="danger" onClick={onDelete}><Trash2 size={14} /></IconButton>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <PriorityBadge priority={task.priority} />
        {task.assigneeName ? (
          <span className="flex items-center gap-1"><Avatar name={task.assigneeName} size={20} /></span>
        ) : (
          <span className="flex items-center gap-1 text-xs text-muted"><User size={12} /> Sin asignar</span>
        )}
      </div>
    </div>
  );
}

function TaskModal({ task, projectId, members, onClose, onSaved }: { task: Task; projectId: string; members: GroupMember[]; onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [assigneeId, setAssigneeId] = useState(task.assigneeId ?? "");
  const [dueDate, setDueDate] = useState(forDateInput(task.dueDate));

  const save = useMutation({
    mutationFn: () => api.tasks.update(task.id, {
      title, description: description || undefined, status, priority,
      assigneeId: assigneeId || null, projectId, dueDate: dateInputToIso(dueDate) ?? null,
    } as Partial<Task>),
    onSuccess: () => { onSaved(); onClose(); toast.success("Tarea actualizada"); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Error"),
  });

  return (
    <Modal open onClose={onClose} title="Editar tarea" footer={<><Button variant="secondary" onClick={onClose}>Cancelar</Button><Button onClick={() => save.mutate()} disabled={save.isPending || !title.trim()}>Guardar</Button></>}>
      <div className="space-y-4">
        <Field label="Título"><Input value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
        <Field label="Descripción"><Textarea value={description} onChange={(e) => setDescription(e.target.value)} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Estado"><Select value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)}>{TaskStatus.map((s) => <option key={s} value={s}>{statusLabels[s]}</option>)}</Select></Field>
          <Field label="Prioridad"><Select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}>{TaskPriority.map((p) => <option key={p} value={p}>{priorityLabels[p]}</option>)}</Select></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Asignar a">
            <Select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
              <option value="">Sin asignar</option>
              {members.map((m) => <option key={m.userId} value={m.userId}>{m.userName ?? m.userId}</option>)}
            </Select>
          </Field>
          <Field label="Fecha límite"><Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></Field>
        </div>
      </div>
    </Modal>
  );
}
