'use client'
import { useState } from 'react'
import StakeholderView from './StakeholderView'
import SequenceView from './SequenceView'
import ContentView from './ContentView'
import ApprovalQueue from './ApprovalQueue'

export default function ResearchView({ onCampaignLaunched }: { onCampaignLaunched?: (campaign: any) => void }) {
  const [company, setCompany] = useState('HDFC Life Insurance')
  const [industry, setIndustry] = useState('Insurance')
  const [size, setSize] = useState('Enterprise (5000+)')
  const [context, setContext] = useState('')
  const [loading, setLoading] = useState(false)
  const [research, setResearch] = useState('')
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)
  const [selectedStakeholder, setSelectedStakeholder] = useState<any>(null)
  const [sequenceSteps, setSequenceSteps] = useState<any[]>([])
  const [contentItems, setContentItems] = useState<any[]>([])
  const [campaignLaunched, setCampaignLaunched] = useState(false)

  async function runResearch() {
  if (!company.trim()) return alert('Enter a company name')
  setLoading(true)
  setResearch('')
  setError('')
  try {
    const res = await fetch('/api/research', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ company, industry, size, context }),
    })
    const data = await res.json()
    if (data.result) {
      setResearch(data.result)
      setStep(2)
    } else {
      setError('No result returned. Try again.')
    }
  } catch (e) {
    setError('Connection error. Make sure the dev server is running.')
  }
  setLoading(false)
}

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '22px', fontWeight: 600, color: '#1a1a2e', marginBottom: '4px' }}>
          Account Research
        </div>
        <div style={{ fontSize: '13px', color: '#8888a0' }}>
          Enter a company → AI researches pain points, maps stakeholders, and builds a personalised outreach plan
        </div>
      </div>

      {/* Progress steps */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px', gap: '0' }}>
        {['Research', 'Stakeholders', 'Sequence', 'Content', 'Approve'].map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: 600,
                background: step > i + 1 ? '#059669' : step === i + 1 ? '#0066cc' : '#ffffff',
                color: step > i + 1 ? '#fff' : step === i + 1 ? '#fff' : '#aaaabc',
                border: step > i + 1 ? '2px solid #059669' : step === i + 1 ? '2px solid #0066cc' : '2px solid #e8e8ed',
                transition: 'all .3s',
              }}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <div style={{ fontSize: '10px', color: step === i + 1 ? '#0066cc' : '#aaaabc', fontWeight: step === i + 1 ? 600 : 400 }}>
                {s}
              </div>
            </div>
            {i < 4 && <div style={{ flex: 1, height: '2px', background: step > i + 1 ? '#059669' : '#e8e8ed', margin: '0 4px', marginBottom: '20px', transition: 'all .3s' }} />}
          </div>
        ))}
      </div>

      {/* Input card */}
      <div style={{ background: '#ffffff', border: '1px solid #e8e8ed', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #e8e8ed', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 600, fontSize: '14px', color: '#1a1a2e' }}>Company Details</div>
          <span style={{ fontSize: '10px', background: '#e8f4ff', color: '#0066cc', padding: '2px 8px', borderRadius: '20px', fontWeight: 600 }}>LIVE AI</span>
        </div>
        <div style={{ padding: '18px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#8888a0', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Company Name</div>
              <input
                value={company}
                onChange={e => setCompany(e.target.value)}
                placeholder="e.g. HDFC Life Insurance"
                style={{ width: '100%', background: '#f5f5f7', border: '1px solid #e8e8ed', borderRadius: '8px', padding: '9px 12px', fontSize: '13px', color: '#1a1a2e', outline: 'none' }}
              />
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#8888a0', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Industry</div>
              <select
                value={industry}
                onChange={e => setIndustry(e.target.value)}
                style={{ width: '100%', background: '#f5f5f7', border: '1px solid #e8e8ed', borderRadius: '8px', padding: '9px 12px', fontSize: '13px', color: '#1a1a2e', outline: 'none' }}
              >
                <option>Insurance</option>
                <option>BFSI</option>
                <option>Wealth Management</option>
                <option>Pharma</option>
                <option>Fintech</option>
              </select>
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#8888a0', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Company Size</div>
              <select
                value={size}
                onChange={e => setSize(e.target.value)}
                style={{ width: '100%', background: '#f5f5f7', border: '1px solid #e8e8ed', borderRadius: '8px', padding: '9px 12px', fontSize: '13px', color: '#1a1a2e', outline: 'none' }}
              >
                <option>Enterprise (5000+)</option>
                <option>Mid-market (500-5000)</option>
                <option>SMB (&lt;500)</option>
              </select>
            </div>
          </div>
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#8888a0', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Additional Context (optional)</div>
            <textarea
              value={context}
              onChange={e => setContext(e.target.value)}
              placeholder="Any known info — past conversations, specific challenges, contacts you know..."
              rows={3}
              style={{ width: '100%', background: '#f5f5f7', border: '1px solid #e8e8ed', borderRadius: '8px', padding: '9px 12px', fontSize: '13px', color: '#1a1a2e', outline: 'none', resize: 'vertical', lineHeight: '1.6' }}
            />
          </div>
          <button
            onClick={runResearch}
            disabled={loading}
            style={{
              background: loading ? '#e8e8ed' : '#0066cc',
              color: loading ? '#aaaabc' : '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all .15s',
            }}
          >
            {loading ? '⟳ Researching...' : 'Run Deep Research →'}
          </button>
        </div>
      </div>

      {/* Research output */}
      {error && (
  <div style={{ background: '#fff0f0', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', color: '#dc2626', fontSize: '13px' }}>
    {error}
  </div>
)}
      {research && (
        <div style={{ background: '#ffffff', border: '1px solid #e8e8ed', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #e8e8ed', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontWeight: 600, fontSize: '14px', color: '#1a1a2e' }}>Research Output — {company}</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{ fontSize: '10px', background: '#e8f4ff', color: '#0066cc', padding: '2px 8px', borderRadius: '20px', fontWeight: 600 }}>AI GENERATED</span>
              <button style={{ fontSize: '11px', background: '#f0faf5', color: '#059669', border: '1px solid #d1fae5', borderRadius: '6px', padding: '3px 10px', fontWeight: 600 }}>
                Save to Notion ↗
              </button>
            </div>
          </div>
          <div style={{ padding: '18px' }}>
            <div style={{ fontSize: '13px', lineHeight: '1.8', color: '#444460', whiteSpace: 'pre-wrap' }}>
              {research.split('\n').map((line, i) => (
  <div key={i} style={{
    marginBottom: line === '' ? '8px' : '2px',
    fontWeight: line.toUpperCase() === line && line.length > 3 ? 600 : 400,
    color: line.toUpperCase() === line && line.length > 3 ? '#1a1a2e' : '#444460',
    fontSize: line.toUpperCase() === line && line.length > 3 ? '11px' : '13px',
    letterSpacing: line.toUpperCase() === line && line.length > 3 ? '0.5px' : '0',
  }}>
    {line}
  </div>
))}
            </div>
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e8e8ed', display: 'flex', gap: '10px' }}>
              <button style={{ background: '#0066cc', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 18px', fontSize: '13px', fontWeight: 600 }}>
                Map Stakeholders →
              </button>
              <button style={{ background: '#f5f5f7', color: '#444460', border: '1px solid #e8e8ed', borderRadius: '8px', padding: '9px 18px', fontSize: '13px' }}
                onClick={runResearch}>
                Re-run Research
              </button>
            </div>
          </div>
        </div>
      )}
   {step >= 2 && (
  <StakeholderView
    company={company}
    industry={industry}
    research={research}
    onSelect={(sk) => {
      setSelectedStakeholder(sk)
      setStep(3)
    }}
  />
)}

{step >= 3 && selectedStakeholder && (
  <SequenceView
    company={company}
    stakeholder={selectedStakeholder}
    research={research}
    onNext={(steps) => {
      setSequenceSteps(steps)
      setStep(4)
    }}
  />
)}

{step >= 4 && selectedStakeholder && (
  <ContentView
    company={company}
    stakeholder={selectedStakeholder}
    research={research}
    steps={sequenceSteps}
   onNext={(items) => {
  // Attach stakeholder email to each email item
  const enriched = items.map((item: any) => ({
    ...item,
    email: selectedStakeholder?.email || '',
    to: selectedStakeholder?.email || '',
  }))
  setContentItems(enriched)
  setStep(5)
}}
  />
)}

{step >= 5 && selectedStakeholder && !campaignLaunched && (
  <ApprovalQueue
    company={company}
    stakeholder={selectedStakeholder}
    content={contentItems}
    onDone={() => {
  setCampaignLaunched(true)
  setStep(6)
  if (onCampaignLaunched) {
    onCampaignLaunched({
      company,
      stakeholder: selectedStakeholder,
      content: contentItems,
      launchedAt: new Date().toISOString(),
    })
  }
}}
  />
)}

{campaignLaunched && (
  <div style={{ background: '#f0faf5', border: '1px solid #d1fae5', borderRadius: '12px', padding: '28px', textAlign: 'center', marginBottom: '16px' }}>
    <div style={{ fontSize: '32px', marginBottom: '12px' }}>🎯</div>
    <div style={{ fontSize: '18px', fontWeight: 700, color: '#065f46', marginBottom: '6px' }}>
      Campaign Launched!
    </div>
    <div style={{ fontSize: '13px', color: '#059669', marginBottom: '20px' }}>
      Your adaptive outreach sequence for {selectedStakeholder?.name} at {company} is now live.
    </div>
    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
      <button
        onClick={() => {
          setStep(1)
          setResearch('')
          setSelectedStakeholder(null)
          setSequenceSteps([])
          setContentItems([])
          setCampaignLaunched(false)
          setCompany('')
          setContext('')
        }}
        style={{ background: '#0066cc', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
      >
        Start New Campaign
      </button>
      <button
        style={{ background: '#ffffff', color: '#059669', border: '1px solid #d1fae5', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
      >
        View All Campaigns →
      </button>
    </div>
  </div>
)}
    </div>
  )
}