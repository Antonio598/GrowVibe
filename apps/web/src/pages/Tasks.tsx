import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/apiClient";
import type { Task } from "shared";

export function Tasks() {
  const queryClient = useQueryClient();
  const { data: tasks, isLoading } = useQuery({ queryKey: ["tasks"], queryFn: () => api.tasks.list() });
  const [title, setTitle] = useState("");

  const createTask = useMutation({
    mutationFn: () => api.tasks.create({ title, priority: "medium" }),
    onSuccess: () => {
      setTitle("");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const toggleStatus = useMutation({
    mutationFn: (task: Task) =>
      api.tasks.update(task.id, { status: task.status === "done" ? "pending" : "done" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (title.trim()) createTask.mutate();
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Tareas</h1>

      <form onSubmit={onSubmit} className="mb-6 flex gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nueva tarea..."
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white">
          Agregar
        </button>
      </form>

      {isLoading && <p className="text-slate-500">Cargando...</p>}

      <ul className="space-y-2">
        {tasks?.map((task) => (
          <li
            key={task.id}
            className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-4 py-3"
          >
            <div>
              <p className={task.status === "done" ? "text-slate-400 line-through" : "text-slate-900"}>
                {task.title}
              </p>
              <p className="text-xs text-slate-500">
                Prioridad: {task.priority} · Estado: {task.status}
              </p>
            </div>
            <button
              onClick={() => toggleStatus.mutate(task)}
              className="rounded-md border border-slate-300 px-3 py-1 text-xs"
            >
              {task.status === "done" ? "Reabrir" : "Completar"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
