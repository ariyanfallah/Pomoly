import { redirect } from "react-router";
import type { Route } from "../../../+types/root";
import { createSupabaseServerClient } from "../../../lib/supabase.server";

export async function loader({ request }: Route.LoaderArgs) {
  const { supabase, headers } = createSupabaseServerClient(request);
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      throw redirect("/", { headers });
    }
  }

  throw redirect("/auth", { headers });
}
