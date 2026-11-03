import { test } from 'node:test';
import assert from 'node:assert/strict';
import { initializeApp, deleteApp } from 'firebase/app';
import {
  connectAuthEmulator, createUserWithEmailAndPassword, deleteUser, getAuth,
  signInWithEmailAndPassword, signOut,
} from 'firebase/auth';

test('Firebase Auth registration, duplicate email, logout and login', async () => {
  // Refuse to run against a real Firebase project.
  const host = process.env.FIREBASE_AUTH_EMULATOR_HOST;
  assert.ok(host && /^(127\.0\.0\.1|localhost):\d+$/.test(host), 'Start with npm run test:auth');
  const app = initializeApp({ apiKey: 'demo-key', projectId: 'demo-pe-mma301' }, `auth-test-${Date.now()}`);
  const auth = getAuth(app);
  connectAuthEmulator(auth, `http://${host}`, { disableWarnings: true });
  const email = `auth-${Date.now()}@example.com`;
  const password = 'Pe-test-123456';
  let created;
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    created = result.user;
    const uid = created.uid;
    assert.equal(auth.currentUser?.email, email);
    await signOut(auth);
    assert.equal(auth.currentUser, null);
    await assert.rejects(createUserWithEmailAndPassword(auth, email, password), { code: 'auth/email-already-in-use' });
    await assert.rejects(signInWithEmailAndPassword(auth, email, 'wrong-password'));
    assert.equal(auth.currentUser, null);
    const login = await signInWithEmailAndPassword(auth, email, password);
    assert.equal(login.user.uid, uid);
    await deleteUser(login.user);
    created = undefined;
    assert.equal(auth.currentUser, null);
  } finally {
    if (created) {
      await signInWithEmailAndPassword(auth, email, password);
      await deleteUser(auth.currentUser);
    }
    await deleteApp(app);
  }
});
