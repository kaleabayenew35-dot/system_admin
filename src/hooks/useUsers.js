import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { api } from './useApi'

export function useUsers() {
  const { token } = useAuth()
  const toast = useToast()
  const [users, setUsers] = useState([])
  const [adminBalance, setAdminBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [usersRes, balRes] = await Promise.all([
        api(token).get('/api/admin/games/users'),
        api(token).get('/api/admin/games/admin-balance'),
      ])
      setUsers(usersRes.data.users || [])
      setAdminBalance(balRes.data.balance || 0)
    } catch (err) {
      setError(err)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { fetch() }, [fetch])

  const updateUsername = useCallback(async (id, username) => {
    await api(token).put(`/api/admin/games/users/${id}/username`, { username })
    toast.success('Username updated')
    fetch()
  }, [token, fetch])

  const resetPassword = useCallback(async (id, password) => {
    await api(token).put(`/api/admin/games/users/${id}/reset-password`, { password })
    toast.success('Password reset')
  }, [token])

  const deposit = useCallback(async (id, amount) => {
    await api(token).post(`/api/admin/games/users/${id}/deposit`, { amount })
    toast.success(`$${amount} deposited`)
    fetch()
  }, [token, fetch])

  const withdraw = useCallback(async (id, amount) => {
    await api(token).post(`/api/admin/games/users/${id}/withdraw`, { amount })
    toast.success(`$${amount} withdrawn`)
    fetch()
  }, [token, fetch])

  const deleteUser = useCallback(async (id) => {
    await api(token).delete(`/api/admin/games/users/${id}`)
    toast.success('User deleted')
    fetch()
  }, [token, fetch])

  return { users, adminBalance, loading, error, refetch: fetch, updateUsername, resetPassword, deposit, withdraw, deleteUser }
}
