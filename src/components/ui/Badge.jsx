import React from 'react'

/**
 * Badge primitive
 * color: 'green' | 'red' | 'yellow' | 'blue' | 'cyan' | 'gray'
 */
const colorMap = {
  green:  'bg-green-500/15 text-green-400 border-green-500/25',
  red:    'bg-red-500/15 text-red-400 border-red-500/25',
  yellow: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  blue:   'bg-indigo-500/15 text-indigo-300 border-indigo-500/25',
  cyan:   'bg-cyan-500/15 text-cyan-400 border-cyan-500/25',
  gray:   'bg-slate-700/50 text-slate-400 border-slate-600/40',
}

export default function Badge({ children, color = 'gray', className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.7rem] font-medium border ${colorMap[color] ?? colorMap.gray} ${className}`}>
      {children}
    </span>
  )
}

/** Shorthand helpers */
export function ActiveBadge() { return <Badge color="green">active</Badge> }
export function InactiveBadge() { return <Badge color="red">inactive</Badge> }
export function StatusBadge({ status }) {
  if (status === 'active') return <ActiveBadge />
  return <InactiveBadge />
}
