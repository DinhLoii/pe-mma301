import { useRef, useState } from 'react';
import { Redirect, router } from 'expo-router';
import { signOut } from 'firebase/auth';
import { Text, View } from 'react-native';
import { auth } from '@/config/firebase';
import { useSession } from '@/context/Session';
import { authErrorMessage } from '@/domain/auth';
import { Button, Busy, Page, styles } from '@/components/ui';

export default function Workspace() {
  const { user, loading } = useSession();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  if (loading) return <Busy />;
  if (!user) return <Redirect href="/" />;
  async function logout() {
    if (pending.current) return;
    pending.current = true;
    setError('');
    setBusy(true);
    try { if (auth) await signOut(auth); router.replace('/'); }
    catch (e) { setError(authErrorMessage(e)); }
    finally { pending.current = false; setBusy(false); }
  }
  return (
    <Page testID="workspace-screen">
      <Text style={styles.title}>PE Starter</Text>
      <View style={styles.card}>
        <Text style={styles.heading}>Welcome</Text>
        <Text testID="session-email" style={styles.text}>{user.email}</Text>
        <Text style={styles.muted}>Your workspace is ready.</Text>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button testID="logout-button" label={busy ? 'Signing out…' : 'Logout'} secondary disabled={busy} onPress={logout} />
    </Page>
  );
}
