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

type ApolloCompany = {
  id: string
  name: string
  domain: string
  industry: string
  employees: number
  city: string
  country: string
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
  const [mode, setMode] = useState<'choose' | 'ai' | 'notion' | 'manual'>('choose')
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Company confirmation
  const [companyOptions, setCompanyOptions] = useState<ApolloCompany[]>([])
  const [confirming, setConfirming] = useState(false)
  const [selectedOrg, setSelectedOrg] = useState<ApolloCompany | null>(null)
  const [sources, setSources] = useState<{ apollo: number; ai: number } | null>(null)

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
    setCompanyOptions([])
    setConfirming(false)
    setSelectedOrg(null)
    setSources(null)

    try {
      const res = await fetch('/api/stakeholders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company, industry, research }),
      })
      const data = await res.json()

      if (data.mode === 'confirm_company' && data.companies?.length > 0) {
        setCompanyOptions(data.companies)
        setConfirming(true)
      } else if (data.mode === 'stakeholders') {
        setStakeholders(data.stakeholders || [])
        setSources(data.sources || null)
      } else {
        setError(data.error || 'Could not find stakeholders.')
      }
    } catch (e) {
      setError('Error connecting to search. Try manual entry.')
    }
    setLoading(false)
  }

  async function confirmCompany(org: ApolloCompany) {
    setSelectedOrg(org)
    setConfirming(false)
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/stakeholders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: org.name,
          industry,
          research,
          apolloOrgId: org.id,
          apolloDomain: org.domain,
        }),
      })
      const data = await res.json()

      if (data.mode === 'stakeholders') {
        setStakeholders(data.stakeholders || [])
        setSources(data.sources || null)
      } else {
        setError(data.error || 'No stakeholders found.')
      }
    } catch (e) {
      setError('Error loading stakeholders.')
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

  function handleSelect(i: number) { setSelected(i) }

  function proceed() {
    if (selected !== null) onSelect(stakeholders[selected])
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
          {sources && (
  <div style={{ display: 'flex', gap: '6px' }}>
    {(sources as any).lusha > 0 && <span style={{ fontSize: '10px', background: '#e8f4ff', color: '#0066cc', padding: '2px 8px', borderRadius: '20px', fontWeight: 600 }}>✓ {(sources as any).lusha} from Lusha</span>}
    {sources.ai > 0 && <span style={{ fontSize: '10px', background: '#f0f0ff', color: '#6366f1', padding: '2px 8px', borderRadius: '20px', fontWeight: 600 }}>✦ {sources.ai} AI suggested</span>}
  </div>
)}
          {!sources && <span style={{ fontSize: '10px', background: '#e8f4ff', color: '#0066cc', padding: '2px 8px', borderRadius: '20px', fontWeight: 600 }}>SELECT SOURCE</span>}
        </div>
      </div>

      <div style={{ padding: '18px' }}>

        {/* Source tabs */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#8888a0', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            How do you want to find stakeholders?
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button onClick={() => { setMode('ai'); setStakeholders([]); setSelected(null); runAISearch() }} style={TAB(mode === 'ai')}>
              ✦ Apollo + AI Search
            </button>
            <button onClick={() => { setMode('notion'); setStakeholders([]); setSelected(null) }} style={TAB(mode === 'notion', '#6366f1')}>
              N  Import from Notion
            </button>
            <button onClick={() => setMode('manual')} style={TAB(mode === 'manual', '#059669')}>
              + Add Manually
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ padding: '24px', textAlign: 'center', color: '#8888a0', fontSize: '13px' }}>
            <div style={{ fontSize: '22px', marginBottom: '8px' }}>⟳</div>
            {confirming ? 'Loading stakeholders...' : `Searching Apollo for contacts at ${company}...`}
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ background: '#fff0f0', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 14px', marginBottom: '12px', color: '#dc2626', fontSize: '12px' }}>
            {error}
          </div>
        )}

        {/* Company confirmation picker */}
        {confirming && !loading && companyOptions.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '8px', padding: '10px 14px', marginBottom: '12px', fontSize: '12px', color: '#92400e' }}>
              <strong>Multiple companies found.</strong> Select the exact one you want to target:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {companyOptions.map((org, i) => (
                <div key={i} onClick={() => confirmCompany(org)}
                  style={{ border: '1px solid #e8e8ed', borderRadius: '8px', padding: '12px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all .15s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = '#0066cc'}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = '#e8e8ed'}
                >
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#e8f4ff', color: '#0066cc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '13px', flexShrink: 0 }}>
                    {org.name[0]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a2e' }}>{org.name}</div>
                    <div style={{ fontSize: '11px', color: '#8888a0', marginTop: '2px' }}>
                      {[org.domain, org.industry, org.city, org.country].filter(Boolean).join(' · ')}
                      {org.employees && ` · ${org.employees.toLocaleString()} employees`}
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#0066cc', fontWeight: 500 }}>Select →</div>
                </div>
              ))}
            </div>
            <button onClick={() => { setConfirming(false); setMode('manual') }}
              style={{ marginTop: '10px', background: 'transparent', border: 'none', color: '#8888a0', fontSize: '12px', cursor: 'pointer' }}>
              None of these — add manually instead
            </button>
          </div>
        )}

        {/* Selected org confirmation */}
        {selectedOrg && stakeholders.length > 0 && (
          <div style={{ background: '#f0faf5', border: '1px solid #d1fae5', borderRadius: '7px', padding: '8px 12px', marginBottom: '12px', fontSize: '12px', color: '#059669', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>✓</span>
            <span>Showing contacts for <strong>{selectedOrg.name}</strong>{selectedOrg.domain ? ` · ${selectedOrg.domain}` : ''}</span>
          </div>
        )}

        {/* Notion mode */}
        {mode === 'notion' && !loading && (
          <div style={{ background: '#f5f5f7', border: '1px solid #e8e8ed', borderRadius: '8px', padding: '20px', marginBottom: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>N</div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a2e', marginBottom: '6px' }}>Notion not connected yet</div>
            <div style={{ fontSize: '12px', color: '#8888a0', marginBottom: '14px', lineHeight: '1.6' }}>
              Connect your Notion workspace in Settings to pull contacts from your CRM automatically.
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <button onClick={() => { setMode('ai'); runAISearch() }}
                style={{ background: '#0066cc', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                Use Apollo + AI instead
              </button>
              <button onClick={() => setMode('manual')}
                style={{ background: '#f5f5f7', color: '#444460', border: '1px solid #e8e8ed', borderRadius: '8px', padding: '8px 16px', fontSize: '12px', cursor: 'pointer' }}>
                Add manually
              </button>
            </div>
          </div>
        )}

        {/* Manual form */}
        {mode === 'manual' && (
          <div style={{ background: '#f0faf5', border: '1px solid #d1fae5', borderRadius: '8px', padding: '16px', marginBottom: '12px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#059669', marginBottom: '12px' }}>Add a stakeholder manually</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#8888a0', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Full Name *</div>
                <input value={manualName} onChange={e => setManualName(e.target.value)} placeholder="Priya Mehta"
                  style={{ width: '100%', background: '#fff', border: '1px solid #e8e8ed', borderRadius: '7px', padding: '8px 11px', fontSize: '13px', color: '#1a1a2e', outline: 'none' }} />
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#8888a0', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Role / Title *</div>
                <input value={manualRole} onChange={e => setManualRole(e.target.value)} placeholder="VP Sales Operations"
                  style={{ width: '100%', background: '#fff', border: '1px solid #e8e8ed', borderRadius: '7px', padding: '8px 11px', fontSize: '13px', color: '#1a1a2e', outline: 'none' }} />
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#8888a0', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Work Email</div>
                <input value={manualEmail} onChange={e => setManualEmail(e.target.value)} placeholder="priya.mehta@hdfclife.com"
                  style={{ width: '100%', background: '#fff', border: '1px solid #e8e8ed', borderRadius: '7px', padding: '8px 11px', fontSize: '13px', color: '#1a1a2e', outline: 'none' }} />
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#8888a0', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>LinkedIn URL</div>
                <input value={manualLinkedIn} onChange={e => setManualLinkedIn(e.target.value)} placeholder="linkedin.com/in/priya-mehta"
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
                Use Apollo + AI instead
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
                <div key={i} onClick={() => handleSelect(i)}
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                    {sk.source === 'lusha' && (
  <span style={{ fontSize: '9px', padding: '1px 6px', borderRadius: '10px', background: '#e8f4ff', color: '#0066cc', fontWeight: 600 }}>✓ Lusha</span>
)}
                    {sk.source === 'ai' && (
                      <span style={{ fontSize: '9px', padding: '1px 6px', borderRadius: '10px', background: '#f0f0ff', color: '#6366f1', fontWeight: 600 }}>✦ AI suggested</span>
                    )}
                    {sk.source === 'manual' && (
                      <span style={{ fontSize: '9px', padding: '1px 6px', borderRadius: '10px', background: '#f0faf5', color: '#059669', fontWeight: 600 }}>✎ Manual</span>
                    )}
                    {sk.emailVerified && (
                      <span style={{ fontSize: '9px', padding: '1px 6px', borderRadius: '10px', background: '#f0faf5', color: '#059669', fontWeight: 600 }}>✓ Email verified</span>
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
              <button onClick={proceed} disabled={selected === null}
                style={{ background: selected !== null ? '#0066cc' : '#e8e8ed', color: selected !== null ? '#fff' : '#aaaabc', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: 600, cursor: selected !== null ? 'pointer' : 'not-allowed' }}>
                Build Adaptive Sequence →
              </button>
              <button onClick={runAISearch}
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