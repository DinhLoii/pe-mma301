import { useRef, useState } from 'react';
import { Redirect, router } from 'expo-router';
import { signOut } from 'firebase/auth';
import { ActivityIndicator, Pressable, Switch, Text, View } from 'react-native';
import { auth } from '@/config/firebase';
import { useSession } from '@/context/Session';
import { useMovies } from '@/context/Movies';
import { authErrorMessage } from '@/domain/auth';
import { GENRES, STATUSES, emptyFilters, movieSummary, visibleMovies } from '@/domain/movies';
import { saveMovie } from '@/api/movies';
import { MovieForm } from '@/components/MovieForm';
import { FavoriteButton } from '@/components/FavoriteButton';
import { Button, Busy, Field, Page, Select, colors, styles } from '@/components/ui';

export default function List() {
  const { user, loading: sessionLoading } = useSession();
  const { movies, loading, error: loadError, retry } = useMovies();
  const [filters, setFilters] = useState(emptyFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  if (sessionLoading) return <Busy />;
  if (!user) return <Redirect href="/" />;
  const visible = visibleMovies(movies, filters);
  const summary = movieSummary(visible);
  async function logout() {
    if (pending.current) return;
    pending.current = true; setBusy(true); setError('');
    try { if (auth) await signOut(auth); router.replace('/'); }
    catch (e) { setError(authErrorMessage(e)); }
    finally { pending.current = false; setBusy(false); }
  }
  return <Page testID="list-screen">
    <View style={[styles.row, { justifyContent: 'space-between' }]}>
      <View style={{ flex: 1, minWidth: 120 }}><Text style={styles.brand}>CineList</Text><Text testID="session-email" style={styles.muted}>{user.email}</Text></View>
      <Button testID="logout-button" label={busy ? 'Signing out...' : 'Logout'} secondary disabled={busy} onPress={logout} />
    </View>
    <Text style={styles.title}>Your watchlist</Text>
    <View style={styles.row}><Button label={showForm ? 'Close form' : 'Add Movie'} onPress={() => { setShowForm(v => !v); setAdded(false); }} /><Button label={showFilters ? 'Hide filters' : 'Filters and search'} secondary onPress={() => setShowFilters(v => !v)} /></View>
    {added ? <Text testID="movie-success" accessibilityLiveRegion="polite" style={styles.success}>Movie added</Text> : null}
    {showForm ? <MovieForm onSave={async values => { await saveMovie(user.uid, values); setAdded(true); setShowForm(false); }} onCancel={() => setShowForm(false)} /> : null}
    {showFilters ? <View style={styles.card}>
      <Text style={styles.heading}>Find your next film</Text>
      <Field testID="search" label="Search" value={filters.search} placeholder="Title or director" onChangeText={search => setFilters(f => ({ ...f, search }))} autoCorrect={false} />
      <Select testID="genre-filter" label="Genre filter" value={filters.genre} options={['All', ...GENRES]} onChange={genre => setFilters(f => ({ ...f, genre }))} />
      <Select testID="status-filter" label="Status filter" value={filters.status} options={['All', ...STATUSES]} onChange={status => setFilters(f => ({ ...f, status }))} />
      <View style={[styles.row, { justifyContent: 'space-between' }]}><Text style={styles.label}>Favorites only</Text><Switch testID="favorites-only" accessibilityLabel="Favorites only" value={filters.favorites} onValueChange={favorites => setFilters(f => ({ ...f, favorites }))} trackColor={{ true: colors.accent }} /></View>
      <Button testID="clear-filters" label="Clear" secondary onPress={() => setFilters(emptyFilters())} />
    </View> : null}
    {error ? <Text testID="error-movie" style={styles.error}>{error}</Text> : null}
    {loadError ? <View style={styles.card}><Text style={styles.error}>{loadError}</Text><Button label="Retry" onPress={retry} /></View> : loading ? <ActivityIndicator accessibilityLabel="Loading movies" color={colors.accent} /> : <>
      <Text style={styles.heading}>The collection</Text>
      {visible.length === 0 ? <View style={styles.card}><Text testID="movies-empty" style={styles.heading}>No movies found</Text><Text style={styles.muted}>Add a movie below or try clearing your filters.</Text></View> : visible.map((movie, i) => <View testID="movie-item" key={movie.id} style={styles.card}>
        <View style={[styles.row, { flexWrap: 'nowrap', alignItems: 'flex-start' }]}>
          <Pressable accessibilityRole="button" accessibilityLabel={`Open ${movie.title}`} onPress={() => router.push({ pathname: '/movie/[id]', params: { id: movie.id } })} style={{ flex: 1, gap: 5 }}>
            <Text style={styles.muted}>{String(i + 1).padStart(2, '0')} / {movie.genre.toUpperCase()}</Text><Text style={styles.heading}>{movie.title}</Text><Text style={styles.muted}>{movie.director}</Text>
          </Pressable><FavoriteButton movie={movie} onError={setError} />
        </View>
        <View style={[styles.row, { justifyContent: 'space-between' }]}><Text style={styles.badge}>{movie.status}</Text><Pressable accessibilityRole="button" accessibilityLabel={`Details for ${movie.title}`} onPress={() => router.push({ pathname: '/movie/[id]', params: { id: movie.id } })} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={{ color: colors.accent, fontWeight: '600' }}>View details →</Text></Pressable></View>
      </View>)}
    </>}
    <View testID="summary" style={styles.card}>
      <Text style={styles.heading}>In this selection</Text>
      <View style={styles.row}>
        <View style={styles.stat}><Text testID="movie-count" style={styles.statNumber}>{summary.count}</Text><Text style={styles.muted}>Movies</Text></View>
        <View style={styles.stat}><Text testID="favorite-count" style={styles.statNumber}>{summary.favorites}</Text><Text style={styles.muted}>Favorites</Text></View>
      </View>
      {summary.statuses.map(row => <View testID="status-breakdown-row" key={row.status} style={[styles.row, { justifyContent: 'space-between' }]}><Text style={styles.text}>{row.status}</Text><Text style={styles.label}>{row.count}</Text></View>)}
    </View>
  </Page>;
}
