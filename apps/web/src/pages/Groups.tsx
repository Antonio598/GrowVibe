import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "../lib/apiClient";

export function Groups() {
  const queryClient = useQueryClient();
  const { data: groups } = useQuery({ queryKey: ["groups"], queryFn: () => api.groups.list() });
  const [name, setName] = useState("");

  const createGroup = useMutation({
    mutationFn: () => api.groups.create(name),
    onSuccess: () => {
      setName("");
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (name.trim()) createGroup.mutate();
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Colaborativo</h1>

      <form onSubmit={onSubmit} className="mb-6 flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre del grupo..."
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white">
          Crear grupo
        </button>
      </form>

      <ul className="space-y-2">
        {groups?.map((group) => (
          <li key={group.id}>
            <Link
              to={`/groups/${group.id}`}
              className="block rounded-md border border-slate-200 bg-white px-4 py-3 hover:border-slate-400"
            >
              {group.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
