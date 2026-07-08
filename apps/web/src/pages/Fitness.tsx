import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/apiClient";
import type { ActivityLevel, DietGoal, Sex } from "shared";

export function Fitness() {
  const queryClient = useQueryClient();
  const { data: logs } = useQuery({ queryKey: ["fitness", "logs"], queryFn: () => api.fitness.logs() });
  const { data: latestPlan } = useQuery({
    queryKey: ["fitness", "diet-plan", "latest"],
    queryFn: () => api.fitness.latestDietPlan(),
  });

  const [weight, setWeight] = useState("");

  const createLog = useMutation({
    mutationFn: () =>
      api.fitness.createLog({ date: new Date().toISOString(), weightKg: Number(weight) }),
    onSuccess: () => {
      setWeight("");
      queryClient.invalidateQueries({ queryKey: ["fitness", "logs"] });
    },
  });

  const [ageYears, setAgeYears] = useState("30");
  const [sex, setSex] = useState<Sex>("male");
  const [heightCm, setHeightCm] = useState("170");
  const [dietWeight, setDietWeight] = useState("70");
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>("moderate");
  const [goal, setGoal] = useState<DietGoal>("maintain");

  const createDietPlan = useMutation({
    mutationFn: () =>
      api.fitness.createDietPlan({
        ageYears: Number(ageYears),
        sex,
        heightCm: Number(heightCm),
        weightKg: Number(dietWeight),
        activityLevel,
        goal,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["fitness", "diet-plan", "latest"] }),
  });

  function onSubmitLog(e: FormEvent) {
    e.preventDefault();
    if (Number(weight) > 0) createLog.mutate();
  }

  function onSubmitDietPlan(e: FormEvent) {
    e.preventDefault();
    createDietPlan.mutate();
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Salud y Físico</h1>

      <section className="mb-8 rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="mb-3 font-medium text-slate-900">Registro diario</h2>
        <form onSubmit={onSubmitLog} className="flex gap-2">
          <input
            type="number"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="Peso (kg)"
            className="w-32 rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white">
            Registrar
          </button>
        </form>
        <ul className="mt-4 space-y-1 text-sm text-slate-700">
          {logs?.map((log) => (
            <li key={log.id}>
              {new Date(log.date).toLocaleDateString()} — {log.weightKg ?? "—"} kg
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="mb-3 font-medium text-slate-900">Calculadora de dieta (Mifflin-St Jeor)</h2>
        <form onSubmit={onSubmitDietPlan} className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <input
            type="number"
            value={ageYears}
            onChange={(e) => setAgeYears(e.target.value)}
            placeholder="Edad"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <select value={sex} onChange={(e) => setSex(e.target.value as Sex)} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
            <option value="male">Masculino</option>
            <option value="female">Femenino</option>
          </select>
          <input
            type="number"
            value={heightCm}
            onChange={(e) => setHeightCm(e.target.value)}
            placeholder="Altura (cm)"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            type="number"
            value={dietWeight}
            onChange={(e) => setDietWeight(e.target.value)}
            placeholder="Peso (kg)"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <select
            value={activityLevel}
            onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="sedentary">Sedentario</option>
            <option value="light">Actividad ligera</option>
            <option value="moderate">Actividad moderada</option>
            <option value="active">Activo</option>
            <option value="very_active">Muy activo</option>
          </select>
          <select value={goal} onChange={(e) => setGoal(e.target.value as DietGoal)} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
            <option value="lose">Perder peso</option>
            <option value="maintain">Mantener</option>
            <option value="gain">Ganar músculo</option>
          </select>
          <button
            type="submit"
            className="col-span-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white sm:col-span-3"
          >
            Calcular plan
          </button>
        </form>

        {latestPlan && (
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-slate-500">BMR</p>
              <p className="text-lg font-semibold">{latestPlan.bmr} kcal</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">TDEE</p>
              <p className="text-lg font-semibold">{latestPlan.tdee} kcal</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Objetivo diario</p>
              <p className="text-lg font-semibold">{latestPlan.targetCalories} kcal</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
