import { useState } from 'react';
import { Redirect, router } from 'expo-router';
import { signOut } from 'firebase/auth';
import { Switch, Text, View } from 'react-native';
import { auth } from '@/config/firebase';
import { useSession } from '@/context/Session';
import { emptyFilters, GENRES, shownBooks, STATUSES, summarize } from '@/domain/books';
import { errorMessage } from '@/domain/auth';
import { saveBook, toggleFavorite } from '@/api/books';
import { BookForm } from '@/components/BookForm';
import { Button, Busy, Field, Page, Select, styles } from '@/components/ui';
export default function List() {
  const { user, loading, books, booksLoading, error } = useSession();
  const [filters, setFilters] = useState({ ...emptyFilters });
  const [actionError, setActionError] = useState('');
  const [pending, setPending] = useState<string[]>([]);
  if (loading) return <Busy />;
  if (!user) return <Redirect href="/" />;
  const visible = shownBooks(books, filters);
  const summary = summarize(visible);
  const update = (key: keyof typeof filters, value: string | boolean) => setFilters(f => ({ ...f, [key]: value }));
  async function favorite(id: string) {
    const book = books.find(b => b.id === id); if (!book) return;
    setActionError(''); setPending(p => [...p, id]);
    try { await toggleFavorite(book); } catch (e) { setActionError(errorMessage(e)); }
    finally { setPending(p => p.filter(v => v !== id)); }
  }
  return <Page testID="list-screen"><View style={styles.row}><View style={{ flex: 1, minWidth: 160 }}><Text style={styles.heading}>BookShelf</Text><Text style={styles.muted}>{user.email}</Text></View><Button label="Logout" secondary onPress={async () => { try { if (auth) await signOut(auth); router.replace('/'); } catch (e) { setActionError(errorMessage(e)); } }} /></View><Text style={styles.title}>Your library</Text><Text style={styles.muted}>Make room for your next great read.</Text><BookForm onSave={v => saveBook(user.uid, v)} />
    <View style={styles.card}><Text style={styles.heading}>Find a book</Text><Select label="Genre filter" testID="filter-genre" value={filters.genre} options={['All', ...GENRES]} onChange={v => update('genre', v)} /><Select label="Status filter" testID="filter-status" value={filters.status} options={['All', ...STATUSES]} onChange={v => update('status', v)} /><View style={styles.row}><Switch testID="favorites-only" accessibilityLabel="Favorites only" value={filters.favorites} onValueChange={v => update('favorites', v)} /><Text style={styles.text}>Favorites only</Text></View><Field label="Search title or author" testID="search" value={filters.search} onChangeText={v => update('search', v)} /><Button label="Clear" secondary onPress={() => setFilters({ ...emptyFilters })} /></View>
    <View testID="summary" style={styles.card}><Text style={styles.heading}>On your shelf</Text><View style={styles.row}><Text style={styles.text}>Books</Text><Text testID="book-count" style={styles.heading}>{summary.count}</Text><Text style={styles.text}>Favorites</Text><Text testID="favorite-count" style={styles.heading}>{summary.favorites}</Text></View>{summary.statuses.map(row => <View key={row.status} style={styles.row}><Text style={[styles.text, { flex: 1 }]}>{row.status}</Text><Text style={styles.text}>{row.count}</Text></View>)}</View>
    {error || actionError ? <Text testID="error-book" style={styles.error}>{error || actionError}</Text> : null}
    {booksLoading ? <Text style={styles.muted}>Loading your books…</Text> : visible.length ? visible.map(book => <View testID="book-item" key={book.id} style={styles.card}><Text style={styles.heading}>{book.title}</Text><Text style={styles.muted}>{book.author}</Text><Text style={styles.text}>{book.genre} · {book.status}</Text><View style={styles.row}><Button label={book.favorite ? '★ Favorite' : '☆ Favorite'} testID="favorite-toggle" secondary={!book.favorite} disabled={pending.includes(book.id)} onPress={() => favorite(book.id)} /><Button label="View details" secondary onPress={() => router.push({ pathname: '/book/[id]', params: { id: book.id } })} /></View></View>) : !error ? <View style={styles.card}><Text testID="books-empty" style={styles.text}>No books found</Text></View> : null}
  </Page>;
}
