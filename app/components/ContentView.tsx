'use client'
import { useState } from 'react'

export default function ContentView({
  company,
  stakeholder,
  research,
  steps,
  onNext,
}: {
  company: string
  stakeholder: any
  research: string
  steps: any[]
  onNext: (content: any[]) => void
}) {
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState<any[]>([])

  const emailSteps = steps.filter(s =>
    s.channel === 'Email' || s.channel === 'email'
  )
  const humanSteps = steps.filter(s =>
    ['LinkedIn', 'LinkedIn Comment', 'Call'].includes(s.channel)
  )

  async function generateContent() {
    setLoading(true)
    setContent([])
    try {
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company, stakeholder, research, steps }),
      })
      const data = await res.json()
      setContent(data.content || [])
    } catch (e) {
      alert('Error generating content.')
    }
    setLoading(false)
  }

  return (
    <div style={{ background: '#ffffff', border: '1px solid #e8e8ed', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px' }}>
      <div style={{ padding: '14px 18px', borderBottom: '1px solid #e8e8ed', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontWeight: 600, fontSize: '14px', color: '#1a1a2e' }}>
          Content Generation — {stakeholder.name}
        </div>
        <span style={{ fontSize: '10px', background: '#e8f4ff', color: '#0066cc', padding: '2px 8px', borderRadius: '20px', fontWeight: 600 }}>LIVE AI</span>
      </div>
      <div style={{ padding: '18px' }}>

        {/* Info */}
        <div style={{ background: '#f0f8ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '12px', color: '#1e40af', lineHeight: '1.6' }}>
          AI will generate personalised content for each email step. LinkedIn and call steps will show preparation notes for your team to action manually.
        </div>

        {content.length === 0 && (
          <button
            onClick={generateContent}
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
            {loading ? '⟳ Generating content...' : 'Generate Content for All Steps →'}
          </button>
        )}

        {/* Email content */}
        {content.map((item, i) => (
          <div key={i} style={{ marginBottom: '16px' }}>
            {item.type === 'email' ? (
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#0066cc', letterSpacing: '0.5px', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Step {item.step} — Email · AI Drafted
                </div>
                <div style={{ background: '#f5f5f7', border: '1px solid #e8e8ed', borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ padding: '8px 14px', borderBottom: '1px solid #e8e8ed', display: 'flex', gap: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#8888a0', width: '55px', flexShrink: 0 }}>TO</span>
                    <span style={{ fontSize: '12px', color: '#1a1a2e' }}>{stakeholder.name} &lt;{stakeholder.email}&gt;</span>
                  </div>
                  <div style={{ padding: '8px 14px', borderBottom: '1px solid #e8e8ed', display: 'flex', gap: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#8888a0', width: '55px', flexShrink: 0 }}>SUBJECT</span>
                    <span style={{ fontSize: '12px', color: '#1a1a2e', fontWeight: 500 }}>{item.subject}</span>
                  </div>
                  <div style={{ padding: '14px', fontSize: '12px', lineHeight: '1.8', color: '#444460', whiteSpace: 'pre-wrap', background: '#ffffff' }}>
                    {item.body}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#d97706', letterSpacing: '0.5px', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Step {item.step} — {item.channel} · Human Action Required
                </div>
                <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '8px', padding: '14px', fontSize: '12px', lineHeight: '1.7', color: '#92400e' }}>
                  {item.body}
                </div>
              </div>
            )}
          </div>
        ))}

        {content.length > 0 && (
          <button
            onClick={() => onNext(content)}
            style={{
              background: '#0066cc', color: '#ffffff',
              border: 'none', borderRadius: '8px',
              padding: '10px 20px', fontSize: '13px', fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Send to Approval Queue →
          </button>
        )}
      </div>
    </div>
  )
}