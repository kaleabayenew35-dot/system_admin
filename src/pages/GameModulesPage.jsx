import React from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader, Card, Button } from '../components/ui'

const modules = [
  {
    game: 'Bingo',
    status: 'Ready',
    summary: 'Betting flow, stages, draw engine, players, and timers.',
    features: ['Games', 'Bets', 'Players', 'Stages', 'Draws', 'Timers'],
    color: 'text-emerald-400',
    route: '/bingo-module'
  },
  {
    game: 'Dama',
    status: 'Ready',
    summary: 'Live match monitoring, AI config, balance, API callbacks, and token management.',
    features: ['Live', 'AI', 'Balance', 'API', 'Tokens', 'Players'],
    color: 'text-sky-400',
    route: '/dama-module'
  },
  {
    game: 'XO',
    status: 'Shared',
    summary: 'User, token, balance, AI and analysis modules are partly unified into the system shell.',
    features: ['Users', 'Token', 'Balance', 'AI', 'Analysis'],
    color: 'text-violet-400',
    route: '/xo-module'
  },
  {
    game: 'Ludo',
    status: 'Shared',
    summary: 'Game and player administration are represented in the central admin.',
    features: ['Games', 'Players', 'Settings'],
    color: 'text-amber-400',
    route: '/ludo-module'
  },
  {
    game: 'System',
    status: 'Core',
    summary: 'Global dashboard, users, transactions, cashier, sessions and backend overview.',
    features: ['Dashboard', 'Users', 'Transactions', 'Cashier', 'Sessions', 'Overview'],
    color: 'text-brand-400',
    route: '/dashboard'
  }
]

export default function GameModulesPage() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <PageHeader
        title="Game Modules"
        subtitle="Unified representation of all game-specific admin areas within the system admin"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {modules.map((module) => (
          <Card key={module.game} className="min-h-[260px]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-ink font-semibold text-xl">{module.game}</p>
                <p className={`text-sm font-medium ${module.color}`}>{module.status}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-surface-overlay flex items-center justify-center text-lg">
                {module.game === 'Bingo' ? '🎯' : module.game === 'Dama' ? '♟️' : module.game === 'XO' ? '❌' : module.game === 'Ludo' ? '🎲' : '🧩'}
              </div>
            </div>

            <p className="text-ink-muted text-sm mt-4 leading-relaxed">{module.summary}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {module.features.map((feature) => (
                <span key={feature} className="badge badge-blue">{feature}</span>
              ))}
            </div>

            <div className="mt-6">
              <Button variant="secondary" size="sm" className="w-full" onClick={() => navigate(module.route)}>
                Open {module.game}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
