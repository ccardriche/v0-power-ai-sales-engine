import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/sidebar'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/sign-in')
  }

  // Check if company needs onboarding
  const { data: company } = await supabase
    .from('companies')
    .select('brand_voice')
    .eq('name', 'Power AI Funds')
    .single()

  // If brand_voice is empty/null, redirect to onboarding
  if (!company?.brand_voice) {
    redirect('/onboarding')
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
