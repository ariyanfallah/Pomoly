import { createContext, useContext, useEffect, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (...args: unknown[]) => Promise<never>
  signUp: (...args: unknown[]) => Promise<never>
  signOut: (...args: unknown[]) => Promise<never>
  resetPassword: (...args: unknown[]) => Promise<never>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children, initialUser }: { children: React.ReactNode; initialUser?: User | null }) {
  const [user, setUser] = useState<User | null>(initialUser ?? null)
  const [session] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const verifyUser = async () => {
      try {
        const { data } = await supabase.auth.getUser()
        if (!cancelled) {
          setUser(data.user ?? null)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    verifyUser()

    const { data: listener } = supabase.auth.onAuthStateChange(async () => {
      if (cancelled) return
      try {
        const { data } = await supabase.auth.getUser()
        if (!cancelled) {
          setUser(data.user ?? null)
        }
      } catch {
        if (!cancelled) {
          setUser(null)
        }
      }
    })

    return () => {
      cancelled = true
      listener.subscription.unsubscribe()
    }
  }, [])

  const value = {
    user,
    session,
    loading,
    signIn: async () => { throw new Error('Client auth disabled. Use server actions.') },
    signUp: async () => { throw new Error('Client auth disabled. Use server actions.') },
    signOut: async () => { throw new Error('Client auth disabled. Use server actions.') },
    resetPassword: async () => { throw new Error('Client auth disabled. Use server actions.') },
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
