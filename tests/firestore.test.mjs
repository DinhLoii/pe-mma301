import { readFileSync } from 'node:fs';
import { before, after, test } from 'node:test';
import { initializeTestEnvironment, assertFails } from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc } from 'firebase/firestore';

let env;
before(async () => {
  env = await initializeTestEnvironment({ projectId: 'demo-pe-mma301', firestore: { rules: readFileSync('firestore.rules', 'utf8') } });
});
after(async () => env?.cleanup());
test('unconfigured collections stay closed until the real exam rules are written', async () => {
  for (const context of [env.unauthenticatedContext(), env.authenticatedContext('sample-user')]) {
    const ref = doc(context.firestore(), 'unconfigured', 'sample');
    await assertFails(getDoc(ref));
    await assertFails(setDoc(ref, { userId: 'sample-user' }));
  }
});
