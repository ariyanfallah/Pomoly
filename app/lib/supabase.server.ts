import { createServerClient, parseCookieHeader, serializeCookieHeader } from '@supabase/ssr'

const getEnv = (keyA: string, keyB?: string) => {
	return process.env[keyA] ?? (keyB ? process.env[keyB] : undefined)
}

const SUPABASE_URL = (getEnv('VITE_SUPABASE_URL', 'SUPABASE_URL') ?? '') as string
const SUPABASE_ANON_KEY = (getEnv('VITE_SUPABASE_ANON_KEY', 'SUPABASE_ANON_KEY') ?? '') as string

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
	throw new Error('Missing Supabase environment variables on the server')
}

export function createSupabaseServerClient(request: Request) {
	const headers = new Headers()
	const parsed = parseCookieHeader(request.headers.get('Cookie') ?? '')
	const cookies: Record<string, string> = Array.isArray(parsed)
		? parsed.reduce<Record<string, string>>((acc, c) => {
			if (c && typeof c.name === 'string' && typeof c.value === 'string') {
				acc[c.name] = c.value
			}
			return acc
		}, {})
		: (parsed as unknown as Record<string, string>)

	const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
		cookies: {
			get(name) {
				return cookies[name]
			},
			set(name, value, options) {
				headers.append('Set-Cookie', serializeCookieHeader(name, value, options))
			},
			remove(name, options) {
				headers.append('Set-Cookie', serializeCookieHeader(name, '', options))
			},
		},
	})

	return { supabase, headers }
}


