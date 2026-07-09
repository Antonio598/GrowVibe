import { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { api } from "../../src/lib/apiClient";
import type { Transaction } from "shared";
import { theme } from "../../constants/theme";
import { Button, Input, Empty } from "../../src/components/ui";

const c = theme.colors;
const money = (n: number) => n.toLocaleString("es-MX", { style: "currency", currency: "USD" });

export default function FinanceScreen() {
  const qc = useQueryClient();
  const router = useRouter();
  const { data: transactions } = useQuery({ queryKey: ["finance", "transactions"], queryFn: () => api.finance.transactions() });
  const { data: summary } = useQuery({ queryKey: ["finance", "summary"], queryFn: () => api.finance.summary() });
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const invalidate = () => qc.invalidateQueries({ queryKey: ["finance"] });

  const create = useMutation({
    mutationFn: () => api.finance.createTransaction({ type, amount: Number(amount), date: new Date().toISOString() } as Partial<Transaction>),
    onSuccess: () => { setAmount(""); invalidate(); },
  });
  const remove = useMutation({ mutationFn: (id: string) => api.finance.deleteTransaction(id), onSuccess: invalidate });

  return (
    <View style={styles.screen}>
      <View style={styles.summary}>
        <View style={styles.sumCard}><Text style={styles.sumLabel}>Ingresos</Text><Text style={[styles.sumVal, { color: c.primaryDark }]}>{money(summary?.totalIncome ?? 0)}</Text></View>
        <View style={styles.sumCard}><Text style={styles.sumLabel}>Gastos</Text><Text style={[styles.sumVal, { color: c.coral }]}>{money(summary?.totalExpense ?? 0)}</Text></View>
        <View style={styles.sumCard}><Text style={styles.sumLabel}>Balance</Text><Text style={styles.sumVal}>{money(summary?.balance ?? 0)}</Text></View>
      </View>
      <Pressable style={styles.moreBtn} onPress={() => router.push("/finance-more")}>
        <Ionicons name="pie-chart-outline" size={16} color={c.primaryDark} />
        <Text style={styles.moreText}>Presupuestos y metas</Text>
        <Ionicons name="chevron-forward" size={16} color={c.primaryDark} />
      </Pressable>
      <View style={styles.addRow}>
        <Pressable onPress={() => setType(type === "expense" ? "income" : "expense")} style={[styles.typeBtn, { backgroundColor: type === "expense" ? c.coralSoft : c.primarySoft }]}>
          <Text style={{ color: type === "expense" ? c.coral : c.primaryDark, fontWeight: "600", fontSize: 13 }}>{type === "expense" ? "Gasto" : "Ingreso"}</Text>
        </Pressable>
        <View style={{ flex: 1 }}><Input value={amount} onChangeText={setAmount} placeholder="Monto" keyboardType="numeric" /></View>
        <Button title="Añadir" onPress={() => Number(amount) > 0 && create.mutate()} />
      </View>
      <FlatList
        data={transactions ?? []}
        keyExtractor={(t) => t.id}
        contentContainerStyle={{ gap: 8, paddingBottom: 24 }}
        ListEmptyComponent={<Empty title="Sin movimientos" hint="Registra tu primer ingreso o gasto." />}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={[styles.icon, { backgroundColor: item.type === "income" ? c.primarySoft : c.coralSoft }]}>
              <Ionicons name={item.type === "income" ? "trending-up" : "trending-down"} size={16} color={item.type === "income" ? c.primaryDark : c.coral} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.note}>{item.note || (item.type === "income" ? "Ingreso" : "Gasto")}</Text>
              <Text style={styles.sub}>{new Date(item.date).toLocaleDateString("es-MX")}</Text>
            </View>
            <Text style={[styles.amount, { color: item.type === "income" ? c.primaryDark : c.coral }]}>{item.type === "income" ? "+" : "−"}{money(item.amount)}</Text>
            <Pressable onPress={() => remove.mutate(item.id)} hitSlop={8}><Ionicons name="trash-outline" size={18} color={c.coral} /></Pressable>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.canvas, padding: 16, gap: 12 },
  summary: { flexDirection: "row", gap: 8 },
  moreBtn: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: c.primarySoft, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12 },
  moreText: { flex: 1, fontSize: 14, fontWeight: "600", color: c.primaryDark },
  sumCard: { flex: 1, backgroundColor: c.surface, borderRadius: 14, borderWidth: 1, borderColor: c.line, padding: 12 },
  sumLabel: { fontSize: 11, color: c.muted },
  sumVal: { fontSize: 15, fontWeight: "700", color: c.ink, marginTop: 2 },
  addRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  typeBtn: { height: 46, paddingHorizontal: 14, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  row: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: c.surface, borderRadius: 14, borderWidth: 1, borderColor: c.line, padding: 12 },
  icon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  note: { fontSize: 14, fontWeight: "500", color: c.ink },
  sub: { fontSize: 12, color: c.muted, marginTop: 1 },
  amount: { fontSize: 14, fontWeight: "700" },
});
