import { ForgotPasswordForm } from "../../../components/auth/ForgotPasswordForm"
import { useActionData, redirect, type MetaFunction } from "react-router"
import type { Route } from "../../../+types/root"
import { createSupabaseServerClient } from "../../../lib/supabase.server"
import { brandConfig } from "~/configs/brand.config"

type ForgotPasswordActionData = {
  intent?: "forgot-password"
  error?: string | null
  success?: string | null
} | undefined

export const meta: MetaFunction = () => {
  return [
    {
      title: `Reset Password | ${brandConfig.brandName}`,
    },
    {
      name: "description",
      content: `Reset your ${brandConfig.brandName} account password.`,
    },
  ]
}

export default function ForgotPassword() {
  const actionData = useActionData() as ForgotPasswordActionData

  return (
    <div className="min-h-screen flex items-start justify-center pt-16">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Reset Your <span className="text-primary">Password</span>
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email to receive a password reset link
          </p>
        </div>
        
        <div className="mt-8">
          <ForgotPasswordForm
            error={actionData?.intent === "forgot-password" ? actionData?.error ?? null : null}
            success={actionData?.intent === "forgot-password" ? actionData?.success ?? null : null}
          />
        </div>
      </div>
    </div>
  )
}

export async function loader({ request }: Route.LoaderArgs) {
  const { supabase, headers } = createSupabaseServerClient(request)
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    throw redirect('/', { headers })
  }
  return new Response(null, { headers })
}

export async function action({ request }: Route.ActionArgs) {
  const { supabase, headers } = createSupabaseServerClient(request)
  const formData = await request.formData()
  const intent = String(formData.get('intent') ?? '')
  
  if (intent === 'forgot-password') {
    const email = String(formData.get('email') ?? '')
    
    if (!email) {
      return new Response(
        JSON.stringify({ intent: 'forgot-password', error: 'Email is required' }),
        { headers: { ...Object.fromEntries(headers), 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const origin = new URL(request.url).origin
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/callback`,
    })

    if (error) {
      return new Response(
        JSON.stringify({ intent: 'forgot-password', error: error.message }),
        { headers: { ...Object.fromEntries(headers), 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    return new Response(
      JSON.stringify({ 
        intent: 'forgot-password', 
        success: 'Check your email for a password reset link!' 
      }),
      { headers: { ...Object.fromEntries(headers), 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ error: 'Unsupported action' }), 
    { headers: { 'Content-Type': 'application/json' }, status: 400 }
  )
}

