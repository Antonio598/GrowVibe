import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Send, Trash2, MessageSquare } from "lucide-react";
import { api } from "../lib/apiClient";
import { useAuth } from "../store/auth";
import { Button, IconButton, Textarea, EmptyState, Avatar } from "./ui";
import { dateTime } from "../lib/format";

export function Comments({ projectId }: { projectId: string }) {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { data } = useQuery({ queryKey: ["comments", projectId], queryFn: () => api.comments.list(projectId) });
  const [body, setBody] = useState("");
  const invalidate = () => qc.invalidateQueries({ queryKey: ["comments", projectId] });

  const create = useMutation({
    mutationFn: () => api.comments.create(projectId, body),
    onSuccess: () => { setBody(""); invalidate(); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Error"),
  });
  const remove = useMutation({ mutationFn: (id: string) => api.comments.remove(projectId, id), onSuccess: invalidate });

  function onSubmit(e: FormEvent) { e.preventDefault(); if (body.trim()) create.mutate(); }

  return (
    <div>
      <form onSubmit={onSubmit} className="mb-4 flex items-end gap-2">
        <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Escribe un comentario o actualización…" className="min-h-[44px]" />
        <Button type="submit" icon={<Send size={16} />} disabled={!body.trim()}>Enviar</Button>
      </form>

      {(data ?? []).length === 0 ? (
        <EmptyState icon={<MessageSquare size={22} />} title="Sin actividad" hint="Comparte avances y comentarios con tu equipo." />
      ) : (
        <div className="space-y-3">
          {(data ?? []).map((c) => (
            <div key={c.id} className="flex gap-3">
              <Avatar name={c.userName ?? "?"} size={36} />
              <div className="min-w-0 flex-1 rounded-2xl rounded-tl-sm border border-line bg-surface px-4 py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-ink">{c.userName}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted">{dateTime(c.createdAt)}</span>
                    {c.userId === user?.id && <IconButton label="Borrar" variant="danger" onClick={() => remove.mutate(c.id)}><Trash2 size={13} /></IconButton>}
                  </div>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-sm text-ink/90">{c.body}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
