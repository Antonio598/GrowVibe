import { useState } from 'react';
import { FlatList, StyleSheet, TextInput, Pressable } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { Text, View } from '@/components/Themed';
import { api } from '../../src/lib/apiClient';
import type { Task } from 'shared';

export default function TasksScreen() {
  const queryClient = useQueryClient();
  const { data: tasks } = useQuery({ queryKey: ['tasks'], queryFn: () => api.tasks.list() });
  const [title, setTitle] = useState('');

  const createTask = useMutation({
    mutationFn: () => api.tasks.create({ title, priority: 'medium' }),
    onSuccess: () => {
      setTitle('');
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const toggleStatus = useMutation({
    mutationFn: (task: Task) => api.tasks.update(task.id, { status: task.status === 'done' ? 'pending' : 'done' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tareas</Text>
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="Nueva tarea..."
          value={title}
          onChangeText={setTitle}
        />
        <Pressable
          style={styles.button}
          onPress={() => title.trim() && createTask.mutate()}>
          <Text style={styles.buttonText}>+</Text>
        </Pressable>
      </View>
      <FlatList
        data={tasks ?? []}
        keyExtractor={(t) => t.id}
        renderItem={({ item }) => (
          <Pressable style={styles.taskRow} onPress={() => toggleStatus.mutate(item)}>
            <Text style={item.status === 'done' ? styles.taskDone : styles.taskText}>{item.title}</Text>
            <Text style={styles.taskMeta}>{item.status}</Text>
          </Pressable>
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
  taskRow: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  taskText: { fontSize: 15 },
  taskDone: { fontSize: 15, textDecorationLine: 'line-through', opacity: 0.5 },
  taskMeta: { fontSize: 12, opacity: 0.6 },
});
