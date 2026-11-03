import { useRef, useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { Redirect, router } from 'expo-router';
import { Keyboard, Text, View } from 'react-native';
import { auth } from '@/config/firebase';
import { useSession } from '@/context/Session';
import { AuthValues, errorMessage, validateAuth } from '@/domain/auth';
import { PasswordField } from './PasswordField';
import { Button, Busy, Field, Page, styles } from './ui';

export function AuthForm({ register = false }: { register?: boolean }) {
  const { user, loading, error: sessionError } = useSession();
  const [values, setValues] = useState<AuthValues>({ email: '', password: '', confirm: '' });
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  // A ref also blocks a second tap before React renders the disabled button.
  const pending = useRef(false);
  const errors = submitted ? validateAuth(values, register) : {};

  function change(key: keyof AuthValues, value: string) {
    setValues(v => ({ ...v, [key]: value }));
    setError('');
  }

  async function submit() {
    if (pending.current || user) return;
    setSubmitted(true);
    setError('');
    if (Object.keys(validateAuth(values, register)).length) return;
    Keyboard.dismiss();
    pending.current = true;
    setBusy(true);
    try {
      if (!auth) throw new Error('Firebase is not configured. Fill in .env and restart Expo.');
      if (register) {
        await createUserWithEmailAndPassword(auth, values.email.trim(), values.password);
        setValues(v => ({ ...v, password: '', confirm: '' }));
        setSuccess(true);
      } else {
        await signInWithEmailAndPassword(auth, values.email.trim(), values.password);
        router.replace('/list');
      }
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  if (loading) return <Busy />;
  // An existing session should never leave the user stuck on a disabled form.
  // A newly created account keeps its success screen until Continue is tapped.
  if (user && !success && !busy) return <Redirect href="/workspace" />;

  return (
    <Page testID={register ? 'register-screen' : 'login-screen'}>
      <Text style={styles.muted}>CINELIST</Text>
      <Text style={styles.title}>{register ? 'Register' : 'Login'}</Text>
      <Text style={styles.muted}>{register ? 'Create your account to get started.' : 'Welcome back. Sign in to your watchlist.'}</Text>
      {success ? (
        <View style={styles.card}>
          <Text testID="form-success" accessibilityLiveRegion="polite" style={styles.success}>Registration successful</Text>
          <Text style={styles.text}>{values.email.trim()}</Text>
          <Button testID="continue-button" label="Continue" onPress={() => router.replace('/list')} />
        </View>
      ) : (
        <View style={styles.card}>
          <Field label="Email" testID="email" value={values.email} onChangeText={v => change('email', v)}
            error={errors.email} editable={!busy} autoCapitalize="none" autoCorrect={false}
            keyboardType="email-address" autoComplete="email" placeholder="you@example.com" />
          <PasswordField label="Password" testID="password" value={values.password}
            onChangeText={v => change('password', v)} error={errors.password} editable={!busy}
            autoComplete={register ? 'new-password' : 'current-password'}
            returnKeyType={register ? 'next' : 'go'} onSubmitEditing={register ? undefined : submit} />
          {register ? <PasswordField label="Confirm password" testID="confirm-password" value={values.confirm}
            onChangeText={v => change('confirm', v)} error={errors.confirm} editable={!busy}
            autoComplete="new-password" returnKeyType="go" onSubmitEditing={submit} /> : null}
          {error || sessionError ? <Text testID="error-auth" accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>{error || sessionError}</Text> : null}
          <Button testID={register ? 'register-button' : 'login-button'}
            label={busy ? 'Please waitâ€¦' : register ? 'Register' : 'Login'} onPress={submit} disabled={busy || Boolean(user)} />
        </View>
      )}
      <Button label={user ? 'Go to List' : 'Back to Home'} secondary disabled={busy}
        onPress={() => router.replace(user ? '/list' : '/')} />
      {!user ? <Button label={register ? 'Already have an account? Login' : 'Create an account'} secondary
        disabled={busy} onPress={() => router.replace(register ? '/login' : '/register')} /> : null}
    </Page>
  );
}
