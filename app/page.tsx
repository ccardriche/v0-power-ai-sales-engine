import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Zap, ArrowRight, CheckCircle, Users, TrendingUp, Bot } from 'lucide-react'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-teal flex items-center justify-center shadow-lg shadow-brand-teal/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-foreground text-lg tracking-tight">Power AI</span>
              <span className="block text-xs text-muted-foreground font-medium -mt-0.5">Sales Engine</span>
            </div>
          </div>
          <Link href="/sign-in">
            <Button className="bg-brand-navy hover:bg-brand-navy/90 text-white font-medium">
              Sign In
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand-teal/5 via-transparent to-brand-gold/5" />
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-brand-teal/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-brand-gold/10 rounded-full blur-3xl" />
          
          <div className="container mx-auto px-6 py-24 md:py-32 relative">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-teal/10 text-brand-teal text-sm font-medium mb-8">
                <Bot className="w-4 h-4" />
                AI-Powered Outreach Platform
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-[1.1] tracking-tight text-balance">
                Warm leads.
                <br />
                <span className="text-brand-teal">Build relationships.</span>
                <br />
                Close deals.
              </h1>
              
              <p className="mt-8 text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto text-pretty">
                Your AI partner for smarter outreach. Find the right prospects, warm them with personalized sequences, and turn conversations into customers.
              </p>
              
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/sign-in">
                  <Button size="lg" className="gradient-teal hover:opacity-90 text-white font-semibold px-8 h-14 text-base shadow-lg shadow-brand-teal/25">
                    Get Started Free
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-2 border-brand-navy/20 text-brand-navy font-semibold h-14 text-base hover:bg-brand-navy hover:text-white"
                >
                  Watch Demo
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 border-t border-border/50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                Everything you need to scale outreach
              </h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                AI agents work around the clock to keep your pipeline warm and your team focused on closing.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard 
                icon={Users}
                title="Lead Scoring & Enrichment"
                description="AI automatically scores and enriches your leads based on engagement signals and fit criteria."
              />
              <FeatureCard 
                icon={Bot}
                title="Multi-Channel Sequences"
                description="Coordinate email, SMS, LinkedIn, and social posts in intelligent, personalized sequences."
              />
              <FeatureCard 
                icon={TrendingUp}
                title="Performance Analytics"
                description="See what&apos;s working with real-time insights on reply rates, themes, and channel performance."
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-br from-brand-navy via-brand-navy to-[#1e3a5f]">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-6">
              Ready to transform your outreach?
            </h2>
            <p className="text-lg text-white/70 max-w-xl mx-auto mb-10">
              Join founders and sales teams who are closing more deals with less effort.
            </p>
            <Link href="/sign-in">
              <Button size="lg" className="bg-white text-brand-navy hover:bg-white/90 font-semibold px-8 h-14 text-base">
                Start for free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Power AI Funds. Built with purpose.
          </p>
          <p className="text-sm text-muted-foreground italic">
            &ldquo;Remove gates. Build bridges. Carry fire.&rdquo;
          </p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ 
  icon: Icon, 
  title, 
  description 
}: { 
  icon: typeof Users
  title: string
  description: string 
}) {
  return (
    <div className="p-8 rounded-2xl border border-border/50 bg-card hover:shadow-lg hover:shadow-brand-teal/5 transition-all duration-300 card-hover">
      <div className="w-14 h-14 rounded-2xl bg-brand-teal/10 flex items-center justify-center mb-6">
        <Icon className="w-7 h-7 text-brand-teal" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  )
}
