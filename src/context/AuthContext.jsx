import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'

const AuthContext = createContext(null)
const SESSION_TIMEOUT_MS = 30 * 60 * 1000 // 30 minutes
const SESSION_EXPIRY_KEY = 'admin_session_expiry'
const SESSION_LAST_ACTIVE_KEY = 'admin_session_last_active'

const getStoredExpiry = () => {
  const expiry = parseInt(localStorage.getItem(SESSION_EXPIRY_KEY), 10)
  return Number.isFinite(expiry) ? expiry : null
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('admin_token'))
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('admin_user')) } catch { return null }
  })
  const [sessionExpiresAt, setSessionExpiresAt] = useState(() => getStoredExpiry())
  const timeoutRef = useRef(null)
  const lastActivityRef = useRef(Date.now())

  const clearTimeoutRef = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }

  const logout = useCallback(() => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    localStorage.removeItem(SESSION_EXPIRY_KEY)
    localStorage.removeItem(SESSION_LAST_ACTIVE_KEY)
    setToken(null)
    setUser(null)
    setSessionExpiresAt(null)
    clearTimeoutRef()
  }, [])

  const updateSessionExpiry = useCallback((expiry) => {
    localStorage.setItem(SESSION_EXPIRY_KEY, String(expiry))
    localStorage.setItem(SESSION_LAST_ACTIVE_KEY, String(Date.now()))
    setSessionExpiresAt(expiry)
  }, [])

  const refreshSession = useCallback(() => {
    if (!token) return
    const now = Date.now()
    if (now - lastActivityRef.current < 60 * 1000) return
    lastActivityRef.current = now
    updateSessionExpiry(now + SESSION_TIMEOUT_MS)
  }, [token, updateSessionExpiry])

  const login = useCallback((tkn, userData) => {
    const expiry = Date.now() + SESSION_TIMEOUT_MS
    localStorage.setItem('admin_token', tkn)
    localStorage.setItem('admin_user', JSON.stringify(userData))
    updateSessionExpiry(expiry)
    setToken(tkn)
    setUser(userData)
  }, [updateSessionExpiry])

  useEffect(() => {
    if (!token) {
      clearTimeoutRef()
      return
    }

    if (!sessionExpiresAt || Date.now() > sessionExpiresAt) {
      logout()
      return
    }

    clearTimeoutRef()
    timeoutRef.current = setTimeout(() => {
      logout()
    }, Math.max(sessionExpiresAt - Date.now(), 0))

    return () => clearTimeoutRef()
  }, [token, sessionExpiresAt, logout])

  useEffect(() => {
    if (!token) return

    const activityHandler = () => refreshSession()
    const events = ['click', 'keydown', 'mousemove', 'touchstart']

    events.forEach((event) => window.addEventListener(event, activityHandler))
    return () => events.forEach((event) => window.removeEventListener(event, activityHandler))
  }, [token, refreshSession])

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        login,
        logout,
        isAuthenticated: !!token,
        sessionExpiresAt,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
