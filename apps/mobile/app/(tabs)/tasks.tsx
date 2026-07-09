import { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../src/lib/apiClient";
import { TaskStatus, type Task } from "shared";
import { theme } from "../../constants/theme";
import { Button, Input, Badge, Empty, Loading } from "../../src/components/ui";

const c = theme.colors;
const nextStatus: Record<TaskStatus, TaskStatus> = { pending: "in_progress", in_progress: "done", done: "pending" };
const statusIcon: Record<TaskStatus, keyof typeof Ionicons.glyphMap> = { pending: "ellipse-outline", in_progress: "contrast-outline", done: "checkmark-circle" };
const prioTone = { high: "coral", medium: "gold", low: "neutral" } as const;
const prioLabel = { high: "Alta", medium: "Media", low: "Baja" };

export default function TasksScreen() {
  const qc = useQueryClient();
  const { data: tasks, isLoading } = useQuery({ queryKey: ["tasks"], queryFn: () => api.tasks.list() });
  const [title, setTitle] = useState("");
  const invalidate = () => qc.invalidateQueries({ queryKey: ["tasks"] });

  const create = useMutation({ mutationFn: () => api.tasks.create({ title, priority: "medium" }), onSuccess: () => { setTitle(""); invalidate(); } });
  const cycle = useMutation({ mutationFn: (t: Task) => api.tasks.update(t.id, { status: nextStatus[t.status] }), onSuccess: invalidate });
  const remove = useMutation({ mutationFn: (id: string) => api.tasks.remove(id), onSuccess: invalidate });

  return (
    <View style={styles.screen}>
      <View style={styles.addRow}>
        <View style={{ flex: 1 }}><Input value={title} onChangeText={setTitle} placeholder="Nueva tarea…" /></View>
        <Button title="Añadir" onPress={() => title.trim() && create.mutate()} />
      </View>
      {isLoading ? (
        <Loading />
      ) : (
        <FlatList
          data={tasks ?? []}
          keyExtractor={(t) => t.id}
          contentContainerStyle={{ gap: 8, paddingBottom: 24 }}
          ListEmptyComponent={<Empty title="Sin tareas" hint="Agrega tu primera tarea arriba." />}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Pressable onPress={() => cycle.mutate(item)}>
                <Ionicons name={statusIcon[item.status]} size={22} color={item.status === "done" ? c.primary : c.muted} />
              </Pressable>
              <View style={{ flex: 1 }}>
                <Text style={[styles.title, item.status === "done" && styles.done]}>{item.title}</Text>
                {item.assigneeName ? <Text style={styles.sub}>{item.assigneeName}</Text> : null}
              </View>
              <Badge tone={prioTone[item.priority]}>{prioLabel[item.priority]}</Badge>
              <Pressable onPress={() => remove.mutate(item.id)} hitSlop={8}>
                <Ionicons name="trash-outline" size={18} color={c.coral} />
              </Pressable>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.canvas, padding: 16, gap: 12 },
  addRow: { flexDirection: "row", gap: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: c.surface, borderRadius: 14, borderWidth: 1, borderColor: c.line, padding: 12 },
  title: { fontSize: 15, fontWeight: "500", color: c.ink },
  done: { textDecorationLine: "line-through", color: c.muted },
  sub: { fontSize: 12, color: c.muted, marginTop: 2 },
});
