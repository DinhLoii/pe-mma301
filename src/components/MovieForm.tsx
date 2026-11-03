import { useRef, useState } from 'react';
import { Keyboard, Text, View } from 'react-native';
import { GENRES, STATUSES, Movie, MovieValues, emptyMovie, movieValues, validateMovie } from '@/domain/movies';
import { movieError } from '@/api/movies';
import { Button, Field, Select, styles } from './ui';

export function MovieForm({ movie, onSave, onCancel }: { movie?: Movie; onSave: (values: MovieValues) => Promise<void>; onCancel?: () => void }) {
  const [values, setValues] = useState<MovieValues>(() => movie ? movieValues(movie) : emptyMovie());
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const pending = useRef(false);
  const errors = submitted ? validateMovie(values) : {};
  function change(key: keyof MovieValues, value: string) { setValues(v => ({ ...v, [key]: value })); setError(''); setSuccess(false); }
  async function submit() {
    if (pending.current) return;
    setSubmitted(true); setError(''); setSuccess(false);
    if (Object.keys(validateMovie(values)).length) return;
    Keyboard.dismiss(); pending.current = true; setBusy(true);
    try {
      await onSave(values);
      if (!movie) { setValues(emptyMovie()); setSubmitted(false); setSuccess(true); }
    } catch (e) { setError(movieError(e)); }
    finally { pending.current = false; setBusy(false); }
  }
  return <View testID="movie-form" style={styles.card}>
    <Text style={styles.heading}>{movie ? 'Edit movie' : 'Add a movie'}</Text>
    <Text style={styles.muted}>{movie ? 'Update the details in your collection.' : 'Something worth watching? Keep it here.'}</Text>
    <Field testID="title" label="Title" value={values.title} onChangeText={v => change('title', v)} editable={!busy} error={errors.title} placeholder="Movie title" />
    <Field testID="director" label="Director" value={values.director} onChangeText={v => change('director', v)} editable={!busy} error={errors.director} placeholder="Directed by" />
    <Select testID="genre" label="Genre" value={values.genre} options={['', ...GENRES]} onChange={v => change('genre', v)} error={errors.genre} disabled={busy} />
    <Select testID="status" label="Status" value={values.status} options={['', ...STATUSES]} onChange={v => change('status', v)} error={errors.status} disabled={busy} />
    <Field testID="rating" label="Rating (optional, 0–5)" value={values.rating} onChangeText={v => change('rating', v)} editable={!busy} error={errors.rating} keyboardType="numeric" placeholder="Not rated" />
    <Field testID="notes" label="Notes (optional)" value={values.notes} onChangeText={v => change('notes', v)} editable={!busy} error={errors.notes} multiline placeholder="A thought, a recommendation, a reason to watch…" />
    {error ? <Text testID="error-movie" accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
    {success ? <Text testID="movie-success" accessibilityLiveRegion="polite" style={styles.success}>Movie added</Text> : null}
    <Button testID={movie ? 'save-movie' : 'add-movie'} label={busy ? 'Saving…' : movie ? 'Save' : 'Add Movie'} disabled={busy} onPress={submit} />
    {onCancel ? <Button label="Cancel" secondary disabled={busy} onPress={onCancel} /> : null}
  </View>;
}
