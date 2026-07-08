import { useState } from 'react';
import { FlatList, StyleSheet, TextInput, Pressable } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { Text, View } from '@/components/Themed';
import { api } from '../../src/lib/apiClient';

export default function GroupsScreen() {
  const queryClient = useQueryClient();
  const { data: groups } = useQuery({ queryKey: ['groups'], queryFn: () => api.groups.list() });
  const [name, setName] = useState('');

  const createGroup = useMutation({
    mutationFn: () => api.groups.create(name),
    onSuccess: () => {
      setName('');
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Colaborativo</Text>
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="Nombre del grupo..."
          value={name}
          onChangeText={setName}
        />
        <Pressable style={styles.button} onPress={() => name.trim() && createGroup.mutate()}>
          <Text style={styles.buttonText}>+</Text>
        </Pressable>
      </View>
      <FlatList
        data={groups ?? []}
        keyExtractor={(g) => g.id}
        renderItem={({ item }) => (
          <View style={styles.groupRow}>
            <Text>{item.name}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  title: { fontSize: 22, fontWeight: '700' },
  row: { flexDirection: 'row', gap: 8 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10 },
  button: { backgroundColor: '#111827', borderRadius: 8, paddingHorizontal: 16, justifyContent: 'center' },
  buttonText: { color: '#fff', fontWeight: '700' },
  groupRow: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
});
