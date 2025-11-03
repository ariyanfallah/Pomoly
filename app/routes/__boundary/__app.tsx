import { Outlet, useLoaderData } from "react-router";
import type { Route } from "../../+types/root";
import { createSupabaseServerClient } from "../../lib/supabase.server";
import type { User } from "@supabase/supabase-js";
import { AuthProvider } from "../../contexts/AuthContext";
import { Navbar } from "~/components/Navbar";
import { Toaster } from "~/components/ui/toaster";

function AppContent() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Toaster />
    </>
  );
}

export default function AppLayout() {
  const data = useLoaderData() as { user: User | null };
  return (
    <AuthProvider initialUser={data.user}>
      <AppContent />
    </AuthProvider>
  );
}

export async function loader({ request }: Route.LoaderArgs) {
  const { supabase, headers } = createSupabaseServerClient(request)
  const { data: { user } } = await supabase.auth.getUser()
  return Response.json({ user }, { headers })
}
