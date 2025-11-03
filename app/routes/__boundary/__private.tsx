import { Outlet, redirect } from "react-router";
import type { Route } from "../../+types/root";
import { createSupabaseServerClient } from "../../lib/supabase.server";

export default function PrivateLayout() {
  return <Outlet />;
}

export async function loader({ request }: Route.LoaderArgs) {
  const { supabase, headers } = createSupabaseServerClient(request)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw redirect('/auth', { headers })
  }
  return new Response(null, { headers })
}


