import React, { useState } from 'react'
import { Card, PageHeader } from '../components/ui'

// ── Game tab definitions ───────────────────────────────────────────────────
const GAME_TABS = [
  { key: 'dama',  label: 'Dama',  icon: '♟', color: 'text-violet-400',  ring: 'ring-violet-500/40',  bg: 'bg-violet-500/10'  },
  { key: 'bingo', label: 'Bingo', icon: '🎱', color: 'text-amber-400',   ring: 'ring-amber-500/40',   bg: 'bg-amber-500/10'   },
  { key: 'xo',    label: 'XO',    icon: '✕',  color: 'text-sky-400',     ring: 'ring-sky-500/40',     bg: 'bg-sky-500/10'     },
  { key: 'ludo',  label: 'Ludo',  icon: '🎲', color: 'text-emerald-400', ring: 'ring-emerald-500/40', bg: 'bg-emerald-500/10' },
]

// ── Placeholder data per game (replace with real API calls later) ──────────
const GAME_DATA = {
  dama: {
    description: 'Ethiopian Checkers — minimax engine with configurable depth and Gemini LLM integration.',
    stats: [
      { label: 'AI Bots Active',    value: '15',  icon: '🤖', color: 'text-violet-400' },
      { label: 'AI Games Today',    value: '—',   icon: '♟',  color: 'text-sky-400'    },
      { label: 'Avg. AI Win Rate',  value: '—',   icon: '📈', color: 'text-emerald-400'},
      { label: 'LLM Requests',      value: '—',   icon: '✨', color: 'text-amber-400'  },
    ],
    features: [
      { label: 'Minimax Engine',      status: 'active',  note: 'Depth 1–20 configurable per bot' },
      { label: 'Gemini LLM Fallback', status: 'config',  note: 'Requires GEMINI_API_KEY in .env'  },
      { label: 'AI Bot Management',   status: 'active',  note: '15 bots seeded across skill levels'},
      { label: 'Difficulty Scaling',  status: 'active',  note: 'easy / medium / hard via depth'   },
      { label: 'PvAI Bet Settlement', status: 'active',  note: 'Owner-backed house edge logic'     },
    ],
    bots: [
      { name: 'AI-Bot-1',  depth: 1,  pct: 5,   level: 'Beginner' },
      { name: 'AI-Bot-5',  depth: 5,  pct: 25,  level: 'Easy'     },
      { name: 'AI-Bot-10', depth: 10, pct: 50,  level: 'Medium'   },
      { name: 'AI-Bot-14', depth: 14, pct: 70,  level: 'Hard'     },
      { name: 'AI-Bot-18', depth: 18, pct: 90,  level: 'Expert'   },
    ],
  },
  bingo: {
    description: 'Bingo game engine — automated number draw, stage management, and RNG fairness controls.',
    stats: [
      { label: 'RNG Mode',        value: 'Live',  icon: '🎱', color: 'text-amber-400'   },
      { label: 'Draw Interval',   value: '5s',    icon: '⏱',  color: 'text-sky-400'     },
      { label: 'Active Sessions', value: '—',     icon: '🃏', color: 'text-violet-400'  },
      { label: 'Payout Rate',     value: '—',     icon: '💰', color: 'text-emerald-400' },
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
    stats: [
      { label: 'AI Strategy',    value: 'Minimax', icon: '✕',  color: 'text-sky-400'     },
      { label: 'Win Rate vs AI', value: '—',       icon: '📊', color: 'text-violet-400'  },
      { label: 'Games Today',    value: '—',       icon: '🎮', color: 'text-emerald-400' },
      { label: 'Avg Duration',   value: '—',       icon: '⏱',  color: 'text-amber-400'   },
    ],
    features: [
      { label: 'Perfect-Play AI',   status: 'active',  note: 'Unbeatable at max depth (9)'   },
      { label: 'Difficulty Levels', status: 'active',  note: 'Easy / Medium / Hard modes'    },
      { label: 'LLM Integration',   status: 'planned', note: 'Optional AI commentary'         },
    ],
    bots: [
      { name: 'Easy Bot',   depth: 1, pct: 33, level: 'Easy'   },
      { name: 'Medium Bot', depth: 5, pct: 66, level: 'Medium' },
      { name: 'Hard Bot',   depth: 9, pct: 100,level: 'Hard'   },
    ],
  },
  ludo: {
    description: 'Ludo engine — dice-driven AI with strategic piece selection and blocking heuristics.',
    stats: [
      { label: 'AI Players',      value: '4',  icon: '🎲', color: 'text-emerald-400' },
      { label: 'Strategy Mode',   value: 'Heuristic', icon: '🧠', color: 'text-violet-400'  },
      { label: 'Games Today',     value: '—',  icon: '🎮', color: 'text-sky-400'     },
      { label: 'Avg. AI Wins',    value: '—',  icon: '🏆', color: 'text-amber-400'   },
    ],
    features: [
      { label: 'Heuristic AI',      status: 'active',  note: 'Block, capture, advance logic'  },
      { label: 'Difficulty Levels', status: 'active',  note: 'Adjustable aggression score'    },
      { label: 'Multi-AI Games',    status: 'active',  note: 'Up to 3 AI opponents per game'  },
      { label: 'LLM Narration',     status: 'planned', note: 'Optional play-by-play AI voice' },
    ],
    bots: [
      { name: 'Passive AI',   depth: 2, pct: 30, level: 'Easy'   },
      { name: 'Balanced AI',  depth: 5, pct: 60, level: 'Medium' },
      { name: 'Aggressive AI',depth: 9, pct: 90, level: 'Hard'   },
    ],
  },
}

// ── Status badge helper ────────────────────────────────────────────────────
function FeatureStatusBadge({ status }) {
  if (status === 'active')  return <span className="badge-active">● Active</span>
  if (status === 'config')  return <span className="badge-yellow">⚙ Config Needed</span>
  if (status === 'planned') return <span className="badge-blue">◌ Planned</span>
  return <span className="badge">{status}</span>
}

// ── Skill bar ──────────────────────────────────────────────────────────────
function SkillBar({ pct, color }) {
  return (
    <div className="flex-1 h-1.5 bg-surface-overlay rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full ${color} opacity-80`}
        style={{ width: `${pct}%`, transition: 'width 0.6s ease' }}
      />
    </div>
  )
}

// ── Per-game content panel ─────────────────────────────────────────────────
function GameAiPanel({ tab }) {
  const data = GAME_DATA[tab.key]
  if (!data) return null

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Description */}
      <Card>
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-2xl ${tab.bg} ring-1 ${tab.ring} flex items-center justify-center text-2xl flex-shrink-0`}>
            {tab.icon}
          </div>
          <div>
            <h3 className={`text-lg font-semibold ${tab.color}`}>{tab.label} AI Engine</h3>
            <p className="text-ink-muted text-sm mt-1 leading-relaxed">{data.description}</p>
          </div>
        </div>
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

      {/* Features list + Bots table — side by side on lg */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Features */}
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

        {/* Bots table or placeholder */}
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
                    <th className="th w-32">Strength</th>
                  </tr>
                </thead>
                <tbody>
                  {data.bots.map((bot) => (
                    <tr key={bot.name} className="tr">
                      <td className="td text-ink font-medium">{bot.name}</td>
                      <td className="td">
                        <span className={`badge ${
                          bot.level === 'Expert'  || bot.level === 'Hard'   ? 'badge-red'    :
                          bot.level === 'Medium'  || bot.level === 'Hard'   ? 'badge-yellow' :
                          bot.level === 'Beginner'|| bot.level === 'Easy'   ? 'badge-active' :
                          'badge-blue'
                        }`}>
                          {bot.level}
                        </span>
                      </td>
                      <td className="td text-ink-muted">{bot.depth}</td>
                      <td className="td">
                        <div className="flex items-center gap-2">
                          <SkillBar pct={bot.pct} color={tab.color.replace('text-', 'bg-')} />
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
  const [activeTab, setActiveTab] = useState('dama')
  const currentTab = GAME_TABS.find(t => t.key === activeTab)

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <PageHeader
        title="AI Management"
        subtitle="Configure and monitor AI engines across all game modules"
      />

      {/* Tab bar */}
      <div className="flex flex-wrap gap-2 p-1 bg-surface-raised rounded-2xl border border-surface-border">
        {GAME_TABS.map((tab) => {
          const isActive = activeTab === tab.key
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
              {isActive && (
                <span className={`w-1.5 h-1.5 rounded-full ${tab.color.replace('text-', 'bg-')} opacity-80`} />
              )}
            </button>
          )
        })}
      </div>

      {/* Active tab panel */}
      {currentTab && <GameAiPanel tab={currentTab} />}
    </div>
  )
}
