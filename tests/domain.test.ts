import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateAuth } from '../src/domain/auth.ts';

test('registration validates email, password and confirmation', () => {
  assert.deepEqual(validateAuth({ email: '', password: '', confirm: '' }, true), {
    email: 'Email is required', password: 'Password is required', confirm: 'Confirm password is required',
  });
  assert.equal(validateAuth({ email: 'reader@example.com', password: '123', confirm: '123' }, true).password, 'Password must be at least 6 characters');
  assert.deepEqual(validateAuth({ email: 'reader@example.com', password: '123456', confirm: '123456' }, true), {});
});
test('login does not apply registration-only password checks', () => {
  assert.deepEqual(validateAuth({ email: 'reader@example.com', password: '123', confirm: '' }, false), {});
  assert.equal(validateAuth({ email: 'invalid', password: '123', confirm: '' }, false).email, 'Please enter a valid email address');
});
