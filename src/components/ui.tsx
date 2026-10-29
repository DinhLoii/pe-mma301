import { PropsWithChildren, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const colors = { ink: '#192b2a', muted: '#5b6d66', accent: '#246653', paper: '#f6f5ee', border: '#d5ded5', danger: '#a72e30' };
export const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.paper },
  content: { width: '100%', maxWidth: 640, alignSelf: 'center', padding: 20, gap: 18, paddingBottom: 60 },
  title: { fontSize: 30, fontWeight: '700', color: colors.ink },
  heading: { fontSize: 21, fontWeight: '700', color: colors.ink },
  text: { fontSize: 16, lineHeight: 24, color: colors.ink },
  muted: { fontSize: 14, lineHeight: 22, color: colors.muted },
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 10 },
  card: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 18, gap: 12 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, backgroundColor: '#fff', padding: 13, minHeight: 48, color: colors.ink, fontSize: 16 },
  label: { fontSize: 14, fontWeight: '600', color: colors.ink },
  error: { fontSize: 14, color: colors.danger, lineHeight: 21 },
  success: { fontSize: 15, color: colors.accent, fontWeight: '600' },
});
export function Page({ children, testID }: PropsWithChildren<{ testID?: string }>) {
  return <SafeAreaView style={styles.page}><KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScrollView testID={testID} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>{children}</ScrollView></KeyboardAvoidingView></SafeAreaView>;
}
export function Button({ label, onPress, disabled, secondary, testID }: { label: string; onPress: () => void; disabled?: boolean; secondary?: boolean; testID?: string }) {
  return <Pressable testID={testID} accessibilityRole="button" accessibilityLabel={label} disabled={disabled} onPress={onPress} style={({ pressed }) => ({ backgroundColor: secondary ? '#e8eee7' : colors.accent, opacity: disabled ? 0.5 : pressed ? 0.75 : 1, paddingVertical: 13, paddingHorizontal: 17, borderRadius: 10, minHeight: 48, justifyContent: 'center' })}><Text style={{ color: secondary ? colors.ink : '#fff', fontWeight: '600', textAlign: 'center', fontSize: 15 }}>{label}</Text></Pressable>;
}
export function Field({ label, error, testID, ...props }: TextInputProps & { label: string; error?: string }) {
  return <View style={{ gap: 6 }}><Text style={styles.label}>{label}</Text><TextInput {...props} testID={testID} accessibilityLabel={label} style={[styles.input, props.multiline && { minHeight: 90, textAlignVertical: 'top' }]} placeholderTextColor={colors.muted} />{error ? <Text testID={`error-${testID}`} style={styles.error}>{error}</Text> : null}</View>;
}
export function Select({ label, value, options, onChange, error, testID }: { label: string; value: string; options: readonly string[]; onChange: (v: string) => void; error?: string; testID: string }) {
  const [open, setOpen] = useState(false);
  return <View style={{ gap: 6 }}><Text style={styles.label}>{label}</Text><Pressable testID={testID} accessibilityRole="button" accessibilityLabel={`${label}: ${value || `Choose ${label.toLowerCase()}`}`} style={styles.input} onPress={() => setOpen(true)}><Text style={styles.text}>{value || `Choose ${label.toLowerCase()}`} ▾</Text></Pressable>{error ? <Text testID={`error-${testID}`} style={styles.error}>{error}</Text> : null}<Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}><View style={{ flex: 1, backgroundColor: '#0007', justifyContent: 'center', padding: 24 }}><View style={styles.card}><Text style={styles.heading}>{label}</Text><ScrollView>{options.map(option => <Pressable key={option} accessibilityRole="button" accessibilityLabel={option || `Choose ${label.toLowerCase()}`} onPress={() => { onChange(option); setOpen(false); }} style={{ paddingVertical: 14 }}><Text style={styles.text}>{option || `Choose ${label.toLowerCase()}`}</Text></Pressable>)}</ScrollView><Button label="Close" secondary onPress={() => setOpen(false)} /></View></View></Modal></View>;
}
export function Busy() { return <SafeAreaView style={[styles.page, { justifyContent: 'center', alignItems: 'center' }]}><ActivityIndicator accessibilityLabel="Loading" color={colors.accent} size="large" /></SafeAreaView>; }
