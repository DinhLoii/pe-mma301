import { collection, deleteDoc, doc, onSnapshot, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { db } from '@/config/firebase';

export type OwnedRecord = { id: string; userId: string; createdAt: unknown; updatedAt: unknown };

// Reusable factory only. No collection or document is created on startup.
// Add the real entity validation and matching Security Rules when the exam arrives.
export function createRepository<T extends Record<string, unknown>>(collectionName: string) {
  function database() {
    if (!db) throw new Error('Firebase is not configured.');
    return db;
  }
  return {
    subscribe(userId: string, next: (rows: (T & OwnedRecord)[]) => void, error: (error: Error) => void) {
      return onSnapshot(query(collection(database(), collectionName), where('userId', '==', userId)), snapshot => {
        next(snapshot.docs.map(row => ({ ...row.data(), id: row.id }) as T & OwnedRecord));
      }, error);
    },
    async create(userId: string, values: T) {
      const ref = doc(collection(database(), collectionName));
      await setDoc(ref, { ...values, id: ref.id, userId, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      return ref.id;
    },
    async update(id: string, values: Partial<T>) {
      const safeValues = Object.fromEntries(Object.entries(values).filter(([key]) => !['id', 'userId', 'createdAt', 'updatedAt'].includes(key)));
      await updateDoc(doc(database(), collectionName, id), { ...safeValues, updatedAt: serverTimestamp() });
    },
    remove(id: string) { return deleteDoc(doc(database(), collectionName, id)); },
  };
}
