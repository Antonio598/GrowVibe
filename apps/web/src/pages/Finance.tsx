import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, TrendingUp, TrendingDown, Wallet, Tag, Receipt, PiggyBank, Target, Repeat } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { api } from "../lib/apiClient";
import { type Category, type Transaction } from "shared";
import {
  Button,
  IconButton,
  Card,
  StatTile,
  Field,
  Input,
  Select,
  Modal,
  ConfirmDialog,
  Badge,
  EmptyState,
  PageHeader,
  Tabs,
} from "../components/ui";
import { money, moneyExact, shortDate, forDateInput, dateInputToIso } from "../lib/format";
import { BudgetsPanel } from "../components/finance/BudgetsPanel";
import { GoalsPanel } from "../components/finance/GoalsPanel";
import { RecurringPanel } from "../components/finance/RecurringPanel";

const CHART_COLORS = ["#15A06B", "#F0653E", "#8FBD2E", "#E8A93B", "#0C6B47", "#5B6B63"];

export function Finance() {
  const qc = useQueryClient();
  const { data: transactions } = useQuery({ queryKey: ["finance", "transactions"], queryFn: () => api.finance.transactions() });
  const { data: summary } = useQuery({ queryKey: ["finance", "summary"], queryFn: () => api.finance.summary() });
  const { data: categories } = useQuery({ queryKey: ["finance", "categories"], queryFn: () => api.finance.categories() });

  const [editing, setEditing] = useState<Transaction | null>(null);
  const [deleting, setDeleting] = useState<Transaction | null>(null);
  const [showCats, setShowCats] = useState(false);
  const [tab, setTab] = useState<"movements" | "budgets" | "goals" | "recurring">("movements");

  const invalidate = () => qc.invalidateQueries({ queryKey: ["finance"] });

  const remove = useMutation({
    mutationFn: (id: string) => api.finance.deleteTransaction(id),
    onSuccess: () => {
      setDeleting(null);
      invalidate();
      toast.success("Movimiento borrado");
    },
  });

  const expenseData = (summary?.byCategory ?? [])
    .filter((c) => c.total > 0)
    .map((c) => ({ name: c.categoryName, value: c.total }));

  const catName = (id: string | null) => categories?.find((c) => c.id === id)?.name;

  return (
    <div>
      <PageHeader
        title="Finanzas"
        subtitle="Controla tus ingresos y gastos del mes."
        action={<Button variant="secondary" icon={<Tag size={16} />} onClick={() => setShowCats(true)}>Categorías</Button>}
      />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile label="Ingresos" value={money(summary?.totalIncome ?? 0)} accent="primary" icon={<TrendingUp size={18} />} />
        <StatTile label="Gastos" value={money(summary?.totalExpense ?? 0)} accent="coral" icon={<TrendingDown size={18} />} />
        <StatTile label="Balance" value={money(summary?.balance ?? 0)} accent="lime" icon={<Wallet size={18} />} />
      </div>

      <div className="mb-5">
        <Tabs
          active={tab}
          onChange={setTab}
          tabs={[
            { id: "movements", label: "Movimientos", icon: <Receipt size={15} /> },
            { id: "budgets", label: "Presupuestos", icon: <PiggyBank size={15} /> },
            { id: "goals", label: "Metas", icon: <Target size={15} /> },
            { id: "recurring", label: "Recurrentes", icon: <Repeat size={15} /> },
          ]}
        />
      </div>

      {tab === "budgets" && <BudgetsPanel />}
      {tab === "goals" && <GoalsPanel />}
      {tab === "recurring" && <RecurringPanel />}

      {tab === "movements" && (
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <NewTransactionForm categories={categories ?? []} onCreated={invalidate} />
          <div className="mt-4 space-y-2">
            {(transactions ?? []).length === 0 ? (
              <EmptyState icon={<Wallet size={22} />} title="Sin movimientos" hint="Registra tu primer ingreso o gasto arriba." />
            ) : (
              (transactions ?? []).map((t) => (
                <Card key={t.id} className="flex items-center gap-3 px-4 py-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${t.type === "income" ? "bg-primary-soft text-primary-dark" : "bg-coral-soft text-coral"}`}>
                    {t.type === "income" ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-ink">{t.note || (t.type === "income" ? "Ingreso" : "Gasto")}</p>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-muted">
                      <span>{shortDate(t.date)}</span>
                      {catName(t.categoryId) && <Badge tone="neutral">{catName(t.categoryId)}</Badge>}
                    </div>
                  </div>
                  <span className={`tabular font-semibold ${t.type === "income" ? "text-primary-dark" : "text-coral"}`}>
                    {t.type === "income" ? "+" : "−"}{moneyExact(t.amount)}
                  </span>
                  <div className="flex shrink-0">
                    <IconButton label="Editar" onClick={() => setEditing(t)}><Pencil size={16} /></IconButton>
                    <IconButton label="Borrar" variant="danger" onClick={() => setDeleting(t)}><Trash2 size={16} /></IconButton>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        <Card className="h-fit p-5">
          <h3 className="mb-4 text-sm font-medium text-muted">Distribución de gastos</h3>
          {expenseData.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">Sin datos aún.</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={expenseData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                    {expenseData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => moneyExact(Number(v))} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-3 space-y-1.5">
                {expenseData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2 text-sm">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                    <span className="flex-1 truncate text-muted">{d.name}</span>
                    <span className="tabular font-medium text-ink">{money(d.value)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>
      )}

      {editing && <EditTransactionModal tx={editing} categories={categories ?? []} onClose={() => setEditing(null)} onSaved={invalidate} />}
      {showCats && <CategoriesModal categories={categories ?? []} onClose={() => setShowCats(false)} onChanged={invalidate} />}
      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting.id)}
        title="Borrar movimiento"
        message="¿Seguro que quieres borrar este movimiento?"
        loading={remove.isPending}
      />
    </div>
  );
}

function NewTransactionForm({ categories, onCreated }: { categories: Category[]; onCreated: () => void }) {
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState(forDateInput(new Date().toISOString()));

  const create = useMutation({
    mutationFn: () =>
      api.finance.createTransaction({
        type,
        amount: Number(amount),
        note: note || undefined,
        categoryId: categoryId || null,
        date: dateInputToIso(date),
      } as Partial<Transaction>),
    onSuccess: () => {
      setAmount("");
      setNote("");
      onCreated();
      toast.success("Movimiento registrado");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Error"),
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (Number(amount) > 0) create.mutate();
  }

  const options = categories.filter((c) => c.type === type);

  return (
    <Card className="p-4">
      <form onSubmit={onSubmit} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Select value={type} onChange={(e) => setType(e.target.value as "income" | "expense")}>
          <option value="expense">Gasto</option>
          <option value="income">Ingreso</option>
        </Select>
        <Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Monto" />
        <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">Sin categoría</option>
          {options.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <Input className="col-span-2 sm:col-span-3" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Nota (opcional)" />
        <Button type="submit" icon={<Plus size={16} />} className="col-span-2 sm:col-span-1">Registrar</Button>
      </form>
    </Card>
  );
}

function EditTransactionModal({ tx, categories, onClose, onSaved }: { tx: Transaction; categories: Category[]; onClose: () => void; onSaved: () => void }) {
  const [type, setType] = useState(tx.type);
  const [amount, setAmount] = useState(String(tx.amount));
  const [note, setNote] = useState(tx.note ?? "");
  const [categoryId, setCategoryId] = useState(tx.categoryId ?? "");
  const [date, setDate] = useState(forDateInput(tx.date));

  const save = useMutation({
    mutationFn: () =>
      api.finance.updateTransaction(tx.id, {
        type,
        amount: Number(amount),
        note: note || null,
        categoryId: categoryId || null,
        date: dateInputToIso(date),
      } as Partial<Transaction>),
    onSuccess: () => {
      onSaved();
      onClose();
      toast.success("Movimiento actualizado");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Error"),
  });

  return (
    <Modal open onClose={onClose} title="Editar movimiento" footer={<><Button variant="secondary" onClick={onClose}>Cancelar</Button><Button onClick={() => save.mutate()} disabled={save.isPending}>Guardar</Button></>}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Tipo">
            <Select value={type} onChange={(e) => setType(e.target.value as "income" | "expense")}>
              <option value="expense">Gasto</option>
              <option value="income">Ingreso</option>
            </Select>
          </Field>
          <Field label="Monto"><Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Categoría">
            <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">Sin categoría</option>
              {categories.filter((c) => c.type === type).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </Field>
          <Field label="Fecha"><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
        </div>
        <Field label="Nota"><Input value={note} onChange={(e) => setNote(e.target.value)} /></Field>
      </div>
    </Modal>
  );
}

function CategoriesModal({ categories, onClose, onChanged }: { categories: Category[]; onClose: () => void; onChanged: () => void }) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");

  const create = useMutation({
    mutationFn: () => api.finance.createCategory({ name, type } as Partial<Category>),
    onSuccess: () => { setName(""); onChanged(); toast.success("Categoría creada"); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Error"),
  });
  const remove = useMutation({
    mutationFn: (id: string) => api.finance.deleteCategory(id),
    onSuccess: () => { onChanged(); toast.success("Categoría borrada"); },
  });

  return (
    <Modal open onClose={onClose} title="Categorías">
      <div className="space-y-4">
        <form onSubmit={(e) => { e.preventDefault(); if (name.trim()) create.mutate(); }} className="flex gap-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre" />
          <Select value={type} onChange={(e) => setType(e.target.value as "income" | "expense")} className="w-auto">
            <option value="expense">Gasto</option>
            <option value="income">Ingreso</option>
          </Select>
          <Button type="submit" icon={<Plus size={16} />}>Añadir</Button>
        </form>
        <div className="space-y-1.5">
          {categories.length === 0 && <p className="text-sm text-muted">Aún no tienes categorías.</p>}
          {categories.map((c) => (
            <div key={c.id} className="flex items-center gap-2 rounded-xl border border-line px-3 py-2">
              <Badge tone={c.type === "income" ? "primary" : "coral"}>{c.type === "income" ? "Ingreso" : "Gasto"}</Badge>
              <span className="flex-1 text-sm text-ink">{c.name}</span>
              <IconButton label="Borrar" variant="danger" onClick={() => remove.mutate(c.id)}><Trash2 size={15} /></IconButton>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
