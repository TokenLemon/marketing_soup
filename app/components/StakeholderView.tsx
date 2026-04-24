'use client'
import { useState } from 'react'

type Stakeholder = {
  initials: string
  name: string
  role: string
  email: string
  tags: string[]
  persona: string
  painPoint?: string
  linkedin?: string
  color: string
  textColor: string
  source?: string
  emailVerified?: boolean
}

const COLORS = [
  { color: '#e8f4ff', textColor: '#0066cc' },
  { color: '#f0f0ff', textColor: '#6366f1' },
  { color: '#f0faf5', textColor: '#059669' },
  { color: '#fff7ed', textColor: '#d97706' },
]

export default function StakeholderView({
  company,
  industry,
  research,
  onSelect,
}: {
  company: string
  industry: string
  research: string
  onSelect: (sk: Stakeholder) => void
}) {
  const [mode, setMode] = useState<'choose' | 'ai' | 'manual'>('choose')
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sources, setSources] = useState<{ lusha: number; ai: number } | null>(null)

  // Manual form
  const [manualName, setManualName] = useState('')
  const [manualRole, setManualRole] = useState('')
  const [manualEmail, setManualEmail] = useState('')
  const [manualLinkedIn, setManualLinkedIn] = useState('')
  const [manualTags, setManualTags] = useState('')
  const [manualPersona, setManualPersona] = useState('')

  async function runAISearch() {
    setLoading(true)
    setError('')
    setStakeholders([])
    setSources(null)
    setSelected(null)

    try {
      const res = await fetch('/api/stakeholders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company, industry, research }),
      })
      const data = await res.json()

      if (data.stakeholders?.length > 0) {
        setStakeholders(data.stakeholders)
        setSources(data.sources || null)
      } else {
        setError('Could not find stakeholders. Try manual entry.')
      }
    } catch (e) {
      setError('Error connecting to search. Try manual entry.')
    }
    setLoading(false)
  }

  function addManual() {
    if (!manualName.trim() || !manualRole.trim()) return alert('Name and role are required')
    const initials = manualName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    const colorIdx = stakeholders.length % COLORS.length
    const newSk: Stakeholder = {
      initials,
      name: manualName,
      role: manualRole,
      email: manualEmail || `${manualName.toLowerCase().replace(' ', '.')}@${company.toLowerCase().replace(/\s+/g, '')}.com`,
      tags: manualTags ? manualTags.split(',').map(t => t.trim()) : ['Manually added'],
      persona: manualPersona || `${manualRole} at ${company}`,
      linkedin: manualLinkedIn,
      source: 'manual',
      emailVerified: false,
      ...COLORS[colorIdx],
    }
    setStakeholders(prev => [...prev, newSk])
    setManualName('')
    setManualRole('')
    setManualEmail('')
    setManualLinkedIn('')
    setManualTags('')
    setManualPersona('')
  }

  const TAB = (active: boolean, color = '#0066cc') => ({
    padding: '8px 16px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer',
    border: `1px solid ${active ? color : '#e8e8ed'}`,
    background: active ? color + '15' : '#ffffff',
    color: active ? color : '#444460',
    fontWeight: active ? 600 : 400,
  } as React.CSSProperties)

  return (
    <div style={{ background: '#ffffff', border: '1px solid #e8e8ed', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px' }}>
      <div style={{ padding: '14px 18px', borderBottom: '1px solid #e8e8ed', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontWeight: 600, fontSize: '14px', color: '#1a1a2e' }}>Stakeholder Map — {company}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {sources && sources.ai > 0 && (
            <span style={{ fontSize: '10px', background: '#e8f4ff', color: '#0066cc', padding: '2px 8px', borderRadius: '20px', fontWeight: 600 }}>
              ✦ {sources.ai} AI identified
            </span>
          )}
        </div>
      </div>

      <div style={{ padding: '18px' }}>

        {/* Source tabs */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#8888a0', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            How do you want to find stakeholders?
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => { setMode('ai'); setStakeholders([]); setSelected(null); runAISearch() }}
              style={TAB(mode === 'ai', '#0066cc')}
            >
              ✦ Lusha + AI Search
            </button>
            <button
              onClick={() => setMode('manual')}
              style={TAB(mode === 'manual', '#059669')}
            >
              + Add Manually
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ padding: '24px', textAlign: 'center', color: '#8888a0', fontSize: '13px' }}>
            <div style={{ fontSize: '22px', marginBottom: '8px' }}>⟳</div>
            Searching for stakeholders at {company}...
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ background: '#fff0f0', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 14px', marginBottom: '12px', color: '#dc2626', fontSize: '12px' }}>
            {error}
          </div>
        )}

        {/* Manual form */}
        {mode === 'manual' && (
          <div style={{ background: '#f0faf5', border: '1px solid #d1fae5', borderRadius: '8px', padding: '16px', marginBottom: '12px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#059669', marginBottom: '12px' }}>Add a stakeholder manually</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#8888a0', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Full Name *</div>
                <input value={manualName} onChange={e => setManualName(e.target.value)} placeholder="Vibha Padalkar"
                  style={{ width: '100%', background: '#fff', border: '1px solid #e8e8ed', borderRadius: '7px', padding: '8px 11px', fontSize: '13px', color: '#1a1a2e', outline: 'none' }} />
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#8888a0', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Role / Title *</div>
                <input value={manualRole} onChange={e => setManualRole(e.target.value)} placeholder="MD & CEO"
                  style={{ width: '100%', background: '#fff', border: '1px solid #e8e8ed', borderRadius: '7px', padding: '8px 11px', fontSize: '13px', color: '#1a1a2e', outline: 'none' }} />
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#8888a0', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Work Email</div>
                <input value={manualEmail} onChange={e => setManualEmail(e.target.value)} placeholder="vibha.padalkar@hdfclife.com"
                  style={{ width: '100%', background: '#fff', border: '1px solid #e8e8ed', borderRadius: '7px', padding: '8px 11px', fontSize: '13px', color: '#1a1a2e', outline: 'none' }} />
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#8888a0', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>LinkedIn URL</div>
                <input value={manualLinkedIn} onChange={e => setManualLinkedIn(e.target.value)} placeholder="linkedin.com/in/vibhapadalkar"
                  style={{ width: '100%', background: '#fff', border: '1px solid #e8e8ed', borderRadius: '7px', padding: '8px 11px', fontSize: '13px', color: '#1a1a2e', outline: 'none' }} />
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#8888a0', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tags (comma separated)</div>
                <input value={manualTags} onChange={e => setManualTags(e.target.value)} placeholder="Decision Maker, LinkedIn Active"
                  style={{ width: '100%', background: '#fff', border: '1px solid #e8e8ed', borderRadius: '7px', padding: '8px 11px', fontSize: '13px', color: '#1a1a2e', outline: 'none' }} />
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#8888a0', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>What they care about</div>
                <input value={manualPersona} onChange={e => setManualPersona(e.target.value)} placeholder="Cares about agent adoption and ROI"
                  style={{ width: '100%', background: '#fff', border: '1px solid #e8e8ed', borderRadius: '7px', padding: '8px 11px', fontSize: '13px', color: '#1a1a2e', outline: 'none' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={addManual}
                style={{ background: '#059669', color: '#fff', border: 'none', borderRadius: '7px', padding: '8px 16px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                + Add Stakeholder
              </button>
              <button onClick={() => { setMode('ai'); runAISearch() }}
                style={{ background: '#f5f5f7', color: '#444460', border: '1px solid #e8e8ed', borderRadius: '7px', padding: '8px 14px', fontSize: '12px', cursor: 'pointer' }}>
                Use AI Search instead
              </button>
            </div>
          </div>
        )}

        {/* Stakeholder cards */}
        {stakeholders.length > 0 && (
          <div>
            <div style={{ fontSize: '12px', color: '#8888a0', marginBottom: '10px' }}>
              Select the stakeholder you want to target:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
              {stakeholders.map((sk, i) => (
                <div key={i} onClick={() => setSelected(i)}
                  style={{ border: selected === i ? '2px solid #0066cc' : '1px solid #e8e8ed', borderRadius: '10px', padding: '14px', cursor: 'pointer', background: selected === i ? '#f0f8ff' : '#fff', transition: 'all .15s' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: sk.color, color: sk.textColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, flexShrink: 0 }}>
                      {sk.initials}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a2e' }}>{sk.name}</div>
                      <div style={{ fontSize: '11px', color: '#8888a0' }}>{sk.role}</div>
                    </div>
                    {selected === i && (
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#0066cc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '11px', fontWeight: 700 }}>✓</div>
                    )}
                  </div>
                  {sk.painPoint && (
                    <div style={{ fontSize: '11px', color: '#8888a0', marginBottom: '6px', lineHeight: '1.5', fontStyle: 'italic' }}>
                      {sk.painPoint}
                    </div>
                  )}
                  {sk.email && (
                    <div style={{ fontSize: '10px', color: '#aaaabc', marginBottom: '6px' }}>{sk.email}</div>
                  )}
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '4px' }}>
                    {sk.tags.map(tag => (
                      <span key={tag} style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '20px', background: sk.color, color: sk.textColor, fontWeight: 500 }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                    {sk.source === 'ai' && (
                      <span style={{ fontSize: '9px', padding: '1px 6px', borderRadius: '10px', background: '#e8f4ff', color: '#0066cc', fontWeight: 600 }}>✦ AI identified</span>
                    )}
                    {sk.source === 'manual' && (
                      <span style={{ fontSize: '9px', padding: '1px 6px', borderRadius: '10px', background: '#f0faf5', color: '#059669', fontWeight: 600 }}>✎ Manual</span>
                    )}
                    {sk.linkedin && (
                      <a href={`https://${sk.linkedin}`} target="_blank" rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        style={{ fontSize: '10px', color: '#6366f1', textDecoration: 'none' }}>
                        LinkedIn ↗
                      </a>
                    )}
                  </div>
                </div>
              ))}

              <div onClick={() => setMode('manual')}
                style={{ border: '1px dashed #e8e8ed', borderRadius: '10px', padding: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '6px', color: '#8888a0', minHeight: '120px', background: '#fafafa' }}>
                <div style={{ fontSize: '20px' }}>+</div>
                <div style={{ fontSize: '12px' }}>Add another stakeholder</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => selected !== null && onSelect(stakeholders[selected])}
                disabled={selected === null}
                style={{ background: selected !== null ? '#0066cc' : '#e8e8ed', color: selected !== null ? '#fff' : '#aaaabc', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: 600, cursor: selected !== null ? 'pointer' : 'not-allowed' }}>
                Build Adaptive Sequence →
              </button>
              <button onClick={() => { setMode('ai'); runAISearch() }}
                style={{ background: '#f5f5f7', color: '#444460', border: '1px solid #e8e8ed', borderRadius: '8px', padding: '10px 16px', fontSize: '12px', cursor: 'pointer' }}>
                Search again
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}