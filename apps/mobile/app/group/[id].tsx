import { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { api, apiBaseUrl } from "../../src/lib/apiClient";
import type { Project } from "shared";
import { theme } from "../../constants/theme";
import { Button, Input, Empty, Badge, ProgressBar, Sheet, Muted } from "../../src/components/ui";

const c = theme.colors;

export default function GroupScreen() {
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
  const groupId = id!;
  const qc = useQueryClient();
  const router = useRouter();
  const { data: projects } = useQuery({ queryKey: ["projects", groupId], queryFn: () => api.projects.list(groupId) });
  const { data: members } = useQuery({ queryKey: ["groups", groupId, "members"], queryFn: () => api.groups.members(groupId) });
  const [pname, setPname] = useState("");
  const [showMembers, setShowMembers] = useState(false);
  const [email, setEmail] = useState("");
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  const create = useMutation({
    mutationFn: () => api.projects.create({ groupId, name: pname }),
    onSuccess: () => { setPname(""); qc.invalidateQueries({ queryKey: ["projects", groupId] }); },
  });
  const invite = useMutation({
    mutationFn: () => api.auth.createInvite(email, groupId),
    onSuccess: (r) => { setInviteLink(`${apiBaseUrl}/accept-invite?token=${r.token}`); setEmail(""); },
  });

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ title: name ?? "Grupo", headerRight: () => (
        <Pressable onPress={() => setShowMembers(true)} hitSlop={8}><Ionicons name="people-outline" size={22} color={c.ink} /></Pressable>
      ) }} />
      <View style={styles.addRow}>
        <View style={{ flex: 1 }}><Input value={pname} onChangeText={setPname} placeholder="Nuevo proyecto" /></View>
        <Button title="Crear" onPress={() => pname.trim() && create.mutate()} />
      </View>
      <FlatList
        data={projects ?? []}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ gap: 10, paddingBottom: 24 }}
        ListEmptyComponent={<Empty title="Sin proyectos" hint="Crea el primer proyecto del grupo." />}
        renderItem={({ item }: { item: Project }) => (
          <Pressable style={styles.card} onPress={() => router.push({ pathname: "/project/[id]", params: { id: item.id, name: item.name } })}>
            <View style={styles.cardHead}>
              <Text style={styles.pname}>{item.name}</Text>
              <Badge tone={item.status === "done" ? "primary" : item.status === "paused" ? "gold" : "lime"}>{item.progress}%</Badge>
            </View>
            <View style={{ marginTop: 8 }}><ProgressBar value={item.progress} /></View>
          </Pressable>
        )}
      />

      <Sheet visible={showMembers} onClose={() => setShowMembers(false)} title="Miembros">
        <Muted>Invitar por email</Muted>
        <View style={styles.addRow}>
          <View style={{ flex: 1 }}><Input value={email} onChangeText={setEmail} placeholder="persona@email.com" autoCapitalize="none" keyboardType="email-address" /></View>
          <Button title="Invitar" onPress={() => email.trim() && invite.mutate()} />
        </View>
        {inviteLink ? <Text selectable style={styles.link}>{inviteLink}</Text> : null}
        {(members ?? []).map((m) => (
          <View key={m.userId} style={styles.member}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{(m.userName ?? "?").slice(0, 1).toUpperCase()}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.pname}>{m.userName}</Text>
              <Muted>{m.userEmail}</Muted>
            </View>
            <Badge tone="primary">{m.role}</Badge>
          </View>
        ))}
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.canvas, padding: 16, gap: 12 },
  addRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  card: { backgroundColor: c.surface, borderRadius: 16, borderWidth: 1, borderColor: c.line, padding: 14 },
  cardHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  pname: { fontSize: 15, fontWeight: "600", color: c.ink },
  link: { fontSize: 12, color: c.primaryDark, backgroundColor: c.primarySoft, padding: 10, borderRadius: 10 },
  member: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 6 },
  avatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: c.primary, alignItems: "center", justifyContent: "center" },
  avatarText: { color: c.white, fontWeight: "700" },
});
