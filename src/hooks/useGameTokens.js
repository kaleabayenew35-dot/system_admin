import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { api } from './useApi'

export function useGameTokens() {
  const { token } = useAuth()
  const toast = useToast()
  const [tokens, setTokens] = useState([])
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [tokRes, gameRes] = await Promise.all([
        api(token).get('/api/admin/games/game-tokens'),
        api(token).get('/api/admin/games/all-games'),
      ])
      setTokens(tokRes.data.tokens || [])
      setGames(gameRes.data.games || [])
    } catch (err) {
      setError(err)
      toast.error('Failed to load game tokens')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { fetch() }, [fetch])

  const generateToken = useCallback(async (payload) => {
    await api(token).post('/api/admin/games/game-tokens', payload)
    toast.success('Token generated')
    fetch()
  }, [token, fetch])

  const updateToken = useCallback(async (id, payload) => {
    await api(token).put(`/api/admin/games/game-tokens/${id}`, payload)
    toast.success('Token updated')
    fetch()
  }, [token, fetch])

  const deleteToken = useCallback(async (id) => {
    await api(token).delete(`/api/admin/games/game-tokens/${id}`)
    toast.success('Token deleted')
    fetch()
  }, [token, fetch])

  return { tokens, games, loading, error, refetch: fetch, generateToken, updateToken, deleteToken }
}
