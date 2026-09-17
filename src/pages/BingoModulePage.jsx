import React from 'react'
import { Card, PageHeader, Button } from '../components/ui'

const bingoStats = [
  { label: 'Active Bets', value: '1,284', tone: 'text-emerald-400' },
  { label: 'Draws Today', value: '42', tone: 'text-sky-400' },
  { label: 'Pending Stages', value: '16', tone: 'text-amber-400' },
  { label: 'Total Volume', value: '$48.7k', tone: 'text-brand-400' },
]

const bingoRows = [
  { id: 'C-2041', name: 'Lucky 7', status: 'Active', amount: '$250', stage: 'Stage 5' },
  { id: 'C-2042', name: 'High Roller', status: 'Live', amount: '$1200', stage: 'Stage 3' },
  { id: 'C-2043', name: 'Nina', status: 'Paused', amount: '$90', stage: 'Stage 2' },
]

export default function BingoModulePage() {
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <PageHeader
        title="Bingo Module"
        subtitle="Betting, stages, draws, timers, and live game controls"
        action={<Button>Refresh Bingo</Button>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {bingoStats.map((item) => (
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
                <th className="px-4 py-3 text-ink-faint font-medium">ID</th>
                <th className="px-4 py-3 text-ink-faint font-medium">Player</th>
                <th className="px-4 py-3 text-ink-faint font-medium">Status</th>
                <th className="px-4 py-3 text-ink-faint font-medium">Amount</th>
                <th className="px-4 py-3 text-ink-faint font-medium">Stage</th>
              </tr>
            </thead>
            <tbody>
              {bingoRows.map((row) => (
                <tr key={row.id} className="border-t border-surface-border">
                  <td className="px-4 py-3 text-ink">{row.id}</td>
                  <td className="px-4 py-3 text-ink">{row.name}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${row.status === 'Active' ? 'badge-active' : row.status === 'Live' ? 'badge-blue' : 'badge-inactive'}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink">{row.amount}</td>
                  <td className="px-4 py-3 text-ink-muted">{row.stage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
