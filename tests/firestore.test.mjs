import { readFileSync } from 'node:fs';
import { before, after, beforeEach, test } from 'node:test';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, Timestamp, runTransaction } from 'firebase/firestore';

let env;
const idFor = (uid, title = 'Dune', director = 'Denis') => `${uid}_${Buffer.from(title.trim().toLowerCase()).toString('hex')}_${Buffer.from(director.trim().toLowerCase()).toString('hex')}`;
const data = (uid = 'alice', title = 'Dune', director = 'Denis') => ({ id: idFor(uid, title, director), userId: uid, title, director, genre: 'Drama', status: 'Plan to Watch', favorite: false, notes: '', createdAt: Timestamp.fromMillis(1000) });
const store = (uid = 'alice') => env.authenticatedContext(uid).firestore();
before(async () => { env = await initializeTestEnvironment({ projectId: 'demo-pe-mma301', firestore: { rules: readFileSync('firestore.rules', 'utf8') } }); });
beforeEach(async () => env.clearFirestore());
after(async () => env?.cleanup());

test('owner can create, query, update and delete; optional empty rating is absent', async () => {
  const db = store(); const d = data(); const ref = doc(db, 'movies', d.id);
  await assertSucceeds(getDoc(ref));
  await assertSucceeds(setDoc(ref, d));
  await assertSucceeds(getDocs(query(collection(db, 'movies'), where('userId', '==', 'alice'))));
  await assertSucceeds(updateDoc(ref, { rating: 0, favorite: true, status: 'Watched' }));
  await assertSucceeds(deleteDoc(ref));
});
test('anonymous and other users cannot read or change private data', async () => {
  const d = data(); await setDoc(doc(store(), 'movies', d.id), d);
  for (const db of [env.unauthenticatedContext().firestore(), store('bob')]) {
    const ref = doc(db, 'movies', d.id);
    await assertFails(getDoc(ref)); await assertFails(getDocs(collection(db, 'movies')));
    await assertFails(setDoc(ref, d)); await assertFails(updateDoc(ref, { favorite: true })); await assertFails(deleteDoc(ref));
  }
  await assertFails(setDoc(doc(store(), 'movies', idFor('alice', 'Other')), { ...data('alice', 'Other'), userId: 'bob' }));
  await assertFails(getDocs(collection(store(), 'movies')));
  await assertFails(setDoc(doc(store(), 'anything', 'id'), {}));
});
test('direct invalid creates AND updates are rejected at the database', async () => {
  const db = store(); const good = data(); const ref = doc(db, 'movies', good.id);
  await setDoc(ref, good);
  const invalid = [
    { title: '' }, { title: '   ' }, { title: 'a'.repeat(101) }, { title: 123 },
    { director: '' }, { director: '  ' }, { director: 'a'.repeat(61) }, { director: false },
    { genre: 'Sci-Fi' }, { status: 'Finished' }, { rating: -1 }, { rating: 6 }, { rating: 2.5 }, { rating: null }, { rating: '5' },
    { notes: 'a'.repeat(301) }, { notes: 3 }, { favorite: 'yes' }, { userId: 'bob' }, { id: 'fake' }, { createdAt: 'today' }, { extra: 'no' },
  ];
  for (const patch of invalid) {
    await assertFails(updateDoc(ref, patch));
    // A fresh canonical path is used so the create branch, not update, is tested.
    const next = { ...data('alice', 'Fresh'), ...patch };
    await assertFails(setDoc(doc(db, 'movies', idFor('alice', 'Fresh')), next));
  }
});
test('canonical identity enforces uniqueness even for direct arbitrary-ID writes', async () => {
  const db = store(); const good = data(); await setDoc(doc(db, 'movies', good.id), good);
  await assertFails(setDoc(doc(db, 'movies', 'alice_random-id'), { ...good, id: 'alice_random-id', title: 'dUnE', director: 'DENIS' }));
  const other = data('bob', 'dune', 'denis');
  await assertSucceeds(setDoc(doc(store('bob'), 'movies', other.id), other));
  const unicode = data('alice', 'Điện ảnh', 'Lê');
  await assertSucceeds(setDoc(doc(db, 'movies', unicode.id), unicode));
});
test('renaming a title atomically moves its canonical document and preserves ownership', async () => {
  const db = store(); const original = data(); await setDoc(doc(db, 'movies', original.id), original);
  const renamed = data('alice', 'Arrival');
  await assertSucceeds(runTransaction(db, async tx => {
    await tx.get(doc(db, 'movies', renamed.id));
    tx.set(doc(db, 'movies', renamed.id), renamed);
    tx.delete(doc(db, 'movies', original.id));
  }));
  await assertSucceeds(updateDoc(doc(db, 'movies', renamed.id), { title: 'ARRIVAL' }));
  await assertFails(updateDoc(doc(db, 'movies', renamed.id), { title: 'Different' }));
});
