import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { api } from './useApi'

export function useTransactions() {
  const { token } = useAuth()
  const toast = useToast()
  const [transactions, setTransactions] = useState([])
  const [cashierTransactions, setCashierTransactions] = useState([])
  const [adminBalance, setAdminBalance] = useState(0)
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [p, d, r, s, c, b] = await Promise.all([
        api(token).get('/api/admin/games/transactions?status=pending'),
        api(token).get('/api/admin/games/transactions?status=done'),
        api(token).get('/api/admin/games/transactions?status=rejected'),
        api(token).get('/api/admin/games/balance-summary'),
        api(token).get('/api/admin/games/cashier-transactions'),
        api(token).get('/api/admin/games/admin-balance'),
      ])
      const all = [
        ...(p.data.transactions || []),
        ...(d.data.transactions || []),
        ...(r.data.transactions || []),
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      setTransactions(all)
      setSummary(s.data.summary || null)
      setCashierTransactions(c.data.transactions || [])
      setAdminBalance(b.data.balance || 0)
    } catch (err) {
      setError(err)
      toast.error('Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { fetch() }, [fetch])

  const approve = useCallback(async (id) => {
    await api(token).put(`/api/admin/games/transactions/${id}/status`, { status: 'done' })
    toast.success('Transaction approved')
    fetch()
  }, [token, fetch])

  const reject = useCallback(async (id, rejection_reason) => {
    await api(token).put(`/api/admin/games/transactions/${id}/status`, { status: 'rejected', rejection_reason })
    toast.success('Transaction rejected')
    fetch()
  }, [token, fetch])

  return { transactions, cashierTransactions, adminBalance, summary, loading, error, refetch: fetch, approve, reject }
}
