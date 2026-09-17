import React, { useState, useEffect, useCallback } from 'react'
import { Card, PageHeader } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { getBackendByKey } from '../config/gameBackends'

// ── Game tab definitions ───────────────────────────────────────────────────
const GAME_TABS = [
  { key: 'dama',  label: 'Dama',  icon: '♟', color: 'text-violet-400',  ring: 'ring-violet-500/40',  bg: 'bg-violet-500/10',  accentBg: 'bg-violet-500'  },
  { key: 'bingo', label: 'Bingo', icon: '🎱', color: 'text-amber-400',   ring: 'ring-amber-500/40',   bg: 'bg-amber-500/10',   accentBg: 'bg-amber-500'   },
  { key: 'xo',    label: 'XO',    icon: '✕',  color: 'text-sky-400',     ring: 'ring-sky-500/40',     bg: 'bg-sky-500/10',     accentBg: 'bg-sky-500'     },
  { key: 'ludo',  label: 'Ludo',  icon: '🎲', color: 'text-emerald-400', ring: 'ring-emerald-500/40', bg: 'bg-emerald-500/10', accentBg: 'bg-emerald-500' },
]

// ── Static data per game ───────────────────────────────────────────────────
const GAME_DATA = {
  dama: {
    description: 'Ethiopian Checkers — minimax engine with configurable depth and Gemini LLM integration.',
    apiKey: 'dama',            // matches gameBackends key — real API toggle
    toggleEndpoint: '/api/ai', // PUT endpoint
    stats: [
      { label: 'AI Bots Active',   value: '15', icon: '🤖', color: 'text-violet-400' },
      { label: 'AI Games Today',   value: '—',  icon: '♟',  color: 'text-sky-400'    },
      { label: 'Avg. AI Win Rate', value: '—',  icon: '📈', color: 'text-emerald-400'},
      { label: 'LLM Requests',     value: '—',  icon: '✨', color: 'text-amber-400'  },
    ],
    features: [
      { label: 'Minimax Engine',      status: 'active',  note: 'Depth 1–20 configurable per bot' },
      { label: 'Gemini LLM Fallback', status: 'config',  note: 'Requires GEMINI_API_KEY in .env'  },
      { label: 'AI Bot Management',   status: 'active',  note: '15 bots seeded across skill levels'},
      { label: 'Difficulty Scaling',  status: 'active',  note: 'easy / medium / hard via depth'   },
      { label: 'PvAI Bet Settlement', status: 'active',  note: 'Owner-backed house edge logic'     },
    ],
    bots: [
      { name: 'AI-Bot-1',  depth: 1,  pct: 5,  level: 'Beginner' },
      { name: 'AI-Bot-5',  depth: 5,  pct: 25, level: 'Easy'     },
      { name: 'AI-Bot-10', depth: 10, pct: 50, level: 'Medium'   },
      { name: 'AI-Bot-14', depth: 14, pct: 70, level: 'Hard'     },
      { name: 'AI-Bot-18', depth: 18, pct: 90, level: 'Expert'   },
    ],
  },
  bingo: {
    description: 'Bingo game engine — automated number draw, stage management, and RNG fairness controls.',
    apiKey: null,  // no AI toggle endpoint yet
    stats: [
      { label: 'RNG Mode',        value: 'Live', icon: '🎱', color: 'text-amber-400'   },
      { label: 'Draw Interval',   value: '5s',   icon: '⏱',  color: 'text-sky-400'     },
      { label: 'Active Sessions', value: '—',    icon: '🃏', color: 'text-violet-400'  },
      { label: 'Payout Rate',     value: '—',    icon: '💰', color: 'text-emerald-400' },
    ],
    features: [
      { label: 'Auto Draw Engine',   status: 'active',  note: 'Configurable draw interval'    },
      { label: 'Stage Progression',  status: 'active',  note: 'Multi-stage betting rounds'     },
      { label: 'Fairness Audit Log', status: 'planned', note: 'Seeded RNG traceable per round' },
      { label: 'Jackpot Logic',      status: 'planned', note: 'Progressive jackpot module'     },
    ],
    bots: [],
  },
  xo: {
    description: 'Tic-Tac-Toe — minimax-based AI opponent with perfect play at max depth.',
    apiKey: 'xo',
    toggleEndpoint: '/api/ai/config',
    stats: [
      { label: 'AI Strategy',    value: 'Minimax', icon: '✕',  color: 'text-sky-400'     },
      { label: 'Win Rate vs AI', value: '—',       icon: '📊', color: 'text-violet-400'  },
      { label: 'Games Today',    value: '—',       icon: '🎮', color: 'text-emerald-400' },
      { label: 'Avg Duration',   value: '—',       icon: '⏱',  color: 'text-amber-400'   },
    ],
    features: [
      { label: 'Perfect-Play AI',   status: 'active',  note: 'Unbeatable at max depth (9)'  },
      { label: 'Difficulty Levels', status: 'active',  note: 'Easy / Medium / Hard modes'   },
      { label: 'LLM Integration',   status: 'planned', note: 'Optional AI commentary'        },
    ],
    bots: [
      { name: 'Easy Bot',    depth: 1, pct: 33,  level: 'Easy'   },
      { name: 'Medium Bot',  depth: 5, pct: 66,  level: 'Medium' },
      { name: 'Hard Bot',    depth: 9, pct: 100, level: 'Hard'   },
    ],
  },
  ludo: {
    description: 'Ludo engine — dice-driven AI with strategic piece selection and blocking heuristics.',
    apiKey: 'ludo',
    toggleEndpoint: '/api/ai/config',
    stats: [
      { label: 'AI Players',    value: '4',          icon: '🎲', color: 'text-emerald-400' },
      { label: 'Strategy Mode', value: 'Heuristic',  icon: '🧠', color: 'text-violet-400'  },
      { label: 'Games Today',   value: '—',          icon: '🎮', color: 'text-sky-400'     },
      { label: 'Avg. AI Wins',  value: '—',          icon: '🏆', color: 'text-amber-400'   },
    ],
    features: [
      { label: 'Heuristic AI',      status: 'active',  note: 'Block, capture, advance logic'  },
      { label: 'Difficulty Levels', status: 'active',  note: 'Adjustable aggression score'    },
      { label: 'Multi-AI Games',    status: 'active',  note: 'Up to 3 AI opponents per game'  },
      { label: 'LLM Narration',     status: 'planned', note: 'Optional play-by-play AI voice' },
    ],
    bots: [
      { name: 'Passive AI',    depth: 2, pct: 30, level: 'Easy'   },
      { name: 'Balanced AI',   depth: 5, pct: 60, level: 'Medium' },
      { name: 'Aggressive AI', depth: 9, pct: 90, level: 'Hard'   },
    ],
  },
}

// ── Toggle switch component ────────────────────────────────────────────────
function AiToggle({ enabled, loading, onChange, tab, hasRealApi }) {
  return (
    <button
      onClick={() => !loading && onChange(!enabled)}
      disabled={loading}
      aria-label={`Toggle AI play for ${tab.label}`}
      className={`
        relative flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all duration-200
        ${loading ? 'opacity-60 cursor-wait' : 'cursor-pointer hover:opacity-90'}
        ${enabled
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
          : 'bg-red-500/10    border-red-500/30    text-red-400'
        }
      `}
    >
      {/* Track */}
      <div className={`
        relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0
        ${enabled ? 'bg-emerald-500' : 'bg-surface-overlay'}
      `}>
        {/* Thumb */}
        <div className={`
          absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-200
          ${enabled ? 'left-5' : 'left-0.5'}
        `} />
        {/* Loading spinner ring */}
        {loading && (
          <div className="absolute inset-0 rounded-full border-2 border-white/30 border-t-white/80 animate-spin" />
        )}
      </div>

      {/* Label */}
      <div className="flex flex-col items-start leading-tight">
        <span className="text-xs font-semibold uppercase tracking-wide">
          Play with AI
        </span>
        <span className="text-xs opacity-75">
          {loading ? 'Saving…' : enabled ? 'Enabled' : 'Disabled'}
        </span>
      </div>

      {/* Live dot */}
      {enabled && !loading && (
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
      )}

      {/* No-API note */}
      {!hasRealApi && (
        <span className="ml-1 text-[10px] text-ink-faint border border-surface-border rounded px-1 py-0.5">
          local
        </span>
      )}
    </button>
  )
}

// ── Status badge ───────────────────────────────────────────────────────────
function FeatureStatusBadge({ status }) {
  if (status === 'active')  return <span className="badge-active">● Active</span>
  if (status === 'config')  return <span className="badge-yellow">⚙ Config Needed</span>
  if (status === 'planned') return <span className="badge-blue">◌ Planned</span>
  return <span className="badge">{status}</span>
}

// ── Skill bar ──────────────────────────────────────────────────────────────
function SkillBar({ pct, accentBg }) {
  return (
    <div className="flex-1 h-1.5 bg-surface-overlay rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full ${accentBg} opacity-70`}
        style={{ width: `${pct}%`, transition: 'width 0.6s ease' }}
      />
    </div>
  )
}

// ── Toast notification (inline, no context needed) ─────────────────────────
function Toast({ msg, type }) {
  if (!msg) return null
  return (
    <div className={`
      fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg
      border text-sm font-medium animate-slide-in
      ${type === 'error'
        ? 'bg-red-500/15 border-red-500/30 text-red-300'
        : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
      }
    `}>
      <span>{type === 'error' ? '✕' : '✓'}</span>
      <span>{msg}</span>
    </div>
  )
}

// ── Per-game panel ─────────────────────────────────────────────────────────
function GameAiPanel({ tab, enabled, toggleLoading, onToggle }) {
  const data = GAME_DATA[tab.key]
  if (!data) return null
  const hasRealApi = !!data.apiKey

  return (
    <div className="flex flex-col gap-6 animate-fade-in">

      {/* Description + toggle row */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Icon + text */}
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className={`w-12 h-12 rounded-2xl ${tab.bg} ring-1 ${tab.ring} flex items-center justify-center text-2xl flex-shrink-0`}>
              {tab.icon}
            </div>
            <div className="min-w-0">
              <h3 className={`text-lg font-semibold ${tab.color}`}>{tab.label} AI Engine</h3>
              <p className="text-ink-muted text-sm mt-0.5 leading-relaxed">{data.description}</p>
            </div>
          </div>

          {/* ── THE TOGGLE ── */}
          <div className="flex-shrink-0 self-start sm:self-center">
            <AiToggle
              enabled={enabled}
              loading={toggleLoading}
              onChange={onToggle}
              tab={tab}
              hasRealApi={hasRealApi}
            />
            {!hasRealApi && (
              <p className="text-ink-faint text-[10px] mt-1 text-center">
                No backend endpoint yet
              </p>
            )}
          </div>
        </div>

        {/* Disabled overlay hint */}
        {!enabled && (
          <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
            <span>⚠</span>
            <span>
              AI play is currently <strong>disabled</strong> for {tab.label}.
              Players cannot start AI matches until this is turned back on.
            </span>
          </div>
        )}
      </Card>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {data.stats.map((stat) => (
          <Card key={stat.label} className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">{stat.icon}</span>
              <span className="text-ink-faint text-xs uppercase tracking-wide">{stat.label}</span>
            </div>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* Features + Bots */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <Card noPad>
          <div className="px-5 py-4 border-b border-surface-border">
            <h4 className="text-ink font-semibold text-sm">AI Features</h4>
          </div>
          <div className="divide-y divide-surface-border">
            {data.features.map((f) => (
              <div key={f.label} className="px-5 py-3 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-ink text-sm font-medium truncate">{f.label}</p>
                  <p className="text-ink-faint text-xs mt-0.5">{f.note}</p>
                </div>
                <FeatureStatusBadge status={f.status} />
              </div>
            ))}
          </div>
        </Card>

        <Card noPad>
          <div className="px-5 py-4 border-b border-surface-border">
            <h4 className="text-ink font-semibold text-sm">AI Bots / Agents</h4>
          </div>
          {data.bots.length === 0 ? (
            <div className="px-5 py-10 text-center text-ink-faint text-sm">
              No AI bots configured for this game.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface-base">
                  <tr>
                    <th className="th">Bot Name</th>
                    <th className="th">Level</th>
                    <th className="th">Depth</th>
                    <th className="th w-36">Strength</th>
                  </tr>
                </thead>
                <tbody>
                  {data.bots.map((bot) => (
                    <tr key={bot.name} className="tr">
                      <td className="td text-ink font-medium">{bot.name}</td>
                      <td className="td">
                        <span className={`badge ${
                          bot.level === 'Expert' || bot.level === 'Hard'     ? 'badge-red'    :
                          bot.level === 'Medium'                             ? 'badge-yellow' :
                          bot.level === 'Beginner' || bot.level === 'Easy'  ? 'badge-active' :
                          'badge-blue'
                        }`}>
                          {bot.level}
                        </span>
                      </td>
                      <td className="td text-ink-muted">{bot.depth}</td>
                      <td className="td">
                        <div className="flex items-center gap-2">
                          <SkillBar pct={bot.pct} accentBg={tab.accentBg} />
                          <span className="text-ink-faint text-xs w-8 text-right">{bot.pct}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function AiPage() {
  const { token } = useAuth()
  const [activeTab, setActiveTab]   = useState('dama')

  // Per-game enabled state — dama starts null (loading from API)
  const [aiEnabled, setAiEnabled]   = useState({ dama: null, bingo: true, xo: null, ludo: null })
  const [toggleLoading, setToggleLoading] = useState({ dama: false, bingo: false, xo: false, ludo: false })

  // Toast
  const [toast, setToast] = useState({ msg: '', type: 'success' })
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast({ msg: '', type: 'success' }), 3000)
  }

  const fetchConfigs = useCallback(async () => {
    await Promise.all(['dama', 'xo', 'ludo'].map(async (gameKey) => {
      const data = GAME_DATA[gameKey]
      const backend = getBackendByKey(data.apiKey)
      if (!backend) return
      try {
        const res = await fetch(`${backend.url}${data.toggleEndpoint || '/api/ai'}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) return
        const json = await res.json()
        const cfg = json?.data ?? json
        const enabled = cfg?.ai_enabled !== undefined ? Boolean(cfg.ai_enabled) : true
        setAiEnabled(prev => ({ ...prev, [gameKey]: enabled }))
      } catch {
        setAiEnabled(prev => ({ ...prev, [gameKey]: false }))
      }
    }))
  }, [token])

  useEffect(() => { fetchConfigs() }, [fetchConfigs])

  // ── Toggle handler ─────────────────────────────────────────────────────
  const handleToggle = async (gameKey, newValue) => {
    const data = GAME_DATA[gameKey]

    // Games without a real API: just flip local state
    if (!data?.apiKey) {
      setAiEnabled(prev => ({ ...prev, [gameKey]: newValue }))
      showToast(
        `AI play ${newValue ? 'enabled' : 'disabled'} for ${GAME_TABS.find(t => t.key === gameKey)?.label} (local only)`,
        'success'
      )
      return
    }

    // Persist the setting in the owning game backend.
    const backend = getBackendByKey(data.apiKey)
    if (!backend) return

    setToggleLoading(prev => ({ ...prev, [gameKey]: true }))
    try {
      const res = await fetch(`${backend.url}${data.toggleEndpoint}`, {
        method:  'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization:  `Bearer ${token}`,
        },
        body: JSON.stringify({ aiEnabled: newValue }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || `HTTP ${res.status}`)
      }

      const json = await res.json()
      const cfg  = json?.data ?? json
      const saved = cfg?.ai_enabled !== undefined ? Boolean(cfg.ai_enabled) : newValue

      setAiEnabled(prev => ({ ...prev, [gameKey]: saved }))
      showToast(
        `${GAME_TABS.find(t => t.key === gameKey)?.label} AI play ${saved ? 'enabled' : 'disabled'} successfully`,
        'success'
      )
    } catch (err) {
      showToast(`Failed to update: ${err.message}`, 'error')
    } finally {
      setToggleLoading(prev => ({ ...prev, [gameKey]: false }))
    }
  }

  const currentTab = GAME_TABS.find(t => t.key === activeTab)

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <PageHeader
        title="AI Management"
        subtitle="Configure and monitor AI engines across all game modules"
      />

      {/* Tab bar — shows enabled/disabled pill per tab */}
      <div className="flex flex-wrap gap-2 p-1 bg-surface-raised rounded-2xl border border-surface-border">
        {GAME_TABS.map((tab) => {
          const isActive  = activeTab === tab.key
          const isEnabled = aiEnabled[tab.key]
          const isLoading = toggleLoading[tab.key]

          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                ${isActive
                  ? `${tab.bg} ${tab.color} ring-1 ${tab.ring} shadow-sm`
                  : 'text-ink-muted hover:text-ink hover:bg-surface-overlay/50'
                }
              `}
            >
              <span className="text-base leading-none">{tab.icon}</span>
              <span>{tab.label}</span>

              {/* AI status pill on the tab */}
              {isLoading ? (
                <span className="w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
              ) : isEnabled === null ? (
                <span className="w-2 h-2 rounded-full bg-surface-overlay animate-pulse" />
              ) : isEnabled ? (
                <span className="w-2 h-2 rounded-full bg-emerald-400" title="AI enabled" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-red-400" title="AI disabled" />
              )}
            </button>
          )
        })}
      </div>

      {/* Active tab panel */}
      {currentTab && (
        <GameAiPanel
          tab={currentTab}
          enabled={aiEnabled[currentTab.key] ?? true}
          toggleLoading={toggleLoading[currentTab.key]}
          onToggle={(val) => handleToggle(currentTab.key, val)}
        />
      )}

      {/* Toast */}
      <Toast msg={toast.msg} type={toast.type} />
    </div>
  )
}
