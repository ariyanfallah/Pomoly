import { createContext, useContext, useEffect, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => ReturnType<typeof supabase.auth.signInWithPassword>
  signUp: (email: string, password: string) => ReturnType<typeof supabase.auth.signUp>
  signOut: () => ReturnType<typeof supabase.auth.signOut>
  resetPassword: (email: string) => ReturnType<typeof supabase.auth.resetPasswordForEmail>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children, initialSession }: { children: React.ReactNode; initialSession?: Session | null }) {
  const [user, setUser] = useState<User | null>(initialSession?.user ?? null)
  const [session, setSession] = useState<Session | null>(initialSession ?? null)
  const [loading, setLoading] = useState(!initialSession)

  useEffect(() => {
    let isMounted = true

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession)
      setUser(newSession?.user ?? null)
      setLoading(false)

      // Sync cookies with the server via API route for SSR
      try {
        await fetch('/api/auth/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            event: _event,
            session: newSession,
          }),
          credentials: 'include',
        })
      } catch (e) {
        // ignore network errors; UI state stays client-side
      }
    })

    return () => {
      isMounted = false
      data.subscription.unsubscribe()
    }
  }, [])

  const value = {
    user,
    session,
    loading,
    signIn: async (email: string, password: string) =>
      supabase.auth.signInWithPassword({ email, password }),
    signUp: async (email: string, password: string) =>
      supabase.auth.signUp({ email, password }),
    signOut: async () => supabase.auth.signOut(),
    resetPassword: async (email: string) =>
      supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      }),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
