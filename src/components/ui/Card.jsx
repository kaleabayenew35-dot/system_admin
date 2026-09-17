import React from 'react'

/**
 * Card primitive — standard surface container.
 * noPad: removes default padding (useful when card wraps a table)
 */
export default function Card({ children, className = '', noPad = false }) {
  return (
    <div className={`bg-surface-raised border border-surface-border rounded-2xl ${noPad ? '' : 'p-6'} ${className}`}>
      {children}
    </div>
  )
}
