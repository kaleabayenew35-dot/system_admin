import React from 'react'
import { Card, PageHeader, Button } from '../components/ui'

const damaStats = [
  { label: 'Online Players', value: '287', tone: 'text-emerald-400' },
  { label: 'Active Matches', value: '24', tone: 'text-sky-400' },
  { label: 'AI Games', value: '11', tone: 'text-violet-400' },
  { label: 'Pending Callback', value: '5', tone: 'text-amber-400' },
]

const damaRows = [
  { id: 'DM-110', player: 'Abel', result: 'Win', balance: '$420', mode: 'AI' },
  { id: 'DM-111', player: 'Marta', result: 'Loss', balance: '$210', mode: 'PVP' },
  { id: 'DM-112', player: 'Zeki', result: 'Draw', balance: '$330', mode: 'AI' },
]

export default function DamaModulePage() {
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <PageHeader
        title="Dama Module"
        subtitle="Live matches, players, balance, tokens, AI, and game callbacks"
        action={<Button>Sync Dama</Button>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {damaStats.map((item) => (
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
                <th className="px-4 py-3 text-ink-faint font-medium">Match</th>
                <th className="px-4 py-3 text-ink-faint font-medium">Player</th>
                <th className="px-4 py-3 text-ink-faint font-medium">Result</th>
                <th className="px-4 py-3 text-ink-faint font-medium">Balance</th>
                <th className="px-4 py-3 text-ink-faint font-medium">Mode</th>
              </tr>
            </thead>
            <tbody>
              {damaRows.map((row) => (
                <tr key={row.id} className="border-t border-surface-border">
                  <td className="px-4 py-3 text-ink">{row.id}</td>
                  <td className="px-4 py-3 text-ink">{row.player}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${row.result === 'Win' ? 'badge-active' : row.result === 'Loss' ? 'badge-inactive' : 'badge-blue'}`}>
                      {row.result}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink">{row.balance}</td>
                  <td className="px-4 py-3 text-ink-muted">{row.mode}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
