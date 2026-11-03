import { PropsWithChildren, ReactNode, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export const colors = { ink: '#252520', muted: '#716d64', accent: '#a8442a', paper: '#f6f3ec', border: '#e2ddd2', danger: '#a72e30' };
export const styles = StyleSheet.create({
  kicker: { fontSize: 10, lineHeight: 15, fontWeight: '700', letterSpacing: 1.7, color: '#967a5c' },
  brand: { fontSize: 24, fontWeight: '800', letterSpacing: -1, color: '#252520' },
  hero: { backgroundColor: '#292d29', borderRadius: 22, padding: 26, gap: 12 },
  eyebrow: { fontSize: 11, letterSpacing: 2, fontWeight: '700', color: '#eab99b' },
  heroTitle: { fontSize: 37, lineHeight: 43, letterSpacing: -1.5, fontWeight: '700', color: '#fff9ef' },
  heroText: { fontSize: 16, lineHeight: 25, color: '#d5d7ce' },
  badge: { overflow: 'hidden', borderRadius: 7, backgroundColor: '#f1e7db', color: '#74402b', paddingHorizontal: 10, paddingVertical: 6, fontSize: 12, fontWeight: '600' },
  stat: { flex: 1, paddingVertical: 10 },
  statNumber: { fontSize: 32, fontWeight: '700', color: '#a8442a' },
  page: { flex: 1, backgroundColor: colors.paper },
  content: { width: '100%', maxWidth: 640, alignSelf: 'center', padding: 20, gap: 18, paddingBottom: 60 },
  title: { fontSize: 30, fontWeight: '700', color: colors.ink },
  heading: { fontSize: 21, fontWeight: '700', color: colors.ink },
  text: { fontSize: 16, lineHeight: 24, color: colors.ink },
  muted: { fontSize: 14, lineHeight: 22, color: colors.muted },
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 10 },
  card: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: 20, padding: 18, gap: 12, boxShadow: '0px 3px 12px rgba(35, 30, 20, 0.035)' },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, backgroundColor: '#fff', padding: 13, minHeight: 48, color: colors.ink, fontSize: 16 },
  label: { fontSize: 14, fontWeight: '600', color: colors.ink },
  error: { fontSize: 14, color: colors.danger, lineHeight: 21 },
  success: { fontSize: 15, color: colors.accent, fontWeight: '600' },
});
export function Page({ children, testID }: PropsWithChildren<{ testID?: string }>) {
  return <SafeAreaView style={styles.page}><KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScrollView testID={testID} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>{children}</ScrollView></KeyboardAvoidingView></SafeAreaView>;
}
export function Button({ label, onPress, disabled, secondary, testID }: { label: string; onPress: () => void; disabled?: boolean; secondary?: boolean; testID?: string }) {
  return <Pressable testID={testID} accessibilityRole="button" accessibilityLabel={label} disabled={disabled} onPress={onPress} style={({ pressed }) => ({ backgroundColor: secondary ? '#ede9df' : colors.accent, opacity: disabled ? 0.5 : pressed ? 0.75 : 1, paddingVertical: 13, paddingHorizontal: 17, borderRadius: 12, minHeight: 48, justifyContent: 'center' })}><Text style={{ color: secondary ? colors.ink : '#fff', fontWeight: '600', textAlign: 'center', fontSize: 15 }}>{label}</Text></Pressable>;
}
export function Field({ label, error, testID, labelAction, ...props }: TextInputProps & { label: string; error?: string; labelAction?: ReactNode }) {
  return <View style={{ gap: 6 }}><View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}><Text style={styles.label}>{label}</Text>{labelAction}</View><TextInput {...props} testID={testID} accessibilityLabel={label} style={[styles.input, props.multiline && { minHeight: 90, textAlignVertical: 'top' }]} placeholderTextColor={colors.muted} />{error ? <Text testID={`error-${testID}`} accessibilityLiveRegion="polite" style={styles.error}>{error}</Text> : null}</View>;
}
export function Select({ label, value, options, onChange, error, testID, disabled }: { label: string; value: string; options: readonly string[]; onChange: (v: string) => void; error?: string; testID: string; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  return <View style={{ gap: 6 }}><Text style={styles.label}>{label}</Text><Pressable testID={testID} accessibilityRole="button" accessibilityLabel={`${label}: ${value || `Choose ${label.toLowerCase()}`}`} disabled={disabled} style={[styles.input, disabled && { opacity: 0.5 }]} onPress={() => setOpen(true)}><View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}><Text style={[styles.text, { flex: 1 }]}>{value || `Choose ${label.toLowerCase()}`}</Text><Ionicons name="chevron-down" size={18} color={colors.muted} /></View></Pressable>{error ? <Text testID={`error-${testID}`} accessibilityLiveRegion="polite" style={styles.error}>{error}</Text> : null}<Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}><View style={{ flex: 1, backgroundColor: '#0007', justifyContent: 'center', padding: 24 }}><View style={styles.card}><Text style={styles.heading}>{label}</Text><ScrollView>{options.map(option => <Pressable key={option} accessibilityRole="button" accessibilityLabel={option || `Choose ${label.toLowerCase()}`} onPress={() => { onChange(option); setOpen(false); }} style={{ paddingVertical: 14 }}><Text style={styles.text}>{option || `Choose ${label.toLowerCase()}`}</Text></Pressable>)}</ScrollView><Button label="Close" secondary onPress={() => setOpen(false)} /></View></View></Modal></View>;
}
export function Busy() { return <SafeAreaView style={[styles.page, { justifyContent: 'center', alignItems: 'center' }]}><ActivityIndicator accessibilityLabel="Loading" color={colors.accent} size="large" /></SafeAreaView>; }
