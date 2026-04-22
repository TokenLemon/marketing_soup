'use client'
import { useState } from 'react'

const CHANNEL_COLORS: Record<string, { bg: string; text: string }> = {
  'Email':             { bg: '#e8f4ff', text: '#0066cc' },
  'LinkedIn':          { bg: '#f0f0ff', text: '#6366f1' },
  'LinkedIn Comment':  { bg: '#f0f0ff', text: '#6366f1' },
  'Call':              { bg: '#fff7ed', text: '#d97706' },
}

const HUMAN_CHANNELS = ['LinkedIn', 'LinkedIn Comment', 'Call']

type Step = {
  step: string
  channel: string
  timing: string
  trigger: string
  action: string
  reason: string
}

export default function SequenceView({
  company,
  stakeholder,
  research,
  onNext,
}: {
  company: string
  stakeholder: any
  research: string
  onNext: (steps: Step[]) => void
}) {
  const [loading, setLoading] = useState(false)
  const [steps, setSteps] = useState<Step[]>([])

  async function buildSequence() {
    setLoading(true)
    setSteps([])
    try {
      const res = await fetch('/api/sequence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company, stakeholder, research }),
      })
      const data = await res.json()
      setSteps(data.steps || [])
    } catch (e) {
      alert('Error building sequence.')
    }
    setLoading(false)
  }

  return (
    <div style={{ background: '#ffffff', border: '1px solid #e8e8ed', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px' }}>
      <div style={{ padding: '14px 18px', borderBottom: '1px solid #e8e8ed', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontWeight: 600, fontSize: '14px', color: '#1a1a2e' }}>
          Adaptive Sequence — {stakeholder.name}
        </div>
        <span style={{ fontSize: '10px', background: '#e8f4ff', color: '#0066cc', padding: '2px 8px', borderRadius: '20px', fontWeight: 600 }}>AI REASONED</span>
      </div>
      <div style={{ padding: '18px' }}>

        {/* Notice */}
        <div style={{ background: '#f0f8ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '12px', color: '#1e40af', lineHeight: '1.6' }}>
          <strong>This is not a fixed playbook.</strong> The sequence is decided by AI based on {stakeholder.name}'s role, seniority, communication style, and the pain points found in research.
        </div>

        {/* Generate button */}
        {steps.length === 0 && (
          <button
            onClick={buildSequence}
            disabled={loading}
            style={{
              background: loading ? '#e8e8ed' : '#0066cc',
              color: loading ? '#aaaabc' : '#ffffff',
              border: 'none', borderRadius: '8px',
              padding: '10px 20px', fontSize: '13px', fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '16px',
            }}
          >
            {loading ? '⟳ Building sequence...' : 'Generate Adaptive Sequence →'}
          </button>
        )}

        {/* Steps */}
        {steps.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            {steps.map((s, i) => {
              const isHuman = HUMAN_CHANNELS.includes(s.channel)
              const colors = CHANNEL_COLORS[s.channel] || { bg: '#f5f5f7', text: '#444460' }
              return (
                <div key={i} style={{ display: 'flex', gap: '14px', position: 'relative', paddingBottom: '20px' }}>
                  {/* Line connector */}
                  {i < steps.length - 1 && (
                    <div style={{ position: 'absolute', left: '16px', top: '32px', bottom: '0', width: '1px', background: '#e8e8ed' }} />
                  )}
                  {/* Icon */}
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                    background: colors.bg, color: colors.text,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', fontWeight: 700,
                    border: `1px solid ${colors.text}30`,
                  }}>
                    {s.channel === 'Email' ? '✉' : s.channel === 'Call' ? '☎' : 'in'}
                  </div>
                  {/* Content */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', background: colors.bg, color: colors.text }}>
                        {s.channel.toUpperCase()}
                      </span>
                      {isHuman ? (
                        <span style={{ fontSize: '10px', background: '#fff7ed', color: '#d97706', padding: '2px 8px', borderRadius: '20px', fontWeight: 600 }}>
                          HUMAN ACTION
                        </span>
                      ) : (
                        <span style={{ fontSize: '10px', background: '#f0faf5', color: '#059669', padding: '2px 8px', borderRadius: '20px', fontWeight: 600 }}>
                          AI DRAFTS · YOU APPROVE
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a2e', marginBottom: '4px' }}>
                      Step {s.step} — {s.action}
                    </div>
                    <div style={{ fontSize: '11px', color: '#0066cc', background: '#e8f4ff', padding: '3px 10px', borderRadius: '20px', display: 'inline-block', marginBottom: '6px' }}>
                      ⟳ Trigger: {s.trigger || s.timing}
                    </div>
                    <div style={{ fontSize: '12px', color: '#8888a0', lineHeight: '1.5' }}>
                      {s.reason}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {steps.length > 0 && (
          <button
            onClick={() => onNext(steps)}
            style={{
              background: '#0066cc', color: '#ffffff',
              border: 'none', borderRadius: '8px',
              padding: '10px 20px', fontSize: '13px', fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Generate Content for Each Step →
          </button>
        )}
      </div>
    </div>
  )
}