import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MoviesProvider } from '@/context/Movies';
import { SessionProvider } from '@/context/Session';
export default function Layout() {
  return <SafeAreaProvider><SessionProvider><MoviesProvider><StatusBar style="dark" /><Stack screenOptions={{ headerShown: false }} /></MoviesProvider></SessionProvider></SafeAreaProvider>;
}
