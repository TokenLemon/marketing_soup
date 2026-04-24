'use client'
import { useState, useEffect } from 'react'
import LayoutShell from './layout-shell'
import ResearchView from './components/ResearchView'
import SignalsView from './components/SignalsView'
import RAGBoard from './components/RAGBoard'
import MeetingPrepView from './components/MeetingPrepView'

let globalCampaigns: any[] = []

export default function Home() {
  const [activeView, setActiveView] = useState('research')
  const [campaigns, setCampaigns] = useState<any[]>([])

  function addCampaign(campaign: any) {
    globalCampaigns = [...globalCampaigns, campaign]
    setCampaigns([...globalCampaigns])
  }

  function renderView() {
    switch (activeView) {
      case 'research':
        return (
          <ResearchView
            onCampaignLaunched={(campaign) => {
              addCampaign(campaign)
              setActiveView('approval')
            }}
          />
        )
      case 'approval':
        return <ApprovalView campaigns={campaigns} />
      case 'signals':
        return <SignalsView />
      case 'rag':
        return <RAGBoard />
      case 'meetingprep':
        return <MeetingPrepView />
      default:
        return (
          <div style={{ background: '#ffffff', border: '1px solid #e8e8ed', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#8888a0' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🚧</div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a2e', marginBottom: '4px' }}>Coming soon</div>
            <div style={{ fontSize: '13px' }}>This section is being built.</div>
          </div>
        )
    }
  }

  return (
    <LayoutShell activeView={activeView} setActiveView={setActiveView}>
      {renderView()}
    </LayoutShell>
  )
}

// ── Approval View ─────────────────────────────────────────────
function ApprovalView({ campaigns }: { campaigns: any[] }) {
  const [statuses, setStatuses] = useState<Record<string, 'pending' | 'approved' | 'rejected'>>({})
  const [editing, setEditing] = useState<Record<string, boolean>>({})
  const [editedBodies, setEditedBodies] = useState<Record<string, string>>({})
  const [gmailConnected, setGmailConnected] = useState(false)
  const [sending, setSending] = useState<Record<string, boolean>>({})
  const [sentStatus, setSentStatus] = useState<Record<string, string>>({})

 useEffect(() => {
  const params = new URLSearchParams(window.location.search)
  if (params.get('gmail') === 'connected') {
    setGmailConnected(true)
    window.history.replaceState({}, '', '/')
    return
  }
  // Check if Gmail cookie exists by probing the send endpoint
  fetch('/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ checkOnly: true }),
  }).then(r => {
    if (r.status !== 401) setGmailConnected(true)
  }).catch(() => {})
}, [])

  function getKey(ci: number, si: number) { return `${ci}-${si}` }
  function getStatus(ci: number, si: number) { return statuses[getKey(ci, si)] || 'pending' }

  function approve(ci: number, si: number) {
    setStatuses(prev => ({ ...prev, [getKey(ci, si)]: 'approved' }))
    setEditing(prev => ({ ...prev, [getKey(ci, si)]: false }))
  }

  function reject(ci: number, si: number) {
    setStatuses(prev => ({ ...prev, [getKey(ci, si)]: 'rejected' }))
  }

  function toggleEdit(ci: number, si: number, body: string) {
    const key = getKey(ci, si)
    if (!editedBodies[key]) setEditedBodies(prev => ({ ...prev, [key]: body }))
    setEditing(prev => ({ ...prev, [key]: !prev[key] }))
  }

  async function sendEmail(ci: number, si: number, item: any) {
    const key = getKey(ci, si)
    setSending(prev => ({ ...prev, [key]: true }))
    try {
      const body = editedBodies[key] ?? item.body ?? ''
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: item.email || '',
          subject: item.subject || 'Vymo — connecting',
          body,
          fromName: 'Vymo Sales',
        }),
      })
      const data = await res.json()
      if (data.success) {
        setSentStatus(prev => ({ ...prev, [key]: `✓ Sent from ${data.from}` }))
        setStatuses(prev => ({ ...prev, [key]: 'approved' }))
      } else if (res.status === 401) {
        setSentStatus(prev => ({ ...prev, [key]: 'Gmail not connected — click Connect Gmail above' }))
      } else {
        setSentStatus(prev => ({ ...prev, [key]: `Error: ${data.error}` }))
      }
    } catch (e) {
      setSentStatus(prev => ({ ...prev, [key]: 'Failed to send. Try again.' }))
    }
    setSending(prev => ({ ...prev, [key]: false }))
  }

  const allItems = campaigns.flatMap((c, ci) =>
    (c.content || []).map((item: any, si: number) => ({ ...item, ci, si, campaign: c }))
  )
  const pendingCount = allItems.filter(item => getStatus(item.ci, item.si) === 'pending').length
  const approvedCount = allItems.filter(item => getStatus(item.ci, item.si) === 'approved').length

  const GmailBanner = () => !gmailConnected ? (
    <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '10px', padding: '14px 18px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#d97706', marginBottom: '3px' }}>Connect Gmail to send approved emails</div>
        <div style={{ fontSize: '12px', color: '#8888a0' }}>One-time setup. Uses your Google Workspace account.</div>
      </div>
      <a href="/api/auth/gmail" style={{ background: '#0066cc', color: '#fff', borderRadius: '8px', padding: '8px 16px', fontSize: '12px', fontWeight: 600, textDecoration: 'none' }}>
        Connect Gmail →
      </a>
    </div>
  ) : (
    <div style={{ background: '#f0faf5', border: '1px solid #d1fae5', borderRadius: '10px', padding: '10px 18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{ color: '#059669', fontWeight: 600, fontSize: '13px' }}>✓ Gmail connected</span>
      <span style={{ fontSize: '12px', color: '#8888a0' }}>Approved emails will send from your Gmail account</span>
    </div>
  )

  if (campaigns.length === 0) {
    return (
      <div>
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '22px', fontWeight: 600, color: '#1a1a2e', marginBottom: '4px' }}>Approval Queue</div>
          <div style={{ fontSize: '13px', color: '#8888a0' }}>Review and approve AI-generated outreach before anything sends</div>
        </div>
        <GmailBanner />
        <div style={{ background: '#ffffff', border: '1px solid #e8e8ed', borderRadius: '12px', padding: '48px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>📭</div>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#1a1a2e', marginBottom: '6px' }}>No campaigns yet</div>
          <div style={{ fontSize: '13px', color: '#8888a0' }}>Run an account research and complete the flow to see campaigns here</div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '22px', fontWeight: 600, color: '#1a1a2e', marginBottom: '4px' }}>Approval Queue</div>
        <div style={{ fontSize: '13px', color: '#8888a0' }}>Review and approve AI-generated outreach before anything sends</div>
      </div>

      <GmailBanner />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
        <div style={{ background: '#ffffff', border: '1px solid #e8e8ed', borderRadius: '10px', padding: '16px' }}>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#d97706' }}>{pendingCount}</div>
          <div style={{ fontSize: '11px', color: '#8888a0', marginTop: '3px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Awaiting Review</div>
        </div>
        <div style={{ background: '#ffffff', border: '1px solid #e8e8ed', borderRadius: '10px', padding: '16px' }}>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#059669' }}>{approvedCount}</div>
          <div style={{ fontSize: '11px', color: '#8888a0', marginTop: '3px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Approved</div>
        </div>
        <div style={{ background: '#ffffff', border: '1px solid #e8e8ed', borderRadius: '10px', padding: '16px' }}>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#1a1a2e' }}>{allItems.length}</div>
          <div style={{ fontSize: '11px', color: '#8888a0', marginTop: '3px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Steps</div>
        </div>
      </div>

      <div style={{ background: '#f0faf5', border: '1px solid #d1fae5', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '12px', color: '#065f46', lineHeight: '1.6' }}>
        <strong>Nothing sends without your approval.</strong> Email steps send via Gmail after approval. LinkedIn and call steps are flagged for manual action.
      </div>

      {campaigns.map((campaign, ci) => (
        <div key={ci} style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#e8f4ff', color: '#0066cc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700 }}>
              {campaign.stakeholder?.initials || '?'}
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a2e' }}>
                {campaign.stakeholder?.name} — {campaign.company}
              </div>
              <div style={{ fontSize: '12px', color: '#8888a0' }}>
                {campaign.stakeholder?.role} · {(campaign.content || []).length} steps
              </div>
            </div>
            <div style={{ marginLeft: 'auto', fontSize: '11px', color: '#8888a0' }}>
              {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>

          {(campaign.content || []).map((item: any, si: number) => {
            const status = getStatus(ci, si)
            const key = getKey(ci, si)
            const isHuman = item.type === 'human'
            const body = editedBodies[key] ?? item.body ?? ''
            const borderColor = status === 'approved' ? '#059669' : status === 'rejected' ? '#dc2626' : '#e8e8ed'

            return (
              <div key={si} style={{ border: `1px solid ${borderColor}`, borderRadius: '10px', overflow: 'hidden', marginBottom: '10px', transition: 'border .2s' }}>
                <div style={{ padding: '10px 14px', background: status === 'approved' ? '#f0faf5' : status === 'rejected' ? '#fff0f0' : '#f5f5f7', borderBottom: '1px solid #e8e8ed', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#1a1a2e' }}>
                      Step {item.step} — {item.channel}{isHuman ? ' · Human Action' : ' · Email'}
                    </div>
                  </div>
                  {status === 'pending' && <span style={{ fontSize: '10px', background: '#fff7ed', color: '#d97706', padding: '2px 8px', borderRadius: '20px', fontWeight: 600 }}>PENDING</span>}
                  {status === 'approved' && <span style={{ fontSize: '10px', background: '#f0faf5', color: '#059669', padding: '2px 8px', borderRadius: '20px', fontWeight: 600 }}>✓ APPROVED</span>}
                  {status === 'rejected' && <span style={{ fontSize: '10px', background: '#fff0f0', color: '#dc2626', padding: '2px 8px', borderRadius: '20px', fontWeight: 600 }}>✕ REJECTED</span>}
                </div>

                <div style={{ padding: '14px', background: '#ffffff' }}>
                  {!isHuman && item.subject && (
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', padding: '8px 12px', background: '#f5f5f7', borderRadius: '6px' }}>
                      <span style={{ fontSize: '11px', color: '#8888a0', width: '55px', flexShrink: 0 }}>SUBJECT</span>
                      <span style={{ fontSize: '12px', color: '#1a1a2e', fontWeight: 500 }}>{item.subject}</span>
                    </div>
                  )}

                  {isHuman && (
                    <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '6px', padding: '8px 12px', marginBottom: '10px', fontSize: '11px', color: '#92400e' }}>
                      Copy the message below and send manually on {item.channel}
                    </div>
                  )}

                  {editing[key] ? (
                    <textarea
                      value={body}
                      onChange={e => setEditedBodies(prev => ({ ...prev, [key]: e.target.value }))}
                      rows={6}
                      style={{ width: '100%', background: '#f5f5f7', border: '1px solid #0066cc', borderRadius: '8px', padding: '10px 12px', fontSize: '12px', lineHeight: '1.7', color: '#1a1a2e', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
                    />
                  ) : (
                    <div style={{ fontSize: '12px', lineHeight: '1.8', color: '#444460', whiteSpace: 'pre-wrap' }}>
                      {body}
                    </div>
                  )}

                  {status === 'pending' && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e8e8ed', alignItems: 'center', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => isHuman ? approve(ci, si) : sendEmail(ci, si, item)}
                        disabled={sending[key]}
                        style={{ background: sending[key] ? '#e8e8ed' : '#059669', color: sending[key] ? '#aaaabc' : '#fff', border: 'none', borderRadius: '7px', padding: '8px 16px', fontSize: '12px', fontWeight: 600, cursor: sending[key] ? 'not-allowed' : 'pointer' }}>
                        {sending[key] ? '⟳ Sending...' : isHuman ? '✓ Mark Done' : gmailConnected ? '✓ Approve & Send' : '✓ Approve'}
                      </button>
                      <button onClick={() => toggleEdit(ci, si, item.body)}
                        style={{ background: '#f5f5f7', color: '#444460', border: '1px solid #e8e8ed', borderRadius: '7px', padding: '8px 16px', fontSize: '12px', cursor: 'pointer' }}>
                        {editing[key] ? 'Save' : 'Edit'}
                      </button>
                      {isHuman && (
                        <button onClick={() => navigator.clipboard.writeText(body)}
                          style={{ background: '#f0f0ff', color: '#6366f1', border: '1px solid #c7d2fe', borderRadius: '7px', padding: '8px 16px', fontSize: '12px', cursor: 'pointer' }}>
                          Copy
                        </button>
                      )}
                      {sentStatus[key] && (
                        <span style={{ fontSize: '11px', color: sentStatus[key].startsWith('✓') ? '#059669' : '#dc2626' }}>
                          {sentStatus[key]}
                        </span>
                      )}
                      <button onClick={() => reject(ci, si)}
                        style={{ background: '#fff0f0', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '7px', padding: '8px 16px', fontSize: '12px', cursor: 'pointer', marginLeft: 'auto' }}>
                        Reject
                      </button>
                    </div>
                  )}

                  {status === 'approved' && (
                    <div style={{ marginTop: '10px', fontSize: '12px', color: '#059669' }}>
                      ✓ {isHuman ? 'Marked as done' : sentStatus[key] || 'Approved'}
                    </div>
                  )}
                  {status === 'rejected' && (
                    <div style={{ marginTop: '10px', fontSize: '12px', color: '#dc2626' }}>✕ Rejected — step skipped</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}