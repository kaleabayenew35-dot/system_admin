import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useSessions } from '../hooks/useSessions'
import Spinner from '../components/Spinner'
import { Card, PageHeader, Button, Badge } from '../components/ui'

const formatDuration = (ms) => {
  const total = Math.max(Math.ceil(ms / 1000), 0)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function SessionsPage() {
  const { sessionExpiresAt } = useAuth()
  const { health, healthLoading, games, gamesLoading, refetchHealth } = useSessions()
  const [timeLeft, setTimeLeft] = useState(() => sessionExpiresAt ? Math.max(sessionExpiresAt - Date.now(), 0) : 0)

  useEffect(() => {
    setTimeLeft(sessionExpiresAt ? Math.max(sessionExpiresAt - Date.now(), 0) : 0)
    if (!sessionExpiresAt) return
    const id = setInterval(() => setTimeLeft(Math.max(sessionExpiresAt - Date.now(), 0)), 1000)
    return () => clearInterval(id)
  }, [sessionExpiresAt])

  const isHealthy = health?.status?.includes('running') || health?.status?.toLowerCase().includes('ok')

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <PageHeader title="Sessions & Status" subtitle="System health and game session overview" />

      {/* Two-column layout on md+ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Backend health */}
        <Card>
          <h2 className="text-ink font-semibold mb-4 text-sm flex items-center gap-2">🩺 Backend Health</h2>
          {healthLoading ? (
            <div className="flex items-center gap-2 text-ink-muted text-sm"><Spinner size="sm" /> Checking...</div>
          ) : (
            <div className={`flex items-center gap-4 p-4 rounded-xl border
              ${isHealthy ? 'bg-green-500/10 border-green-500/25' : 'bg-red-500/10 border-red-500/25'}`}>
              <span className={`w-3 h-3 rounded-full flex-shrink-0 animate-pulse ${isHealthy ? 'bg-green-400' : 'bg-red-400'}`} />
              <div>
                <p className={`font-medium text-sm ${isHealthy ? 'text-green-400' : 'text-red-400'}`}>{health?.status || 'Unknown'}</p>
                {health?.timestamp && <p className="text-ink-faint text-xs mt-0.5">Checked: {new Date(health.timestamp).toLocaleTimeString()}</p>}
              </div>
              <Button variant="ghost" size="sm" className="ml-auto" onClick={refetchHealth}>↻</Button>
            </div>
          )}
          <div className="mt-4 text-xs font-mono text-ink-faint break-all">
            {import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}
          </div>
        </Card>

        {/* Admin session timer */}
        <Card>
          <h2 className="text-ink font-semibold mb-4 text-sm flex items-center gap-2">⏱ Admin Session</h2>
          <div className="flex items-center gap-3">
            <div className={`text-4xl font-mono font-bold ${timeLeft < 5 * 60 * 1000 ? 'text-red-400' : 'text-brand-300'}`}>
              {formatDuration(timeLeft)}
            </div>
            <div>
              <p className="text-ink-muted text-sm">remaining</p>
              <p className="text-ink-faint text-xs mt-0.5">Session auto-renews on activity</p>
            </div>
          </div>
          {timeLeft < 5 * 60 * 1000 && timeLeft > 0 && (
            <div className="mt-3 p-2 bg-amber-500/10 border border-amber-500/25 rounded-xl text-xs text-amber-400">
              ⚠ Session expiring soon — move the mouse or interact to extend.
            </div>
          )}
        </Card>
      </div>

      {/* Game sessions overview */}
      <Card>
        <h2 className="text-ink font-semibold mb-4 text-sm flex items-center gap-2">🎮 Game Sessions Overview</h2>
        {gamesLoading ? (
          <div className="flex items-center justify-center py-8"><Spinner /></div>
        ) : games.length === 0 ? (
          <div className="text-center py-8 text-ink-faint">No games in the system yet</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {games.map(game => (
              <div key={game.id} className="bg-surface-overlay/30 border border-surface-border rounded-xl p-4 flex flex-col gap-2">
                <div className="flex items-start justify-between">
                  <div className="w-8 h-8 bg-brand-600/25 rounded-lg flex items-center justify-center">🎮</div>
                  <Badge color={game.status === 'active' ? 'green' : 'red'}>{game.status || 'active'}</Badge>
                </div>
                <div>
                  <p className="text-ink font-medium text-sm">{game.name}</p>
                  <p className="text-ink-faint text-xs mt-0.5 line-clamp-2">{game.description || 'No description'}</p>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-ink-faint text-xs">Players: {game.min_players}–{game.max_players}</span>
                  {game.mini_app_url && (
                    <a href={game.mini_app_url} target="_blank" rel="noreferrer" className="text-brand-400 text-xs hover:text-brand-300">Mini App ↗</a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Leaderboard placeholder */}
      <Card>
        <h2 className="text-ink font-semibold mb-4 text-sm flex items-center gap-2">🏆 Leaderboard</h2>
        <div className="text-center py-10">
          <div className="text-4xl mb-3">🏆</div>
          <p className="text-ink-muted">Leaderboard data will appear here</p>
          <p className="text-ink-faint text-xs mt-1">Score endpoints are ready at /api/scores/leaderboard</p>
        </div>
      </Card>

      {/* API reference */}
      <Card>
        <h2 className="text-ink font-semibold mb-4 text-sm flex items-center gap-2">📡 Session API Reference</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
          {[
            ['POST', '/api/games/:id/start',      'Start a game session'],
            ['POST', '/api/games/session/:id/end', 'End a game session'],
            ['GET',  '/api/scores/leaderboard',   'Global leaderboard'],
            ['GET',  '/api/scores/:user_id',       "User's scores"],
          ].map(([m, path, desc]) => (
            <div key={path} className="flex items-center gap-3 bg-surface-overlay/30 rounded-lg px-3 py-2">
              <span className={`px-1.5 py-0.5 rounded font-bold text-xs flex-shrink-0 ${m === 'GET' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>{m}</span>
              <span className="text-ink-muted truncate">{path}</span>
              <span className="text-ink-faint ml-auto flex-shrink-0 hidden md:block">{desc}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
