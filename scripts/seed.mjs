import { readFileSync } from 'node:fs';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, doc, runTransaction, serverTimestamp, terminate } from 'firebase/firestore';
const settings = JSON.parse(readFileSync('submission.local.json', 'utf8'));
const app = initializeApp({ apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY, authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN, projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID, appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID });
const auth = getAuth(app); const db = getFirestore(app);
try {
  const { user } = await signInWithEmailAndPassword(auth, settings.testEmail, settings.testPassword);
  const samples = [
    ['Dune', 'Frank Herbert', 'Fiction', 'To Read', true, 5, 'Read the first chapter.'],
    ['Clean Code', 'Robert C. Martin', 'Academic', 'Reading', false, 4, 'Practice one idea each day.'],
    ['Atomic Habits', 'James Clear', 'Non-Fiction', 'Finished', true, 5, 'Small changes add up.'],
    ['The Little Prince', 'Antoine de Saint-Exupery', 'Fiction', 'Reading', false, null, ''],
    ['A Short History of Nearly Everything', 'Bill Bryson', 'Non-Fiction', 'To Read', false, null, ''],
  ];
  for (const [title, author, genre, status, favorite, rating, notes] of samples) {
    const id = `${user.uid}_${Buffer.from(title.trim().toLowerCase()).toString('hex')}_${Buffer.from(author.trim().toLowerCase()).toString('hex')}`;
    await runTransaction(db, async tx => { const ref = doc(db, 'books', id); if (!(await tx.get(ref)).exists()) tx.set(ref, { id, userId: user.uid, title, author, genre, status, favorite, rating, notes, createdAt: serverTimestamp() }); });
  }
  console.log('Test account signed in; five sample books are ready. Existing books were not overwritten.');
} finally { await signOut(auth); await terminate(db); }
