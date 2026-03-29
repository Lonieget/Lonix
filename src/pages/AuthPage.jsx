import { useState } from 'react'

export default function AuthPage({ onSignIn, onSignUp }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (mode === 'login') {
      const { error } = await onSignIn(email, password)
      if (error) setError(error.message)
    } else {
      if (!username.trim()) { setError('請輸入使用者名稱'); setLoading(false); return }
      const { error } = await onSignUp(email, password, username)
      if (error) setError(error.message)
      else setSuccess('註冊成功！請檢查信箱確認帳號後登入。')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '380px',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '36px 32px',
      }}>
        <div style={{ marginBottom: '28px' }}>
          <div style={{
            width: '40px', height: '40px',
            background: 'var(--accent)',
            borderRadius: '10px',
            marginBottom: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px'
          }}>💬</div>
          <h1 style={{ fontSize: '20px', fontWeight: '500', color: 'var(--text)', margin: 0 }}>
            {mode === 'login' ? '歡迎回來' : '建立帳號'}
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--muted)', margin: '4px 0 0' }}>
            {mode === 'login' ? '登入繼續使用聊天室' : '開始使用聊天室'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--muted)', marginBottom: '6px' }}>
                使用者名稱
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="your_username"
                required
                style={inputStyle}
              />
            </div>
          )}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--muted)', marginBottom: '6px' }}>
              電子郵件
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={inputStyle}
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--muted)', marginBottom: '6px' }}>
              密碼
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              style={inputStyle}
            />
          </div>

          {error && (
            <div style={{
              background: '#fee2e2', border: '1px solid #fca5a5',
              borderRadius: '8px', padding: '10px 12px',
              fontSize: '13px', color: '#dc2626', marginBottom: '14px'
            }}>{error}</div>
          )}

          {success && (
            <div style={{
              background: '#dcfce7', border: '1px solid #86efac',
              borderRadius: '8px', padding: '10px 12px',
              fontSize: '13px', color: '#16a34a', marginBottom: '14px'
            }}>{success}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '10px',
              background: loading ? 'var(--border)' : 'var(--text)',
              color: 'var(--bg)',
              border: 'none', borderRadius: '8px',
              fontSize: '14px', fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              transition: 'opacity 0.15s'
            }}
          >
            {loading ? '處理中...' : mode === 'login' ? '登入' : '註冊'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: 'var(--muted)' }}>
          {mode === 'login' ? '還沒有帳號？' : '已有帳號？'}
          <button
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setSuccess('') }}
            style={{
              background: 'none', border: 'none',
              color: 'var(--text)', cursor: 'pointer',
              fontFamily: 'inherit', fontSize: '13px',
              fontWeight: '500', marginLeft: '4px', padding: 0
            }}
          >
            {mode === 'login' ? '立即註冊' : '登入'}
          </button>
        </div>
      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%',
  padding: '9px 12px',
  background: 'var(--bg)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  fontSize: '14px',
  color: 'var(--text)',
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
}
