import { useRef, useState } from 'react';
import { Pressable, Text } from 'react-native';
import { favoriteMovie, movieError } from '@/api/movies';
import { Movie } from '@/domain/movies';
import { colors } from './ui';

export function FavoriteButton({ movie, onError }: { movie: Movie; onError: (error: string) => void }) {
  const pending = useRef(false);
  const [busy, setBusy] = useState(false);
  async function toggle() {
    if (pending.current) return;
    pending.current = true; setBusy(true); onError('');
    try { await favoriteMovie(movie.id, !movie.favorite); }
    catch (e) { onError(movieError(e)); }
    finally { pending.current = false; setBusy(false); }
  }
  return <Pressable testID="favorite-toggle" accessibilityRole="button"
    accessibilityLabel={movie.favorite ? `Remove ${movie.title} from favorites` : `Add ${movie.title} to favorites`}
    accessibilityState={{ selected: movie.favorite, disabled: busy }} disabled={busy} onPress={toggle}
    style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: movie.favorite ? '#fae9ce' : '#f0efea', alignItems: 'center', justifyContent: 'center' }}>
    <Text style={{ color: movie.favorite ? '#9a5905' : colors.muted, fontSize: 28 }}>{movie.favorite ? '★' : '☆'}</Text>
  </Pressable>;
}
