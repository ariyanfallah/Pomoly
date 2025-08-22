import { createContext, useContext, useEffect, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'

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

export function AuthProvider({ children, initialSession }: { children: React.ReactNode; initialSession?: Session | null }) {
  const [user] = useState<User | null>(initialSession?.user ?? null)
  const [session] = useState<Session | null>(initialSession ?? null)
  const [loading] = useState(false)

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
