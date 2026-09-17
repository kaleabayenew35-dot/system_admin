import React from 'react'

/**
 * Table primitives — DataTable, THead, TBody, TR, TH, TD
 * Usage:
 *   <DataTable>
 *     <THead><TR><TH>Name</TH>…</TR></THead>
 *     <TBody>{rows.map(r => <TR key={r.id}>…</TR>)}</TBody>
 *   </DataTable>
 */

export function DataTable({ children, className = '' }) {
  return (
    <div className="overflow-x-auto w-full">
      <table className={`w-full text-sm ${className}`}>{children}</table>
    </div>
  )
}

export function THead({ children }) {
  return <thead className="sticky top-0 z-10 bg-surface-raised">{children}</thead>
}

export function TBody({ children }) {
  return <tbody>{children}</tbody>
}

export function TR({ children, onClick, className = '' }) {
  return (
    <tr
      onClick={onClick}
      className={`border-b border-surface-border transition-colors last:border-0
        ${onClick ? 'cursor-pointer' : ''}
        hover:bg-surface-overlay/30
        ${className}`}
    >
      {children}
    </tr>
  )
}

export function TH({ children, right = false, className = '' }) {
  return (
    <th className={`px-4 py-3 text-ink-faint font-medium text-[0.68rem] uppercase tracking-wider whitespace-nowrap
      ${right ? 'text-right' : 'text-left'} ${className}`}>
      {children}
    </th>
  )
}

export function TD({ children, right = false, className = '' }) {
  return (
    <td className={`px-4 py-3 ${right ? 'text-right' : ''} ${className}`}>
      {children}
    </td>
  )
}
