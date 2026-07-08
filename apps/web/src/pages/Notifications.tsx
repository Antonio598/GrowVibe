import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/apiClient";

export function Notifications() {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ["notifications", "all"], queryFn: () => api.notifications.list() });

  const markRead = useMutation({
    mutationFn: (id: string) => api.notifications.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAllRead = useMutation({
    mutationFn: () => api.notifications.markAllRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Alertas</h1>
        <button onClick={() => markAllRead.mutate()} className="text-sm text-slate-600 underline">
          Marcar todo como leído
        </button>
      </div>

      <ul className="space-y-2">
        {data?.data.map((n) => (
          <li
            key={n.id}
            className={`rounded-md border px-4 py-3 ${
              n.read ? "border-slate-200 bg-white" : "border-slate-400 bg-slate-100"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-900">{n.message}</p>
                <p className="text-xs text-slate-500">
                  {n.type} · {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
              {!n.read && (
                <button onClick={() => markRead.mutate(n.id)} className="text-xs text-slate-600 underline">
                  Marcar leída
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
