import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "../lib/apiClient";

function Card({ title, children, to }: { title: string; children: React.ReactNode; to: string }) {
  return (
    <Link to={to} className="block rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:border-slate-400">
      <h2 className="mb-2 text-sm font-medium text-slate-500">{title}</h2>
      <div className="text-slate-900">{children}</div>
    </Link>
  );
}

export function Dashboard() {
  const tasks = useQuery({ queryKey: ["tasks", "pending"], queryFn: () => api.tasks.list("?status=pending") });
  const summary = useQuery({ queryKey: ["finance", "summary"], queryFn: () => api.finance.summary() });
  const notifications = useQuery({
    queryKey: ["notifications", "unread"],
    queryFn: () => api.notifications.list("?read=false"),
  });
  const fitnessLogs = useQuery({ queryKey: ["fitness", "logs"], queryFn: () => api.fitness.logs() });
  const groups = useQuery({ queryKey: ["groups"], queryFn: () => api.groups.list() });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card title="Tareas pendientes" to="/tasks">
          <p className="text-3xl font-semibold">{tasks.data?.length ?? "…"}</p>
        </Card>

        <Card title="Balance del mes" to="/finance">
          {summary.data ? (
            <p className="text-3xl font-semibold">
              ${summary.data.balance.toFixed(2)}
              <span className="ml-2 text-sm font-normal text-slate-500">
                (+${summary.data.totalIncome.toFixed(2)} / -${summary.data.totalExpense.toFixed(2)})
              </span>
            </p>
          ) : (
            <p className="text-3xl font-semibold">…</p>
          )}
        </Card>

        <Card title="Grupos colaborativos" to="/groups">
          <p className="text-3xl font-semibold">{groups.data?.length ?? "…"}</p>
        </Card>

        <Card title="Notificaciones sin leer" to="/notifications">
          <p className="text-3xl font-semibold">{notifications.data?.total ?? "…"}</p>
        </Card>

        <Card title="Últimos registros de fitness" to="/fitness">
          <p className="text-3xl font-semibold">{fitnessLogs.data?.length ?? "…"}</p>
        </Card>
      </div>
    </div>
  );
}
