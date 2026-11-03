import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import { Movie } from '@/domain/movies';
import { movieError, subscribeMovies } from '@/api/movies';
import { useSession } from './Session';

type State = { owner: string; movies: Movie[]; loading: boolean; error: string };
const Movies = createContext<{ movies: Movie[]; loading: boolean; error: string; retry: () => void }>({ movies: [], loading: true, error: '', retry: () => {} });
export function MoviesProvider({ children }: PropsWithChildren) {
  const { user } = useSession();
  const uid = user?.uid ?? '';
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<State>({ owner: '', movies: [], loading: true, error: '' });
  const subscriptionKey = uid + ':' + attempt;
  useEffect(() => {
    if (!uid) return;
    let active = true;
    const unsubscribe = subscribeMovies(uid,
      movies => { if (active) setState({ owner: subscriptionKey, movies, loading: false, error: '' }); },
      e => { if (active) setState({ owner: subscriptionKey, movies: [], loading: false, error: movieError(e) }); });
    return () => { active = false; unsubscribe(); };
  }, [uid, subscriptionKey]);
  // Never expose records from the previous session, even for one render.
  const current = uid && state.owner === subscriptionKey ? state : { movies: [], loading: Boolean(uid), error: '' };
  return <Movies.Provider value={{ movies: current.movies, loading: current.loading, error: current.error, retry: () => setAttempt(n => n + 1) }}>{children}</Movies.Provider>;
}
export const useMovies = () => useContext(Movies);
