import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Get company
    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('name', 'Power AI Funds')
      .single()

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // Get segments
    const { data: segments } = await supabase
      .from('segments')
      .select('id, name')
      .eq('company_id', company.id)
      .order('name')

    // Get subscription plan
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('subscription_plans(leads_per_month)')
      .eq('company_id', company.id)
      .eq('status', 'active')
      .single()

    // Get usage limits for current period
    const now = new Date().toISOString()
    const { data: usage } = await supabase
      .from('usage_limits')
      .select('leads_used')
      .eq('company_id', company.id)
      .lte('period_start', now)
      .gte('period_end', now)
      .single()

    const plan = {
      leads_per_month: (subscription?.subscription_plans as { leads_per_month?: number })?.leads_per_month || 1000,
      leads_used: usage?.leads_used || 0,
    }

    return NextResponse.json({
      companyId: company.id,
      segments: segments || [],
      plan,
    })
  } catch (error) {
    console.error('Campaign data error:', error)
    return NextResponse.json(
      { error: 'Failed to load campaign data' },
      { status: 500 }
    )
  }
}
