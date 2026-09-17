import React, { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV_ITEMS = [
  { to: '/dashboard',       label: 'Dashboard',       icon: '⬡' },
  { to: '/system-overview',  label: 'System Overview', icon: '🧩' },
  { to: '/game-modules',     label: 'Game Modules',    icon: '🎯' },
  { to: '/games',           label: 'Games',           icon: '🎮' },
  { to: '/game-tokens',     label: 'Game Tokens',     icon: '🔑' },
  { to: '/users',           label: 'Users',           icon: '👥' },
  { to: '/cashier',         label: 'Cashier',         icon: '🏦' },
  { to: '/transactions',    label: 'Transactions',    icon: '💳' },
  { to: '/sessions',        label: 'Sessions',        icon: '📊' },
  // Future stubs
  { to: '/audit-log',       label: 'Audit Log',       icon: '📋', stub: true },
  { to: '/roles',           label: 'Roles & Access',  icon: '🛡', stub: true },
]

function NavItem({ item, onClick }) {
  return (
    <NavLink
      to={item.to}
      onClick={onClick}
      className={({ isActive }) =>
        `nav-link w-full ${isActive ? 'active' : ''} ${item.stub ? 'opacity-40 pointer-events-none' : ''}`
      }
      tabIndex={item.stub ? -1 : 0}
      title={item.stub ? 'Coming soon' : undefined}
    >
      <span className="text-base w-5 text-center flex-shrink-0">{item.icon}</span>
      <span className="flex-1">{item.label}</span>
      {item.stub && (
        <span className="text-[0.6rem] font-semibold bg-surface-overlay text-ink-faint px-1.5 py-0.5 rounded-full">
          soon
        </span>
      )}
    </NavLink>
  )
}

/* ── Desktop sidebar content ──────────────────────────────────────────── */
function SidebarContent({ onNavClick }) {
  const { user, logout } = useAuth()

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-surface-border flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center text-lg shadow-glow-brand flex-shrink-0">
            🎯
          </div>
          <div>
            <p className="text-ink font-bold text-sm leading-tight">TG Games</p>
            <p className="text-brand-400 text-xs">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
        {NAV_ITEMS.map(item => (
          <NavItem key={item.to} item={item} onClick={onNavClick} />
        ))}
      </nav>

      {/* User + logout */}
      <div className="px-3 py-4 border-t border-surface-border flex-shrink-0">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-surface-overlay/40 mb-2">
          <div className="w-8 h-8 bg-brand-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
            {user?.username?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-ink text-xs font-medium truncate">{user?.username || 'Admin'}</p>
            <p className="text-ink-faint text-xs">Administrator</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="nav-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <span className="text-base w-5 text-center flex-shrink-0">⎋</span>
          Logout
        </button>
      </div>
    </div>
  )
}

/* ── Main export ──────────────────────────────────────────────────────── */
export default function Sidebar() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const location = useLocation()

  // Close drawer on route change
  useEffect(() => { setDrawerOpen(false) }, [location.pathname])

  // Close drawer on outside click / escape
  useEffect(() => {
    if (!drawerOpen) return
    const handleKey = (e) => { if (e.key === 'Escape') setDrawerOpen(false) }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [drawerOpen])

  return (
    <>
      {/* ── Desktop sidebar (md+) ── */}
      <aside className="hidden md:flex w-60 flex-shrink-0 flex-col bg-surface-raised border-r border-surface-border">
        <SidebarContent />
      </aside>

      {/* ── Mobile: hamburger button ── */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-surface-raised border border-surface-border rounded-xl flex items-center justify-center text-ink-muted hover:text-ink transition-colors shadow-lg"
        onClick={() => setDrawerOpen(o => !o)}
        aria-label="Toggle navigation"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          {drawerOpen
            ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          }
        </svg>
      </button>

      {/* ── Mobile: overlay backdrop ── */}
      {drawerOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* ── Mobile: slide-in drawer ── */}
      <aside className={`md:hidden fixed inset-y-0 left-0 z-50 w-72 bg-surface-raised border-r border-surface-border
        transform transition-transform duration-200 ease-out
        ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <SidebarContent onNavClick={() => setDrawerOpen(false)} />
      </aside>
    </>
  )
}
