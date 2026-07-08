import { ScrollView, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';

import { Text, View } from '@/components/Themed';
import { api } from '../../src/lib/apiClient';

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={styles.cardValue}>{value}</Text>
    </View>
  );
}

export default function DashboardScreen() {
  const tasks = useQuery({ queryKey: ['tasks', 'pending'], queryFn: () => api.tasks.list('?status=pending') });
  const summary = useQuery({ queryKey: ['finance', 'summary'], queryFn: () => api.finance.summary() });
  const notifications = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: () => api.notifications.list('?read=false'),
  });
  const groups = useQuery({ queryKey: ['groups'], queryFn: () => api.groups.list() });
  const fitnessLogs = useQuery({ queryKey: ['fitness', 'logs'], queryFn: () => api.fitness.logs() });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <StatCard label="Tareas pendientes" value={tasks.data?.length ?? '…'} />
      <StatCard
        label="Balance del mes"
        value={summary.data ? `$${summary.data.balance.toFixed(2)}` : '…'}
      />
      <StatCard label="Grupos colaborativos" value={groups.data?.length ?? '…'} />
      <StatCard label="Notificaciones sin leer" value={notifications.data?.total ?? '…'} />
      <StatCard label="Registros de fitness" value={fitnessLogs.data?.length ?? '…'} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  card: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, padding: 14 },
  cardLabel: { fontSize: 12, opacity: 0.6, marginBottom: 4 },
  cardValue: { fontSize: 20, fontWeight: '600' },
});
