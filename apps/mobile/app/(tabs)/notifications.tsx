import { FlatList, Pressable, StyleSheet } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { Text, View } from '@/components/Themed';
import { api } from '../../src/lib/apiClient';

export default function NotificationsScreen() {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ['notifications', 'all'], queryFn: () => api.notifications.list() });

  const markRead = useMutation({
    mutationFn: (id: string) => api.notifications.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Alertas</Text>
      <FlatList
        data={data?.data ?? []}
        keyExtractor={(n) => n.id}
        renderItem={({ item }) => (
          <Pressable style={[styles.row, !item.read && styles.unread]} onPress={() => markRead.mutate(item.id)}>
            <Text>{item.message}</Text>
            <Text style={styles.meta}>{item.type}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  title: { fontSize: 22, fontWeight: '700' },
  row: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  unread: { opacity: 1 },
  meta: { fontSize: 12, opacity: 0.6 },
});
