import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { api } from './useApi'

export function useCashier() {
  const { token } = useAuth()
  const toast = useToast()
  const [cashiers, setCashiers] = useState([])
  const [adminBalance, setAdminBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [cashRes, balRes] = await Promise.all([
        api(token).get('/api/admin/games/cashiers'),
        api(token).get('/api/admin/games/admin-balance'),
      ])
      setCashiers(cashRes.data.cashiers || [])
      setAdminBalance(balRes.data.balance || 0)
    } catch (err) {
      setError(err)
      toast.error('Failed to load cashiers')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { fetch() }, [fetch])

  const addCashier = useCallback(async (payload) => {
    await api(token).post('/api/admin/games/cashiers', payload)
    toast.success('Cashier added')
    fetch()
  }, [token, fetch])

  const updateCashier = useCallback(async (id, payload) => {
    await api(token).put(`/api/admin/games/cashiers/${id}`, payload)
    toast.success('Cashier updated')
    fetch()
  }, [token, fetch])

  const deleteCashier = useCallback(async (id) => {
    await api(token).delete(`/api/admin/games/cashiers/${id}`)
    toast.success('Cashier deleted')
    fetch()
  }, [token, fetch])

  const deposit = useCallback(async (id, amount) => {
    await api(token).post(`/api/admin/games/cashiers/${id}/deposit`, { amount })
    toast.success(`Deposited $${amount}`)
    fetch()
  }, [token, fetch])

  const withdraw = useCallback(async (id, amount) => {
    await api(token).post(`/api/admin/games/cashiers/${id}/withdraw`, { amount })
    toast.success(`Withdrawn $${amount}`)
    fetch()
  }, [token, fetch])

  return { cashiers, adminBalance, loading, error, refetch: fetch, addCashier, updateCashier, deleteCashier, deposit, withdraw }
}
