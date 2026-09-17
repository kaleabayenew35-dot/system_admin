import React from 'react'
import Spinner from '../Spinner'

/**
 * Button primitive
 * variant: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost'
 * size:    'sm' | 'md' | 'lg'
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  ...props
}) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all cursor-pointer border disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary:   'bg-brand-600 hover:bg-brand-500 text-white border-transparent',
    secondary: 'bg-surface-raised hover:bg-surface-overlay text-ink border-surface-border',
    danger:    'bg-red-500/15 hover:bg-red-500/30 text-red-400 border-red-500/25',
    success:   'bg-green-500/15 hover:bg-green-500/30 text-green-400 border-green-500/25',
    ghost:     'bg-transparent hover:bg-white/5 text-ink-muted border-transparent',
  }

  const sizes = {
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  }

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  )
}
