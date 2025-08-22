import { Outlet, useLoaderData } from "react-router";
import type { Route } from "../../+types/root";
import { createSupabaseServerClient } from "../../lib/supabase.server";
import type { Session } from "@supabase/supabase-js";
import { AuthProvider } from "../../contexts/AuthContext";

function AppContent() {
  return (
    <>
      <Outlet />
    </>
  );
}

export default function AppLayout() {
  const data = useLoaderData() as { session: Session | null };
  return (
    <AuthProvider initialSession={data.session}>
      <AppContent />
    </AuthProvider>
  );
}

export async function loader({ request }: Route.LoaderArgs) {
  const { supabase, headers } = createSupabaseServerClient(request)
  const { data: { session } } = await supabase.auth.getSession()
  return Response.json({ session }, { headers })
}


