import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/store/auth';
import { theme } from '../constants/theme';
import { Button, Input } from '../src/components/ui';

const c = theme.colors;

export default function LoginScreen() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.logo}><Ionicons name="leaf" size={30} color={c.white} /></View>
      <Text style={styles.title}>GrowVibe</Text>
      <Text style={styles.subtitle}>Tu vida, en orden y creciendo.</Text>
      <View style={styles.form}>
        <Input placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
        <Input placeholder="Contraseña" secureTextEntry value={password} onChangeText={setPassword} />
        {error && <Text style={styles.error}>{error}</Text>}
        <Button title={loading ? 'Ingresando…' : 'Ingresar'} onPress={onSubmit} disabled={loading} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: c.canvas },
  logo: { width: 60, height: 60, borderRadius: 18, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  title: { fontSize: 26, fontWeight: '700', color: c.ink },
  subtitle: { fontSize: 14, color: c.muted, marginBottom: 24 },
  form: { width: '100%', maxWidth: 340, gap: 12 },
  error: { color: c.coral, fontSize: 13 },
});
