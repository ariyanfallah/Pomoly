import { useState } from 'react'
import { useNavigation, Link } from 'react-router'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Alert, AlertDescription } from '../ui/alert'
import { Loader2, Mail, AlertCircle, CheckCircle2 } from 'lucide-react'

export function ForgotPasswordForm({ error, success }: { error?: string | null; success?: string | null }) {
  const [email, setEmail] = useState('')
  const navigation = useNavigation()
  const loading = navigation.state === 'submitting'

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Reset Password</CardTitle>
        <CardDescription>
          Enter your email address and we'll send you a link to reset your password
        </CardDescription>
      </CardHeader>
      <CardContent>
        {success ? (
          <Alert variant="success" className="mb-6">
            <CheckCircle2 className="h-5 w-5" />
            <AlertDescription className="font-medium">
              {success}
            </AlertDescription>
          </Alert>
        ) : null}
        
        <form method="post" className="space-y-4">
          <input type="hidden" name="intent" value="forgot-password" />
          {error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-5 w-5" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={loading}
            />
          </div>

          <Button type="submit" className="w-full !mt-8" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send Reset Link
          </Button>

          <div className="text-center mt-4">
            <Link
              to="/auth"
              className="text-sm text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline"
            >
              Back to Sign In
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

