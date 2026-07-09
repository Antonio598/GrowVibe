import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Trash2, PiggyBank, AlertTriangle } from "lucide-react";
import { api } from "../../lib/apiClient";
import type { Budget, Category } from "shared";
import { Button, IconButton, Card, Input, Select, ProgressBar, Badge, EmptyState } from "../ui";
import { money } from "../../lib/format";

export function BudgetsPanel() {
  const qc = useQueryClient();
  const { data: budgets } = useQuery({ queryKey: ["finance", "budgets"], queryFn: () => api.finance.budgets() });
  const { data: categories } = useQuery({ queryKey: ["finance", "categories"], queryFn: () => api.finance.categories() });
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const invalidate = () => qc.invalidateQueries({ queryKey: ["finance", "budgets"] });

  const create = useMutation({
    mutationFn: () => api.finance.createBudget({ categoryId: categoryId || null, amount: Number(amount) } as Partial<Budget>),
    onSuccess: () => { setAmount(""); setCategoryId(""); invalidate(); toast.success("Presupuesto creado"); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Error"),
  });
  const remove = useMutation({ mutationFn: (id: string) => api.finance.deleteBudget(id), onSuccess: () => { invalidate(); toast.success("Presupuesto borrado"); } });

  function onSubmit(e: FormEvent) { e.preventDefault(); if (Number(amount) > 0) create.mutate(); }
  const expenseCats = (categories ?? []).filter((c: Category) => c.type === "expense");

  return (
    <div>
      <Card className="mb-4 p-4">
        <form onSubmit={onSubmit} className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">Presupuesto general</option>
            {expenseCats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Límite mensual" />
          <Button type="submit" icon={<Plus size={16} />}>Crear</Button>
        </form>
      </Card>

      {(budgets ?? []).length === 0 ? (
        <EmptyState icon={<PiggyBank size={22} />} title="Sin presupuestos" hint="Define un límite mensual por categoría para no pasarte." />
      ) : (
        <div className="space-y-3">
          {(budgets ?? []).map((b) => {
            const pct = b.amount > 0 ? (b.spent / b.amount) * 100 : 0;
            const over = b.spent > b.amount;
            return (
              <Card key={b.id} className="p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-ink">{b.categoryName ?? "General"}</span>
                    {over && <Badge tone="coral"><AlertTriangle size={11} /> Excedido</Badge>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="tabular text-sm text-muted">{money(b.spent)} / {money(b.amount)}</span>
                    <IconButton label="Borrar" variant="danger" onClick={() => remove.mutate(b.id)}><Trash2 size={15} /></IconButton>
                  </div>
                </div>
                <ProgressBar value={Math.min(100, pct)} className={over ? "[&>div]:from-coral [&>div]:to-coral" : ""} />
                <p className="mt-1 text-xs text-muted">{over ? `Te pasaste por ${money(b.spent - b.amount)}` : `Te queda ${money(b.amount - b.spent)} este mes`}</p>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
