import React, { useEffect } from 'react'

export default function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    if (open) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h3 className="text-white font-semibold text-base">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-800 transition-colors"
          >
            ×
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}
