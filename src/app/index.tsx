import { Redirect, router } from 'expo-router';
import { Text, View } from 'react-native';
import { useSession } from '@/context/Session';
import { configured } from '@/config/firebase';
import { Button, Busy, Page, styles } from '@/components/ui';

export default function Home() {
  const { user, loading, error } = useSession();
  if (loading) return <Busy />;
  if (user) return <Redirect href="/workspace" />;
  return (
    <Page>
      <Text testID="home-title" style={styles.title}>PE Starter</Text>
      <Text style={styles.text}>Welcome. Sign in or create an account to get started.</Text>
      {!configured ? <Text style={styles.error}>Fill in Firebase configuration in .env, then restart Expo.</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.row}>
        <Button label="Login" onPress={() => router.push('/login')} />
        <Button label="Register" secondary onPress={() => router.push('/register')} />
      </View>
    </Page>
  );
}
