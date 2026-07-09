import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Play, Square, Trash2, Clock, Timer } from "lucide-react";
import { api } from "../lib/apiClient";
import type { WorkSession } from "shared";
import { Button, IconButton, Card, EmptyState, Avatar } from "./ui";
import { dateTime, durationBetween } from "../lib/format";

export function WorkSessions({ projectId }: { projectId: string }) {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["sessions", projectId],
    queryFn: () => api.sessions.list(projectId),
    refetchInterval: 30_000,
  });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["sessions", projectId] });

  const start = useMutation({ mutationFn: () => api.sessions.start(projectId), onSuccess: () => { invalidate(); toast.success("Sesión iniciada"); } });
  const stop = useMutation({ mutationFn: (id: string) => api.sessions.stop(projectId, id), onSuccess: () => { invalidate(); toast.success("Sesión finalizada"); } });
  const remove = useMutation({ mutationFn: (id: string) => api.sessions.remove(projectId, id), onSuccess: invalidate });

  const running = (data ?? []).find((s) => !s.endedAt);
  const totalMs = (data ?? []).reduce((acc, s) => acc + ((s.endedAt ? +new Date(s.endedAt) : Date.now()) - +new Date(s.startedAt)), 0);
  const totalH = Math.floor(totalMs / 3600000);
  const totalM = Math.round((totalMs % 3600000) / 60000);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        {running ? (
          <Button variant="danger" icon={<Square size={16} />} onClick={() => stop.mutate(running.id)}>Detener ({durationBetween(running.startedAt, null)})</Button>
        ) : (
          <Button variant="lime" icon={<Play size={16} />} onClick={() => start.mutate()}>Iniciar sesión de trabajo</Button>
        )}
        <span className="inline-flex items-center gap-1.5 text-sm text-muted"><Clock size={15} /> Total: <span className="tabular font-semibold text-ink">{totalH}h {totalM}m</span></span>
      </div>

      {(data ?? []).length === 0 ? (
        <EmptyState icon={<Timer size={22} />} title="Sin sesiones" hint="Inicia el cronómetro cuando empieces a trabajar (ideal para proyectos diarios)." />
      ) : (
        <div className="space-y-2">
          {(data ?? []).map((s: WorkSession) => (
            <Card key={s.id} className="flex items-center gap-3 px-4 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary-dark"><Timer size={16} /></div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-ink">
                  {durationBetween(s.startedAt, s.endedAt)}
                  {!s.endedAt && <span className="ml-2 inline-flex items-center gap-1 text-xs font-medium text-primary"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" /> en curso</span>}
                </p>
                <p className="mt-0.5 text-xs text-muted">{dateTime(s.startedAt)} {s.endedAt ? `→ ${dateTime(s.endedAt)}` : ""}</p>
              </div>
              {s.userName && <Avatar name={s.userName} size={24} />}
              <IconButton label="Borrar" variant="danger" onClick={() => remove.mutate(s.id)}><Trash2 size={15} /></IconButton>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
