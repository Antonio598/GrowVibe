import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { CheckSquare, Wallet, Users, Bell, HeartPulse, ArrowRight, CalendarClock, Sprout } from "lucide-react";
import { api } from "../lib/apiClient";
import { useAuth } from "../store/auth";
import { Card, StatTile, ProgressBar, Badge, EmptyState } from "../components/ui";
import { PriorityBadge } from "../components/ui";
import { money, relativeDay } from "../lib/format";

export function Dashboard() {
  const { user } = useAuth();
  const tasks = useQuery({ queryKey: ["tasks", "?status=pending"], queryFn: () => api.tasks.list("?status=pending") });
  const summary = useQuery({ queryKey: ["finance", "summary"], queryFn: () => api.finance.summary() });
  const notifications = useQuery({ queryKey: ["notifications", "unread"], queryFn: () => api.notifications.list("?read=false") });
  const fitnessLogs = useQuery({ queryKey: ["fitness", "logs"], queryFn: () => api.fitness.logs() });
  const groups = useQuery({ queryKey: ["groups"], queryFn: () => api.groups.list() });

  const upcoming = [...(tasks.data ?? [])]
    .filter((t) => t.dueDate)
    .sort((a, b) => +new Date(a.dueDate!) - +new Date(b.dueDate!))
    .slice(0, 4);
  const pendingCount = tasks.data?.length ?? 0;
  const latestWeight = [...(fitnessLogs.data ?? [])].find((l) => l.weightKg != null)?.weightKg;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches";

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-lime text-white"><Sprout size={22} /></span>
        <div>
          <h1 className="text-2xl font-semibold text-ink sm:text-3xl">{greeting}, {user?.name?.split(" ")[0]}</h1>
          <p className="text-sm text-muted">Este es el pulso de tu día.</p>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Tareas pendientes" value={pendingCount} accent="primary" icon={<CheckSquare size={18} />} />
        <StatTile label="Balance del mes" value={money(summary.data?.balance ?? 0)} accent="lime" icon={<Wallet size={18} />} />
        <StatTile label="Sin leer" value={notifications.data?.total ?? 0} accent="coral" icon={<Bell size={18} />} />
        <StatTile label="Peso actual" value={latestWeight ? `${latestWeight}` : "—"} hint={latestWeight ? "kg" : undefined} accent="gold" icon={<HeartPulse size={18} />} />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-semibold text-ink"><CalendarClock size={18} className="text-primary" /> Próximas tareas</h3>
            <Link to="/tasks" className="flex items-center gap-1 text-sm text-primary hover:underline">Ver todas <ArrowRight size={14} /></Link>
          </div>
          {upcoming.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">No hay tareas con fecha próxima. 🌱</p>
          ) : (
            <div className="space-y-2">
              {upcoming.map((t) => (
                <div key={t.id} className="flex items-center gap-3 rounded-xl border border-line px-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{t.title}</p>
                    <p className="text-xs text-muted">{relativeDay(t.dueDate)}</p>
                  </div>
                  <PriorityBadge priority={t.priority} />
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-semibold text-ink"><Users size={18} className="text-primary" /> Proyectos activos</h3>
            <Link to="/groups" className="flex items-center gap-1 text-sm text-primary hover:underline">Ver grupos <ArrowRight size={14} /></Link>
          </div>
          <ProjectsWidget groupIds={(groups.data ?? []).map((g) => g.id)} />
        </Card>

        <Card className="p-5">
          <h3 className="mb-4 font-semibold text-ink">Resumen financiero</h3>
          {summary.data ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Ingresos</span>
                <span className="tabular font-semibold text-primary-dark">{money(summary.data.totalIncome)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Gastos</span>
                <span className="tabular font-semibold text-coral">{money(summary.data.totalExpense)}</span>
              </div>
              <div className="border-t border-line pt-3">
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium text-ink">Balance</span>
                  <span className="tabular font-semibold text-ink">{money(summary.data.balance)}</span>
                </div>
                <ProgressBar value={summary.data.totalIncome > 0 ? (summary.data.balance / summary.data.totalIncome) * 100 : 0} />
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted">Cargando…</p>
          )}
        </Card>

        <Card className="p-5">
          <h3 className="mb-4 font-semibold text-ink">Accesos rápidos</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { to: "/tasks", label: "Nueva tarea", icon: CheckSquare },
              { to: "/finance", label: "Registrar gasto", icon: Wallet },
              { to: "/fitness", label: "Registrar peso", icon: HeartPulse },
              { to: "/groups", label: "Ver proyectos", icon: Users },
            ].map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} className="flex items-center gap-2 rounded-xl border border-line px-3 py-3 text-sm font-medium text-ink transition-colors hover:border-primary/40 hover:bg-primary-soft/30">
                <Icon size={16} className="text-primary" /> {label}
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function ProjectsWidget({ groupIds }: { groupIds: string[] }) {
  const { data } = useQuery({
    queryKey: ["dashboard-projects", groupIds],
    queryFn: async () => {
      const lists = await Promise.all(groupIds.map((id) => api.projects.list(id)));
      return lists.flat();
    },
    enabled: groupIds.length > 0,
  });
  const active = (data ?? []).filter((p) => p.status !== "done").slice(0, 4);
  if (groupIds.length === 0) return <EmptyState title="Sin proyectos" hint="Crea un grupo y su primer proyecto." />;
  if (active.length === 0) return <p className="py-6 text-center text-sm text-muted">No hay proyectos activos.</p>;
  return (
    <div className="space-y-3">
      {active.map((p) => (
        <div key={p.id}>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="truncate font-medium text-ink">{p.name}</span>
            <Badge tone="primary">{p.progress}%</Badge>
          </div>
          <ProgressBar value={p.progress} />
        </div>
      ))}
    </div>
  );
}
