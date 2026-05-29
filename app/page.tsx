import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Zap } from 'lucide-react'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-navy flex items-center justify-center">
              <Zap className="w-5 h-5 text-brand-gold" />
            </div>
            <span className="font-semibold text-brand-navy text-lg">Power AI Sales Engine</span>
          </div>
          <Link href="/sign-in">
            <Button variant="outline" className="border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white">
              Sign In
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-2xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-brand-navy leading-tight text-balance">
            Warm leads. Build relationships. Close deals.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed text-pretty">
            Power AI Sales Engine is your AI-powered partner for smarter outreach. 
            We help you find the right prospects, warm them up with personalized sequences, 
            and turn conversations into customers.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-in">
              <Button size="lg" className="bg-brand-teal hover:bg-brand-teal/90 text-white px-8">
                Get Started
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="border-brand-navy text-brand-navy">
              See how it works
            </Button>
          </div>
          <p className="mt-12 text-sm text-muted-foreground italic">
            &ldquo;Remove gates. Build bridges. Carry fire.&rdquo;
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Power AI Funds. Built with purpose.
      </footer>
    </div>
  )
}
