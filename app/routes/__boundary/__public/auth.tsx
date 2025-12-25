import { useEffect, useState } from "react";
import { LoginForm } from "../../../components/auth/LoginForm";
import { SignUpForm } from "../../../components/auth/SignUpForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { useActionData, redirect, type MetaFunction } from "react-router";
import type { Route } from "../../../+types/root";
import { createSupabaseServerClient } from "../../../lib/supabase.server";
import { brandConfig } from "~/configs/brand.config";

type AuthActionData = {
  intent?: "login" | "signup" | "logout"
  error?: string | null
  success?: string | null
} | undefined

export const meta: MetaFunction = () => {
  return [
    {
      title: `Authentication | ${brandConfig.brandName}`,
    },
    {
      name: "description",
      content: `Sign in to your ${brandConfig.brandName} account or create a new one to start tracking your productivity sessions.`,
    },
    {
      name: "keywords",
      content: "sign in, login, sign up, authentication, pomodoro, productivity, timer",
    },
    {
      property: "og:title",
      content: `Sign In | ${brandConfig.brandName}`,
    },
    {
      property: "og:description",
      content: `Sign in to your ${brandConfig.brandName} account or create a new one to start tracking your productivity sessions.`,
    },
    {
      property: "og:type",
      content: "website",
    },
    {
      name: "twitter:card",
      content: "summary",
    },
    {
      name: "twitter:title",
      content: `Sign In | ${brandConfig.brandName}`,
    },
    {
      name: "twitter:description",
      content: `Sign in to your ${brandConfig.brandName} account or create a new one to start tracking your productivity sessions.`,
    },
  ];
};

export default function Auth() {
  const actionData = useActionData() as AuthActionData
  const [activeTab, setActiveTab] = useState<"login" | "signup">(
    actionData?.intent === "signup" ? "signup" : "login"
  )
  const handleTabChange = (value: string) => {
    if (value === "login" || value === "signup") {
      setActiveTab(value)
    }
  }

  useEffect(() => {
    if (actionData?.intent === "login" || actionData?.intent === "signup") {
      setActiveTab(actionData.intent)
    }
  }, [actionData?.intent])
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Welcome to <span className="text-primary">{brandConfig.brandName}!</span></h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account or create a new one
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="space-y-4">
            <LoginForm error={actionData?.intent === "login" ? actionData?.error ?? null : null} />
          </TabsContent>
          
          <TabsContent value="signup" className="space-y-4">
            <SignUpForm
              error={actionData?.intent === "signup" ? actionData?.error ?? null : null}
              success={actionData?.intent === "signup" ? actionData?.success ?? null : null}
            />
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
      return new Response(
        JSON.stringify({ intent: 'login', error: error.message }),
        { headers: { ...Object.fromEntries(headers), 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    if (data.session) {
      await supabase.auth.setSession({ access_token: data.session.access_token, refresh_token: data.session.refresh_token })
    }
    throw redirect('/', { headers })
  }
  if (intent === 'signup') {
    const email = String(formData.get('email') ?? '')
    const password = String(formData.get('password') ?? '')
    const origin = new URL(request.url).origin
    if (password.length < 6) {
      return new Response(
        JSON.stringify({ intent: 'signup', error: 'Password must be at least 6 characters long' }),
        { headers: { ...Object.fromEntries(headers), 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
      },
    })
    if (error) {
      return new Response(
        JSON.stringify({ intent: 'signup', error: error.message }),
        { headers: { ...Object.fromEntries(headers), 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    return new Response(
      JSON.stringify({ intent: 'signup', success: 'Check your email for a confirmation link!' }),
      { headers: { ...Object.fromEntries(headers), 'Content-Type': 'application/json' } }
    )
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
