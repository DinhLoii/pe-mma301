export type AuthValues = { email: string; password: string; confirm: string };
export function validateAuth(v: AuthValues, register: boolean) {
  const e: Partial<Record<keyof AuthValues, string>> = {};
  if (!v.email.trim()) e.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) e.email = 'Please enter a valid email address';
  if (!v.password) e.password = 'Password is required';
  else if (register && v.password.length < 6) e.password = 'Password must be at least 6 characters';
  if (register && !v.confirm) e.confirm = 'Confirm password is required';
  else if (register && v.confirm !== v.password) e.confirm = 'Passwords do not match';
  return e;
}
export function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

// Firebase error codes are stable; avoid exposing provider internals in the UI.
export function authErrorMessage(error: unknown): string {
  const code = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : '';
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password': return 'Email or password is incorrect';
    case 'auth/email-already-in-use': return 'This email is already registered. Please login.';
    case 'auth/invalid-email': return 'Please enter a valid email address';
    case 'auth/weak-password': return 'Password must be at least 6 characters';
    case 'auth/password-does-not-meet-requirements': return 'Password does not meet the requirements. Please choose a stronger password.';
    case 'auth/network-request-failed': return 'Unable to connect. Check your internet connection and try again.';
    case 'auth/too-many-requests': return 'Too many attempts. Please wait and try again later.';
    case 'auth/user-disabled': return 'This account has been disabled.';
    case 'auth/operation-not-allowed': return 'Email/password sign-in is not enabled. Please contact the administrator.';
    default: return code.startsWith('auth/') ? 'Unable to sign in. Please try again.' : errorMessage(error);
  }
}
