import { collection, deleteDoc, doc, onSnapshot, query, runTransaction, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Movie, MovieValues, movieId, validateMovie } from '@/domain/movies';

function database() { if (!db) throw new Error('Firebase is not configured'); return db; }
export function subscribeMovies(uid: string, next: (movies: Movie[]) => void, error: (e: Error) => void) {
  return onSnapshot(query(collection(database(), 'movies'), where('userId', '==', uid)),
    snapshot => next(snapshot.docs.map(d => ({ ...d.data(), id: d.id }) as Movie)), error);
}
export async function saveMovie(uid: string, values: MovieValues, original?: Movie) {
  const validation = validateMovie(values);
  if (Object.keys(validation).length) throw new Error(Object.values(validation)[0]);
  const id = movieId(uid, values.title, values.director);
  const store = database();
  const target = doc(store, 'movies', id);
  await runTransaction(store, async tx => {
    const existing = await tx.get(target);
    const source = original ? (original.id === id ? existing : await tx.get(doc(store, 'movies', original.id))) : null;
    if (original && !source?.exists()) throw new Error('This movie no longer exists. Return to your list.');
    if (existing.exists() && (!original || original.id !== id)) throw new Error('This title and director are already in your watchlist.');
    const current = source?.data();
    const data = { id, userId: uid, title: values.title.trim(), director: values.director.trim(),
      genre: values.genre, status: values.status, notes: values.notes,
      favorite: current?.favorite ?? false, createdAt: current?.createdAt ?? serverTimestamp(),
      ...(values.rating.trim() ? { rating: Number(values.rating.trim()) } : {}) };
    tx.set(target, data);
    if (original && original.id !== id) tx.delete(doc(store, 'movies', original.id));
  });
  return id;
}
export const favoriteMovie = (id: string, favorite: boolean) => updateDoc(doc(database(), 'movies', id), { favorite });
export const deleteMovie = (id: string) => deleteDoc(doc(database(), 'movies', id));
export function movieError(error: unknown) {
  const code = (error as { code?: string })?.code;
  if (code === 'permission-denied') return 'Movie could not be saved or loaded. Check your account, movie values and published rules.';
  if (code === 'unavailable') return 'Connection unavailable. Please reconnect and try again.';
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}
