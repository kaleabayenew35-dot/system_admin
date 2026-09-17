import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { api } from '../hooks/useApi'
import Spinner from '../components/Spinner'

export default function Login() {
  const [username, setUsername]   = useState('')
  const [password, setPassword]   = useState('')
  const [loading, setLoading]     = useState(false)
  const [showPass, setShowPass]   = useState(false)
  // Inline message — shown directly in the card so feedback is always visible
  const [message, setMessage]     = useState(null) // { type: 'error'|'success', text: string }

  const { login } = useAuth()
  const toast     = useToast()
  const navigate  = useNavigate()

  const setError   = (text) => setMessage({ type: 'error',   text })
  const setSuccess = (text) => setMessage({ type: 'success', text })
  const clearMsg   = ()     => setMessage(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearMsg()

    if (!username.trim()) { setError('Username is required'); return }
    if (!password.trim()) { setError('Password is required'); return }

    setLoading(true)
    try {
      const res = await api().post('/api/admin/games/login', { username, password })

      // Temporary debug — remove once confirmed working
      console.log('[Login] status:', res.status, '| data:', res.data)

      if (res.data?.token) {
        setSuccess('Login successful! Redirecting…')
        login(res.data.token, res.data.user)
        // also fire toast for the dashboard
        toast.success('Welcome back, ' + (res.data.user?.username || 'Admin'))
        setTimeout(() => navigate('/dashboard'), 400)
      } else {
        // API returned 200 but no token — shouldn't happen, but handle it
        setError('Unexpected response from server. Please try again.')
      }
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        (err.response?.status === 401 ? 'Invalid username or password.' : null) ||
        (err.response?.status === 403 ? 'Access denied.' : null) ||
        (err.response?.status >= 500 ? 'Server error. Please try again later.' : null) ||
        (err.message === 'Network Error' ? 'Cannot reach the server. Check your connection.' : null) ||
        'Login failed. Check your credentials.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)' }} />
      </div>

      <div className="w-full max-w-sm relative" style={{ animation: 'fadeUp .25s ease both' }}>
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl text-3xl mb-4"
            style={{ background: '#4f46e5', boxShadow: '0 0 24px -4px rgba(99,102,241,.5)' }}>
            🎯
          </div>
          <h1 className="text-white text-2xl font-bold">TG Games Admin</h1>
          <p className="text-slate-400 text-sm mt-1">Sign in to your admin panel</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8 shadow-2xl" style={{ background: '#1e293b', border: '1px solid #334155' }}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>

            {/* ── Inline message area ──────────────────────────────── */}
            {message && (
              <div
                role="alert"
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '0.75rem',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.625rem',
                  ...(message.type === 'error'
                    ? { background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)', color: '#fca5a5' }
                    : { background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.35)', color: '#86efac' }
                  ),
                }}
              >
                <span style={{ flexShrink: 0, fontSize: '1rem' }}>
                  {message.type === 'error' ? '⚠' : '✓'}
                </span>
                <span>{message.text}</span>
              </div>
            )}

            {/* Username */}
            <div>
              <label
                htmlFor="login-username"
                className="block text-xs font-medium mb-1.5 uppercase tracking-wide"
                style={{ color: '#94a3b8' }}
              >
                Username
              </label>
              <input
                id="login-username"
                type="text"
                placeholder="admin"
                value={username}
                onChange={e => { clearMsg(); setUsername(e.target.value) }}
                autoComplete="username"
                disabled={loading}
                style={{
                  width: '100%', background: '#0f172a', border: '1px solid #334155',
                  color: '#f1f5f9', borderRadius: '0.75rem', padding: '0.625rem 1rem',
                  fontSize: '0.875rem', outline: 'none',
                  opacity: loading ? 0.6 : 1,
                }}
                onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 1px #6366f1' }}
                onBlur={e  => { e.target.style.borderColor = '#334155'; e.target.style.boxShadow = 'none' }}
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="login-password"
                className="block text-xs font-medium mb-1.5 uppercase tracking-wide"
                style={{ color: '#94a3b8' }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => { clearMsg(); setPassword(e.target.value) }}
                  autoComplete="current-password"
                  disabled={loading}
                  style={{
                    width: '100%', background: '#0f172a', border: '1px solid #334155',
                    color: '#f1f5f9', borderRadius: '0.75rem', padding: '0.625rem 2.5rem 0.625rem 1rem',
                    fontSize: '0.875rem', outline: 'none',
                    opacity: loading ? 0.6 : 1,
                  }}
                  onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 1px #6366f1' }}
                  onBlur={e  => { e.target.style.borderColor = '#334155'; e.target.style.boxShadow = 'none' }}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPass(p => !p)}
                  style={{
                    position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                    color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem',
                  }}
                >
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '0.5rem',
                width: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                padding: '0.75rem 1rem',
                background: loading ? '#4338ca' : '#4f46e5',
                color: 'white',
                borderRadius: '0.75rem',
                fontWeight: 600,
                fontSize: '0.9375rem',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { if (!loading) e.target.style.background = '#6366f1' }}
              onMouseLeave={e => { if (!loading) e.target.style.background = '#4f46e5' }}
            >
              {loading ? <><Spinner size="sm" /> Signing in…</> : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: '#475569' }}>
          Telegram Games System · Admin Panel
        </p>
      </div>

      {/* Keyframe for the card entrance */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
