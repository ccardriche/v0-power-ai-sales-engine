'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const AGENTS_BY_GROUP = {
  Pipeline: [
    { id: 'lead-generator', label: 'Lead Generator', desc: 'Source verified leads daily' },
    { id: 'cold-email', label: 'Cold Email', desc: 'Send personalized outreach' },
    { id: 'crm-memory', label: 'CRM/Memory', desc: 'Score and enrich leads' },
  ],
  'Outreach Amplifiers': [
    { id: 'linkedin', label: 'LinkedIn', desc: 'Connection requests & followups' },
    { id: 'sms', label: 'SMS', desc: 'Text message outreach' },
    { id: 'social-generate', label: 'Social Drafter', desc: 'Draft social content' },
    { id: 'social-schedule', label: 'Social Scheduler', desc: 'Schedule to Buffer' },
  ],
  'Operations & Insights': [
    { id: 'ads', label: 'Ads', label: 'Create ad campaigns' },
    { id: 'analytics', label: 'Analytics', desc: 'Weekly performance reports' },
    { id: 'approval-reminders', label: 'Approval Reminders', desc: 'Alert on stale approvals' },
  ],
}

export default function AgentGallery() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Agent Gallery</h1>
          <p className="text-muted-foreground mt-2">Configure your AI sales agents</p>
        </div>

        {Object.entries(AGENTS_BY_GROUP).map(([group, agents]) => (
          <div key={group} className="space-y-4">
            <h2 className="text-lg font-semibold text-muted-foreground uppercase tracking-wide">{group}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {agents.map((agent) => (
                <Link key={agent.id} href={`/setup/agents/${agent.id}`}>
                  <Card className="h-full hover:border-brand-teal hover:shadow-lg transition-all cursor-pointer">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{agent.label}</span>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{agent.desc}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
