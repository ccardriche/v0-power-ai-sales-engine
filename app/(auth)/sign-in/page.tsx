'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Zap, Mail, CheckCircle, ArrowRight, Sparkles } from 'lucide-react'
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
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-brand-teal/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-brand-gold/5 rounded-full blur-3xl pointer-events-none" />
      
      {/* Header */}
      <header className="border-b border-border/50 bg-white/80 backdrop-blur-sm relative z-10">
        <div className="container mx-auto px-6 py-4">
          <Link href="/" className="flex items-center gap-3 w-fit">
            <div className="w-10 h-10 rounded-xl gradient-teal flex items-center justify-center shadow-lg shadow-brand-teal/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-foreground text-lg tracking-tight">Power AI</span>
              <span className="block text-xs text-muted-foreground font-medium -mt-0.5">Sales Engine</span>
            </div>
          </Link>
        </div>
      </header>

      {/* Sign In Form */}
      <main className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">
        <div className="w-full max-w-md">
          <Card className="border-0 shadow-xl shadow-black/5">
            <CardHeader className="text-center pb-2 pt-8">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-brand-teal/10 flex items-center justify-center mb-6">
                {isSuccess ? (
                  <CheckCircle className="w-8 h-8 text-brand-teal" />
                ) : (
                  <Mail className="w-8 h-8 text-brand-teal" />
                )}
              </div>
              <CardTitle className="text-2xl font-bold text-foreground tracking-tight">
                {isSuccess ? 'Check your email' : 'Welcome back'}
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-2">
                {isSuccess 
                  ? `We sent a magic link to ${email}. Click it to sign in.`
                  : "Enter your email and we'll send you a magic link."
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 pb-8 px-8">
              {!isSuccess ? (
                <form onSubmit={handleSignIn} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      className="h-12 px-4 bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-brand-teal"
                    />
                  </div>
                  {error && (
                    <p className="text-sm text-destructive bg-destructive/10 px-4 py-3 rounded-lg">{error}</p>
                  )}
                  <Button 
                    type="submit" 
                    className="w-full h-12 gradient-teal hover:opacity-90 text-white font-semibold shadow-lg shadow-brand-teal/25"
                    disabled={isLoading || isDemoLoading}
                  >
                    {isLoading ? (
                      <>
                        <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send magic link
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-3 text-muted-foreground font-medium">Or continue with</span>
                    </div>
                  </div>

                  <Button 
                    type="button"
                    variant="outline"
                    className="w-full h-12 border-2 border-brand-navy/20 text-brand-navy font-semibold hover:bg-brand-navy hover:text-white transition-all"
                    disabled={isLoading || isDemoLoading}
                    onClick={handleDemoLogin}
                  >
                    {isDemoLoading ? (
                      <>
                        <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                        Signing in...
                      </>
                    ) : (
                      'Try Demo Account'
                    )}
                  </Button>
                </form>
              ) : (
                <div className="text-center space-y-5">
                  <div className="p-4 rounded-xl bg-brand-teal/5 border border-brand-teal/20">
                    <p className="text-sm text-muted-foreground">
                      Didn&apos;t receive the email? Check your spam folder.
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full h-12 font-semibold"
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
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center relative z-10">
        <p className="text-sm text-muted-foreground italic">
          &ldquo;Remove gates. Build bridges. Carry fire.&rdquo;
        </p>
      </footer>
    </div>
  )
}
