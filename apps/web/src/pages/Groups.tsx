import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Users, Pencil, Trash2, ArrowRight } from "lucide-react";
import { api } from "../lib/apiClient";
import type { Group } from "shared";
import { Button, IconButton, Card, Field, Input, Modal, ConfirmDialog, EmptyState, PageHeader } from "../components/ui";

export function Groups() {
  const qc = useQueryClient();
  const { data: groups } = useQuery({ queryKey: ["groups"], queryFn: () => api.groups.list() });
  const [name, setName] = useState("");
  const [renaming, setRenaming] = useState<Group | null>(null);
  const [deleting, setDeleting] = useState<Group | null>(null);
  const invalidate = () => qc.invalidateQueries({ queryKey: ["groups"] });

  const create = useMutation({
    mutationFn: () => api.groups.create(name),
    onSuccess: () => { setName(""); invalidate(); toast.success("Grupo creado"); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Error"),
  });
  const remove = useMutation({
    mutationFn: (id: string) => api.groups.remove(id),
    onSuccess: () => { setDeleting(null); invalidate(); toast.success("Grupo borrado"); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Error"),
  });

  function onSubmit(e: FormEvent) { e.preventDefault(); if (name.trim()) create.mutate(); }

  return (
    <div>
      <PageHeader title="Colaborativo" subtitle="Grupos, proyectos, entregas y tiempo de trabajo." />

      <form onSubmit={onSubmit} className="mb-5 flex gap-2">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre del grupo" />
        <Button type="submit" icon={<Plus size={16} />}>Crear grupo</Button>
      </form>

      {(groups ?? []).length === 0 ? (
        <EmptyState icon={<Users size={22} />} title="Sin grupos" hint="Crea un grupo para organizar proyectos con tu equipo." />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {(groups ?? []).map((g) => (
            <Card key={g.id} className="group flex items-center gap-3 p-4 transition-all hover:border-primary/40 hover:shadow-pop">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-lime text-white"><Users size={20} /></span>
              <Link to={`/groups/${g.id}`} className="min-w-0 flex-1">
                <p className="truncate font-medium text-ink">{g.name}</p>
                <p className="flex items-center gap-1 text-xs text-primary">Abrir proyectos <ArrowRight size={12} /></p>
              </Link>
              <div className="flex shrink-0">
                <IconButton label="Renombrar" onClick={() => setRenaming(g)}><Pencil size={16} /></IconButton>
                <IconButton label="Borrar" variant="danger" onClick={() => setDeleting(g)}><Trash2 size={16} /></IconButton>
              </div>
            </Card>
          ))}
        </div>
      )}

      {renaming && <RenameModal group={renaming} onClose={() => setRenaming(null)} onSaved={invalidate} />}
      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting.id)}
        title="Borrar grupo"
        message={`¿Borrar "${deleting?.name}"? Se eliminarán sus proyectos, entregas y sesiones. No se puede deshacer.`}
        loading={remove.isPending}
      />
    </div>
  );
}

function RenameModal({ group, onClose, onSaved }: { group: Group; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(group.name);
  const save = useMutation({
    mutationFn: () => api.groups.update(group.id, { name }),
    onSuccess: () => { onSaved(); onClose(); toast.success("Grupo renombrado"); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Error"),
  });
  return (
    <Modal open onClose={onClose} title="Renombrar grupo" size="sm" footer={<><Button variant="secondary" onClick={onClose}>Cancelar</Button><Button onClick={() => save.mutate()} disabled={save.isPending || !name.trim()}>Guardar</Button></>}>
      <Field label="Nombre"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
    </Modal>
  );
}
