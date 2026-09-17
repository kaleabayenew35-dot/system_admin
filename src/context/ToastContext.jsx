import React, { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

// Static style maps — avoids Tailwind purging dynamic class strings
const TOAST_STYLES = {
  success: {
    background: 'rgba(20, 83, 45, 0.95)',
    border: '1px solid rgba(34, 197, 94, 0.4)',
    color: '#bbf7d0',
  },
  error: {
    background: 'rgba(127, 29, 29, 0.95)',
    border: '1px solid rgba(239, 68, 68, 0.4)',
    color: '#fecaca',
  },
  warning: {
    background: 'rgba(120, 53, 15, 0.95)',
    border: '1px solid rgba(245, 158, 11, 0.4)',
    color: '#fde68a',
  },
  info: {
    background: 'rgba(30, 27, 75, 0.95)',
    border: '1px solid rgba(99, 102, 241, 0.4)',
    color: '#c7d2fe',
  },
}

const TOAST_ICONS = {
  success: '✓',
  error:   '✕',
  warning: '⚠',
  info:    'ℹ',
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4500)
  }, [])

  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id))

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error:   (msg) => addToast(msg, 'error'),
    info:    (msg) => addToast(msg, 'info'),
    warning: (msg) => addToast(msg, 'warning'),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Toast container */}
      <div
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          maxWidth: '24rem',
          pointerEvents: 'none',
        }}
      >
        {toasts.map(t => (
          <div
            key={t.id}
            onClick={() => removeToast(t.id)}
            role="alert"
            style={{
              ...TOAST_STYLES[t.type] || TOAST_STYLES.info,
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: '0.875rem',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
              pointerEvents: 'auto',
              animation: 'toastSlideIn 0.2s ease-out',
              backdropFilter: 'blur(8px)',
            }}
          >
            {/* Icon */}
            <span style={{ fontSize: '0.9rem', flexShrink: 0, marginTop: '0.05rem' }}>
              {TOAST_ICONS[t.type]}
            </span>
            {/* Message */}
            <span style={{ flex: 1, lineHeight: 1.4 }}>{t.message}</span>
            {/* Close × */}
            <span style={{ flexShrink: 0, opacity: 0.6, fontSize: '1rem', lineHeight: 1, marginTop: '-0.05rem' }}>×</span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes toastSlideIn {
          from { opacity: 0; transform: translateX(1rem); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
