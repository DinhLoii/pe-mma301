import { useState } from 'react';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import { useSession } from '@/context/Session';
import { removeBook, saveBook, toggleFavorite } from '@/api/books';
import { errorMessage } from '@/domain/auth';
import { BookForm } from '@/components/BookForm';
import { Button, Busy, Page, styles } from '@/components/ui';
export default function Detail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, loading, books, booksLoading, error: loadError } = useSession();
  const [edit, setEdit] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  if (loading) return <Busy />;
  if (!user) return <Redirect href="/" />;
  if (booksLoading) return <Busy />;
  const book = books.find(b => b.id === id);
  if (!book) return <Page><Text style={styles.text}>{loadError || 'Book not found.'}</Text><Button label="Back to List" onPress={() => router.replace('/list')} /></Page>;
  async function favorite() { setBusy(true); setError(''); try { await toggleFavorite(book!); } catch (e) { setError(errorMessage(e)); } finally { setBusy(false); } }
  async function remove() { setBusy(true); setError(''); try { await removeBook(book!.id); router.replace('/list'); } catch (e) { setError(errorMessage(e)); } finally { setBusy(false); } }
  return <Page testID="detail-screen"><Button label="Back to List" secondary onPress={() => router.replace('/list')} /><Text style={styles.title}>{edit ? 'Edit your book' : book.title}</Text>{edit ? <BookForm edit initial={{ title: book.title, author: book.author, genre: book.genre, status: book.status, rating: book.rating == null ? '' : String(book.rating), notes: book.notes ?? '' }} onCancel={() => setEdit(false)} onSave={async v => { const nextId = await saveBook(user.uid, v, book); setEdit(false); if (nextId !== id) router.setParams({ id: nextId }); }} /> : <View style={styles.card}>{[['Title', book.title], ['Author', book.author], ['Genre', book.genre], ['Status', book.status], ['Rating', book.rating == null ? 'Not rated' : `${book.rating} / 5`], ['Notes', book.notes || 'No notes']].map(([label, value]) => <View key={label}><Text style={styles.muted}>{label}</Text><Text style={styles.text}>{value}</Text></View>)}<Button label={book.favorite ? '★ Favorite' : '☆ Favorite'} testID="favorite-toggle" secondary={!book.favorite} onPress={favorite} disabled={busy} /><Button label="Edit" onPress={() => { setEdit(true); setConfirm(false); }} disabled={busy} /><Button label="Delete" secondary onPress={() => setConfirm(true)} disabled={busy} /></View>}{confirm && !edit ? <View style={styles.card}><Text style={styles.heading}>Delete this book?</Text><Text style={styles.text}>This removes “{book.title}” from your library.</Text><Button label="Confirm Delete" onPress={remove} disabled={busy} /><Button label="Cancel" secondary onPress={() => setConfirm(false)} disabled={busy} /></View> : null}{error ? <Text testID="error-book" style={styles.error}>{error}</Text> : null}</Page>;
}
