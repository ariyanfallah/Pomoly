import { createBrowserClient } from '@supabase/ssr'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables on the client')
}

export const supabase = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)


