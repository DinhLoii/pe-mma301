import { Redirect, router } from 'expo-router';
import { Text, View } from 'react-native';
import { useSession } from '@/context/Session';
import { configured } from '@/config/firebase';
import { Button, Busy, Page, styles } from '@/components/ui';
export default function Home() {
  const { user, loading } = useSession();
  if (loading) return <Busy />;
  if (user) return <Redirect href="/list" />;
  return <Page><View style={styles.row}><Text style={[styles.heading, { flex: 1 }]}>BookShelf</Text><Button label="Login" onPress={() => router.push('/login')} secondary /><Button label="Register" onPress={() => router.push('/register')} /></View><Text style={styles.muted}>YOUR NEXT CHAPTER STARTS HERE</Text><Text testID="home-title" style={[styles.title, { fontSize: 42 }]}>BookShelf</Text><Text style={styles.text}>A quiet home for the books you own, the stories you love, and everything you want to read next.</Text>{!configured ? <Text style={styles.error}>Firebase configuration is missing. Fill in .env and restart Expo.</Text> : null}{[['Track your books', 'Keep your personal library in one private place.'], ['Sort by status', 'From To Read to Finished, see your reading journey.'], ['Rate your favorites', 'Star the books you love and keep your own notes.']].map(([title, body]) => <View key={title} style={styles.card}><Text style={styles.heading}>{title}</Text><Text style={styles.muted}>{body}</Text></View>)}</Page>;
}
