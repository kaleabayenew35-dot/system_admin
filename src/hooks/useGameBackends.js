import { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import { GAME_BACKENDS } from '../config/gameBackends'

const withTimeout = async (url, path, timeoutMs = 5000) => {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await axios.get(`${url}${path || ''}`, {
      signal: controller.signal,
      timeout: timeoutMs,
      validateStatus: () => true
    })

    return {
      ok: res.status >= 200 && res.status < 400,
      status: res.status,
      data: res.data
    }
  } catch (error) {
    return {
      ok: false,
      status: error?.response?.status || 503,
      error: error?.message || 'Request failed'
    }
  } finally {
    clearTimeout(timer)
  }
}

export function useGameBackends() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)

    const results = await Promise.all(
      GAME_BACKENDS.map(async (backend) => {
        const health = await withTimeout(backend.url, backend.healthPath)

        return {
          ...backend,
          status: health.ok ? 'online' : 'offline',
          lastStatusCode: health.status,
          response: health.data,
          message: health.ok ? 'Connected' : health.error || 'Unavailable',
          checkedAt: new Date().toISOString()
        }
      })
    )

    setItems(results)
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { items, loading, refresh }
}
