import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../hooks/useApi'
import Spinner from '../components/Spinner'
import { StatCard, Card, PageHeader } from '../components/ui'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

// Build a 7-day transaction trend from raw transactions
function buildTrend(transactions) {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    days.push({ date: key, label: d.toLocaleDateString('en', { weekday: 'short' }), deposits: 0, withdrawals: 0 })
  }
  transactions.forEach(tx => {
    const key = new Date(tx.created_at).toISOString().slice(0, 10)
    const day = days.find(d => d.date === key)
    if (!day) return
    if (tx.type === 'deposit')    day.deposits    += Number(tx.amount) || 0
    if (tx.type === 'withdrawal') day.withdrawals += Number(tx.amount) || 0
  })
  return days
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface-raised border border-surface-border rounded-xl p-3 text-xs shadow-2xl">
      <p className="text-ink-muted mb-2 font-medium">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <strong>${p.value.toFixed(2)}</strong>
        </p>
      ))}
    </div>
  )
}

export default function DashboardHome() {
  const { token } = useAuth()
  const [games, setGames] = useState([])
  const [transactions, setTransactions] = useState([])
  const [users, setUsers] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [gRes, txPending, txDone, txRejected, uRes, sRes] = await Promise.all([
          api(token).get('/api/admin/games/all-games'),
          api(token).get('/api/admin/games/transactions?status=pending'),
          api(token).get('/api/admin/games/transactions?status=done'),
          api(token).get('/api/admin/games/transactions?status=rejected'),
          api(token).get('/api/admin/games/users'),
          api(token).get('/api/admin/games/balance-summary'),
        ])
        setGames(gRes.data.games || [])
        setUsers(uRes.data.users || [])
        setSummary(sRes.data.summary || null)
        const all = [
          ...(txPending.data.transactions  || []),
          ...(txDone.data.transactions     || []),
          ...(txRejected.data.transactions || []),
        ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        setTransactions(all)
      } catch { /* silent — individual failures won't crash */ }
      finally { setLoading(false) }
    }
    load()
  }, [token])

  const activeGames   = games.filter(g => g.status === 'active').length
  const pendingTx     = transactions.filter(t => t.status === 'pending').length
  const trendData     = buildTrend(transactions)

  const kpis = [
    { label: 'Total Users',      value: loading ? '—' : users.length,                          icon: '👥', color: 'text-brand-400',  sub: 'Registered accounts' },
    { label: 'Active Games',     value: loading ? '—' : activeGames,                            icon: '🎮', color: 'text-green-400',  sub: `of ${games.length} total` },
    { label: 'Pending TX',       value: loading ? '—' : pendingTx,                              icon: '⏳', color: 'text-amber-400',  sub: 'Awaiting review' },
    { label: 'Total Deposited',  value: loading ? '—' : `$${Number(summary?.total_deposited || 0).toFixed(0)}`, icon: '💰', color: 'text-emerald-400', sub: 'All time' },
  ]

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <PageHeader title="Dashboard" subtitle="Overview of your Telegram Games system" />

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map(k => (
          <StatCard key={k.label} {...k} />
        ))}
      </div>

      {/* Chart + recent table */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">

        {/* Trend chart — 3/5 width on xl */}
        <Card className="xl:col-span-3">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-ink font-semibold text-sm">Transaction Trend</h2>
              <p className="text-ink-faint text-xs mt-0.5">Last 7 days · deposits vs withdrawals</p>
            </div>
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <Spinner />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={trendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradDeposit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradWithdraw" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f87171" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="deposits"    name="Deposits"    stroke="#6366f1" strokeWidth={2} fill="url(#gradDeposit)" />
                <Area type="monotone" dataKey="withdrawals" name="Withdrawals" stroke="#f87171" strokeWidth={2} fill="url(#gradWithdraw)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Summary stats — 2/5 width on xl */}
        <Card className="xl:col-span-2 flex flex-col gap-4">
          <h2 className="text-ink font-semibold text-sm">Balance Summary</h2>
          {loading ? (
            <div className="flex items-center justify-center flex-1"><Spinner /></div>
          ) : (
            <div className="flex flex-col gap-3">
              {[
                { label: 'Total User Balance', value: `$${Number(summary?.total_balance   || 0).toFixed(2)}`, color: 'text-ink' },
                { label: 'Total Deposited',    value: `$${Number(summary?.total_deposited || 0).toFixed(2)}`, color: 'text-green-400' },
                { label: 'Total Withdrawn',    value: `$${Number(summary?.total_withdrawn || 0).toFixed(2)}`, color: 'text-red-400' },
                { label: 'Pending Amount',     value: `$${Number(summary?.pending_amount  || 0).toFixed(2)}`, color: 'text-amber-400' },
                { label: 'Approved TX',        value: summary?.done_count || 0,                               color: 'text-green-400' },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between py-2 border-b border-surface-border last:border-0">
                  <span className="text-ink-faint text-xs">{row.label}</span>
                  <span className={`font-semibold text-sm ${row.color}`}>{row.value}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Recent games table */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-ink font-semibold text-sm">Recent Games</h2>
          <span className="text-ink-faint text-xs">{games.length} total</span>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-10"><Spinner /></div>
        ) : games.length === 0 ? (
          <div className="text-center py-10">
            <div className="text-4xl mb-2">🎮</div>
            <p className="text-ink-faint text-sm">No games yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border">
                  {['Name', 'Description', 'Status', 'Players'].map(h => (
                    <th key={h} className="text-left py-2 px-3 text-ink-faint font-medium text-xs uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {games.slice(0, 8).map(g => (
                  <tr key={g.id} className="tr">
                    <td className="py-3 px-3 text-ink font-medium">{g.name}</td>
                    <td className="py-3 px-3 text-ink-muted max-w-xs truncate">{g.description || '—'}</td>
                    <td className="py-3 px-3">
                      <span className={g.status === 'active' ? 'badge-active' : 'badge-inactive'}>
                        {g.status || 'active'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-ink-muted">{g.min_players}–{g.max_players}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* System info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <h3 className="text-ink font-semibold text-sm mb-3">API Quick Reference</h3>
          <div className="flex flex-col gap-2 text-xs font-mono">
            {[
              ['GET',    '/api/health',              'Health check'],
              ['POST',   '/api/admin/games/login',   'Admin login'],
              ['GET',    '/api/games',               'List games'],
              ['POST',   '/api/admin/games/add',     'Add game'],
              ['DELETE', '/api/admin/games/:id',     'Delete game'],
              ['GET',    '/api/users/:id',           'Get user'],
            ].map(([method, path, desc]) => (
              <div key={path} className="flex items-center gap-2">
                <span className={`px-1.5 py-0.5 rounded text-xs font-bold
                  ${method === 'GET'    ? 'bg-green-500/20 text-green-400' : ''}
                  ${method === 'POST'   ? 'bg-blue-500/20 text-blue-400' : ''}
                  ${method === 'DELETE' ? 'bg-red-500/20 text-red-400' : ''}
                `}>{method}</span>
                <span className="text-ink-muted">{path}</span>
                <span className="text-ink-faint ml-auto">{desc}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h3 className="text-ink font-semibold text-sm mb-3">System Info</h3>
          <div className="flex flex-col gap-3">
            {[
              ['Backend URL', import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'],
              ['Admin Panel', window.location.origin],
              ['Auth',        'JWT · 30 min session'],
              ['Database',    'SQLite'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between items-center border-b border-surface-border last:border-0 pb-2 last:pb-0">
                <span className="text-ink-faint text-xs">{k}</span>
                <span className="text-ink-muted text-xs font-mono truncate max-w-[200px]">{v}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
