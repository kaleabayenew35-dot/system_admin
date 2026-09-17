import React from 'react'
import { Card, PageHeader, Button } from '../components/ui'

const ludoStats = [
  { label: 'Players Online', value: '96', tone: 'text-emerald-400' },
  { label: 'Game Rooms', value: '12', tone: 'text-sky-400' },
  { label: 'Matches Today', value: '39', tone: 'text-violet-400' },
  { label: 'Settings', value: 'Updated', tone: 'text-brand-400' },
]

const ludoRows = [
  { id: 'LD-201', player: 'Ari', room: 'Room 04', status: 'Ready', amount: '$80' },
  { id: 'LD-202', player: 'Tariq', room: 'Room 12', status: 'Playing', amount: '$120' },
  { id: 'LD-203', player: 'Nami', room: 'Room 07', status: 'Paused', amount: '$50' },
]

export default function LudoModulePage() {
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <PageHeader
        title="Ludo Module"
        subtitle="Players, rooms, game state, and admin settings"
        action={<Button>Sync Ludo</Button>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {ludoStats.map((item) => (
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
                <th className="px-4 py-3 text-ink-faint font-medium">Room</th>
                <th className="px-4 py-3 text-ink-faint font-medium">Status</th>
                <th className="px-4 py-3 text-ink-faint font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {ludoRows.map((row) => (
                <tr key={row.id} className="border-t border-surface-border">
                  <td className="px-4 py-3 text-ink">{row.id}</td>
                  <td className="px-4 py-3 text-ink">{row.player}</td>
                  <td className="px-4 py-3 text-ink-muted">{row.room}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${row.status === 'Playing' ? 'badge-active' : row.status === 'Ready' ? 'badge-blue' : 'badge-inactive'}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink">{row.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
