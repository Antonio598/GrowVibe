import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/apiClient";
import type { TransactionType } from "shared";

export function Finance() {
  const queryClient = useQueryClient();
  const { data: transactions } = useQuery({ queryKey: ["finance", "transactions"], queryFn: () => api.finance.transactions() });
  const { data: summary } = useQuery({ queryKey: ["finance", "summary"], queryFn: () => api.finance.summary() });

  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const createTransaction = useMutation({
    mutationFn: () =>
      api.finance.createTransaction({
        type,
        amount: Number(amount),
        date: new Date().toISOString(),
        note,
      }),
    onSuccess: () => {
      setAmount("");
      setNote("");
      queryClient.invalidateQueries({ queryKey: ["finance"] });
    },
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (Number(amount) > 0) createTransaction.mutate();
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Finanzas</h1>

      {summary && (
        <div className="mb-6 grid grid-cols-3 gap-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-500">Ingresos</p>
            <p className="text-xl font-semibold text-emerald-600">${summary.totalIncome.toFixed(2)}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-500">Gastos</p>
            <p className="text-xl font-semibold text-red-600">${summary.totalExpense.toFixed(2)}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-500">Balance</p>
            <p className="text-xl font-semibold">${summary.balance.toFixed(2)}</p>
          </div>
        </div>
      )}

      <form onSubmit={onSubmit} className="mb-6 flex flex-wrap gap-2">
        <select
          value={type}
          onChange={(e) => setType(e.target.value as TransactionType)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="expense">Gasto</option>
          <option value="income">Ingreso</option>
        </select>
        <input
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Monto"
          className="w-32 rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Nota (opcional)"
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white">
          Registrar
        </button>
      </form>

      <ul className="space-y-2">
        {transactions?.map((t) => (
          <li key={t.id} className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-4 py-3">
            <div>
              <p className="text-slate-900">{t.note || "(sin nota)"}</p>
              <p className="text-xs text-slate-500">{new Date(t.date).toLocaleDateString()}</p>
            </div>
            <p className={t.type === "income" ? "font-medium text-emerald-600" : "font-medium text-red-600"}>
              {t.type === "income" ? "+" : "-"}${t.amount.toFixed(2)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
