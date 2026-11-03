import { Redirect, router } from 'expo-router';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSession } from '@/context/Session';
import { configured } from '@/config/firebase';
import { Button, Busy, Page, colors, styles } from '@/components/ui';

export default function Home() {
  const { user, loading, error } = useSession();
  if (loading) return <Busy />;
  if (user) return <Redirect href="/list" />;
  return <Page>
    <View style={[styles.row, { justifyContent: 'space-between' }]}>
      <Text style={styles.brand}>CineList</Text>
      <View style={styles.row}><Button label="Login" onPress={() => router.push('/login')} /><Button label="Register" secondary onPress={() => router.push('/register')} /></View>
    </View>
    <View style={styles.hero}>
      <Text style={styles.eyebrow}>YOUR OWN LITTLE CINEMA</Text>
      <Text testID="home-title" style={styles.heroTitle}>CineList</Text>
      <Text style={styles.heroText}>Good films stay with you. Keep the ones you want to watch, and remember the ones you loved.</Text>
    </View>
    {([
      ['film-outline', 'Track what you watch', 'One private place for every film on your mind.'],
      ['albums-outline', 'Sort by status', 'From Plan to Watch to Watched, follow your own pace.'],
      ['star-outline', 'Rate your favorites', 'Save a star, leave a note, remember a great story.'],
    ] as const).map(([icon, title, text]) => <View key={title} style={styles.card}>
      <Ionicons name={icon} size={27} color={colors.accent} /><Text style={styles.heading}>{title}</Text><Text style={styles.muted}>{text}</Text>
    </View>)}
    {!configured ? <Text style={styles.error}>Fill in Firebase configuration in .env, then restart Expo.</Text> : null}
    {error ? <Text style={styles.error}>{error}</Text> : null}
  </Page>;
}
