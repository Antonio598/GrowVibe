import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Bell,
  CheckCheck,
  Trash2,
  CalendarClock,
  AlertTriangle,
  TrendingDown,
  Target,
  Activity,
  UserPlus,
  MessageSquare,
  Package,
} from "lucide-react";
import { api } from "../lib/apiClient";
import type { Notification, NotificationType } from "shared";
import { Button, IconButton, Card, EmptyState, PageHeader } from "../components/ui";
import { cn } from "../components/ui/cn";
import { dateTime } from "../lib/format";

const meta: Record<NotificationType, { icon: typeof Bell; color: string }> = {
  task_due: { icon: CalendarClock, color: "text-gold bg-gold/15" },
  task_overdue: { icon: AlertTriangle, color: "text-coral bg-coral-soft" },
  expense_high: { icon: TrendingDown, color: "text-coral bg-coral-soft" },
  goal_reached: { icon: Target, color: "text-primary-dark bg-primary-soft" },
  project_update: { icon: Activity, color: "text-primary-dark bg-primary-soft" },
  routine_reminder: { icon: Activity, color: "text-gold bg-gold/15" },
  task_assigned: { icon: UserPlus, color: "text-primary-dark bg-primary-soft" },
  comment_added: { icon: MessageSquare, color: "text-primary-dark bg-primary-soft" },
  deliverable_due: { icon: Package, color: "text-gold bg-gold/15" },
};

export function Notifications() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<"" | "false">("");
  const query = filter ? "?read=false" : "";
  const { data } = useQuery({ queryKey: ["notifications", "list", query], queryFn: () => api.notifications.list(query) });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["notifications"] });

  const markRead = useMutation({ mutationFn: (id: string) => api.notifications.markRead(id), onSuccess: invalidate });
  const markAll = useMutation({ mutationFn: () => api.notifications.markAllRead(), onSuccess: () => { invalidate(); toast.success("Todo marcado como leído"); } });
  const remove = useMutation({ mutationFn: (id: string) => api.notifications.remove(id), onSuccess: invalidate });

  const items = data?.data ?? [];

  return (
    <div>
      <PageHeader
        title="Alertas"
        subtitle="Todo lo que necesita tu atención, en un lugar."
        action={<Button variant="secondary" icon={<CheckCheck size={16} />} onClick={() => markAll.mutate()}>Marcar todo leído</Button>}
      />

      <div className="mb-4 flex gap-1 rounded-xl border border-line bg-surface p-1 w-fit">
        {[{ id: "", label: "Todas" }, { id: "false", label: "No leídas" }].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id as "" | "false")}
            className={cn("rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors", filter === f.id ? "bg-primary text-white" : "text-muted hover:text-ink")}
          >
            {f.label}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <EmptyState icon={<Bell size={22} />} title="Sin alertas" hint="Cuando pase algo importante, aparecerá aquí." />
      ) : (
        <div className="space-y-2">
          {items.map((n: Notification) => {
            const m = meta[n.type] ?? { icon: Bell, color: "text-muted bg-line/60" };
            const Icon = m.icon;
            return (
              <Card key={n.id} className={cn("flex items-start gap-3 px-4 py-3", !n.read && "border-primary/30 bg-primary-soft/20")}>
                <span className={cn("mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", m.color)}><Icon size={16} /></span>
                <div className="min-w-0 flex-1">
                  <p className={cn("text-sm", n.read ? "text-muted" : "font-medium text-ink")}>{n.message}</p>
                  <p className="mt-0.5 text-xs text-muted">{dateTime(n.createdAt)}</p>
                </div>
                {!n.read && (
                  <button onClick={() => markRead.mutate(n.id)} className="shrink-0 text-xs font-medium text-primary hover:underline">Leída</button>
                )}
                <IconButton label="Borrar" variant="danger" onClick={() => remove.mutate(n.id)}><Trash2 size={15} /></IconButton>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
