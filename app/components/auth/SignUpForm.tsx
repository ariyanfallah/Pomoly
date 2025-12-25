import { useState } from 'react'
import { useNavigation } from 'react-router'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Alert, AlertDescription } from '../ui/alert'
import { Loader2, Mail, AlertCircle } from 'lucide-react'

export function SignUpForm({ error, success }: { error?: string | null; success?: string | null }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordMismatch, setPasswordMismatch] = useState(false)
  const navigation = useNavigation()
  const loading = navigation.state === 'submitting'

  const handleSubmit = (e: React.FormEvent) => {
    const form = e.currentTarget as HTMLFormElement
    // client-side only validation; server revalidates too
    const formData = new FormData(form)
    const pwd = String(formData.get('password') ?? '')
    const cpwd = String(formData.get('confirmPassword') ?? '')
    if (pwd !== cpwd) {
      e.preventDefault()
      setPasswordMismatch(true)
      return
    }
    setPasswordMismatch(false)
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
    if (passwordMismatch && e.target.value === confirmPassword) {
      setPasswordMismatch(false)
    }
  }

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value)
    if (passwordMismatch && e.target.value === password) {
      setPasswordMismatch(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
        <CardDescription>
          Enter your details to create a new account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {success ? (
          <Alert variant="success" className="mb-6">
            <Mail className="h-5 w-5" />
            <AlertDescription className="font-medium">
              {success}
            </AlertDescription>
          </Alert>
        ) : null}
        
        <form method="post" onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="intent" value="signup" />
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

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              name="password"
              value={password}
              onChange={handlePasswordChange}
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              placeholder="Confirm your password"
              required
              disabled={loading}
              className={passwordMismatch ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {passwordMismatch && (
              <p className="text-sm text-destructive mt-1">
                Passwords do not match
              </p>
            )}
          </div>

          <Button type="submit" className="w-full !mt-8" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Account
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}


