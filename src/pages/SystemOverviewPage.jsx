import React, { useMemo } from 'react'
import { useGameBackends } from '../hooks/useGameBackends'
import { PageHeader, Card, EmptyState, Button } from '../components/ui'

export default function SystemOverviewPage() {
  const { items, loading, refresh } = useGameBackends()

  const onlineCount = useMemo(
    () => items.filter((item) => item.status === 'online').length,
    [items]
  )

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <PageHeader
        title="System Overview"
        subtitle="Unified view of all backend services across the platform"
        action={
          <Button onClick={refresh} variant="secondary">
            Refresh status
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <p className="text-ink-faint text-xs uppercase tracking-wide">Backends online</p>
          <p className="text-3xl font-bold text-brand-400 mt-3">{loading ? '...' : onlineCount}</p>
          <p className="text-ink-muted text-xs mt-2">of {items.length} total services</p>
        </Card>

        <Card>
          <p className="text-ink-faint text-xs uppercase tracking-wide">Primary platform</p>
          <p className="text-xl font-semibold text-ink mt-3">System Backend</p>
          <p className="text-ink-muted text-xs mt-2">Central auth, users, games, and admin APIs</p>
        </Card>

        <Card>
          <p className="text-ink-faint text-xs uppercase tracking-wide">Game coverage</p>
          <p className="text-xl font-semibold text-ink mt-3">Bingo · Dama · XO · Ludo</p>
          <p className="text-ink-muted text-xs mt-2">All managed from one dashboard</p>
        </Card>
      </div>

      {!loading && items.length === 0 ? (
        <EmptyState icon="🧩" title="No backend services configured" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((backend) => (
            <Card key={backend.key} className="min-h-[220px]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-ink font-semibold">{backend.name}</p>
                  <p className="text-ink-muted text-xs mt-1">{backend.description}</p>
                </div>
                <span
                  className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase tracking-wide ${
                    backend.status === 'online'
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : 'bg-red-500/15 text-red-400'
                  }`}
                >
                  {backend.status}
                </span>
              </div>

              <div className="mt-4 space-y-2 text-xs text-ink-faint">
                <div className="flex items-center justify-between gap-3 border-b border-surface-border pb-2">
                  <span>URL</span>
                  <span className="text-ink-muted font-mono break-all text-right">{backend.url}</span>
                </div>
                <div className="flex items-center justify-between gap-3 border-b border-surface-border pb-2">
                  <span>Health path</span>
                  <span className="text-ink-muted font-mono">{backend.healthPath}</span>
                </div>
                <div className="flex items-center justify-between gap-3 border-b border-surface-border pb-2">
                  <span>Status code</span>
                  <span className="text-ink-muted font-mono">{backend.lastStatusCode || '—'}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Message</span>
                  <span className="text-ink-muted text-right">{backend.message}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
