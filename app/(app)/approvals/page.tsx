'use client'

import { useEffect, useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CheckCircle, XCircle, Clock, MessageSquare, Mail, Linkedin, Send, FileText, Megaphone, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface ApprovalItem {
  id: string
  entity_type: 'campaign' | 'sequence' | 'outreach_message' | 'social_post'
  entity_id: string
  status: 'pending_approval' | 'approved' | 'rejected'
  reviewer_notes: string | null
  created_at: string
  reviewed_at: string | null
  // Joined data
  entity_name?: string
  entity_content?: string
  entity_channel?: string
  campaign_name?: string
  sequence_name?: string
  lead_name?: string
}

const COMPANY_ID = '00000000-0000-0000-0000-000000000001'

function getEntityIcon(type: string, channel?: string) {
  if (type === 'outreach_message') {
    switch (channel) {
      case 'email': return <Mail className="h-4 w-4" />
      case 'linkedin': return <Linkedin className="h-4 w-4" />
      case 'sms': return <MessageSquare className="h-4 w-4" />
      default: return <Send className="h-4 w-4" />
    }
  }
  switch (type) {
    case 'campaign': return <Megaphone className="h-4 w-4" />
    case 'sequence': return <FileText className="h-4 w-4" />
    case 'social_post': return <MessageSquare className="h-4 w-4" />
    default: return <FileText className="h-4 w-4" />
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'pending_approval':
      return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
    case 'approved':
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>
    case 'rejected':
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffDays > 0) return `${diffDays}d ago`
  if (diffHours > 0) return `${diffHours}h ago`
  if (diffMins > 0) return `${diffMins}m ago`
  return 'just now'
}

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<ApprovalItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApproval, setSelectedApproval] = useState<ApprovalItem | null>(null)
  const [reviewNotes, setReviewNotes] = useState('')
  const [isPending, startTransition] = useTransition()
  const supabase = createClient()

  useEffect(() => {
    loadApprovals()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadApprovals() {
    setLoading(true)
    
    const { data: approvalsData, error: approvalsError } = await supabase
      .from('approvals')
      .select('*')
      .eq('company_id', COMPANY_ID)
      .order('created_at', { ascending: false })

    if (approvalsError) {
      console.error('[v0] Error loading approvals:', approvalsError)
      toast.error('Failed to load approvals')
      setLoading(false)
      return
    }

    const enrichedApprovals: ApprovalItem[] = []
    
    for (const approval of approvalsData || []) {
      const item: ApprovalItem = { ...approval }
      
      try {
        switch (approval.entity_type) {
          case 'campaign': {
            const { data } = await supabase
              .from('campaigns')
              .select('name')
              .eq('id', approval.entity_id)
              .single()
            item.entity_name = data?.name || 'Unknown Campaign'
            break
          }
          case 'sequence': {
            const { data } = await supabase
              .from('outreach_sequences')
              .select('name, campaigns(name)')
              .eq('id', approval.entity_id)
              .single()
            item.entity_name = data?.name || 'Unknown Sequence'
            item.campaign_name = (data as { campaigns?: { name: string } })?.campaigns?.name
            break
          }
          case 'outreach_message': {
            const { data } = await supabase
              .from('outreach_messages')
              .select('subject, body, channel, leads(first_name, last_name)')
              .eq('id', approval.entity_id)
              .single()
            item.entity_name = data?.subject || 'No Subject'
            item.entity_content = data?.body || ''
            item.entity_channel = data?.channel
            const lead = data as { leads?: { first_name: string; last_name: string } }
            item.lead_name = lead?.leads ? `${lead.leads.first_name || ''} ${lead.leads.last_name || ''}`.trim() : undefined
            break
          }
          case 'social_post': {
            const { data } = await supabase
              .from('social_posts')
              .select('content, platform')
              .eq('id', approval.entity_id)
              .single()
            item.entity_name = data?.platform ? `${data.platform} post` : 'Social Post'
            item.entity_content = data?.content || ''
            item.entity_channel = data?.platform
            break
          }
        }
      } catch (e) {
        console.error('[v0] Error enriching approval:', e)
      }
      
      enrichedApprovals.push(item)
    }

    setApprovals(enrichedApprovals)
    setLoading(false)
  }

  async function handleApprove(approval: ApprovalItem) {
    startTransition(async () => {
      const { error } = await supabase
        .from('approvals')
        .update({ 
          status: 'approved', 
          reviewer_notes: reviewNotes || null,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', approval.id)

      if (error) {
        toast.error('Failed to approve')
        return
      }

      if (approval.entity_type === 'campaign') {
        await supabase
          .from('campaigns')
          .update({ status: 'active' })
          .eq('id', approval.entity_id)
      } else if (approval.entity_type === 'sequence') {
        await supabase
          .from('outreach_sequences')
          .update({ status: 'active' })
          .eq('id', approval.entity_id)
      }

      await supabase.from('agent_logs').insert({
        company_id: COMPANY_ID,
        action: 'approval_granted',
        details: { 
          approval_id: approval.id, 
          entity_type: approval.entity_type,
          entity_id: approval.entity_id,
          notes: reviewNotes || null
        }
      })

      toast.success('Approved successfully')
      setSelectedApproval(null)
      setReviewNotes('')
      loadApprovals()
    })
  }

  async function handleReject(approval: ApprovalItem) {
    if (!reviewNotes.trim()) {
      toast.error('Please add a note explaining the rejection')
      return
    }

    startTransition(async () => {
      const { error } = await supabase
        .from('approvals')
        .update({ 
          status: 'rejected', 
          reviewer_notes: reviewNotes,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', approval.id)

      if (error) {
        toast.error('Failed to reject')
        return
      }

      await supabase.from('agent_logs').insert({
        company_id: COMPANY_ID,
        action: 'approval_rejected',
        details: { 
          approval_id: approval.id, 
          entity_type: approval.entity_type,
          entity_id: approval.entity_id,
          notes: reviewNotes
        }
      })

      toast.success('Rejected with feedback')
      setSelectedApproval(null)
      setReviewNotes('')
      loadApprovals()
    })
  }

  const pendingApprovals = approvals.filter(a => a.status === 'pending_approval')
  const reviewedApprovals = approvals.filter(a => a.status !== 'pending_approval')
  const campaignApprovals = approvals.filter(a => a.entity_type === 'campaign')
  const sequenceApprovals = approvals.filter(a => a.entity_type === 'sequence')
  const messageApprovals = approvals.filter(a => a.entity_type === 'outreach_message' || a.entity_type === 'social_post')

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-brand-teal" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-brand-ink">Approvals</h1>
        <p className="text-muted-foreground mt-1">
          Review and approve campaigns, sequences, and messages before they go live.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending Review</CardDescription>
            <CardTitle className="text-3xl text-brand-navy">{pendingApprovals.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Campaigns</CardDescription>
            <CardTitle className="text-3xl">{campaignApprovals.filter(a => a.status === 'pending_approval').length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Sequences</CardDescription>
            <CardTitle className="text-3xl">{sequenceApprovals.filter(a => a.status === 'pending_approval').length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Messages</CardDescription>
            <CardTitle className="text-3xl">{messageApprovals.filter(a => a.status === 'pending_approval').length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pendingApprovals.length})
          </TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="sequences">Sequences</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingApprovals.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-brand-ink">All caught up</h3>
                <p className="text-muted-foreground mt-1">
                  No pending approvals. Your AI-powered outreach is ready to run.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {pendingApprovals.map((approval) => (
                <ApprovalCard
                  key={approval.id}
                  approval={approval}
                  onReview={() => {
                    setSelectedApproval(approval)
                    setReviewNotes('')
                  }}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          {campaignApprovals.length === 0 ? (
            <EmptyState 
              title="No campaign approvals" 
              description="Campaign approvals will appear here when you create new campaigns." 
            />
          ) : (
            <div className="space-y-3">
              {campaignApprovals.map((approval) => (
                <ApprovalCard
                  key={approval.id}
                  approval={approval}
                  onReview={() => {
                    setSelectedApproval(approval)
                    setReviewNotes('')
                  }}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sequences" className="space-y-4">
          {sequenceApprovals.length === 0 ? (
            <EmptyState 
              title="No sequence approvals" 
              description="Sequence approvals will appear here when you finalize sequences in the Campaign Builder." 
            />
          ) : (
            <div className="space-y-3">
              {sequenceApprovals.map((approval) => (
                <ApprovalCard
                  key={approval.id}
                  approval={approval}
                  onReview={() => {
                    setSelectedApproval(approval)
                    setReviewNotes('')
                  }}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="messages" className="space-y-4">
          {messageApprovals.length === 0 ? (
            <EmptyState 
              title="No message approvals" 
              description="Individual message approvals will appear here when high-touch review is enabled." 
            />
          ) : (
            <div className="space-y-3">
              {messageApprovals.map((approval) => (
                <ApprovalCard
                  key={approval.id}
                  approval={approval}
                  onReview={() => {
                    setSelectedApproval(approval)
                    setReviewNotes('')
                  }}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {reviewedApprovals.length === 0 ? (
            <EmptyState 
              title="No approval history" 
              description="Your reviewed approvals will appear here." 
            />
          ) : (
            <div className="space-y-3">
              {reviewedApprovals.map((approval) => (
                <ApprovalCard
                  key={approval.id}
                  approval={approval}
                  onReview={() => {
                    setSelectedApproval(approval)
                    setReviewNotes(approval.reviewer_notes || '')
                  }}
                  readOnly
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={!!selectedApproval} onOpenChange={() => setSelectedApproval(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedApproval && getEntityIcon(selectedApproval.entity_type, selectedApproval.entity_channel)}
              Review {selectedApproval?.entity_type.replace('_', ' ')}
            </DialogTitle>
            <DialogDescription>
              {selectedApproval?.entity_name}
              {selectedApproval?.campaign_name && (
                <span className="text-muted-foreground"> in {selectedApproval.campaign_name}</span>
              )}
              {selectedApproval?.lead_name && (
                <span className="text-muted-foreground"> to {selectedApproval.lead_name}</span>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedApproval?.entity_content && (
            <div className="bg-muted/50 rounded-lg p-4 max-h-64 overflow-y-auto">
              <p className="text-sm whitespace-pre-wrap">{selectedApproval.entity_content}</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {selectedApproval?.status === 'pending_approval' ? 'Review Notes (optional for approval, required for rejection)' : 'Review Notes'}
            </label>
            <Textarea
              placeholder="Add notes about this approval..."
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              rows={3}
              disabled={selectedApproval?.status !== 'pending_approval'}
            />
          </div>

          <DialogFooter>
            {selectedApproval?.status === 'pending_approval' ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => selectedApproval && handleReject(selectedApproval)}
                  disabled={isPending}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => selectedApproval && handleApprove(selectedApproval)}
                  disabled={isPending}
                  className="bg-brand-teal hover:bg-brand-teal/90"
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Approve
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setSelectedApproval(null)}>
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ApprovalCard({ 
  approval, 
  onReview,
  readOnly = false 
}: { 
  approval: ApprovalItem
  onReview: () => void
  readOnly?: boolean
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="mt-1 p-2 rounded-lg bg-muted">
              {getEntityIcon(approval.entity_type, approval.entity_channel)}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-brand-ink">{approval.entity_name}</span>
                {getStatusBadge(approval.status)}
              </div>
              <p className="text-sm text-muted-foreground">
                {approval.entity_type.replace('_', ' ')}
                {approval.campaign_name && ` in ${approval.campaign_name}`}
                {approval.lead_name && ` to ${approval.lead_name}`}
              </p>
              {approval.entity_content && (
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {approval.entity_content}
                </p>
              )}
              {approval.reviewer_notes && (
                <p className="text-sm text-muted-foreground italic mt-2">
                  Note: {approval.reviewer_notes}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                {approval.reviewed_at 
                  ? `Reviewed ${formatTimeAgo(approval.reviewed_at)}`
                  : `Submitted ${formatTimeAgo(approval.created_at)}`
                }
              </p>
            </div>
          </div>
          <Button
            variant={readOnly ? 'ghost' : 'outline'}
            size="sm"
            onClick={onReview}
          >
            {readOnly ? 'View' : 'Review'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-brand-ink">{title}</h3>
        <p className="text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  )
}
