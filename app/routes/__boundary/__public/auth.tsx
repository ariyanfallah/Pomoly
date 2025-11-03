import { LoginForm } from "../../../components/auth/LoginForm";
import { SignUpForm } from "../../../components/auth/SignUpForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { useActionData, redirect } from "react-router";
import type { Route } from "../../../+types/root";
import { createSupabaseServerClient } from "../../../lib/supabase.server";
import { brandConfig } from "~/configs/brand.config";

export default function Auth() {
  const actionData = useActionData() as { error?: string | null; success?: string | null } | undefined
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Welcome to <span className="text-primary">{brandConfig.brandName}!</span></h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account or create a new one
          </p>
        </div>
        
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="space-y-4">
            <LoginForm error={actionData?.error ?? null} />
          </TabsContent>
          
          <TabsContent value="signup" className="space-y-4">
            <SignUpForm error={actionData?.error ?? null} success={actionData?.success ?? null} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export async function action({ request }: Route.ActionArgs) {
  const { supabase, headers } = createSupabaseServerClient(request)
  const formData = await request.formData()
  const intent = String(formData.get('intent') ?? '')
  if (intent === 'login') {
    const email = String(formData.get('email') ?? '')
    const password = String(formData.get('password') ?? '')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { headers: { ...Object.fromEntries(headers), 'Content-Type': 'application/json' }, status: 400 })
    }
    if (data.session) {
      await supabase.auth.setSession({ access_token: data.session.access_token, refresh_token: data.session.refresh_token })
    }
    throw redirect('/', { headers })
  }
  if (intent === 'signup') {
    const email = String(formData.get('email') ?? '')
    const password = String(formData.get('password') ?? '')
    if (password.length < 6) {
      return new Response(JSON.stringify({ error: 'Password must be at least 6 characters long' }), { headers: { ...Object.fromEntries(headers), 'Content-Type': 'application/json' }, status: 400 })
    }
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { headers: { ...Object.fromEntries(headers), 'Content-Type': 'application/json' }, status: 400 })
    }
    return new Response(JSON.stringify({ success: 'Check your email for a confirmation link!' }), { headers: { ...Object.fromEntries(headers), 'Content-Type': 'application/json' } })
  }
  if (intent === 'logout') {
    const { error } = await supabase.auth.signOut()
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { headers: { ...Object.fromEntries(headers), 'Content-Type': 'application/json' }, status: 400 })
    }
    throw redirect('/auth', { headers })
  }
  return new Response(JSON.stringify({ error: 'Unsupported action' }), { headers: { 'Content-Type': 'application/json' }, status: 400 })
}
