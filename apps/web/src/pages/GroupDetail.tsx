import { FormEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft, Plus, Users, LayoutGrid, Package, Timer, MessageSquare, Pencil, Trash2, Copy, Check, UserPlus,
} from "lucide-react";
import { api, apiBaseUrl } from "../lib/apiClient";
import { GroupRole, ProjectStatus, ProjectType, type GroupMember, type Project } from "shared";
import {
  Button, IconButton, Card, Field, Input, Textarea, Select, Modal, ConfirmDialog, Badge, EmptyState, Tabs, Avatar, ProgressBar,
} from "../components/ui";
import { cn } from "../components/ui/cn";
import { Kanban } from "../components/Kanban";
import { Deliverables } from "../components/Deliverables";
import { WorkSessions } from "../components/WorkSessions";
import { Comments } from "../components/Comments";
import { forDateInput, dateInputToIso, shortDate } from "../lib/format";

const statusLabels: Record<ProjectStatus, string> = { active: "Activo", paused: "Pausado", done: "Completado" };
const roleLabels: Record<GroupRole, string> = { owner: "Dueño", admin: "Admin", member: "Miembro" };

export function GroupDetail() {
  const { id } = useParams<{ id: string }>();
  const groupId = id!;
  const [selected, setSelected] = useState<string | null>(null);
  const [showMembers, setShowMembers] = useState(false);
  const [newProject, setNewProject] = useState(false);

  const { data: group } = useQuery({ queryKey: ["groups", groupId], queryFn: () => api.groups.get(groupId) });
  const { data: members } = useQuery({ queryKey: ["groups", groupId, "members"], queryFn: () => api.groups.members(groupId) });
  const { data: projects } = useQuery({ queryKey: ["projects", groupId], queryFn: () => api.projects.list(groupId) });

  useEffect(() => {
    if (!selected && projects && projects.length > 0) setSelected(projects[0].id);
  }, [projects, selected]);

  const current = projects?.find((p) => p.id === selected) ?? null;

  return (
    <div>
      <Link to="/groups" className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"><ArrowLeft size={15} /> Grupos</Link>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink sm:text-3xl">{group?.name ?? "…"}</h1>
          <p className="mt-1 text-sm text-muted">{members?.length ?? 0} miembro(s) · {projects?.length ?? 0} proyecto(s)</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon={<Users size={16} />} onClick={() => setShowMembers(true)}>Miembros</Button>
          <Button icon={<Plus size={16} />} onClick={() => setNewProject(true)}>Nuevo proyecto</Button>
        </div>
      </div>

      {/* Selector de proyectos */}
      {(projects ?? []).length > 0 && (
        <div className="mb-5 flex flex-wrap gap-2">
          {projects!.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelected(p.id)}
              className={cn(
                "rounded-xl border px-4 py-2 text-sm font-medium transition-colors",
                selected === p.id ? "border-primary bg-primary text-white" : "border-line bg-surface text-muted hover:border-primary/40 hover:text-ink",
              )}
            >
              {p.name}
            </button>
          ))}
        </div>
      )}

      {current ? (
        <ProjectBoard project={current} groupId={groupId} members={members ?? []} onDeleted={() => setSelected(null)} />
      ) : (
        <EmptyState icon={<LayoutGrid size={22} />} title="Sin proyectos" hint="Crea el primer proyecto del grupo para empezar a organizar tareas, entregas y tiempo." action={<Button icon={<Plus size={16} />} onClick={() => setNewProject(true)}>Nuevo proyecto</Button>} />
      )}

      {showMembers && <MembersModal groupId={groupId} members={members ?? []} onClose={() => setShowMembers(false)} />}
      {newProject && <ProjectModal groupId={groupId} onClose={() => setNewProject(false)} onSaved={(pid) => { setSelected(pid); }} />}
    </div>
  );
}

function ProjectBoard({ project, groupId, members, onDeleted }: { project: Project; groupId: string; members: GroupMember[]; onDeleted: () => void }) {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"kanban" | "deliverables" | "time" | "comments">("kanban");
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const remove = useMutation({
    mutationFn: () => api.projects.remove(project.id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["projects", groupId] }); onDeleted(); toast.success("Proyecto borrado"); },
  });

  return (
    <Card className="p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-ink">{project.name}</h2>
            <Badge tone={project.status === "done" ? "primary" : project.status === "paused" ? "gold" : "lime"}>{statusLabels[project.status]}</Badge>
            {project.type === "dated" && <Badge tone="neutral">Con fechas</Badge>}
          </div>
          {project.description && <p className="mt-1 text-sm text-muted">{project.description}</p>}
          <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted">
            {project.startDate && <span>Inicio: {shortDate(project.startDate)}</span>}
            {project.dueDate && <span>Entrega: {shortDate(project.dueDate)}</span>}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <IconButton label="Editar proyecto" onClick={() => setEditing(true)}><Pencil size={16} /></IconButton>
          <IconButton label="Borrar proyecto" variant="danger" onClick={() => setDeleting(true)}><Trash2 size={16} /></IconButton>
        </div>
      </div>

      <div className="mb-4">
        <div className="mb-1.5 flex items-center justify-between text-sm"><span className="text-muted">Progreso</span><span className="tabular font-medium text-ink">{project.progress}%</span></div>
        <ProgressBar value={project.progress} />
      </div>

      <div className="mb-4">
        <Tabs
          active={tab}
          onChange={setTab}
          tabs={[
            { id: "kanban", label: "Tablero", icon: <LayoutGrid size={15} /> },
            { id: "deliverables", label: "Entregas", icon: <Package size={15} /> },
            { id: "time", label: "Tiempo", icon: <Timer size={15} /> },
            { id: "comments", label: "Actividad", icon: <MessageSquare size={15} /> },
          ]}
        />
      </div>

      {tab === "kanban" && <Kanban projectId={project.id} members={members} />}
      {tab === "deliverables" && <Deliverables projectId={project.id} />}
      {tab === "time" && <WorkSessions projectId={project.id} />}
      {tab === "comments" && <Comments projectId={project.id} />}

      {editing && <ProjectModal groupId={groupId} project={project} onClose={() => setEditing(false)} onSaved={() => {}} />}
      <ConfirmDialog open={deleting} onClose={() => setDeleting(false)} onConfirm={() => remove.mutate()} title="Borrar proyecto" message={`¿Borrar "${project.name}"? Se eliminarán sus tareas, entregas, sesiones y comentarios.`} loading={remove.isPending} />
    </Card>
  );
}

function ProjectModal({ groupId, project, onClose, onSaved }: { groupId: string; project?: Project; onClose: () => void; onSaved: (projectId: string) => void }) {
  const qc = useQueryClient();
  const editing = !!project;
  const [name, setName] = useState(project?.name ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [type, setType] = useState<ProjectType>(project?.type ?? "ongoing");
  const [status, setStatus] = useState<ProjectStatus>(project?.status ?? "active");
  const [progress, setProgress] = useState(project?.progress ?? 0);
  const [startDate, setStartDate] = useState(forDateInput(project?.startDate));
  const [dueDate, setDueDate] = useState(forDateInput(project?.dueDate));

  const save = useMutation({
    mutationFn: () => {
      const payload = {
        name, description: description || undefined, type, status, progress,
        startDate: dateInputToIso(startDate) ?? null, dueDate: dateInputToIso(dueDate) ?? null,
      };
      return editing ? api.projects.update(project!.id, payload as Partial<Project>) : api.projects.create({ groupId, ...payload } as Partial<Project> & { groupId: string });
    },
    onSuccess: (p) => { qc.invalidateQueries({ queryKey: ["projects", groupId] }); onSaved(p.id); onClose(); toast.success(editing ? "Proyecto actualizado" : "Proyecto creado"); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Error"),
  });

  function onSubmit(e: FormEvent) { e.preventDefault(); if (name.trim()) save.mutate(); }

  return (
    <Modal open onClose={onClose} title={editing ? "Editar proyecto" : "Nuevo proyecto"} footer={<><Button variant="secondary" onClick={onClose}>Cancelar</Button><Button onClick={onSubmit} disabled={save.isPending || !name.trim()}>Guardar</Button></>}>
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Nombre"><Input value={name} onChange={(e) => setName(e.target.value)} autoFocus /></Field>
        <Field label="Descripción"><Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="¿De qué trata el proyecto?" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Tipo"><Select value={type} onChange={(e) => setType(e.target.value as ProjectType)}><option value="ongoing">Continuo</option><option value="dated">Con fechas (diario)</option></Select></Field>
          {editing && <Field label="Estado"><Select value={status} onChange={(e) => setStatus(e.target.value as ProjectStatus)}>{ProjectStatus.map((s) => <option key={s} value={s}>{statusLabels[s]}</option>)}</Select></Field>}
        </div>
        {type === "dated" && (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Fecha inicio"><Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></Field>
            <Field label="Fecha entrega"><Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></Field>
          </div>
        )}
        {editing && (
          <Field label={`Progreso: ${progress}%`}>
            <input type="range" min={0} max={100} value={progress} onChange={(e) => setProgress(Number(e.target.value))} className="w-full accent-[#15A06B]" />
          </Field>
        )}
      </form>
    </Modal>
  );
}

function MembersModal({ groupId, members, onClose }: { groupId: string; members: GroupMember[]; onClose: () => void }) {
  const qc = useQueryClient();
  const [email, setEmail] = useState("");
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const invalidate = () => qc.invalidateQueries({ queryKey: ["groups", groupId, "members"] });

  const invite = useMutation({
    mutationFn: () => api.auth.createInvite(email, groupId),
    onSuccess: (r) => { setInviteLink(`${apiBaseUrl || window.location.origin}/accept-invite?token=${r.token}`); setEmail(""); toast.success("Invitación creada"); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Error"),
  });
  const changeRole = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) => api.groups.updateMember(groupId, userId, role),
    onSuccess: () => { invalidate(); toast.success("Rol actualizado"); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Error"),
  });
  const removeMember = useMutation({
    mutationFn: (userId: string) => api.groups.removeMember(groupId, userId),
    onSuccess: () => { invalidate(); toast.success("Miembro removido"); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Error"),
  });

  function copy() { if (inviteLink) { navigator.clipboard.writeText(inviteLink); setCopied(true); setTimeout(() => setCopied(false), 1500); } }

  return (
    <Modal open onClose={onClose} title="Miembros del grupo">
      <div className="space-y-5">
        <div>
          <p className="mb-2 text-sm font-medium text-ink">Invitar por email</p>
          <form onSubmit={(e) => { e.preventDefault(); if (email.trim()) invite.mutate(); }} className="flex gap-2">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="persona@email.com" />
            <Button type="submit" icon={<UserPlus size={16} />} disabled={invite.isPending}>Invitar</Button>
          </form>
          {inviteLink && (
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-primary/30 bg-primary-soft/40 p-2.5">
              <code className="min-w-0 flex-1 truncate text-xs text-primary-dark">{inviteLink}</code>
              <IconButton label="Copiar" variant="primary" onClick={copy}>{copied ? <Check size={15} /> : <Copy size={15} />}</IconButton>
            </div>
          )}
          <p className="mt-1.5 text-xs text-muted">Comparte este enlace con la persona para que cree su cuenta y se una al grupo.</p>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-ink">Miembros ({members.length})</p>
          <div className="space-y-2">
            {members.map((m) => (
              <div key={m.userId} className="flex items-center gap-3 rounded-xl border border-line px-3 py-2">
                <Avatar name={m.userName ?? "?"} size={34} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{m.userName}</p>
                  <p className="truncate text-xs text-muted">{m.userEmail}</p>
                </div>
                {m.role === "owner" ? (
                  <Badge tone="primary">{roleLabels.owner}</Badge>
                ) : (
                  <>
                    <Select value={m.role} onChange={(e) => changeRole.mutate({ userId: m.userId, role: e.target.value })} className="w-auto text-xs">
                      {GroupRole.filter((r) => r !== "owner").map((r) => <option key={r} value={r}>{roleLabels[r]}</option>)}
                    </Select>
                    <IconButton label="Quitar" variant="danger" onClick={() => removeMember.mutate(m.userId)}><Trash2 size={15} /></IconButton>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
