import React from 'react'
import { Card, PageHeader, Badge } from '../components/ui'

const MOCK_EVENTS = [
  { id: 1, action: 'LOGIN',           actor: 'admin',     target: 'system',      time: new Date(Date.now() - 5 * 60000).toISOString(),  severity: 'info' },
  { id: 2, action: 'USER_DEPOSIT',    actor: 'admin',     target: 'user #42',    time: new Date(Date.now() - 12 * 60000).toISOString(), severity: 'success' },
  { id: 3, action: 'TX_REJECTED',     actor: 'admin',     target: 'tx #89',      time: new Date(Date.now() - 30 * 60000).toISOString(), severity: 'warning' },
  { id: 4, action: 'GAME_DEACTIVATED',actor: 'admin',     target: 'Chess',       time: new Date(Date.now() - 60 * 60000).toISOString(), severity: 'warning' },
  { id: 5, action: 'TOKEN_GENERATED', actor: 'admin',     target: 'game #3',     time: new Date(Date.now() - 90 * 60000).toISOString(), severity: 'info' },
  { id: 6, action: 'CASHIER_ADDED',   actor: 'admin',     target: 'cashier John',time: new Date(Date.now() - 2 * 3600000).toISOString(), severity: 'success' },
]

const severityMap = { info: 'blue', success: 'green', warning: 'yellow', danger: 'red' }
const iconMap = {
  LOGIN: '🔐', USER_DEPOSIT: '💰', TX_REJECTED: '❌', GAME_DEACTIVATED: '🎮',
  TOKEN_GENERATED: '🔑', CASHIER_ADDED: '🏦',
}

const fmtAgo = (iso) => {
  const diff = Date.now() - new Date(iso).getTime()
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  return `${Math.floor(diff / 3600000)}h ago`
}

export default function AuditLogPage() {
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <PageHeader
        title="Audit Log"
        subtitle="Admin activity feed — all system events"
        action={
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-semibold">
            🚧 Coming Soon
          </div>
        }
      />

      {/* Coming-soon banner */}
      <div className="p-5 bg-brand-500/10 border border-brand-500/25 rounded-2xl flex items-start gap-4">
        <span className="text-3xl">📋</span>
        <div>
          <p className="text-ink font-semibold">Audit Log is planned for a future release</p>
          <p className="text-ink-muted text-sm mt-1">
            This page will capture all admin actions (logins, approvals, rejections, deposits, deletions)
            with timestamps, actor info, and optional IP logging. The data below is a preview mock.
          </p>
        </div>
      </div>

      {/* Preview mock feed */}
      <Card>
        <h2 className="text-ink font-semibold text-sm mb-4 flex items-center gap-2">
          <span>📡</span> Recent Activity (preview — not live)
        </h2>
        <div className="flex flex-col gap-0">
          {MOCK_EVENTS.map((ev, i) => (
            <div key={ev.id} className={`flex items-start gap-3 py-3 ${i < MOCK_EVENTS.length - 1 ? 'border-b border-surface-border' : ''}`}>
              <div className="w-8 h-8 bg-surface-overlay rounded-lg flex items-center justify-center text-base flex-shrink-0">
                {iconMap[ev.action] || '⚡'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-ink text-sm font-medium">{ev.action.replace(/_/g, ' ')}</span>
                  <Badge color={severityMap[ev.severity]}>{ev.severity}</Badge>
                </div>
                <p className="text-ink-faint text-xs mt-0.5">
                  <span className="text-ink-muted">{ev.actor}</span> → <span>{ev.target}</span>
                </p>
              </div>
              <span className="text-ink-faint text-xs flex-shrink-0">{fmtAgo(ev.time)}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Planned features */}
      <Card>
        <h2 className="text-ink font-semibold text-sm mb-4">📌 Planned Features</h2>
        <ul className="flex flex-col gap-2 text-sm text-ink-muted list-none">
          {[
            'Real-time event stream via WebSocket',
            'Filter by action type, actor, severity, date range',
            'Export log as CSV / JSON',
            'IP address and device logging',
            'Retention policy configuration',
          ].map(f => (
            <li key={f} className="flex items-center gap-2">
              <span className="text-brand-400">◦</span> {f}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
