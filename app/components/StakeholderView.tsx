'use client'
import { useState } from 'react'

const SAMPLE_STAKEHOLDERS = [
  {
    initials: 'PM', name: 'Priya Mehta', role: 'VP Sales Operations',
    email: 'priya.mehta@hdfclife.com',
    tags: ['Decision Maker', 'LinkedIn Active', 'Tech-forward'],
    persona: 'Senior ops leader who cares about agent adoption metrics and reporting visibility',
    color: '#e8f4ff', textColor: '#0066cc',
  },
  {
    initials: 'RK', name: 'Rohit Kumar', role: 'CTO',
    email: 'rohit.kumar@hdfclife.com',
    tags: ['Technical Buyer', 'AI Interested', 'Email Responsive'],
    persona: 'Technical decision maker who wants architecture details, integration effort, and ROI evidence',
    color: '#f0f0ff', textColor: '#6366f1',
  },
  {
    initials: 'AS', name: 'Anjali Shah', role: 'Head of Distribution',
    email: 'anjali.shah@hdfclife.com',
    tags: ['End User Champion', 'Field Team Focus', 'Scale Oriented'],
    persona: 'Distribution leader managing a large field agent network who cares about adoption and performance',
    color: '#f0faf5', textColor: '#059669',
  },
  {
    initials: 'VN', name: 'Vijay Nair', role: 'CFO',
    email: 'vijay.nair@hdfclife.com',
    tags: ['Economic Buyer', 'ROI Focus', 'Risk Averse'],
    persona: 'Financial decision maker who needs clear ROI, risk justification, and implementation cost clarity',
    color: '#fff7ed', textColor: '#d97706',
  },
]

export default function StakeholderView({
  company,
  onSelect,
}: {
  company: string
  onSelect: (sk: typeof SAMPLE_STAKEHOLDERS[0]) => void
}) {
  const [selected, setSelected] = useState<number | null>(null)

  function handleSelect(i: number) {
    setSelected(i)
    onSelect(SAMPLE_STAKEHOLDERS[i])
  }

  return (
    <div style={{ background: '#ffffff', border: '1px solid #e8e8ed', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px' }}>
      <div style={{ padding: '14px 18px', borderBottom: '1px solid #e8e8ed', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontWeight: 600, fontSize: '14px', color: '#1a1a2e' }}>Stakeholder Map — {company}</div>
        <span style={{ fontSize: '10px', background: '#e8f4ff', color: '#0066cc', padding: '2px 8px', borderRadius: '20px', fontWeight: 600 }}>SELECT ONE TO TARGET</span>
      </div>
      <div style={{ padding: '18px' }}>
        <div style={{ fontSize: '13px', color: '#8888a0', marginBottom: '14px' }}>
          Select the stakeholder you want to reach out to. The AI will build a personalised sequence specifically for them.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          {SAMPLE_STAKEHOLDERS.map((sk, i) => (
            <div
              key={i}
              onClick={() => handleSelect(i)}
              style={{
                border: selected === i ? `2px solid #0066cc` : '1px solid #e8e8ed',
                borderRadius: '10px',
                padding: '14px',
                cursor: 'pointer',
                background: selected === i ? '#f0f8ff' : '#ffffff',
                transition: 'all .15s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div style={{
                  width: '38px', height: '38px', borderRadius: '50%',
                  background: sk.color, color: sk.textColor,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '13px', fontWeight: 700, flexShrink: 0,
                }}>
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
              <div style={{ fontSize: '11px', color: '#6666, 80', marginBottom: '8px', lineHeight: '1.5' }}>
                {sk.persona}
              </div>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {sk.tags.map(tag => (
                  <span key={tag} style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '20px', background: sk.color, color: sk.textColor, fontWeight: 500 }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() => selected !== null && onSelect(SAMPLE_STAKEHOLDERS[selected])}
          disabled={selected === null}
          style={{
            background: selected !== null ? '#0066cc' : '#e8e8ed',
            color: selected !== null ? '#ffffff' : '#aaaabc',
            border: 'none', borderRadius: '8px',
            padding: '10px 20px', fontSize: '13px', fontWeight: 600,
            cursor: selected !== null ? 'pointer' : 'not-allowed',
          }}
        >
          Build Adaptive Sequence →
        </button>
      </div>
    </div>
  )
}