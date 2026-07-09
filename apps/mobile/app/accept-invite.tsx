import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../src/store/auth';
import { theme } from '../constants/theme';
import { Button, Input } from '../src/components/ui';

const c = theme.colors;

export default function AcceptInviteScreen() {
  const { acceptInvite } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string }>();
  const [token, setToken] = useState(params.token ?? '');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setError(null);
    setLoading(true);
    try {
      await acceptInvite(token, name, password);
      router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al aceptar la invitación');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Únete a GrowVibe</Text>
      <View style={styles.form}>
        <Input placeholder="Token" value={token} onChangeText={setToken} autoCapitalize="none" />
        <Input placeholder="Nombre" value={name} onChangeText={setName} />
        <Input placeholder="Contraseña" secureTextEntry value={password} onChangeText={setPassword} />
        {error && <Text style={styles.error}>{error}</Text>}
        <Button title={loading ? 'Creando…' : 'Crear cuenta'} onPress={onSubmit} disabled={loading} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: c.canvas },
  title: { fontSize: 24, fontWeight: '700', color: c.ink, marginBottom: 20, textAlign: 'center' },
  form: { gap: 12 },
  error: { color: c.coral, fontSize: 13 },
});
