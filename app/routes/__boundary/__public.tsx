import { Outlet, redirect } from "react-router";
import type { Route } from "../../+types/root";
import { createSupabaseServerClient } from "../../lib/supabase.server";

export default function PublicLayout() {
  return <Outlet />;
}

export async function loader({ request }: Route.LoaderArgs) {
  const { supabase, headers } = createSupabaseServerClient(request)
  const { data: { session } } = await supabase.auth.getSession()
  if (session) {
    throw redirect('/', { headers })
  }
  return new Response(null, { headers })
}


