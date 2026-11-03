import { test } from 'node:test';
import assert from 'node:assert/strict';
import { authErrorMessage, validateAuth } from '../src/domain/auth.ts';

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

test('registration rejects mismatched confirmation and whitespace-only email', () => {
  assert.equal(validateAuth({ email: '   ', password: '123456', confirm: '654321' }, true).email, 'Email is required');
  assert.equal(validateAuth({ email: 'reader@example.com', password: '123456', confirm: '654321' }, true).confirm, 'Passwords do not match');
  assert.deepEqual(validateAuth({ email: ' reader@example.com ', password: '123456', confirm: '123456' }, true), {});
});

test('login requires a password but ignores confirmation', () => {
  assert.equal(validateAuth({ email: 'reader@example.com', password: '', confirm: '' }, false).password, 'Password is required');
  assert.deepEqual(validateAuth({ email: 'reader@example.com', password: '123456', confirm: 'different' }, false), {});
});

test('credential errors do not reveal whether the email is registered', () => {
  for (const code of ['auth/invalid-credential', 'auth/user-not-found', 'auth/wrong-password']) {
    assert.equal(authErrorMessage({ code }), 'Email or password is incorrect');
  }
});

test('auth failures give actionable messages and hide unknown provider internals', () => {
  assert.match(authErrorMessage({ code: 'auth/email-already-in-use' }), /already registered/);
  assert.match(authErrorMessage({ code: 'auth/network-request-failed' }), /internet connection/);
  assert.match(authErrorMessage({ code: 'auth/too-many-requests' }), /wait/);
  assert.match(authErrorMessage({ code: 'auth/user-disabled' }), /disabled/);
  assert.equal(authErrorMessage({ code: 'auth/internal-error', message: 'internal details' }), 'Unable to sign in. Please try again.');
  assert.equal(authErrorMessage(new Error('Firebase is not configured.')), 'Firebase is not configured.');
});
