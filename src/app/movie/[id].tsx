import { useRef, useState } from 'react';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import { useSession } from '@/context/Session';
import { useMovies } from '@/context/Movies';
import { deleteMovie, movieError, saveMovie } from '@/api/movies';
import { MovieForm } from '@/components/MovieForm';
import { FavoriteButton } from '@/components/FavoriteButton';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Button, Busy, Page, styles } from '@/components/ui';

export default function Detail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, loading: sessionLoading } = useSession();
  const { movies, loading, error: loadError, retry } = useMovies();
  const [edit, setEdit] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [transition, setTransition] = useState(false);
  const pending = useRef(false);
  if (sessionLoading) return <Busy />;
  if (!user) return <Redirect href="/" />;
  if (loading) return <Busy />;
  const movie = movies.find(m => m.id === id);
  async function remove() {
    if (!movie || pending.current) return;
    pending.current = true; setBusy(true); setError('');
    try { setTransition(true); await deleteMovie(movie.id); router.replace('/list'); }
    catch (e) { setTransition(false); setError(movieError(e)); }
    finally { pending.current = false; setBusy(false); setConfirm(false); }
  }
  if (loadError) return <Page><Text style={styles.error}>{loadError}</Text><Button label="Retry" onPress={retry} /><Button label="Back to List" secondary onPress={() => router.replace('/list')} /></Page>;
  if (!movie) return transition ? <Busy /> : <Page><Text style={styles.heading}>Movie not found</Text><Button label="Back to List" onPress={() => router.replace('/list')} /></Page>;
  return <Page testID="detail-screen">
    <Button label="Back to List" secondary disabled={busy} onPress={() => router.replace('/list')} />
    <Text style={styles.muted}>CINELIST / MOVIE DETAILS</Text>
    {edit ? <MovieForm key={movie.id} movie={movie} onCancel={() => setEdit(false)} onSave={async values => {
      setTransition(true);
      try {
        const nextId = await saveMovie(user.uid, values, movie);
        setEdit(false); setSaved(true);
        if (nextId !== id) router.replace({ pathname: '/movie/[id]', params: { id: nextId } });
      } finally { setTransition(false); }
    }} /> : <>
      <View style={styles.card}>
        <Text style={styles.title}>{movie.title}</Text><Text style={styles.text}>Directed by {movie.director}</Text>
        <View style={styles.row}><Text style={styles.badge}>{movie.genre}</Text><Text style={styles.badge}>{movie.status}</Text></View>
        <Text style={styles.label}>Rating</Text><Text style={styles.text}>{movie.rating === undefined ? 'Not rated' : `${movie.rating} / 5`}</Text>
        <Text style={styles.label}>Notes</Text><Text style={styles.text}>{movie.notes || 'No notes yet.'}</Text>
        <View style={styles.row}><FavoriteButton movie={movie} onError={setError} /><Text style={styles.muted}>{movie.favorite ? 'In your favorites' : 'Add to favorites'}</Text></View>
      </View>
      {saved ? <Text testID="movie-saved" style={styles.success}>Changes saved</Text> : null}
      <Button label="Edit" testID="edit-movie" onPress={() => { setEdit(true); setSaved(false); setError(''); }} />
      <Button label="Delete" testID="delete-movie" secondary onPress={() => setConfirm(true)} />
    </>}
    {error ? <Text testID="error-movie" style={styles.error}>{error}</Text> : null}
    <ConfirmDialog visible={confirm} busy={busy} title="Delete this movie?" message={`“${movie.title}” will be removed from your watchlist.`} confirmLabel="Delete movie" onConfirm={remove} onCancel={() => setConfirm(false)} />
  </Page>;
}
