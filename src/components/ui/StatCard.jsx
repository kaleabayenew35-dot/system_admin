import React from 'react'

/**
 * StatCard — KPI display tile.
 * Props: label, value, icon, color (tailwind text-* class), sub, trend
 */
export default function StatCard({ label, value, icon, color = 'text-ink', sub, trend }) {
  return (
    <div className="bg-surface-raised border border-surface-border rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-ink-faint text-xs font-medium uppercase tracking-wider">{label}</span>
        {icon && <span className="text-2xl">{icon}</span>}
      </div>
      <p className={`text-3xl font-bold leading-none ${color}`}>{value}</p>
      {(sub || trend !== undefined) && (
        <div className="flex items-center justify-between">
          {sub && <p className="text-ink-faint text-xs">{sub}</p>}
          {trend !== undefined && (
            <span className={`text-xs font-medium ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%
            </span>
          )}
        </div>
      )}
    </div>
  )
}
