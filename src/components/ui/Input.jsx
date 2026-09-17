import React from 'react'

/**
 * Input primitive — consistent styled text input.
 */
export const Input = React.forwardRef(function Input({ className = '', ...props }, ref) {
  return (
    <input
      ref={ref}
      className={`w-full bg-surface-raised border border-surface-border text-ink rounded-xl px-4 py-2.5 text-sm
        placeholder:text-ink-faint outline-none transition-all
        focus:border-brand-500 focus:ring-1 focus:ring-brand-500
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}`}
      {...props}
    />
  )
})

export const Select = React.forwardRef(function Select({ children, className = '', ...props }, ref) {
  return (
    <select
      ref={ref}
      className={`bg-surface-raised border border-surface-border text-ink rounded-xl px-4 py-2.5 text-sm
        outline-none transition-all cursor-pointer
        focus:border-brand-500 focus:ring-1 focus:ring-brand-500
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}`}
      {...props}
    >
      {children}
    </select>
  )
})

export const Textarea = React.forwardRef(function Textarea({ className = '', ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={`w-full bg-surface-raised border border-surface-border text-ink rounded-xl px-4 py-2.5 text-sm
        placeholder:text-ink-faint outline-none transition-all resize-none
        focus:border-brand-500 focus:ring-1 focus:ring-brand-500
        ${className}`}
      {...props}
    />
  )
})
