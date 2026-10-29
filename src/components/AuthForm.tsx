import { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { Redirect, router } from 'expo-router';
import { Text, View } from 'react-native';
import { auth } from '@/config/firebase';
import { useSession } from '@/context/Session';
import { AuthValues, errorMessage, validateAuth } from '@/domain/auth';
import { Button, Busy, Field, Page, styles } from './ui';
export function AuthForm({ register = false }: { register?: boolean }) {
  const { user, loading } = useSession();
  const [values, setValues] = useState<AuthValues>({ email: '', password: '', confirm: '' });
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const errors = submitted ? validateAuth(values, register) : {};
  function change(key: keyof AuthValues, value: string) { setValues(v => ({ ...v, [key]: value })); setError(''); }
  async function submit() {
    setSubmitted(true); setError('');
    if (Object.keys(validateAuth(values, register)).length) return;
    setBusy(true);
    try {
      if (!auth) throw new Error('Firebase is not configured. Fill in .env and restart Expo.');
      if (register) { await createUserWithEmailAndPassword(auth, values.email.trim(), values.password); setSuccess(true); }
      else { await signInWithEmailAndPassword(auth, values.email.trim(), values.password); router.replace('/list'); }
    } catch (e) { setError(errorMessage(e)); }
    finally { setBusy(false); }
  }
  if (loading) return <Busy />;
  // Keep registration success visible for the required screenshot.
  if (user && !register) return <Redirect href="/list" />;
  return <Page><Text style={styles.muted}>BOOKSHELF</Text><Text style={styles.title}>{register ? 'Register' : 'Login'}</Text><Text style={styles.muted}>{register ? 'Create your private reading space.' : 'Welcome back to your library.'}</Text>{success ? <View style={styles.card}><Text testID="form-success" style={styles.success}>Registration successful</Text><Button label="Continue to List" onPress={() => router.replace('/list')} /></View> : <View style={styles.card}>
    <Field label="Email" testID="email" value={values.email} onChangeText={v => change('email', v)} error={errors.email} autoCapitalize="none" keyboardType="email-address" autoComplete="email" />
    <Field label="Password" testID="password" value={values.password} onChangeText={v => change('password', v)} error={errors.password} secureTextEntry />
    {register ? <Field label="Confirm password" testID="confirm-password" value={values.confirm} onChangeText={v => change('confirm', v)} error={errors.confirm} secureTextEntry /> : null}
    {error ? <Text testID="error-auth" style={styles.error}>{error}</Text> : null}
    <Button label={busy ? 'Please wait…' : register ? 'Register' : 'Login'} onPress={submit} disabled={busy || Boolean(user)} />
  </View>}<Button label={user ? 'Go to List' : 'Back to Home'} secondary onPress={() => router.replace(user ? '/list' : '/')} />{!user ? <Button label={register ? 'Already have an account? Login' : 'Create an account'} secondary onPress={() => router.replace(register ? '/login' : '/register')} /> : null}</Page>;
}
