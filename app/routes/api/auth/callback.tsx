import type { Route } from '../../../+types/root'
import { createSupabaseServerClient } from '../../../lib/supabase.server'

export async function action({ request }: Route.ActionArgs) {
	const { supabase, headers } = createSupabaseServerClient(request)
	try {
		const { event, session } = await request.json()
		if (event === 'SIGNED_OUT') {
			await supabase.auth.signOut()
			return Response.json({ ok: true }, { headers })
		}
		if (session) {
			await supabase.auth.setSession({
				access_token: session.access_token,
				refresh_token: session.refresh_token,
			})
		}
		return Response.json({ ok: true }, { headers })
	} catch {
		return Response.json({ ok: false }, { headers, status: 400 })
	}
}

export function loader() {
	return Response.json({ ok: true })
}


