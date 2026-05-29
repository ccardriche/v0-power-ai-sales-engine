'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Zap, Mail, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isDemoLoading, setIsDemoLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDemoLogin = async () => {
    setIsDemoLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email: 'demo@powerai.dev',
        password: 'demo1234',
      })

      if (error) throw error
      window.location.href = '/dashboard'
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Demo login failed. Please try again.')
    } finally {
      setIsDemoLoading(false)
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? 
            `${window.location.origin}/callback`,
        },
      })

      if (error) throw error
      setIsSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-navy flex items-center justify-center">
              <Zap className="w-5 h-5 text-brand-gold" />
            </div>
            <span className="font-semibold text-brand-navy text-lg">Power AI Sales Engine</span>
          </Link>
        </div>
      </header>

      {/* Sign In Form */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-brand-teal/10 flex items-center justify-center mb-4">
              {isSuccess ? (
                <CheckCircle className="w-6 h-6 text-brand-teal" />
              ) : (
                <Mail className="w-6 h-6 text-brand-teal" />
              )}
            </div>
            <CardTitle className="text-2xl text-brand-navy">
              {isSuccess ? 'Check your email' : 'Welcome back'}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {isSuccess 
                ? `We sent a magic link to ${email}. Click it to sign in.`
                : "Enter your email and we'll send you a magic link to sign in."
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isSuccess ? (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
                <Button 
                  type="submit" 
                  className="w-full bg-brand-teal hover:bg-brand-teal/90 text-white"
                  disabled={isLoading || isDemoLoading}
                >
                  {isLoading ? 'Sending...' : 'Send magic link'}
                </Button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or</span>
                  </div>
                </div>

                <Button 
                  type="button"
                  variant="outline"
                  className="w-full border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white"
                  disabled={isLoading || isDemoLoading}
                  onClick={handleDemoLogin}
                >
                  {isDemoLoading ? 'Signing in...' : 'Try Demo Account'}
                </Button>
              </form>
            ) : (
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Didn&apos;t receive the email? Check your spam folder or try again.
                </p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setIsSuccess(false)
                    setEmail('')
                  }}
                >
                  Try again
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-muted-foreground">
        <p className="italic">&ldquo;Remove gates. Build bridges. Carry fire.&rdquo;</p>
      </footer>
    </div>
  )
}
