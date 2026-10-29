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
