import { FlatList, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';

import { Text, View } from '@/components/Themed';
import { api } from '../../src/lib/apiClient';

export default function FitnessScreen() {
  const { data: logs } = useQuery({ queryKey: ['fitness', 'logs'], queryFn: () => api.fitness.logs() });
  const { data: latestPlan } = useQuery({
    queryKey: ['fitness', 'diet-plan', 'latest'],
    queryFn: () => api.fitness.latestDietPlan(),
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Salud y Físico</Text>
      {latestPlan && (
        <Text style={styles.summary}>
          Objetivo diario: {latestPlan.targetCalories} kcal (TDEE {latestPlan.tdee})
        </Text>
      )}
      <FlatList
        data={logs ?? []}
        keyExtractor={(l) => l.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text>{new Date(item.date).toLocaleDateString()}</Text>
            <Text>{item.weightKg ?? '—'} kg</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  title: { fontSize: 22, fontWeight: '700' },
  summary: { fontSize: 14, opacity: 0.8 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});
