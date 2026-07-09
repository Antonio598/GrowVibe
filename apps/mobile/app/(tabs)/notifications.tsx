import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../src/lib/apiClient";
import { theme } from "../../constants/theme";
import { Button, Empty } from "../../src/components/ui";

const c = theme.colors;

export default function NotificationsScreen() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["notifications", "all"], queryFn: () => api.notifications.list() });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["notifications"] });
  const markRead = useMutation({ mutationFn: (id: string) => api.notifications.markRead(id), onSuccess: invalidate });
  const markAll = useMutation({ mutationFn: () => api.notifications.markAllRead(), onSuccess: invalidate });
  const remove = useMutation({ mutationFn: (id: string) => api.notifications.remove(id), onSuccess: invalidate });

  return (
    <View style={styles.screen}>
      <View style={{ alignItems: "flex-end" }}>
        <Button title="Marcar todo leído" variant="secondary" onPress={() => markAll.mutate()} />
      </View>
      <FlatList
        data={data?.data ?? []}
        keyExtractor={(n) => n.id}
        contentContainerStyle={{ gap: 8, paddingBottom: 24 }}
        ListEmptyComponent={<Empty title="Sin alertas" hint="Cuando pase algo importante, aparecerá aquí." />}
        renderItem={({ item }) => (
          <Pressable onPress={() => !item.read && markRead.mutate(item.id)} style={[styles.row, !item.read && styles.unread]}>
            <Ionicons name="notifications" size={18} color={item.read ? c.muted : c.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.msg, !item.read && { fontWeight: "600", color: c.ink }]}>{item.message}</Text>
              <Text style={styles.sub}>{new Date(item.createdAt).toLocaleString("es-MX")}</Text>
            </View>
            <Pressable onPress={() => remove.mutate(item.id)} hitSlop={8}><Ionicons name="trash-outline" size={17} color={c.coral} /></Pressable>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.canvas, padding: 16, gap: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: c.surface, borderRadius: 14, borderWidth: 1, borderColor: c.line, padding: 12 },
  unread: { borderColor: c.primary, backgroundColor: c.primarySoft + "55" },
  msg: { fontSize: 14, color: c.muted },
  sub: { fontSize: 11, color: c.muted, marginTop: 2 },
});
