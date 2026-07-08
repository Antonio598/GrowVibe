import { useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useAuth } from '../../src/store/auth';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tint,
        headerShown: useClientOnlyValue(false, true),
      }}>
      <Tabs.Screen name="index" options={{ title: 'Dashboard' }} />
      <Tabs.Screen name="tasks" options={{ title: 'Tareas' }} />
      <Tabs.Screen name="finance" options={{ title: 'Finanzas' }} />
      <Tabs.Screen name="groups" options={{ title: 'Grupos' }} />
      <Tabs.Screen name="notifications" options={{ title: 'Alertas' }} />
      <Tabs.Screen name="fitness" options={{ title: 'Salud' }} />
    </Tabs>
  );
}
