import { useState } from 'react'

function Avatar({ name, size = 26 }) {
  const colors = [
    { bg: '#dbeafe', text: '#1d4ed8' },
    { bg: '#dcfce7', text: '#15803d' },
    { bg: '#fce7f3', text: '#be185d' },
    { bg: '#fef3c7', text: '#92400e' },
    { bg: '#ede9fe', text: '#6d28d9' },
  ]
  const idx = name.charCodeAt(0) % colors.length
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: colors[idx].bg, color: colors[idx].text,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: '500', flexShrink: 0, userSelect: 'none'
    }}>
      {name.slice(0, 2).toUpperCase()}
    </div>
  )
}

export default function Sidebar({ channels, activeChannel, onSelectChannel, profile, onSignOut, onlineUsers, onCreateChannel }) {
  const [showNewChannel, setShowNewChannel] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [creating, setCreating] = useState(false)

  async function handleCreate(e) {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true)
    await onCreateChannel(newName.trim(), newDesc.trim())
    setNewName('')
    setNewDesc('')
    setShowNewChannel(false)
    setCreating(false)
  }

  return (
    <div style={{
      width: 240, flexShrink: 0,
      display: 'flex', flexDirection: 'column',
      background: 'var(--sidebar)',
      borderRight: '1px solid var(--border)',
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 16px 12px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div>
          <div style={{ fontSize: '15px', fontWeight: '500', color: 'var(--text)' }}>團隊空間</div>
          <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '1px' }}>
            {onlineUsers.length} 人在線
          </div>
        </div>
        <button
          onClick={onSignOut}
          title="登出"
          style={{
            width: 28, height: 28, border: '1px solid var(--border)',
            background: 'transparent', borderRadius: '7px',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--muted)', fontSize: 12
          }}
        >↩</button>
      </div>

      {/* Channels */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '4px 8px 6px', fontSize: '11px',
          color: 'var(--muted)', letterSpacing: '0.04em', textTransform: 'uppercase'
        }}>
          <span>頻道</span>
          <button
            onClick={() => setShowNewChannel(s => !s)}
            style={{
              width: 18, height: 18, border: 'none', background: 'transparent',
              cursor: 'pointer', color: 'var(--muted)', fontSize: 16, lineHeight: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '4px', transition: 'color 0.1s'
            }}
            title="新增頻道"
          >+</button>
        </div>

        {showNewChannel && (
          <form onSubmit={handleCreate} style={{
            margin: '0 0 8px',
            padding: '10px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
          }}>
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="頻道名稱"
              autoFocus
              style={{
                width: '100%', padding: '6px 8px',
                background: 'var(--bg)', border: '1px solid var(--border)',
                borderRadius: '6px', fontSize: '13px', color: 'var(--text)',
                outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: '6px'
              }}
            />
            <input
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              placeholder="描述（選填）"
              style={{
                width: '100%', padding: '6px 8px',
                background: 'var(--bg)', border: '1px solid var(--border)',
                borderRadius: '6px', fontSize: '13px', color: 'var(--text)',
                outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: '8px'
              }}
            />
            <div style={{ display: 'flex', gap: '6px' }}>
              <button type="submit" disabled={creating} style={{
                flex: 1, padding: '5px', background: 'var(--text)', color: 'var(--bg)',
                border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit'
              }}>建立</button>
              <button type="button" onClick={() => setShowNewChannel(false)} style={{
                flex: 1, padding: '5px', background: 'transparent', color: 'var(--muted)',
                border: '1px solid var(--border)', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit'
              }}>取消</button>
            </div>
          </form>
        )}

        {channels.map(ch => (
          <div
            key={ch.id}
            onClick={() => onSelectChannel(ch)}
            style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              padding: '7px 10px', borderRadius: '7px', cursor: 'pointer',
              fontSize: '14px',
              background: activeChannel?.id === ch.id ? 'var(--active)' : 'transparent',
              color: activeChannel?.id === ch.id ? 'var(--text)' : 'var(--muted)',
              fontWeight: activeChannel?.id === ch.id ? '500' : '400',
              transition: 'background 0.1s',
            }}
            onMouseEnter={e => { if (activeChannel?.id !== ch.id) e.currentTarget.style.background = 'var(--hover)' }}
            onMouseLeave={e => { if (activeChannel?.id !== ch.id) e.currentTarget.style.background = 'transparent' }}
          >
            <span style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1 }}>#</span>
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {ch.name}
            </span>
          </div>
        ))}
      </div>

      {/* Online users */}
      {onlineUsers.length > 0 && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '8px' }}>
          <div style={{ fontSize: '11px', color: 'var(--muted)', letterSpacing: '0.04em', textTransform: 'uppercase', padding: '4px 8px 6px' }}>
            在線成員
          </div>
          {onlineUsers.slice(0, 5).map((u, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 8px', fontSize: '13px', color: 'var(--muted)' }}>
              <div style={{ position: 'relative' }}>
                <Avatar name={u.user_id?.slice(0, 4) || 'U'} size={24} />
                <div style={{
                  position: 'absolute', bottom: 0, right: 0,
                  width: 8, height: 8, borderRadius: '50%',
                  background: '#22c55e', border: '1.5px solid var(--sidebar)'
                }} />
              </div>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {u.user_id === profile?.id ? (profile?.username || '我') + ' (我)' : (u.username || u.user_id?.slice(0, 8))}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Current user */}
      <div style={{
        padding: '10px 12px',
        borderTop: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: '8px'
      }}>
        <Avatar name={profile?.username || '?'} size={30} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {profile?.username}
          </div>
          <div style={{ fontSize: '11px', color: '#22c55e' }}>● 在線</div>
        </div>
      </div>
    </div>
  )
}
