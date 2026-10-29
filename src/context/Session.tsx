import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { subscribeBooks } from '@/api/books';
import { Book } from '@/domain/books';
import { errorMessage } from '@/domain/auth';

const Session = createContext<{ user: User | null; loading: boolean; books: Book[]; booksLoading: boolean; error: string }>({ user: null, loading: true, books: [], booksLoading: false, error: '' });
export function SessionProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(Boolean(auth));
  const [state, setState] = useState<{ uid: string; books: Book[]; loading: boolean; error: string }>({ uid: '', books: [], loading: false, error: '' });
  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, u => { setUser(u); setState({ uid: '', books: [], loading: Boolean(u), error: '' }); setLoading(false); }, e => { setState(s => ({ ...s, error: errorMessage(e) })); setLoading(false); });
  }, []);
  useEffect(() => {
    if (!user) return;
    const uid = user.uid;
    return subscribeBooks(uid, books => setState({ uid, books, loading: false, error: '' }), e => setState({ uid, books: [], loading: false, error: errorMessage(e) }));
  }, [user]);
  const sameUser = Boolean(user && state.uid === user.uid);
  return <Session.Provider value={{ user, loading, books: sameUser ? state.books : [], booksLoading: Boolean(user) && (!sameUser || state.loading), error: sameUser ? state.error : '' }}>{children}</Session.Provider>;
}
export const useSession = () => useContext(Session);
