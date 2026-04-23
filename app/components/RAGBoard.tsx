'use client'
import { useState } from 'react'

const INITIAL_LEADS = [
  {
    id: 1, initials: 'RK', name: 'Rohan Kapoor', role: 'VP Strategy',
    company: 'Max Life Insurance', rag: 'green',
    reason: 'Replied positively · wants demo · engaged on 3 touchpoints',
    score: 94, lastSignal: 'Positive reply · 18m ago',
    color: '#e8f4ff', textColor: '#0066cc',
  },
  {
    id: 2, initials: 'PM', name: 'Priya Mehta', role: 'VP Sales Ops',
    company: 'HDFC Life', rag: 'green',
    reason: 'Opened email 4× · high intent · no reply yet',
    score: 91, lastSignal: 'Email opened 4× · 2h ago',
    color: '#e8f4ff', textColor: '#0066cc',
  },
  {
    id: 3, initials: 'SI', name: 'Suresh Iyer', role: 'CTO',
    company: 'Bajaj Allianz', rag: 'amber',
    reason: 'Clicked pricing twice · no reply · warm signal',
    score: 76, lastSignal: 'Pricing link clicked · 1h ago',
    color: '#fff7ed', textColor: '#d97706',
  },
  {
    id: 4, initials: 'VK', name: 'Vikram Nair', role: 'CDO',
    company: 'SBI Life', rag: 'amber',
    reason: 'New appointment · not yet engaged · research done',
    score: 68, lastSignal: 'Leadership change · 3h ago',
    color: '#fff7ed', textColor: '#d97706',
  },
  {
    id: 5, initials: 'RK', name: 'Rohit Kumar', role: 'CTO',
    company: 'HDFC Life', rag: 'amber',
    reason: 'Opened once · no click · needs follow up',
    score: 65, lastSignal: 'Email opened once · 2d ago',
    color: '#fff7ed', textColor: '#d97706',
  },
  {
    id: 6, initials: 'AS', name: 'Anjali Shah', role: 'Head Distribution',
    company: 'HDFC Life', rag: 'red',
    reason: 'No opens · 10 days · switch channel recommended',
    score: 38, lastSignal: 'No engagement · 10d',
    color: '#fff0f0', textColor: '#dc2626',
  },
  {
    id: 7, initials: 'VN', name: 'Vijay Nair', role: 'CFO',
    company: 'HDFC Life', rag: 'red',
    reason: '"Not right time" reply · on hold 30 days',
    score: 40, lastSignal: 'Timing objection · Yesterday',
    color: '#fff0f0', textColor: '#dc2626',
  },
]

const RAG_CONFIG = {
  green: {
    label: 'Green — Pass to AE',
    desc: 'High intent. Ready for sales conversation.',
    bg: '#f0faf5', border: '#d1fae5', dot: '#059669',
    badgeBg: '#f0faf5', badgeColor: '#059669',
    action: 'Pass to AE', actionBg: '#059669', actionColor: '#fff',
  },
  amber: {
    label: 'Amber — Nurture',
    desc: 'Warm signals. Keep engaging.',
    bg: '#fffbeb', border: '#fde68a', dot: '#d97706',
    badgeBg: '#fff7ed', badgeColor: '#d97706',
    action: 'Continue Sequence', actionBg: '#d97706', actionColor: '#fff',
  },
  red: {
    label: 'Red — Pause',
    desc: 'No engagement or timing objection.',
    bg: '#fff5f5', border: '#fecaca', dot: '#dc2626',
    badgeBg: '#fff0f0', badgeColor: '#dc2626',
    action: 'Pause & Review', actionBg: '#dc2626', actionColor: '#fff',
  },
}

export default function RAGBoard() {
  const [leads, setLeads] = useState(INITIAL_LEADS)
  const [movingId, setMovingId] = useState<number | null>(null)

  function moveToRAG(id: number, newRag: 'green' | 'amber' | 'red') {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, rag: newRag } : l))
    setMovingId(null)
  }

  const green = leads.filter(l => l.rag === 'green')
  const amber = leads.filter(l => l.rag === 'amber')
  const red = leads.filter(l => l.rag === 'red')

  function LeadCard({ lead }: { lead: typeof INITIAL_LEADS[0] }) {
    const config = RAG_CONFIG[lead.rag as keyof typeof RAG_CONFIG]
    return (
      <div style={{ background: '#ffffff', border: '1px solid #e8e8ed', borderRadius: '10px', padding: '12px', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '8px' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: lead.color, color: lead.textColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, flexShrink: 0 }}>
            {lead.initials}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a2e' }}>{lead.name}</div>
            <div style={{ fontSize: '11px', color: '#8888a0' }}>{lead.role} · {lead.company}</div>
          </div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: config.dot }}>{lead.score}</div>
        </div>
        <div style={{ fontSize: '11px', color: '#8888a0', marginBottom: '6px', lineHeight: '1.5' }}>
          {lead.reason}
        </div>
        <div style={{ fontSize: '10px', color: '#aaaabc', marginBottom: '10px' }}>
          Last signal: {lead.lastSignal}
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setMovingId(movingId === lead.id ? null : lead.id)}
            style={{ background: config.actionBg, color: config.actionColor, border: 'none', borderRadius: '6px', padding: '5px 10px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
          >
            {config.action}
          </button>
          <button
            onClick={() => setMovingId(movingId === lead.id ? null : lead.id)}
            style={{ background: '#f5f5f7', color: '#444460', border: '1px solid #e8e8ed', borderRadius: '6px', padding: '5px 10px', fontSize: '11px', cursor: 'pointer' }}
          >
            Move ↕
          </button>
        </div>
        {movingId === lead.id && (
          <div style={{ marginTop: '8px', padding: '10px', background: '#f5f5f7', borderRadius: '8px', border: '1px solid #e8e8ed' }}>
            <div style={{ fontSize: '11px', color: '#8888a0', marginBottom: '6px' }}>Move to:</div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {(['green', 'amber', 'red'] as const).filter(r => r !== lead.rag).map(r => (
                <button
                  key={r}
                  onClick={() => moveToRAG(lead.id, r)}
                  style={{ background: RAG_CONFIG[r].badgeBg, color: RAG_CONFIG[r].badgeColor, border: `1px solid ${RAG_CONFIG[r].border}`, borderRadius: '6px', padding: '4px 10px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize' }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '22px', fontWeight: 600, color: '#1a1a2e', marginBottom: '4px' }}>Lead Board</div>
        <div style={{ fontSize: '13px', color: '#8888a0' }}>AI classifies every lead by engagement. Green = pass to AE. Amber = nurture. Red = pause.</div>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', marginBottom: '20px' }}>
        <div style={{ background: '#f0faf5', border: '1px solid #d1fae5', borderRadius: '10px', padding: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#059669', boxShadow: '0 0 6px #059669' }} />
          <div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#059669' }}>{green.length}</div>
            <div style={{ fontSize: '11px', color: '#059669', fontWeight: 500 }}>Pass to AE</div>
          </div>
        </div>
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#d97706' }} />
          <div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#d97706' }}>{amber.length}</div>
            <div style={{ fontSize: '11px', color: '#d97706', fontWeight: 500 }}>Nurture</div>
          </div>
        </div>
        <div style={{ background: '#fff5f5', border: '1px solid #fecaca', borderRadius: '10px', padding: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#dc2626' }} />
          <div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#dc2626' }}>{red.length}</div>
            <div style={{ fontSize: '11px', color: '#dc2626', fontWeight: 500 }}>Pause</div>
          </div>
        </div>
      </div>

      {/* Kanban columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
        {/* Green */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '12px', padding: '8px 12px', background: '#f0faf5', borderRadius: '8px', border: '1px solid #d1fae5' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#059669', boxShadow: '0 0 5px #059669' }} />
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#059669' }}>Green · {green.length} leads</span>
          </div>
          {green.map(l => <LeadCard key={l.id} lead={l} />)}
          {green.length === 0 && (
            <div style={{ padding: '20px', textAlign: 'center', color: '#aaaabc', fontSize: '12px', background: '#f5f5f7', borderRadius: '8px', border: '1px dashed #e8e8ed' }}>
              No green leads yet
            </div>
          )}
        </div>

        {/* Amber */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '12px', padding: '8px 12px', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#d97706' }} />
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#d97706' }}>Amber · {amber.length} leads</span>
          </div>
          {amber.map(l => <LeadCard key={l.id} lead={l} />)}
          {amber.length === 0 && (
            <div style={{ padding: '20px', textAlign: 'center', color: '#aaaabc', fontSize: '12px', background: '#f5f5f7', borderRadius: '8px', border: '1px dashed #e8e8ed' }}>
              No amber leads
            </div>
          )}
        </div>

        {/* Red */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '12px', padding: '8px 12px', background: '#fff5f5', borderRadius: '8px', border: '1px solid #fecaca' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#dc2626' }} />
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#dc2626' }}>Red · {red.length} leads</span>
          </div>
          {red.map(l => <LeadCard key={l.id} lead={l} />)}
          {red.length === 0 && (
            <div style={{ padding: '20px', textAlign: 'center', color: '#aaaabc', fontSize: '12px', background: '#f5f5f7', borderRadius: '8px', border: '1px dashed #e8e8ed' }}>
              No red leads
            </div>
          )}
        </div>
      </div>
    </div>
  )
}