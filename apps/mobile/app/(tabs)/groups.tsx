import { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { api } from "../../src/lib/apiClient";
import { theme } from "../../constants/theme";
import { Button, Input, Empty } from "../../src/components/ui";

const c = theme.colors;

export default function GroupsScreen() {
  const qc = useQueryClient();
  const router = useRouter();
  const { data: groups } = useQuery({ queryKey: ["groups"], queryFn: () => api.groups.list() });
  const [name, setName] = useState("");
  const invalidate = () => qc.invalidateQueries({ queryKey: ["groups"] });

  const create = useMutation({ mutationFn: () => api.groups.create(name), onSuccess: () => { setName(""); invalidate(); } });
  const remove = useMutation({ mutationFn: (id: string) => api.groups.remove(id), onSuccess: invalidate });

  return (
    <View style={styles.screen}>
      <View style={styles.addRow}>
        <View style={{ flex: 1 }}><Input value={name} onChangeText={setName} placeholder="Nombre del grupo" /></View>
        <Button title="Crear" onPress={() => name.trim() && create.mutate()} />
      </View>
      <FlatList
        data={groups ?? []}
        keyExtractor={(g) => g.id}
        contentContainerStyle={{ gap: 10, paddingBottom: 24 }}
        ListEmptyComponent={<Empty title="Sin grupos" hint="Crea un grupo para organizar proyectos." />}
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => router.push({ pathname: "/group/[id]", params: { id: item.id, name: item.name } })}>
            <View style={styles.icon}><Ionicons name="people" size={20} color={c.white} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.sub}>Abrir proyectos ›</Text>
            </View>
            <Pressable onPress={() => remove.mutate(item.id)} hitSlop={8}><Ionicons name="trash-outline" size={18} color={c.coral} /></Pressable>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.canvas, padding: 16, gap: 12 },
  addRow: { flexDirection: "row", gap: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: c.surface, borderRadius: 16, borderWidth: 1, borderColor: c.line, padding: 14 },
  icon: { width: 44, height: 44, borderRadius: 13, backgroundColor: c.primary, alignItems: "center", justifyContent: "center" },
  name: { fontSize: 15, fontWeight: "600", color: c.ink },
  sub: { fontSize: 12, color: c.primary, marginTop: 2 },
});
