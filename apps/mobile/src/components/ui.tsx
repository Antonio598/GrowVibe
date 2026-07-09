import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Modal as RNModal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
  type ViewProps,
} from "react-native";
import { theme } from "../../constants/theme";

const c = theme.colors;

export function Card({ style, ...props }: ViewProps) {
  return <View style={[styles.card, style]} {...props} />;
}

export function Screen({ children }: { children: ReactNode }) {
  return <View style={styles.screen}>{children}</View>;
}

export function H1({ children }: { children: ReactNode }) {
  return <Text style={styles.h1}>{children}</Text>;
}

export function Muted({ children, style }: { children: ReactNode; style?: object }) {
  return <Text style={[styles.muted, style]}>{children}</Text>;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  disabled,
}: {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger" | "lime";
  disabled?: boolean;
}) {
  const bg = variant === "primary" ? c.primary : variant === "danger" ? c.coral : variant === "lime" ? c.lime : c.surface;
  const fg = variant === "secondary" ? c.ink : variant === "lime" ? c.ink : c.white;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: bg, opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
        variant === "secondary" && { borderWidth: 1, borderColor: c.line },
      ]}
    >
      <Text style={[styles.btnText, { color: fg }]}>{title}</Text>
    </Pressable>
  );
}

export function Input(props: TextInputProps) {
  return <TextInput placeholderTextColor={c.muted} style={styles.input} {...props} />;
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "primary" | "coral" | "gold" | "lime" }) {
  const map = {
    neutral: { bg: c.line, fg: c.muted },
    primary: { bg: c.primarySoft, fg: c.primaryDark },
    coral: { bg: c.coralSoft, fg: c.coral },
    gold: { bg: "#F7ECD3", fg: c.gold },
    lime: { bg: "#EEF7D6", fg: c.limeDark },
  }[tone];
  return (
    <View style={[styles.badge, { backgroundColor: map.bg }]}>
      <Text style={[styles.badgeText, { color: map.fg }]}>{children}</Text>
    </View>
  );
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${Math.max(0, Math.min(100, value))}%` }]} />
    </View>
  );
}

export function Loading() {
  return (
    <View style={styles.center}>
      <ActivityIndicator color={c.primary} />
    </View>
  );
}

export function Empty({ title, hint }: { title: string; hint?: string }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>{title}</Text>
      {hint && <Text style={styles.muted}>{hint}</Text>}
    </View>
  );
}

export function Sheet({ visible, onClose, title, children }: { visible: boolean; onClose: () => void; title: string; children: ReactNode }) {
  return (
    <RNModal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.sheetHandle} />
        <Text style={styles.sheetTitle}>{title}</Text>
        {children}
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.canvas },
  card: { backgroundColor: c.surface, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: c.line, padding: 14 },
  h1: { fontSize: 26, fontWeight: "700", color: c.ink },
  muted: { fontSize: 13, color: c.muted },
  btn: { height: 46, borderRadius: theme.radius.md, alignItems: "center", justifyContent: "center", paddingHorizontal: 18 },
  btnText: { fontSize: 15, fontWeight: "600" },
  input: {
    height: 46, borderRadius: theme.radius.md, borderWidth: 1, borderColor: c.line, backgroundColor: c.surface,
    paddingHorizontal: 14, fontSize: 15, color: c.ink,
  },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: theme.radius.full, alignSelf: "flex-start" },
  badgeText: { fontSize: 11, fontWeight: "600" },
  progressTrack: { height: 8, borderRadius: theme.radius.full, backgroundColor: c.line, overflow: "hidden" },
  progressFill: { height: 8, borderRadius: theme.radius.full, backgroundColor: c.primary },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  empty: { alignItems: "center", padding: 32, gap: 4 },
  emptyTitle: { fontSize: 15, fontWeight: "600", color: c.ink },
  backdrop: { flex: 1, backgroundColor: "rgba(23,36,31,0.35)" },
  sheet: { backgroundColor: c.surface, borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 20, paddingBottom: 36, gap: 12, maxHeight: "85%" },
  sheetHandle: { alignSelf: "center", width: 40, height: 4, borderRadius: 2, backgroundColor: c.line, marginBottom: 6 },
  sheetTitle: { fontSize: 18, fontWeight: "700", color: c.ink },
});
