import { useState } from "react";
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams } from "expo-router";
import { api } from "../../src/lib/apiClient";
import { TaskStatus, type Task } from "shared";
import { theme } from "../../constants/theme";
import { Button, Input, Empty, Badge } from "../../src/components/ui";

const c = theme.colors;
const TABS = [
  { id: "tasks", label: "Tareas" },
  { id: "deliverables", label: "Entregas" },
  { id: "time", label: "Tiempo" },
  { id: "comments", label: "Actividad" },
] as const;
type Tab = (typeof TABS)[number]["id"];
const nextStatus: Record<TaskStatus, TaskStatus> = { pending: "in_progress", in_progress: "done", done: "pending" };
const statusLabel: Record<TaskStatus, string> = { pending: "Pendiente", in_progress: "En progreso", done: "Hecho" };
const statusTone = { pending: "neutral", in_progress: "gold", done: "primary" } as const;

export default function ProjectScreen() {
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
  const projectId = id!;
  const [tab, setTab] = useState<Tab>("tasks");

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ title: name ?? "Proyecto" }} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
        {TABS.map((t) => (
          <Pressable key={t.id} onPress={() => setTab(t.id)} style={[styles.tab, tab === t.id && styles.tabActive]}>
            <Text style={[styles.tabText, tab === t.id && styles.tabTextActive]}>{t.label}</Text>
          </Pressable>
        ))}
      </ScrollView>
      {tab === "tasks" && <TasksTab projectId={projectId} />}
      {tab === "deliverables" && <DeliverablesTab projectId={projectId} />}
      {tab === "time" && <TimeTab projectId={projectId} />}
      {tab === "comments" && <CommentsTab projectId={projectId} />}
    </View>
  );
}

function TasksTab({ projectId }: { projectId: string }) {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["project-tasks", projectId], queryFn: () => api.tasks.list(`?projectId=${projectId}`) });
  const [title, setTitle] = useState("");
  const invalidate = () => qc.invalidateQueries({ queryKey: ["project-tasks", projectId] });
  const create = useMutation({ mutationFn: () => api.tasks.create({ title, projectId, priority: "medium" } as Partial<Task>), onSuccess: () => { setTitle(""); invalidate(); } });
  const cycle = useMutation({ mutationFn: (t: Task) => api.tasks.update(t.id, { status: nextStatus[t.status] }), onSuccess: invalidate });
  const remove = useMutation({ mutationFn: (id: string) => api.tasks.remove(id), onSuccess: invalidate });
  return (
    <View style={{ flex: 1, gap: 12 }}>
      <View style={styles.addRow}>
        <View style={{ flex: 1 }}><Input value={title} onChangeText={setTitle} placeholder="Nueva tarea…" /></View>
        <Button title="Añadir" onPress={() => title.trim() && create.mutate()} />
      </View>
      <FlatList
        data={data ?? []}
        keyExtractor={(t) => t.id}
        contentContainerStyle={{ gap: 8, paddingBottom: 24 }}
        ListEmptyComponent={<Empty title="Sin tareas" />}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>{item.title}</Text>
              {item.assigneeName ? <Text style={styles.sub}>{item.assigneeName}</Text> : null}
            </View>
            <Pressable onPress={() => cycle.mutate(item)}><Badge tone={statusTone[item.status]}>{statusLabel[item.status]}</Badge></Pressable>
            <Pressable onPress={() => remove.mutate(item.id)} hitSlop={8}><Ionicons name="trash-outline" size={17} color={c.coral} /></Pressable>
          </View>
        )}
      />
    </View>
  );
}

function DeliverablesTab({ projectId }: { projectId: string }) {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["deliverables", projectId], queryFn: () => api.deliverables.list(projectId) });
  const [title, setTitle] = useState("");
  const invalidate = () => qc.invalidateQueries({ queryKey: ["deliverables", projectId] });
  const create = useMutation({ mutationFn: () => api.deliverables.create(projectId, { title }), onSuccess: () => { setTitle(""); invalidate(); } });
  const toggle = useMutation({ mutationFn: (d: { id: string; status: string }) => api.deliverables.update(projectId, d.id, { status: d.status === "delivered" ? "pending" : "delivered" }), onSuccess: invalidate });
  const remove = useMutation({ mutationFn: (id: string) => api.deliverables.remove(projectId, id), onSuccess: invalidate });
  return (
    <View style={{ flex: 1, gap: 12 }}>
      <View style={styles.addRow}>
        <View style={{ flex: 1 }}><Input value={title} onChangeText={setTitle} placeholder="Nueva entrega…" /></View>
        <Button title="Añadir" onPress={() => title.trim() && create.mutate()} />
      </View>
      <FlatList
        data={data ?? []}
        keyExtractor={(d) => d.id}
        contentContainerStyle={{ gap: 8, paddingBottom: 24 }}
        ListEmptyComponent={<Empty title="Sin entregas" />}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Pressable onPress={() => toggle.mutate(item)}>
              <Ionicons name={item.status === "delivered" ? "checkmark-circle" : "ellipse-outline"} size={22} color={item.status === "delivered" ? c.primary : c.muted} />
            </Pressable>
            <Text style={[styles.rowTitle, { flex: 1 }, item.status === "delivered" && styles.done]}>{item.title}</Text>
            <Pressable onPress={() => remove.mutate(item.id)} hitSlop={8}><Ionicons name="trash-outline" size={17} color={c.coral} /></Pressable>
          </View>
        )}
      />
    </View>
  );
}

function TimeTab({ projectId }: { projectId: string }) {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["sessions", projectId], queryFn: () => api.sessions.list(projectId), refetchInterval: 30000 });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["sessions", projectId] });
  const start = useMutation({ mutationFn: () => api.sessions.start(projectId), onSuccess: invalidate });
  const stop = useMutation({ mutationFn: (id: string) => api.sessions.stop(projectId, id), onSuccess: invalidate });
  const remove = useMutation({ mutationFn: (id: string) => api.sessions.remove(projectId, id), onSuccess: invalidate });
  const running = (data ?? []).find((s) => !s.endedAt);
  const dur = (start: string, end: string | null) => {
    const mins = Math.round(((end ? +new Date(end) : Date.now()) - +new Date(start)) / 60000);
    return mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins}m`;
  };
  return (
    <View style={{ flex: 1, gap: 12 }}>
      {running ? (
        <Button title={`Detener (${dur(running.startedAt, null)})`} variant="danger" onPress={() => stop.mutate(running.id)} />
      ) : (
        <Button title="Iniciar sesión de trabajo" variant="lime" onPress={() => start.mutate()} />
      )}
      <FlatList
        data={data ?? []}
        keyExtractor={(s) => s.id}
        contentContainerStyle={{ gap: 8, paddingBottom: 24 }}
        ListEmptyComponent={<Empty title="Sin sesiones" hint="Inicia el cronómetro al empezar a trabajar." />}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Ionicons name="timer-outline" size={20} color={c.primaryDark} />
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>{dur(item.startedAt, item.endedAt)}{!item.endedAt ? " · en curso" : ""}</Text>
              <Text style={styles.sub}>{new Date(item.startedAt).toLocaleString("es-MX")}</Text>
            </View>
            <Pressable onPress={() => remove.mutate(item.id)} hitSlop={8}><Ionicons name="trash-outline" size={17} color={c.coral} /></Pressable>
          </View>
        )}
      />
    </View>
  );
}

function CommentsTab({ projectId }: { projectId: string }) {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["comments", projectId], queryFn: () => api.comments.list(projectId) });
  const [body, setBody] = useState("");
  const invalidate = () => qc.invalidateQueries({ queryKey: ["comments", projectId] });
  const create = useMutation({ mutationFn: () => api.comments.create(projectId, body), onSuccess: () => { setBody(""); invalidate(); } });
  return (
    <View style={{ flex: 1, gap: 12 }}>
      <View style={styles.addRow}>
        <View style={{ flex: 1 }}><Input value={body} onChangeText={setBody} placeholder="Comentario…" /></View>
        <Button title="Enviar" onPress={() => body.trim() && create.mutate()} />
      </View>
      <FlatList
        data={data ?? []}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ gap: 10, paddingBottom: 24 }}
        ListEmptyComponent={<Empty title="Sin actividad" />}
        renderItem={({ item }) => (
          <View style={styles.comment}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{(item.userName ?? "?").slice(0, 1).toUpperCase()}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>{item.userName}</Text>
              <Text style={styles.body}>{item.body}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.canvas, padding: 16, gap: 12 },
  tabs: { gap: 8, paddingVertical: 2 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, backgroundColor: c.surface, borderWidth: 1, borderColor: c.line },
  tabActive: { backgroundColor: c.primary, borderColor: c.primary },
  tabText: { fontSize: 13, fontWeight: "600", color: c.muted },
  tabTextActive: { color: c.white },
  addRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  row: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: c.surface, borderRadius: 14, borderWidth: 1, borderColor: c.line, padding: 12 },
  rowTitle: { fontSize: 14, fontWeight: "600", color: c.ink },
  sub: { fontSize: 12, color: c.muted, marginTop: 1 },
  done: { textDecorationLine: "line-through", color: c.muted },
  comment: { flexDirection: "row", gap: 10, backgroundColor: c.surface, borderRadius: 14, borderWidth: 1, borderColor: c.line, padding: 12 },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: c.primary, alignItems: "center", justifyContent: "center" },
  avatarText: { color: c.white, fontWeight: "700" },
  body: { fontSize: 14, color: c.ink, marginTop: 2 },
});
