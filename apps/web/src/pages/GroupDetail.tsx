import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { api } from "../lib/apiClient";

export function GroupDetail() {
  const { id } = useParams<{ id: string }>();
  const groupId = id!;
  const queryClient = useQueryClient();

  const { data: projects } = useQuery({
    queryKey: ["projects", groupId],
    queryFn: () => api.projects.list(groupId),
  });
  const { data: members } = useQuery({
    queryKey: ["groups", groupId, "members"],
    queryFn: () => api.groups.members(groupId),
  });

  const [name, setName] = useState("");

  const createProject = useMutation({
    mutationFn: () => api.projects.create({ groupId, name }),
    onSuccess: () => {
      setName("");
      queryClient.invalidateQueries({ queryKey: ["projects", groupId] });
    },
  });

  const updateProgress = useMutation({
    mutationFn: ({ projectId, progress }: { projectId: string; progress: number }) =>
      api.projects.update(projectId, { progress }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects", groupId] }),
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (name.trim()) createProject.mutate();
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-slate-900">Proyectos del grupo</h1>
      <p className="mb-6 text-sm text-slate-500">
        Miembros: {members?.map((m) => m.userName ?? m.userId).join(", ") || "…"}
      </p>

      <form onSubmit={onSubmit} className="mb-6 flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nuevo proyecto..."
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white">
          Crear proyecto
        </button>
      </form>

      <ul className="space-y-3">
        {projects?.map((project) => (
          <li key={project.id} className="rounded-md border border-slate-200 bg-white px-4 py-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="font-medium text-slate-900">{project.name}</p>
              <span className="text-sm text-slate-500">{project.progress}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={project.progress}
              onChange={(e) => updateProgress.mutate({ projectId: project.id, progress: Number(e.target.value) })}
              className="w-full"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
