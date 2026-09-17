import React from 'react'

/**
 * EmptyState — shown when a list/table has no data.
 * Props: icon, title, description, action (ReactNode)
 */
export default function EmptyState({ icon = '📭', title = 'Nothing here yet', description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 gap-3">
      <div className="text-5xl">{icon}</div>
      <div>
        <p className="text-ink font-medium">{title}</p>
        {description && <p className="text-ink-faint text-sm mt-1">{description}</p>}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
