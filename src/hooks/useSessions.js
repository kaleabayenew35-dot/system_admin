import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from './useApi'

export function useSessions() {
  const { token } = useAuth()
  const [health, setHealth] = useState(null)
  const [games, setGames] = useState([])
  const [healthLoading, setHealthLoading] = useState(true)
  const [gamesLoading, setGamesLoading] = useState(true)

  const fetchHealth = useCallback(async () => {
    setHealthLoading(true)
    try {
      const r = await api(token).get('/api/health')
      setHealth(r.data)
    } catch {
      setHealth({ status: 'Unavailable' })
    } finally {
      setHealthLoading(false)
    }
  }, [token])

  const fetchGames = useCallback(async () => {
    setGamesLoading(true)
    try {
      const r = await api(token).get('/api/games')
      setGames(r.data.games || [])
    } catch {
      setGames([])
    } finally {
      setGamesLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchHealth()
    fetchGames()
  }, [fetchHealth, fetchGames])

  return { health, healthLoading, games, gamesLoading, refetchHealth: fetchHealth }
}
