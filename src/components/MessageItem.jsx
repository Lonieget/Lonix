import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { format, isToday, isYesterday } from 'date-fns'
import { zhTW } from 'date-fns/locale'

function Avatar({ profile, size = 34 }) {
  const colors = [
    { bg: '#dbeafe', text: '#1d4ed8' },
    { bg: '#dcfce7', text: '#15803d' },
    { bg: '#fce7f3', text: '#be185d' },
    { bg: '#fef3c7', text: '#92400e' },
    { bg: '#ede9fe', text: '#6d28d9' },
    { bg: '#ffedd5', text: '#c2410c' },
  ]
  const name = profile?.username || 'U'
  const idx = name.charCodeAt(0) % colors.length
  const { bg, text } = colors[idx]
  const initials = profile?.username ? name.slice(0, 2).toUpperCase() : '?'

  if (profile?.avatar_url) {
    return (
      <img
        src={profile.avatar_url}
        style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0 }}
        alt={name}
      />
    )
  }

  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: bg, color: text,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.35, fontWeight: '500', flexShrink: 0,
      userSelect: 'none'
    }}>
      {initials}
    </div>
  )
}

function formatTime(dateStr) {
  const date = new Date(dateStr)
  if (isToday(date)) return format(date, 'HH:mm')
  if (isYesterday(date)) return '昨天 ' + format(date, 'HH:mm')
  return format(date, 'MM/dd HH:mm', { locale: zhTW })
}

export default function MessageItem({ message, isMine, showHeader }) {
  const [hovered, setHovered] = useState(false)
  const profile = message.profiles

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        gap: '10px',
        padding: showHeader ? '10px 16px 2px' : '2px 16px 2px',
        background: hovered ? 'var(--hover)' : 'transparent',
        transition: 'background 0.1s',
      }}
    >
      {/* Avatar column */}
      <div style={{ width: 34, flexShrink: 0, paddingTop: showHeader ? 2 : 0 }}>
        {showHeader ? <Avatar profile={profile} /> : (
          hovered ? (
            <span style={{ fontSize: '10px', color: 'var(--muted)', display: 'block', textAlign: 'right', paddingTop: '4px' }}>
              {format(new Date(message.created_at), 'HH:mm')}
            </span>
          ) : null
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {showHeader && (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '3px' }}>
            <span style={{ fontSize: '14px', fontWeight: '500', color: isMine ? '#2563eb' : 'var(--text)' }}>
              {profile?.username || (isMine ? '我' : `使用者 ${message.user_id?.slice(0, 4)}`)}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
              {formatTime(message.created_at)}
            </span>
          </div>
        )}
        <div style={{
          fontSize: '14px',
          color: 'var(--text)',
          lineHeight: '1.6',
          wordBreak: 'break-word'
        }}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, inline, className, children, ...props }) {
                return inline ? (
                  <code style={{
                    background: 'var(--code-bg)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    padding: '1px 5px',
                    fontSize: '12px',
                    fontFamily: 'DM Mono, monospace',
                  }} {...props}>{children}</code>
                ) : (
                  <pre style={{
                    background: 'var(--code-bg)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    overflow: 'auto',
                    margin: '6px 0'
                  }}>
                    <code style={{ fontSize: '12px', fontFamily: 'DM Mono, monospace', lineHeight: 1.6 }} {...props}>
                      {children}
                    </code>
                  </pre>
                )
              },
              p({ children }) { return <p style={{ margin: '2px 0' }}>{children}</p> },
              a({ children, href }) {
                return <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb' }}>{children}</a>
              }
            }}
          >
            {message.content}
          </ReactMarkdown>

          {message.file_url && (
            <div style={{ marginTop: '8px' }}>
              {message.file_type?.startsWith('image/') ? (
                <a href={message.file_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block' }}>
                  <img
                    src={message.file_url}
                    alt="上傳圖片"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '300px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      cursor: 'zoom-in'
                    }}
                  />
                </a>
              ) : (
                <a
                  href={message.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 14px',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    color: 'var(--text)',
                    fontSize: '13px',
                    width: 'fit-content'
                  }}
                >
                  <span style={{ fontSize: '18px' }}>📄</span>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: '500' }}>點擊下載檔案</span>
                    <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{message.file_type || '未知格式'}</span>
                  </div>
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
