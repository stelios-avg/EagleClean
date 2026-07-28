import React, { createContext, useContext, useMemo, useState } from 'react';

/**
 * Phase 1 placeholder for Supabase Auth.
 *
 * In Phase 2 this provider will:
 *  - create the Supabase client
 *  - restore the persisted session on app start
 *  - subscribe to supabase.auth.onAuthStateChange and keep `session` in sync
 *
 * Nothing else in the app will need to change: screens only consume
 * `useAuth()`, so swapping the mock for Supabase is contained to this file.
 */

type Session = {
  userId: string;
  email: string;
} | null;

type AuthContextValue = {
  session: Session;
  isAuthenticated: boolean;
  signIn: (email: string) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session>(null);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isAuthenticated: session !== null,
      // Phase 2: supabase.auth.signInWithPassword / signUp
      signIn: (email: string) => setSession({ userId: 'mock-user-id', email }),
      // Phase 2: supabase.auth.signOut
      signOut: () => setSession(null),
    }),
    [session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside an <AuthProvider>');
  }
  return ctx;
}
