import { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../src/lib/apiClient";
import type { FitnessLog } from "shared";
import { theme } from "../../constants/theme";
import { Button, Input, Empty } from "../../src/components/ui";

const c = theme.colors;

export default function FitnessScreen() {
  const qc = useQueryClient();
  const { data: logs } = useQuery({ queryKey: ["fitness", "logs"], queryFn: () => api.fitness.logs() });
  const { data: plan } = useQuery({ queryKey: ["fitness", "diet-plan", "latest"], queryFn: () => api.fitness.latestDietPlan() });
  const [weight, setWeight] = useState("");
  const [compliance, setCompliance] = useState("");
  const invalidate = () => qc.invalidateQueries({ queryKey: ["fitness"] });

  const create = useMutation({
    mutationFn: () => api.fitness.createLog({
      date: new Date().toISOString(),
      weightKg: weight ? Number(weight) : undefined,
      routineCompliance: compliance ? Number(compliance) : undefined,
    } as Partial<FitnessLog>),
    onSuccess: () => { setWeight(""); setCompliance(""); invalidate(); },
  });
  const remove = useMutation({ mutationFn: (id: string) => api.fitness.deleteLog(id), onSuccess: invalidate });

  return (
    <View style={styles.screen}>
      {plan ? (
        <View style={styles.plan}>
          <Text style={styles.planLabel}>Objetivo diario</Text>
          <Text style={styles.planVal}>{plan.targetCalories} kcal</Text>
        </View>
      ) : null}
      <View style={styles.addRow}>
        <View style={{ flex: 1 }}><Input value={weight} onChangeText={setWeight} placeholder="Peso (kg)" keyboardType="numeric" /></View>
        <View style={{ flex: 1 }}><Input value={compliance} onChangeText={setCompliance} placeholder="Rutina %" keyboardType="numeric" /></View>
        <Button title="Registrar" onPress={() => create.mutate()} />
      </View>
      <FlatList
        data={logs ?? []}
        keyExtractor={(l) => l.id}
        contentContainerStyle={{ gap: 8, paddingBottom: 24 }}
        ListEmptyComponent={<Empty title="Sin registros" hint="Añade tu primer registro de peso." />}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.icon}><Ionicons name="fitness-outline" size={16} color={c.primaryDark} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>{item.weightKg ? `${item.weightKg} kg` : "Registro"}</Text>
              <Text style={styles.sub}>{new Date(item.date).toLocaleDateString("es-MX")}{item.routineCompliance != null ? ` · Rutina ${item.routineCompliance}%` : ""}</Text>
            </View>
            <Pressable onPress={() => remove.mutate(item.id)} hitSlop={8}><Ionicons name="trash-outline" size={17} color={c.coral} /></Pressable>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.canvas, padding: 16, gap: 12 },
  plan: { backgroundColor: c.primarySoft, borderRadius: 14, padding: 14 },
  planLabel: { fontSize: 12, color: c.muted },
  planVal: { fontSize: 20, fontWeight: "700", color: c.primaryDark },
  addRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  row: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: c.surface, borderRadius: 14, borderWidth: 1, borderColor: c.line, padding: 12 },
  icon: { width: 34, height: 34, borderRadius: 10, backgroundColor: c.primarySoft, alignItems: "center", justifyContent: "center" },
  rowTitle: { fontSize: 14, fontWeight: "600", color: c.ink },
  sub: { fontSize: 12, color: c.muted, marginTop: 1 },
});
