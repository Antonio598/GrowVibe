import { useEffect } from "react";
import type { ColorValue } from "react-native";
import { Tabs, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../src/store/auth";
import { theme } from "../../constants/theme";

type IconName = keyof typeof Ionicons.glyphMap;

function icon(name: IconName) {
  return ({ color, size }: { color: ColorValue; size: number; focused: boolean }) => (
    <Ionicons name={name} color={color as string} size={size} />
  );
}

export default function TabLayout() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.muted,
        headerStyle: { backgroundColor: theme.colors.canvas },
        headerShadowVisible: false,
        headerTitleStyle: { color: theme.colors.ink, fontWeight: "700" },
        tabBarStyle: { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.line },
        sceneStyle: { backgroundColor: theme.colors.canvas },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Inicio", tabBarIcon: icon("leaf") }} />
      <Tabs.Screen name="tasks" options={{ title: "Tareas", tabBarIcon: icon("checkbox-outline") }} />
      <Tabs.Screen name="finance" options={{ title: "Finanzas", tabBarIcon: icon("wallet-outline") }} />
      <Tabs.Screen name="groups" options={{ title: "Grupos", tabBarIcon: icon("people-outline") }} />
      <Tabs.Screen name="notifications" options={{ title: "Alertas", tabBarIcon: icon("notifications-outline") }} />
      <Tabs.Screen name="fitness" options={{ title: "Salud", tabBarIcon: icon("heart-outline") }} />
    </Tabs>
  );
}
