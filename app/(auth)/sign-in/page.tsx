'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Zap, Mail, CheckCircle, ArrowRight, Sparkles, UserPlus, LogIn } from 'lucide-react'
import Link from 'next/link'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isDemoLoading, setIsDemoLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin')

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
      
      // If password is provided, use password auth; otherwise use magic link
      if (password) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        window.location.href = '/dashboard'
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? 
              `${window.location.origin}/callback`,
          },
        })
        if (error) throw error
        setSuccessMessage(`We sent a magic link to ${email}. Click it to sign in.`)
        setIsSuccess(true)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      setIsLoading(false)
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      setIsLoading(false)
      return
    }

    try {
      const supabase = createClient()
      
      // Sign up with password
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (signUpError) throw signUpError
      
      // If signup successful and user is auto-confirmed (no email verification required),
      // sign them in immediately
      if (authData.user) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        
        if (signInError) {
          // If auto-signin fails, tell user to check email or try again
          setSuccessMessage(`Account created! You can now sign in with your email and password.`)
          setIsSuccess(true)
        } else {
          // Successfully signed in after signup
          window.location.href = '/dashboard'
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setIsSuccess(false)
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setError(null)
    setSuccessMessage('')
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

      {/* Sign In / Sign Up Form */}
      <main className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">
        <div className="w-full max-w-md">
          <Card className="border-0 shadow-xl shadow-black/5">
            {isSuccess ? (
              <>
                <CardHeader className="text-center pb-2 pt-8">
                  <div className="mx-auto w-16 h-16 rounded-2xl bg-brand-teal/10 flex items-center justify-center mb-6">
                    <CheckCircle className="w-8 h-8 text-brand-teal" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-foreground tracking-tight">
                    Check your email
                  </CardTitle>
                  <CardDescription className="text-muted-foreground mt-2">
                    {successMessage}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 pb-8 px-8">
                  <div className="text-center space-y-5">
                    <div className="p-4 rounded-xl bg-brand-teal/5 border border-brand-teal/20">
                      <p className="text-sm text-muted-foreground">
                        Didn&apos;t receive the email? Check your spam folder.
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full h-12 font-semibold"
                      onClick={resetForm}
                    >
                      Try again
                    </Button>
                  </div>
                </CardContent>
              </>
            ) : (
              <>
                <CardHeader className="text-center pb-2 pt-8">
                  <div className="mx-auto w-16 h-16 rounded-2xl bg-brand-teal/10 flex items-center justify-center mb-6">
                    {activeTab === 'signin' ? (
                      <LogIn className="w-8 h-8 text-brand-teal" />
                    ) : (
                      <UserPlus className="w-8 h-8 text-brand-teal" />
                    )}
                  </div>
                  <CardTitle className="text-2xl font-bold text-foreground tracking-tight">
                    {activeTab === 'signin' ? 'Welcome back' : 'Create your account'}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground mt-2">
                    {activeTab === 'signin' 
                      ? 'Sign in with your email and password, or use a magic link.'
                      : 'Get started with Power AI Sales Engine today.'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4 pb-8 px-8">
                  <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as 'signin' | 'signup'); setError(null); }}>
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="signin" className="font-medium">Sign In</TabsTrigger>
                      <TabsTrigger value="signup" className="font-medium">Sign Up</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="signin">
                      <form onSubmit={handleSignIn} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="signin-email" className="text-sm font-medium">Email address</Label>
                          <Input
                            id="signin-email"
                            type="email"
                            placeholder="you@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isLoading}
                            className="h-12 px-4 bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-brand-teal"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signin-password" className="text-sm font-medium">
                            Password <span className="text-muted-foreground font-normal">(optional for magic link)</span>
                          </Label>
                          <Input
                            id="signin-password"
                            type="password"
                            placeholder="Enter password or leave blank for magic link"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
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
                              {password ? 'Signing in...' : 'Sending...'}
                            </>
                          ) : (
                            <>
                              {password ? 'Sign in' : 'Send magic link'}
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </>
                          )}
                        </Button>

                        <div className="relative my-4">
                          <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-border" />
                          </div>
                          <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-3 text-muted-foreground font-medium">Or</span>
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
                    </TabsContent>
                    
                    <TabsContent value="signup">
                      <form onSubmit={handleSignUp} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="signup-email" className="text-sm font-medium">Email address</Label>
                          <Input
                            id="signup-email"
                            type="email"
                            placeholder="you@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isLoading}
                            className="h-12 px-4 bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-brand-teal"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-password" className="text-sm font-medium">Password</Label>
                          <Input
                            id="signup-password"
                            type="password"
                            placeholder="At least 8 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isLoading}
                            className="h-12 px-4 bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-brand-teal"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-confirm" className="text-sm font-medium">Confirm password</Label>
                          <Input
                            id="signup-confirm"
                            type="password"
                            placeholder="Re-enter your password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
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
                              Creating account...
                            </>
                          ) : (
                            <>
                              Create account
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </>
                          )}
                        </Button>
                        
                        <p className="text-xs text-center text-muted-foreground mt-4">
                          By creating an account, you agree to our terms of service and privacy policy.
                        </p>
                      </form>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </>
            )}
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
