'use client'
import { useState } from 'react'

export default function ApprovalQueue({
  company,
  stakeholder,
  content,
  onDone,
}: {
  company: string
  stakeholder: any
  content: any[]
  onDone: () => void
}) {
  const [statuses, setStatuses] = useState<Record<number, 'pending' | 'approved' | 'rejected'>>(
    Object.fromEntries(content.map((_, i) => [i, 'pending']))
  )
  const [editedBodies, setEditedBodies] = useState<Record<number, string>>(
    Object.fromEntries(content.map((c, i) => [i, c.body || '']))
  )
  const [editing, setEditing] = useState<Record<number, boolean>>({})

  function approve(i: number) {
    setStatuses(prev => ({ ...prev, [i]: 'approved' }))
    setEditing(prev => ({ ...prev, [i]: false }))
  }

  function reject(i: number) {
    setStatuses(prev => ({ ...prev, [i]: 'rejected' }))
  }

  function toggleEdit(i: number) {
    setEditing(prev => ({ ...prev, [i]: !prev[i] }))
  }

  const allActioned = content.every((_, i) => statuses[i] !== 'pending')
  const approvedCount = content.filter((_, i) => statuses[i] === 'approved').length

  return (
    <div style={{ background: '#ffffff', border: '1px solid #e8e8ed', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px' }}>
      <div style={{ padding: '14px 18px', borderBottom: '1px solid #e8e8ed', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontWeight: 600, fontSize: '14px', color: '#1a1a2e' }}>
          Approval Queue — {stakeholder.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: '#8888a0' }}>
            {approvedCount} of {content.length} approved
          </span>
          <span style={{ fontSize: '10px', background: '#fff7ed', color: '#d97706', padding: '2px 8px', borderRadius: '20px', fontWeight: 600 }}>
            {content.filter((_, i) => statuses[i] === 'pending').length} PENDING
          </span>
        </div>
      </div>

      <div style={{ padding: '18px' }}>

        {/* Notice */}
        <div style={{ background: '#f0faf5', border: '1px solid #d1fae5', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '12px', color: '#065f46', lineHeight: '1.6' }}>
          <strong>Nothing sends without your approval.</strong> Review each step, edit if needed, then approve. Email steps send via Gmail. LinkedIn and call steps are flagged for you to action manually.
        </div>

        {content.map((item, i) => {
          const status = statuses[i]
          const isEditing = editing[i]
          const isHuman = item.type === 'human'

          const borderColor = status === 'approved' ? '#059669' : status === 'rejected' ? '#dc2626' : '#e8e8ed'
          const headerBg = status === 'approved' ? '#f0faf5' : status === 'rejected' ? '#fff0f0' : '#f5f5f7'

          return (
            <div key={i} style={{ border: `1px solid ${borderColor}`, borderRadius: '10px', overflow: 'hidden', marginBottom: '12px', transition: 'border .2s' }}>

              {/* Item header */}
              <div style={{ padding: '10px 14px', background: headerBg, borderBottom: '1px solid #e8e8ed', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#1a1a2e' }}>
                    Step {item.step} — {item.channel}
                    {isHuman ? ' · Human Action Required' : ' · Email'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#8888a0', marginTop: '1px' }}>
                    {company} · {stakeholder.name}
                  </div>
                </div>

                {/* Status badge */}
                {status === 'pending' && (
                  <span style={{ fontSize: '10px', background: '#fff7ed', color: '#d97706', padding: '2px 8px', borderRadius: '20px', fontWeight: 600 }}>
                    PENDING
                  </span>
                )}
                {status === 'approved' && (
                  <span style={{ fontSize: '10px', background: '#f0faf5', color: '#059669', padding: '2px 8px', borderRadius: '20px', fontWeight: 600 }}>
                    ✓ APPROVED
                  </span>
                )}
                {status === 'rejected' && (
                  <span style={{ fontSize: '10px', background: '#fff0f0', color: '#dc2626', padding: '2px 8px', borderRadius: '20px', fontWeight: 600 }}>
                    ✕ REJECTED
                  </span>
                )}
              </div>

              {/* Item body */}
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

                {isEditing ? (
                  <textarea
                    value={editedBodies[i]}
                    onChange={e => setEditedBodies(prev => ({ ...prev, [i]: e.target.value }))}
                    rows={6}
                    style={{ width: '100%', background: '#f5f5f7', border: '1px solid #0066cc', borderRadius: '8px', padding: '10px 12px', fontSize: '12px', lineHeight: '1.7', color: '#1a1a2e', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
                  />
                ) : (
                  <div style={{ fontSize: '12px', lineHeight: '1.8', color: '#444460', whiteSpace: 'pre-wrap', padding: '4px 0' }}>
                    {editedBodies[i]}
                  </div>
                )}

                {/* Actions */}
                {status === 'pending' && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e8e8ed' }}>
                    <button
                      onClick={() => approve(i)}
                      style={{ background: '#059669', color: '#fff', border: 'none', borderRadius: '7px', padding: '8px 16px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                    >
                      {isHuman ? '✓ Mark as Done' : '✓ Approve & Send'}
                    </button>
                    <button
                      onClick={() => toggleEdit(i)}
                      style={{ background: '#f5f5f7', color: '#444460', border: '1px solid #e8e8ed', borderRadius: '7px', padding: '8px 16px', fontSize: '12px', cursor: 'pointer' }}
                    >
                      {isEditing ? 'Save Edit' : 'Edit'}
                    </button>
                    {isHuman && (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(editedBodies[i])
                        }}
                        style={{ background: '#f0f0ff', color: '#6366f1', border: '1px solid #c7d2fe', borderRadius: '7px', padding: '8px 16px', fontSize: '12px', cursor: 'pointer' }}
                      >
                        Copy Message
                      </button>
                    )}
                    <button
                      onClick={() => reject(i)}
                      style={{ background: '#fff0f0', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '7px', padding: '8px 16px', fontSize: '12px', cursor: 'pointer', marginLeft: 'auto' }}
                    >
                      Reject
                    </button>
                  </div>
                )}

                {status === 'approved' && !isHuman && (
                  <div style={{ marginTop: '10px', fontSize: '12px', color: '#059669', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>✓</span> Approved — will send via Gmail when campaign launches
                  </div>
                )}
                {status === 'approved' && isHuman && (
                  <div style={{ marginTop: '10px', fontSize: '12px', color: '#059669', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>✓</span> Marked as done — sequence continues
                  </div>
                )}
                {status === 'rejected' && (
                  <div style={{ marginTop: '10px', fontSize: '12px', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>✕</span> Rejected — this step will be skipped
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {/* Done button */}
        {allActioned && (
          <div style={{ marginTop: '16px', padding: '16px', background: '#f0faf5', border: '1px solid #d1fae5', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#065f46', marginBottom: '3px' }}>
                Campaign ready — {approvedCount} steps approved
              </div>
              <div style={{ fontSize: '12px', color: '#059669' }}>
                All steps reviewed. Campaign will launch with approved steps only.
              </div>
            </div>
            <button
              onClick={onDone}
              style={{ background: '#059669', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
            >
              Launch Campaign →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}