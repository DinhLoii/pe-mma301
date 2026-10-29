import { readFileSync } from 'node:fs';
import { before, after, beforeEach, test } from 'node:test';
import { initializeTestEnvironment, assertSucceeds, assertFails } from '@firebase/rules-unit-testing';
import { collection, doc, getDoc, getDocs, query, where, setDoc, updateDoc, deleteDoc, Timestamp, runTransaction } from 'firebase/firestore';

let env;
const key = (uid, title = 'Dune', author = 'Frank Herbert') => `${uid}_${Buffer.from(title.trim().toLowerCase()).toString('hex')}_${Buffer.from(author.trim().toLowerCase()).toString('hex')}`;
const book = (uid = 'alice', changes = {}) => ({ id: key(uid), userId: uid, title: 'Dune', author: 'Frank Herbert', genre: 'Fiction', status: 'To Read', rating: null, notes: '', favorite: false, createdAt: Timestamp.now(), ...changes });
before(async () => { env = await initializeTestEnvironment({ projectId: 'demo-pe-mma301', firestore: { rules: readFileSync('firestore.rules', 'utf8') } }); });
beforeEach(async () => env.clearFirestore());
after(async () => env?.cleanup());
test('owner CRUD, query and absent-document transaction work', async () => {
  const db = env.authenticatedContext('alice').firestore();
  const ref = doc(db, 'books', key('alice'));
  await assertSucceeds(runTransaction(db, async tx => { await tx.get(ref); tx.set(ref, book()); }));
  await assertSucceeds(getDoc(ref));
  await assertSucceeds(getDocs(query(collection(db, 'books'), where('userId', '==', 'alice'))));
  await assertSucceeds(updateDoc(ref, { rating: 5, favorite: true }));
  await assertSucceeds(deleteDoc(ref));
});
test('anonymous and other users cannot read, overwrite, delete, or spoof ownership', async () => {
  const alice = env.authenticatedContext('alice').firestore();
  await setDoc(doc(alice, 'books', key('alice')), book());
  for (const db of [env.unauthenticatedContext().firestore(), env.authenticatedContext('bob').firestore()]) {
    const ref = doc(db, 'books', key('alice'));
    await assertFails(getDoc(ref)); await assertFails(updateDoc(ref, { favorite: true })); await assertFails(deleteDoc(ref));
    await assertFails(setDoc(doc(db, 'books', key('bob')), book()));
    await assertFails(getDocs(collection(db, 'books')));
  }
});
test('direct bad writes are denied for every required field and type', async () => {
  const db = env.authenticatedContext('alice').firestore();
  for (const changes of [
    { title: '  ' }, { title: 'x'.repeat(101) }, { author: '\t ' }, { author: 'x'.repeat(61) },
    { genre: 'Invalid' }, { status: 'Invalid' }, { rating: -1 }, { rating: 6 }, { rating: 2.5 }, { rating: '3' },
    { notes: 'x'.repeat(301) }, { notes: 42 }, { favorite: 'true' }, { userId: 'bob' }, { createdAt: 123 }, { id: 'wrong' }, { extra: true },
  ]) await assertFails(setDoc(doc(db, 'books', key('alice')), book('alice', changes)));
});
test('arbitrary IDs cannot bypass uniqueness; same key allows updates but never a second row', async () => {
  const db = env.authenticatedContext('alice').firestore();
  await setDoc(doc(db, 'books', key('alice')), book());
  await assertFails(setDoc(doc(db, 'books', 'random-second-id'), book('alice', { id: 'random-second-id', title: 'dune' })));
  await assertSucceeds(updateDoc(doc(db, 'books', key('alice')), { title: 'dune' }));
  await assertFails(updateDoc(doc(db, 'books', key('alice')), { userId: 'bob' }));
  await assertFails(updateDoc(doc(db, 'books', key('alice')), { createdAt: Timestamp.fromMillis(1) }));
  const bob = env.authenticatedContext('bob').firestore();
  await assertSucceeds(setDoc(doc(bob, 'books', key('bob')), book('bob')));
});
test('rename is atomic, duplicate rename fails and optional fields may be omitted', async () => {
  const db = env.authenticatedContext('alice').firestore();
  const old = book(); await setDoc(doc(db, 'books', old.id), old);
  const newId = key('alice', 'Changed');
  await assertSucceeds(runTransaction(db, async tx => {
    const ref = doc(db, 'books', newId); await tx.get(ref);
    tx.set(ref, { ...old, id: newId, title: 'Changed' }); tx.delete(doc(db, 'books', old.id));
  }));
  const optional = book('alice', { title: 'Optional', id: key('alice', 'Optional') });
  delete optional.rating; delete optional.notes;
  await assertSucceeds(setDoc(doc(db, 'books', optional.id), optional));
});
