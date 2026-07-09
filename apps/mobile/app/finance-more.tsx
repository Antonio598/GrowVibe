import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { api } from "../src/lib/apiClient";
import type { Budget, RecurringTransaction, SavingsGoal } from "shared";
import { theme } from "../constants/theme";
import { Button, Input, Empty, Badge, ProgressBar } from "../src/components/ui";

const c = theme.colors;
const money = (n: number) => n.toLocaleString("es-MX", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const SEGMENTS = [
  { id: "budgets", label: "Presupuestos" },
  { id: "goals", label: "Metas" },
  { id: "recurring", label: "Recurrentes" },
] as const;
type Seg = (typeof SEGMENTS)[number]["id"];

export default function FinanceMore() {
  const [seg, setSeg] = useState<Seg>("budgets");
  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ title: "Presupuestos y metas" }} />
      <View style={styles.segments}>
        {SEGMENTS.map((s) => (
          <Pressable key={s.id} onPress={() => setSeg(s.id)} style={[styles.seg, seg === s.id && styles.segActive]}>
            <Text style={[styles.segText, seg === s.id && styles.segTextActive]}>{s.label}</Text>
          </Pressable>
        ))}
      </View>
      <ScrollView contentContainerStyle={{ gap: 10, paddingBottom: 24 }}>
        {seg === "budgets" && <Budgets />}
        {seg === "goals" && <Goals />}
        {seg === "recurring" && <Recurring />}
      </ScrollView>
    </View>
  );
}

function Budgets() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["finance", "budgets"], queryFn: () => api.finance.budgets() });
  const [amount, setAmount] = useState("");
  const invalidate = () => qc.invalidateQueries({ queryKey: ["finance", "budgets"] });
  const create = useMutation({ mutationFn: () => api.finance.createBudget({ amount: Number(amount) } as Partial<Budget>), onSuccess: () => { setAmount(""); invalidate(); } });
  const remove = useMutation({ mutationFn: (id: string) => api.finance.deleteBudget(id), onSuccess: invalidate });
  return (
    <>
      <View style={styles.addRow}>
        <View style={{ flex: 1 }}><Input value={amount} onChangeText={setAmount} placeholder="Límite mensual general" keyboardType="numeric" /></View>
        <Button title="Crear" onPress={() => Number(amount) > 0 && create.mutate()} />
      </View>
      {(data ?? []).length === 0 ? <Empty title="Sin presupuestos" /> : (data ?? []).map((b) => {
        const over = b.spent > b.amount;
        return (
          <View key={b.id} style={styles.card}>
            <View style={styles.rowBetween}>
              <Text style={styles.name}>{b.categoryName ?? "General"}</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Text style={styles.sub}>{money(b.spent)} / {money(b.amount)}</Text>
                <Pressable onPress={() => remove.mutate(b.id)} hitSlop={8}><Ionicons name="trash-outline" size={16} color={c.coral} /></Pressable>
              </View>
            </View>
            <View style={{ marginTop: 8 }}><ProgressBar value={b.amount > 0 ? Math.min(100, (b.spent / b.amount) * 100) : 0} /></View>
            {over && <Text style={[styles.sub, { color: c.coral, marginTop: 4 }]}>Excedido por {money(b.spent - b.amount)}</Text>}
          </View>
        );
      })}
    </>
  );
}

function Goals() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["finance", "goals"], queryFn: () => api.finance.goals() });
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const invalidate = () => qc.invalidateQueries({ queryKey: ["finance", "goals"] });
  const create = useMutation({ mutationFn: () => api.finance.createGoal({ name, targetAmount: Number(target) } as Partial<SavingsGoal>), onSuccess: () => { setName(""); setTarget(""); invalidate(); } });
  const contribute = useMutation({ mutationFn: ({ id, amount }: { id: string; amount: number }) => api.finance.contributeGoal(id, amount), onSuccess: invalidate });
  const remove = useMutation({ mutationFn: (id: string) => api.finance.deleteGoal(id), onSuccess: invalidate });
  return (
    <>
      <View style={styles.addRow}>
        <View style={{ flex: 1 }}><Input value={name} onChangeText={setName} placeholder="Meta (ej. Viaje)" /></View>
        <View style={{ width: 90 }}><Input value={target} onChangeText={setTarget} placeholder="$" keyboardType="numeric" /></View>
        <Button title="Crear" onPress={() => name.trim() && Number(target) > 0 && create.mutate()} />
      </View>
      {(data ?? []).length === 0 ? <Empty title="Sin metas" /> : (data ?? []).map((g) => (
        <View key={g.id} style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.name}>{g.name}</Text>
            {g.reachedAt ? <Badge tone="lime">Lograda</Badge> : <Text style={styles.sub}>{Math.round((g.currentAmount / g.targetAmount) * 100)}%</Text>}
          </View>
          <Text style={styles.sub}>{money(g.currentAmount)} de {money(g.targetAmount)}</Text>
          <View style={{ marginTop: 8 }}><ProgressBar value={g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0} /></View>
          <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
            <Button title="+50" variant="lime" onPress={() => contribute.mutate({ id: g.id, amount: 50 })} />
            <Button title="−50" variant="secondary" onPress={() => contribute.mutate({ id: g.id, amount: -50 })} />
            <Pressable onPress={() => remove.mutate(g.id)} hitSlop={8} style={{ justifyContent: "center" }}><Ionicons name="trash-outline" size={18} color={c.coral} /></Pressable>
          </View>
        </View>
      ))}
    </>
  );
}

function Recurring() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["finance", "recurring"], queryFn: () => api.finance.recurring() });
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const invalidate = () => qc.invalidateQueries({ queryKey: ["finance", "recurring"] });
  const create = useMutation({ mutationFn: () => api.finance.createRecurring({ type: "expense", amount: Number(amount), note: note || undefined, interval: "monthly" } as Partial<RecurringTransaction>), onSuccess: () => { setAmount(""); setNote(""); invalidate(); } });
  const remove = useMutation({ mutationFn: (id: string) => api.finance.deleteRecurring(id), onSuccess: invalidate });
  return (
    <>
      <View style={styles.addRow}>
        <View style={{ flex: 1 }}><Input value={note} onChangeText={setNote} placeholder="Nota (ej. Netflix)" /></View>
        <View style={{ width: 90 }}><Input value={amount} onChangeText={setAmount} placeholder="$" keyboardType="numeric" /></View>
        <Button title="Crear" onPress={() => Number(amount) > 0 && create.mutate()} />
      </View>
      <Text style={styles.sub}>Gasto mensual. Se registra solo cada periodo.</Text>
      {(data ?? []).length === 0 ? <Empty title="Sin recurrentes" /> : (data ?? []).map((r) => (
        <View key={r.id} style={[styles.card, styles.rowBetween]}>
          <View>
            <Text style={styles.name}>{r.note || (r.type === "income" ? "Ingreso" : "Gasto")}</Text>
            <Text style={styles.sub}>{r.interval} · próximo {new Date(r.nextRun).toLocaleDateString("es-MX")}</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Text style={styles.name}>{money(r.amount)}</Text>
            <Pressable onPress={() => remove.mutate(r.id)} hitSlop={8}><Ionicons name="trash-outline" size={16} color={c.coral} /></Pressable>
          </View>
        </View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.canvas, padding: 16, gap: 12 },
  segments: { flexDirection: "row", gap: 6, backgroundColor: c.surface, borderRadius: 12, borderWidth: 1, borderColor: c.line, padding: 4 },
  seg: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: "center" },
  segActive: { backgroundColor: c.primary },
  segText: { fontSize: 13, fontWeight: "600", color: c.muted },
  segTextActive: { color: c.white },
  addRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  card: { backgroundColor: c.surface, borderRadius: 14, borderWidth: 1, borderColor: c.line, padding: 14 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  name: { fontSize: 15, fontWeight: "600", color: c.ink },
  sub: { fontSize: 12, color: c.muted, marginTop: 2 },
});
