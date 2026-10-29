import { collection, deleteDoc, doc, onSnapshot, query, runTransaction, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Book, BookValues, bookId } from '@/domain/books';

function database() { if (!db) throw new Error('Firebase is not configured. Copy .env.example to .env and fill it in.'); return db; }
export function subscribeBooks(uid: string, next: (books: Book[]) => void, error: (error: Error) => void) {
  return onSnapshot(query(collection(database(), 'books'), where('userId', '==', uid)), snapshot => {
    next(snapshot.docs.map(d => ({ ...d.data(), id: d.id }) as Book));
  }, error);
}
export async function saveBook(uid: string, values: BookValues, previous?: Book) {
  const firestore = database();
  const id = bookId(uid, values.title, values.author);
  const target = doc(firestore, 'books', id);
  await runTransaction(firestore, async tx => {
    const existing = await tx.get(target);
    if (existing.exists() && previous?.id !== id) throw new Error('A book with this title and author already exists.');
    if (previous) {
      const current = previous.id === id ? existing : await tx.get(doc(firestore, 'books', previous.id));
      if (!current.exists()) throw new Error('This book was deleted. Return to the list.');
      if (previous.id !== id) tx.delete(doc(firestore, 'books', previous.id));
      tx.set(target, {
        id, userId: uid, title: values.title.trim(), author: values.author.trim(), genre: values.genre,
        status: values.status, rating: values.rating.trim() ? Number(values.rating) : null,
        notes: values.notes, favorite: current.data().favorite, createdAt: current.data().createdAt,
      });
    } else {
      tx.set(target, {
        id, userId: uid, title: values.title.trim(), author: values.author.trim(), genre: values.genre,
        status: values.status, rating: values.rating.trim() ? Number(values.rating) : null,
        notes: values.notes, favorite: false, createdAt: serverTimestamp(),
      });
    }
  });
  return id;
}
export function toggleFavorite(book: Book) { return updateDoc(doc(database(), 'books', book.id), { favorite: !book.favorite }); }
export function removeBook(id: string) { return deleteDoc(doc(database(), 'books', id)); }
