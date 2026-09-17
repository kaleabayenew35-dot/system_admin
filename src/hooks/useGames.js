import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { api } from './useApi'

export function useGames() {
  const { token } = useAuth()
  const toast = useToast()
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api(token).get('/api/admin/games/all-games')
      setGames(res.data.games || [])
    } catch (err) {
      setError(err)
      toast.error('Failed to load games')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { fetch() }, [fetch])

  const addGame = useCallback(async (payload) => {
    await api(token).post('/api/admin/games', payload)
    toast.success('Game added')
    fetch()
  }, [token, fetch])

  const updateGame = useCallback(async (id, payload) => {
    await api(token).put(`/api/admin/games/${id}`, payload)
    toast.success('Game updated')
    fetch()
  }, [token, fetch])

  const deleteGame = useCallback(async (id) => {
    await api(token).delete(`/api/admin/games/${id}`)
    toast.success('Game deleted')
    fetch()
  }, [token, fetch])

  const toggleStatus = useCallback(async (game) => {
    const newStatus = game.status === 'active' ? 'inactive' : 'active'
    await api(token).put(`/api/admin/games/${game.id}`, {
      name: game.name,
      game_url: game.game_url,
      mini_app_url: game.mini_app_url,
      status: newStatus,
    })
    toast.success(`Game ${newStatus === 'active' ? 'activated' : 'deactivated'}`)
    fetch()
  }, [token, fetch])

  return { games, loading, error, refetch: fetch, addGame, updateGame, deleteGame, toggleStatus }
}
