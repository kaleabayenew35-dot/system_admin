import React from 'react'

/**
 * PageHeader — consistent title + subtitle + optional action slot.
 */
export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between gap-4 flex-wrap">
      <div>
        <h1 className="text-ink text-2xl font-bold leading-tight">{title}</h1>
        {subtitle && <p className="text-ink-muted text-sm mt-1">{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-2 flex-shrink-0">{action}</div>}
    </div>
  )
}
