import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { errorMessage } from '@/domain/auth';

type SessionState = { user: User | null; loading: boolean; error: string };
const Session = createContext<SessionState>({ user: null, loading: true, error: '' });

export function SessionProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<SessionState>({ user: null, loading: Boolean(auth), error: '' });
  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(
      auth,
      user => setState({ user, loading: false, error: '' }),
      error => setState({ user: null, loading: false, error: errorMessage(error) }),
    );
  }, []);
  return <Session.Provider value={state}>{children}</Session.Provider>;
}
export const useSession = () => useContext(Session);
