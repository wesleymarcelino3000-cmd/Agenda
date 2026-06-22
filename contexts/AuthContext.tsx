'use client';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type AuthContextValue = { user: User | null; session: Session | null; loading: boolean; signOut: () => Promise<void> };
const AuthContext = createContext<AuthContextValue | undefined>(undefined);
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null); const [session, setSession] = useState<Session | null>(null); const [loading, setLoading] = useState(true);
  useEffect(() => { supabase.auth.getSession().then(({ data }) => { setSession(data.session); setUser(data.session?.user ?? null); setLoading(false); }); const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => { setSession(s); setUser(s?.user ?? null); setLoading(false); }); return () => sub.subscription.unsubscribe(); }, []);
  const value = useMemo(() => ({ user, session, loading, signOut: async () => { await supabase.auth.signOut(); location.href = '/login'; } }), [user, session, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuthContext(){ const ctx = useContext(AuthContext); if(!ctx) throw new Error('useAuthContext deve ser usado dentro de AuthProvider'); return ctx; }
