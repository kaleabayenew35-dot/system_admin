import React from 'react'
import { Card, PageHeader, Button } from '../components/ui'

const xoStats = [
  { label: 'Users Online', value: '142', tone: 'text-emerald-400' },
  { label: 'Live Sessions', value: '18', tone: 'text-sky-400' },
  { label: 'AI Settings', value: 'Active', tone: 'text-violet-400' },
  { label: 'Balance Drift', value: '2.1%', tone: 'text-amber-400' },
]

const xoRows = [
  { id: 'XO-442', player: 'Mick', status: 'Playing', token: 'Valid', score: '3-1' },
  { id: 'XO-443', player: 'Lina', status: 'Waiting', token: 'Valid', score: '1-2' },
  { id: 'XO-444', player: 'Sam', status: 'Paused', token: 'Expired', score: '0-0' },
]

export default function XoModulePage() {
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <PageHeader
        title="XO Module"
        subtitle="XO player management, token state, AI controls, and analysis"
        action={<Button>Refresh XO</Button>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {xoStats.map((item) => (
          <Card key={item.label}>
            <p className="text-ink-faint text-xs uppercase tracking-wide">{item.label}</p>
            <p className={`text-3xl font-bold mt-3 ${item.tone}`}>{item.value}</p>
          </Card>
        ))}
      </div>

      <Card noPad>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-base text-left">
              <tr>
                <th className="px-4 py-3 text-ink-faint font-medium">Session</th>
                <th className="px-4 py-3 text-ink-faint font-medium">Player</th>
                <th className="px-4 py-3 text-ink-faint font-medium">Status</th>
                <th className="px-4 py-3 text-ink-faint font-medium">Token</th>
                <th className="px-4 py-3 text-ink-faint font-medium">Score</th>
              </tr>
            </thead>
            <tbody>
              {xoRows.map((row) => (
                <tr key={row.id} className="border-t border-surface-border">
                  <td className="px-4 py-3 text-ink">{row.id}</td>
                  <td className="px-4 py-3 text-ink">{row.player}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${row.status === 'Playing' ? 'badge-active' : row.status === 'Waiting' ? 'badge-blue' : 'badge-inactive'}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{row.token}</td>
                  <td className="px-4 py-3 text-ink">{row.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
