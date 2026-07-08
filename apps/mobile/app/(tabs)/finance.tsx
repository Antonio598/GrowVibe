import { FlatList, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';

import { Text, View } from '@/components/Themed';
import { api } from '../../src/lib/apiClient';

export default function FinanceScreen() {
  const { data: transactions } = useQuery({
    queryKey: ['finance', 'transactions'],
    queryFn: () => api.finance.transactions(),
  });
  const { data: summary } = useQuery({ queryKey: ['finance', 'summary'], queryFn: () => api.finance.summary() });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Finanzas</Text>
      {summary && (
        <Text style={styles.summary}>
          Balance: ${summary.balance.toFixed(2)} (+${summary.totalIncome.toFixed(2)} / -$
          {summary.totalExpense.toFixed(2)})
        </Text>
      )}
      <FlatList
        data={transactions ?? []}
        keyExtractor={(t) => t.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text>{item.note || '(sin nota)'}</Text>
            <Text style={item.type === 'income' ? styles.income : styles.expense}>
              {item.type === 'income' ? '+' : '-'}${item.amount.toFixed(2)}
            </Text>
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
  income: { color: '#059669', fontWeight: '600' },
  expense: { color: '#dc2626', fontWeight: '600' },
});
