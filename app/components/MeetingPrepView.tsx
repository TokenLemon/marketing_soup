'use client'
import { useState } from 'react'

export default function MeetingPrepView() {
  const [name, setName] = useState('Priya Mehta')
  const [company, setCompany] = useState('HDFC Life Insurance')
  const [role, setRole] = useState('VP Sales Operations')
  const [context, setContext] = useState('First intro call — responded to our outreach')
  const [loading, setLoading] = useState(false)
  const [brief, setBrief] = useState('')
  const [error, setError] = useState('')

  async function generatePrep() {
    if (!name.trim() || !company.trim()) return alert('Enter name and company')
    setLoading(true)
    setBrief('')
    setError('')
    try {
      const res = await fetch('/api/meeting-prep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, company, role, context }),
      })
      const data = await res.json()
      if (data.result) setBrief(data.result)
      else setError('No result returned. Try again.')
    } catch (e) {
      setError('Connection error. Check API key.')
    }
    setLoading(false)
  }

  function formatBrief(text: string) {
    return text.split('\n').map((line, i) => {
      const isHeader = line.startsWith('##') || line.startsWith('**') && line.endsWith('**')
      const isBullet = line.startsWith('-') || line.startsWith('•')
      const clean = line.replace(/^##\s*/, '').replace(/\*\*/g, '').replace(/^-\s*/, '')
      if (!clean.trim()) return <div key={i} style={{ height: '8px' }} />
      if (isHeader) return (
        <div key={i} style={{ fontSize: '11px', fontWeight: 700, color: '#0066cc', letterSpacing: '0.8px', textTransform: 'uppercase', marginTop: '14px', marginBottom: '5px', paddingBottom: '4px', borderBottom: '1px solid #e8f4ff' }}>
          {clean}
        </div>
      )
      if (isBullet) return (
        <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '5px' }}>
          <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#0066cc', flexShrink: 0, marginTop: '7px' }} />
          <div style={{ fontSize: '13px', color: '#444460', lineHeight: '1.6' }}>{clean}</div>
        </div>
      )
      return <div key={i} style={{ fontSize: '13px', color: '#444460', lineHeight: '1.6', marginBottom: '3px' }}>{clean}</div>
    })
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '22px', fontWeight: 600, color: '#1a1a2e', marginBottom: '4px' }}>Meeting Prep</div>
        <div style={{ fontSize: '13px', color: '#8888a0' }}>Enter meeting details → AI generates a 90-second read brief before you walk in</div>
      </div>

      <div style={{ background: '#ffffff', border: '1px solid #e8e8ed', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #e8e8ed', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 600, fontSize: '14px', color: '#1a1a2e' }}>Meeting Details</div>
          <span style={{ fontSize: '10px', background: '#e8f4ff', color: '#0066cc', padding: '2px 8px', borderRadius: '20px', fontWeight: 600 }}>LIVE AI</span>
        </div>
        <div style={{ padding: '18px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#8888a0', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Prospect Name</div>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Priya Mehta"
                style={{ width: '100%', background: '#f5f5f7', border: '1px solid #e8e8ed', borderRadius: '8px', padding: '9px 12px', fontSize: '13px', color: '#1a1a2e', outline: 'none' }} />
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#8888a0', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Company</div>
              <input value={company} onChange={e => setCompany(e.target.value)} placeholder="HDFC Life Insurance"
                style={{ width: '100%', background: '#f5f5f7', border: '1px solid #e8e8ed', borderRadius: '8px', padding: '9px 12px', fontSize: '13px', color: '#1a1a2e', outline: 'none' }} />
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#8888a0', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Their Role</div>
              <input value={role} onChange={e => setRole(e.target.value)} placeholder="VP Sales Operations"
                style={{ width: '100%', background: '#f5f5f7', border: '1px solid #e8e8ed', borderRadius: '8px', padding: '9px 12px', fontSize: '13px', color: '#1a1a2e', outline: 'none' }} />
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#8888a0', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Meeting Context</div>
              <input value={context} onChange={e => setContext(e.target.value)} placeholder="First intro call"
                style={{ width: '100%', background: '#f5f5f7', border: '1px solid #e8e8ed', borderRadius: '8px', padding: '9px 12px', fontSize: '13px', color: '#1a1a2e', outline: 'none' }} />
            </div>
          </div>
          <button onClick={generatePrep} disabled={loading}
            style={{ background: loading ? '#e8e8ed' : '#0066cc', color: loading ? '#aaaabc' : '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? '⟳ Generating brief...' : 'Generate Prep Brief →'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: '#fff0f0', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', color: '#dc2626', fontSize: '13px' }}>
          {error}
        </div>
      )}

      {brief && (
        <div style={{ background: '#ffffff', border: '1px solid #e8e8ed', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #e8e8ed', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontWeight: 600, fontSize: '14px', color: '#1a1a2e' }}>
              Prep Brief — {name} · {company}
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '10px', background: '#f0faf5', color: '#059669', padding: '2px 8px', borderRadius: '20px', fontWeight: 600 }}>90-SECOND READ</span>
              <button onClick={() => navigator.clipboard.writeText(brief)}
                style={{ fontSize: '11px', background: '#f5f5f7', color: '#444460', border: '1px solid #e8e8ed', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer' }}>
                Copy
              </button>
            </div>
          </div>
          <div style={{ padding: '18px' }}>
            {formatBrief(brief)}
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e8e8ed', display: 'flex', gap: '10px' }}>
              <button onClick={generatePrep}
                style={{ background: '#f5f5f7', color: '#444460', border: '1px solid #e8e8ed', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', cursor: 'pointer' }}>
                Regenerate
              </button>
              <button style={{ background: '#0066cc', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                Save to Notion ↗
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}