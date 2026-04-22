'use client'

const NAV = [
  { group: 'Marketing Agent', items: [
    { id: 'research', label: 'Account Research', badge: 'AI', badgeType: 'blue' },
    { id: 'approval', label: 'Approval Queue', badge: '3', badgeType: 'amber' },
    { id: 'signals', label: 'Live Signals', badge: '6', badgeType: 'red' },
  ]},
  { group: 'Pipeline', items: [
    { id: 'pipeline', label: 'All Campaigns', badge: '5', badgeType: 'blue' },
    { id: 'rag', label: 'Lead Board', badge: '', badgeType: '' },
  ]},
  { group: 'Sales Agent', items: [
    { id: 'meetingprep', label: 'Meeting Prep', badge: 'AI', badgeType: 'blue' },
    { id: 'social', label: 'Social Content', badge: 'AI', badgeType: 'blue' },
  ]},
  { group: 'Settings', items: [
    { id: 'notion', label: 'Notion Sync', badge: '', badgeType: '' },
  ]},
]

const BADGE: Record<string, React.CSSProperties> = {
  blue:  { background: '#e8f4ff', color: '#0066cc', fontWeight: 600 },
  amber: { background: '#fff4e6', color: '#d97706', fontWeight: 600 },
  red:   { background: '#fff0f0', color: '#dc2626', fontWeight: 600 },
  green: { background: '#f0faf5', color: '#059669', fontWeight: 600 },
}

export default function LayoutShell({
  activeView,
  setActiveView,
  children,
}: {
  activeView: string
  setActiveView: (v: string) => void
  children: React.ReactNode
}) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '240px 1fr',
      gridTemplateRows: '56px 1fr',
      height: '100vh',
      overflow: 'hidden',
    }}>

      {/* Topbar */}
      <div style={{
        gridColumn: '1/-1',
        background: '#ffffff',
        borderBottom: '1px solid #e8e8ed',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        gap: '16px',
      }}>
        <div style={{
          fontSize: '16px',
          fontWeight: 700,
          color: '#1a1a2e',
          letterSpacing: '-0.3px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <div style={{
            width: '28px', height: '28px',
            background: '#0066cc',
            borderRadius: '7px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: '13px', fontWeight: 700,
          }}>V</div>
          Vymo Agent
        </div>

        <div style={{
          fontSize: '11px',
          color: '#8888a0',
          background: '#f5f5f7',
          border: '1px solid #e8e8ed',
          padding: '3px 10px',
          borderRadius: '20px',
        }}>
          Adaptive Outreach Engine
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#059669', background: '#f0faf5', padding: '4px 12px', borderRadius: '20px', border: '1px solid #d1fae5' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#059669' }}></div>
            Engine active
          </div>
          <div style={{
            width: '32px', height: '32px',
            background: '#0066cc',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: '12px', fontWeight: 600,
          }}>P</div>
        </div>
      </div>

      {/* Sidebar */}
      <div style={{
        background: '#ffffff',
        borderRight: '1px solid #e8e8ed',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        <div style={{ padding: '16px 12px', flex: 1, overflowY: 'auto' }}>
          {NAV.map(group => (
            <div key={group.group} style={{ marginBottom: '4px' }}>
              <div style={{
                fontSize: '10px',
                fontWeight: 600,
                letterSpacing: '0.8px',
                color: '#aaaabc',
                padding: '0 10px',
                margin: '16px 0 6px',
                textTransform: 'uppercase',
              }}>
                {group.group}
              </div>
              {group.items.map(item => {
                const isActive = activeView === item.id
                return (
                  <div
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      color: isActive ? '#0066cc' : '#444460',
                      background: isActive ? '#e8f4ff' : 'transparent',
                      fontWeight: isActive ? 500 : 400,
                      marginBottom: '2px',
                      transition: 'all .15s',
                      fontSize: '13px',
                    }}
                    onMouseEnter={e => {
                      if (!isActive) (e.currentTarget as HTMLDivElement).style.background = '#f5f5f7'
                    }}
                    onMouseLeave={e => {
                      if (!isActive) (e.currentTarget as HTMLDivElement).style.background = 'transparent'
                    }}
                  >
                    <div style={{
                      width: '6px', height: '6px',
                      borderRadius: '50%',
                      background: isActive ? '#0066cc' : '#d0d0de',
                      flexShrink: 0,
                    }} />
                    {item.label}
                    {item.badge && (
                      <span style={{
                        marginLeft: 'auto',
                        fontSize: '10px',
                        padding: '1px 7px',
                        borderRadius: '20px',
                        ...(BADGE[item.badgeType] || {}),
                      }}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid #e8e8ed',
          fontSize: '11px',
          color: '#aaaabc',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#059669' }} />
          Vymo · Hackathon 2025
        </div>
      </div>

      {/* Main content */}
      <div style={{
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        background: '#f5f5f7',
      }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          {children}
        </div>
      </div>

    </div>
  )
}