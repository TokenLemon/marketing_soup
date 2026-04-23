'use client'
import { useState } from 'react'

const INITIAL_SIGNALS = [
  {
    id: 1,
    type: 'hot',
    title: 'Priya Mehta opened email 4× in 2 hours',
    desc: 'HDFC Life · Sent 2h ago · Subject: "How HDFC Life\'s top performers could close 30% more"',
    time: '2m ago',
    aiAction: 'Send LinkedIn connect now — strike while warm',
    actionLabel: 'Generate LinkedIn Message',
    actionColor: '#0066cc',
    actionBg: '#e8f4ff',
    dotColor: '#dc2626',
    status: 'pending',
  },
  {
    id: 2,
    type: 'positive',
    title: 'Rohan Kapoor replied — "Interested, tell me more"',
    desc: 'Max Life Insurance · Step 2 of sequence · Positive reply detected',
    time: '18m ago',
    aiAction: 'Fast-track to demo booking — don\'t nurture, move fast',
    actionLabel: 'Book Demo',
    actionColor: '#059669',
    actionBg: '#f0faf5',
    dotColor: '#059669',
    status: 'pending',
  },
  {
    id: 3,
    type: 'warm',
    title: 'Suresh Iyer clicked pricing link twice',
    desc: 'Bajaj Allianz · Bottom-of-funnel signal · No reply yet',
    time: '1h ago',
    aiAction: 'SDR call within 24h — lead with ROI angle, not product features',
    actionLabel: 'Generate Call Script',
    actionColor: '#d97706',
    actionBg: '#fff7ed',
    dotColor: '#d97706',
    status: 'pending',
  },
  {
    id: 4,
    type: 'trigger',
    title: 'SBI Life — new CDO appointed (Vikram Nair)',
    desc: 'Trigger event detected via news · New stakeholder opportunity',
    time: '3h ago',
    aiAction: 'Draft congratulations + timely Vymo intro email immediately',
    actionLabel: 'Draft Intro Email',
    actionColor: '#0066cc',
    actionBg: '#e8f4ff',
    dotColor: '#6366f1',
    status: 'pending',
  },
  {
    id: 5,
    type: 'cold',
    title: 'Anjali Shah — no open after 2 emails, 10 days',
    desc: 'HDFC Life · Email channel not converting · Switch recommended',
    time: '6h ago',
    aiAction: 'Pause email. Switch to LinkedIn — try a comment on her recent post',
    actionLabel: 'Switch to LinkedIn',
    actionColor: '#6366f1',
    actionBg: '#f0f0ff',
    dotColor: '#aaaabc',
    status: 'pending',
  },
  {
    id: 6,
    type: 'hold',
    title: 'Vijay Nair replied "Not the right time"',
    desc: 'HDFC Life · Timing objection · Not a hard no',
    time: 'Yesterday',
    aiAction: 'Pause 30 days. Set reminder. Re-engage with industry trigger in Q3.',
    actionLabel: 'Set 30-day Reminder',
    actionColor: '#d97706',
    actionBg: '#fff7ed',
    dotColor: '#d97706',
    status: 'pending',
  },
]

const DOT_COLORS: Record<string, string> = {
  hot: '#dc2626',
  positive: '#059669',
  warm: '#d97706',
  trigger: '#6366f1',
  cold: '#aaaabc',
  hold: '#d97706',
}

const TYPE_LABELS: Record<string, { label: string; bg: string; color: string }> = {
  hot:      { label: '🔥 High Intent',      bg: '#fff0f0', color: '#dc2626' },
  positive: { label: '✓ Positive Reply',    bg: '#f0faf5', color: '#059669' },
  warm:     { label: '⚡ Warm Signal',       bg: '#fff7ed', color: '#d97706' },
  trigger:  { label: '◈ Trigger Event',     bg: '#f0f0ff', color: '#6366f1' },
  cold:     { label: '◯ No Engagement',     bg: '#f5f5f7', color: '#8888a0' },
  hold:     { label: '⏸ Timing Objection', bg: '#fff7ed', color: '#d97706' },
}

export default function SignalsView() {
  const [signals, setSignals] = useState(INITIAL_SIGNALS)
  const [actioning, setActioning] = useState<number | null>(null)
  const [actionOutputs, setActionOutputs] = useState<Record<number, string>>({})
  const [filter, setFilter] = useState<string>('all')

  async function actOnSignal(signal: typeof INITIAL_SIGNALS[0]) {
    setActioning(signal.id)
    try {
      const res = await fetch('/api/signal-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signal }),
      })
      const data = await res.json()
      setActionOutputs(prev => ({ ...prev, [signal.id]: data.result }))
    } catch (e) {
      setActionOutputs(prev => ({ ...prev, [signal.id]: 'Error generating action. Try again.' }))
    }
    setActioning(null)
  }

  function dismissSignal(id: number) {
    setSignals(prev => prev.filter(s => s.id !== id))
  }

  function markDone(id: number) {
    setSignals(prev => prev.map(s => s.id === id ? { ...s, status: 'done' } : s))
  }

  const filtered = filter === 'all' ? signals : signals.filter(s => s.type === filter)
  const pendingCount = signals.filter(s => s.status === 'pending').length

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '22px', fontWeight: 600, color: '#1a1a2e', marginBottom: '4px' }}>
          Live Signals
        </div>
        <div style={{ fontSize: '13px', color: '#8888a0' }}>
          Real-time engagement signals. AI recommends next action for each. You approve.
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', marginBottom: '20px' }}>
        <div style={{ background: '#ffffff', border: '1px solid #e8e8ed', borderRadius: '10px', padding: '14px' }}>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#dc2626' }}>{signals.filter(s => s.type === 'hot').length}</div>
          <div style={{ fontSize: '11px', color: '#8888a0', marginTop: '3px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Hot Signals</div>
        </div>
        <div style={{ background: '#ffffff', border: '1px solid #e8e8ed', borderRadius: '10px', padding: '14px' }}>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#059669' }}>{signals.filter(s => s.type === 'positive').length}</div>
          <div style={{ fontSize: '11px', color: '#8888a0', marginTop: '3px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Positive Replies</div>
        </div>
        <div style={{ background: '#ffffff', border: '1px solid #e8e8ed', borderRadius: '10px', padding: '14px' }}>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#d97706' }}>{signals.filter(s => s.type === 'warm').length}</div>
          <div style={{ fontSize: '11px', color: '#8888a0', marginTop: '3px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Warm Signals</div>
        </div>
        <div style={{ background: '#ffffff', border: '1px solid #e8e8ed', borderRadius: '10px', padding: '14px' }}>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#1a1a2e' }}>{pendingCount}</div>
          <div style={{ fontSize: '11px', color: '#8888a0', marginTop: '3px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Need Action</div>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {['all', 'hot', 'positive', 'warm', 'trigger', 'cold', 'hold'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '5px 14px', borderRadius: '20px', border: '1px solid',
              fontSize: '12px', cursor: 'pointer', fontWeight: filter === f ? 600 : 400,
              background: filter === f ? '#0066cc' : '#ffffff',
              color: filter === f ? '#ffffff' : '#444460',
              borderColor: filter === f ? '#0066cc' : '#e8e8ed',
              textTransform: 'capitalize',
            }}
          >
            {f === 'all' ? `All (${signals.length})` : f}
          </button>
        ))}
      </div>

      {/* Signals list */}
      {filtered.length === 0 && (
        <div style={{ background: '#ffffff', border: '1px solid #e8e8ed', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#8888a0' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>✓</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a2e', marginBottom: '4px' }}>All clear</div>
          <div style={{ fontSize: '13px' }}>No signals in this category right now</div>
        </div>
      )}

      {filtered.map(signal => {
        const typeInfo = TYPE_LABELS[signal.type]
        const isDone = signal.status === 'done'
        const output = actionOutputs[signal.id]

        return (
          <div
            key={signal.id}
            style={{
              background: '#ffffff',
              border: '1px solid #e8e8ed',
              borderRadius: '10px',
              marginBottom: '10px',
              overflow: 'hidden',
              opacity: isDone ? 0.6 : 1,
              transition: 'opacity .2s',
            }}
          >
            <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              {/* Dot */}
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: DOT_COLORS[signal.type], flexShrink: 0, marginTop: '4px', boxShadow: signal.type === 'hot' ? '0 0 6px #dc2626' : 'none' }} />

              {/* Content */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a2e', marginBottom: '3px' }}>
                  {signal.title}
                </div>
                <div style={{ fontSize: '12px', color: '#8888a0', marginBottom: '8px' }}>
                  {signal.desc}
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                  <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', background: typeInfo.bg, color: typeInfo.color, fontWeight: 600 }}>
                    {typeInfo.label}
                  </span>
                  <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', background: '#e8f4ff', color: '#0066cc', fontWeight: 500 }}>
                    AI: {signal.aiAction}
                  </span>
                </div>

                {/* AI Output */}
                {output && (
                  <div style={{ background: '#f5f5f7', border: '1px solid #e8e8ed', borderRadius: '8px', padding: '12px', marginBottom: '10px', fontSize: '12px', lineHeight: '1.7', color: '#444460', whiteSpace: 'pre-wrap' }}>
                    {output}
                  </div>
                )}
              </div>

              {/* Time + actions */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
                <div style={{ fontSize: '11px', color: '#aaaabc' }}>{signal.time}</div>
                {!isDone && (
                  <>
                    <button
                      onClick={() => actOnSignal(signal)}
                      disabled={actioning === signal.id}
                      style={{
                        background: actioning === signal.id ? '#e8e8ed' : signal.actionBg,
                        color: actioning === signal.id ? '#aaaabc' : signal.actionColor,
                        border: `1px solid ${signal.actionColor}30`,
                        borderRadius: '7px', padding: '6px 12px',
                        fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {actioning === signal.id ? '⟳ Working...' : signal.actionLabel}
                    </button>
                    <button
                      onClick={() => markDone(signal.id)}
                      style={{ background: '#f0faf5', color: '#059669', border: '1px solid #d1fae5', borderRadius: '7px', padding: '4px 10px', fontSize: '10px', cursor: 'pointer' }}
                    >
                      Mark Done
                    </button>
                    <button
                      onClick={() => dismissSignal(signal.id)}
                      style={{ background: 'transparent', color: '#aaaabc', border: 'none', fontSize: '10px', cursor: 'pointer' }}
                    >
                      Dismiss
                    </button>
                  </>
                )}
                {isDone && (
                  <span style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>✓ Done</span>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}