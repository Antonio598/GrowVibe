import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../src/lib/apiClient";
import { useAuth } from "../../src/store/auth";
import { theme } from "../../constants/theme";
import { Card } from "../../src/components/ui";

const c = theme.colors;

function Stat({ label, value, icon, tint }: { label: string; value: string | number; icon: keyof typeof Ionicons.glyphMap; tint: string }) {
  return (
    <Card style={styles.stat}>
      <View style={styles.statHead}>
        <Text style={styles.statLabel}>{label}</Text>
        <View style={[styles.statIcon, { backgroundColor: tint + "22" }]}>
          <Ionicons name={icon} size={16} color={tint} />
        </View>
      </View>
      <Text style={styles.statValue}>{value}</Text>
    </Card>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const tasks = useQuery({ queryKey: ["tasks", "pending"], queryFn: () => api.tasks.list("?status=pending") });
  const summary = useQuery({ queryKey: ["finance", "summary"], queryFn: () => api.finance.summary() });
  const notifications = useQuery({ queryKey: ["notifications", "unread"], queryFn: () => api.notifications.list("?read=false") });
  const groups = useQuery({ queryKey: ["groups"], queryFn: () => api.groups.list() });
  const money = (n: number) => n.toLocaleString("es-MX", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  return (
    <ScrollView style={{ backgroundColor: c.canvas }} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={styles.logo}><Ionicons name="leaf" size={20} color={c.white} /></View>
        <View>
          <Text style={styles.hi}>Hola, {user?.name?.split(" ")[0]}</Text>
          <Text style={styles.muted}>Tu pulso de hoy</Text>
        </View>
      </View>
      <View style={styles.grid}>
        <Stat label="Tareas" value={tasks.data?.length ?? "…"} icon="checkbox-outline" tint={c.primary} />
        <Stat label="Balance" value={summary.data ? money(summary.data.balance) : "…"} icon="wallet-outline" tint={c.limeDark} />
        <Stat label="Sin leer" value={notifications.data?.total ?? "…"} icon="notifications-outline" tint={c.coral} />
        <Stat label="Grupos" value={groups.data?.length ?? "…"} icon="people-outline" tint={c.gold} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 14 },
  header: { flexDirection: "row", alignItems: "center", gap: 12 },
  logo: { width: 44, height: 44, borderRadius: 14, backgroundColor: c.primary, alignItems: "center", justifyContent: "center" },
  hi: { fontSize: 22, fontWeight: "700", color: c.ink },
  muted: { fontSize: 13, color: c.muted },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  stat: { width: "47%", flexGrow: 1, gap: 10 },
  statHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  statLabel: { fontSize: 13, color: c.muted, fontWeight: "500" },
  statIcon: { width: 30, height: 30, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  statValue: { fontSize: 24, fontWeight: "700", color: c.ink },
});
