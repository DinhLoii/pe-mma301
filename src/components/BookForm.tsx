import { useState } from 'react';
import { Text, View } from 'react-native';
import { BookValues, emptyBook, GENRES, STATUSES, validateBook } from '@/domain/books';
import { errorMessage } from '@/domain/auth';
import { Button, Field, Select, styles } from './ui';

export function BookForm({ initial = emptyBook, onSave, onCancel, edit = false }: { initial?: BookValues; onSave: (v: BookValues) => Promise<unknown>; onCancel?: () => void; edit?: boolean }) {
  const [values, setValues] = useState<BookValues>(initial);
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const errors = submitted ? validateBook(values) : {};
  function change(key: keyof BookValues, value: string) { setValues(v => ({ ...v, [key]: value })); setSuccess(''); setError(''); }
  async function submit() {
    setSubmitted(true); setSuccess(''); setError('');
    if (Object.keys(validateBook(values)).length) return;
    setBusy(true);
    try { await onSave(values); if (!edit) { setValues({ ...emptyBook }); setSubmitted(false); setSuccess('Book added'); } }
    catch (e) { setError(errorMessage(e)); }
    finally { setBusy(false); }
  }
  return <View testID="book-form" style={styles.card}>
    <Text style={styles.heading}>{edit ? 'Edit book' : 'Add a book'}</Text>
    <Field label="Title" testID="title" value={values.title} onChangeText={v => change('title', v)} error={errors.title} />
    <Field label="Author" testID="author" value={values.author} onChangeText={v => change('author', v)} error={errors.author} />
    <Select label="Genre" testID="genre" value={values.genre} options={['', ...GENRES]} onChange={v => change('genre', v)} error={errors.genre} />
    <Select label="Status" testID="status" value={values.status} options={['', ...STATUSES]} onChange={v => change('status', v)} error={errors.status} />
    <Field label="Rating (optional, 0–5)" testID="rating" value={values.rating} onChangeText={v => change('rating', v)} keyboardType="numeric" error={errors.rating} />
    <Field label="Notes (optional)" testID="notes" value={values.notes} onChangeText={v => change('notes', v)} multiline error={errors.notes} />
    {error ? <Text testID="error-book" style={styles.error}>{error}</Text> : null}
    {success ? <Text testID="book-success" style={styles.success}>{success}</Text> : null}
    <Button label={busy ? 'Saving…' : edit ? 'Save' : 'Add Book'} testID={edit ? 'save-book' : 'add-book'} onPress={submit} disabled={busy} />
    {onCancel ? <Button label="Cancel" secondary onPress={onCancel} disabled={busy} /> : null}
  </View>;
}
