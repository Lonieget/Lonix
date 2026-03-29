import { useState, useRef } from 'react'

const EMOJIS = ['😊','👍','🎉','❤️','🙌','🔥','💡','✅','😂','🤔','👀','🚀','📌','💬','🛠️','📅','😅','🥳','👏','💪','🎯','✨','🙏','😎']

export default function MessageInput({ onSend, channelName, disabled }) {
  const [text, setText] = useState('')
  const [showEmoji, setShowEmoji] = useState(false)
  const textareaRef = useRef(null)

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleSend() {
    if (!text.trim() || disabled) return
    onSend(text)
    setText('')
    setShowEmoji(false)
    textareaRef.current?.focus()
  }

  function insertEmoji(emoji) {
    const el = textareaRef.current
    const start = el.selectionStart
    const newText = text.slice(0, start) + emoji + text.slice(start)
    setText(newText)
    setShowEmoji(false)
    el.focus()
    setTimeout(() => el.setSelectionRange(start + emoji.length, start + emoji.length), 0)
  }

  function wrapSelection(before, after) {
    const el = textareaRef.current
    const start = el.selectionStart
    const end = el.selectionEnd
    const selected = text.slice(start, end) || '文字'
    const newText = text.slice(0, start) + before + selected + after + text.slice(end)
    setText(newText)
    el.focus()
  }

  function autoResize(e) {
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px'
  }

  return (
    <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', position: 'relative' }}>
      {/* Emoji picker */}
      {showEmoji && (
        <div style={{
          position: 'absolute', bottom: '100%', left: '16px',
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: '12px', padding: '10px',
          display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '2px',
          zIndex: 10, boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
          marginBottom: '4px'
        }}>
          {EMOJIS.map(e => (
            <button
              key={e}
              onClick={() => insertEmoji(e)}
              style={{
                width: 32, height: 32, border: 'none', background: 'transparent',
                cursor: 'pointer', borderRadius: '6px', fontSize: 16,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.1s'
              }}
              onMouseEnter={ev => ev.target.style.background = 'var(--hover)'}
              onMouseLeave={ev => ev.target.style.background = 'transparent'}
            >
              {e}
            </button>
          ))}
        </div>
      )}

      <div style={{
        border: '1px solid var(--border)',
        borderRadius: '12px',
        background: 'var(--surface)',
        overflow: 'hidden',
        transition: 'border-color 0.15s',
      }}
        onFocus={() => {}}
      >
        {/* Toolbar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '2px',
          padding: '6px 8px',
          borderBottom: '1px solid var(--border)'
        }}>
          {[
            { label: 'B', title: '粗體', action: () => wrapSelection('**', '**'), bold: true },
            { label: 'i', title: '斜體', action: () => wrapSelection('*', '*'), italic: true },
            { label: '`', title: '行內程式碼', action: () => wrapSelection('`', '`') },
          ].map(btn => (
            <button
              key={btn.label}
              title={btn.title}
              onClick={btn.action}
              style={{
                width: 26, height: 26, border: 'none',
                background: 'transparent', borderRadius: '4px',
                cursor: 'pointer', fontSize: btn.bold ? 13 : 13,
                fontWeight: btn.bold ? '700' : btn.italic ? '400' : '500',
                fontStyle: btn.italic ? 'italic' : 'normal',
                fontFamily: btn.label === '`' ? 'DM Mono, monospace' : 'inherit',
                color: 'var(--muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.1s, color 0.1s'
              }}
              onMouseEnter={e => { e.target.style.background = 'var(--hover)'; e.target.style.color = 'var(--text)' }}
              onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--muted)' }}
            >
              {btn.label}
            </button>
          ))}
          <div style={{ width: 1, height: 14, background: 'var(--border)', margin: '0 2px' }} />
          <button
            title="程式碼區塊"
            onClick={() => wrapSelection('\n```\n', '\n```\n')}
            style={{
              width: 26, height: 26, border: 'none', background: 'transparent',
              borderRadius: '4px', cursor: 'pointer', fontSize: 10,
              fontFamily: 'DM Mono, monospace', color: 'var(--muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
            onMouseEnter={e => { e.target.style.background = 'var(--hover)'; e.target.style.color = 'var(--text)' }}
            onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--muted)' }}
          >{'{ }'}</button>
          <div style={{ width: 1, height: 14, background: 'var(--border)', margin: '0 2px' }} />
          <button
            title="表情符號"
            onClick={() => setShowEmoji(s => !s)}
            style={{
              width: 26, height: 26, border: 'none',
              background: showEmoji ? 'var(--hover)' : 'transparent',
              borderRadius: '4px', cursor: 'pointer', fontSize: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >😊</button>
        </div>

        {/* Input row */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', padding: '8px 10px' }}>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={e => { setText(e.target.value); autoResize(e) }}
            onKeyDown={handleKeyDown}
            placeholder={`傳送訊息至 #${channelName}`}
            disabled={disabled}
            rows={1}
            style={{
              flex: 1, border: 'none', background: 'transparent',
              fontSize: '14px', color: 'var(--text)',
              resize: 'none', outline: 'none',
              fontFamily: 'DM Sans, sans-serif',
              lineHeight: '1.5', maxHeight: '160px',
              padding: 0,
            }}
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() || disabled}
            style={{
              width: 30, height: 30, border: 'none',
              background: text.trim() && !disabled ? 'var(--text)' : 'var(--border)',
              borderRadius: '8px', cursor: text.trim() ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, transition: 'background 0.15s'
            }}
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill={text.trim() ? 'var(--bg)' : 'var(--muted)'}>
              <path d="M1 1l14 7-14 7V9.5l10-1.5-10-1.5V1z"/>
            </svg>
          </button>
        </div>
      </div>
      <p style={{ fontSize: '11px', color: 'var(--muted)', margin: '6px 0 0', paddingLeft: '2px' }}>
        Enter 送出 · Shift+Enter 換行 · 支援 Markdown 格式
      </p>
    </div>
  )
}
