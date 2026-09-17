import React from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import DashboardHome from './DashboardHome'
import GamesPage from './GamesPage'
import GameTokensPage from './GameTokensPage'
import UsersPage from './UsersPage'
import CashierPage from './CashierPage'
import TransactionsPage from './TransactionsPage'
import SessionsPage from './SessionsPage'
import AuditLogPage from './AuditLogPage'
import RolesPage from './RolesPage'
import SystemOverviewPage from './SystemOverviewPage'
import GameModulesPage from './GameModulesPage'
import BingoModulePage from './BingoModulePage'
import DamaModulePage from './DamaModulePage'
import XoModulePage from './XoModulePage'
import LudoModulePage from './LudoModulePage'

// Map route path segment → human-readable label
const PAGE_LABELS = {
  dashboard:        'Dashboard',
  'system-overview': 'System Overview',
  'game-modules':    'Game Modules',
  'bingo-module':    'Bingo Module',
  'dama-module':     'Dama Module',
  'xo-module':       'XO Module',
  'ludo-module':     'Ludo Module',
  games:            'Games',
  'game-tokens':    'Game Tokens',
  users:            'Users',
  cashier:          'Cashier',
  transactions:     'Transactions',
  sessions:         'Sessions',
  'audit-log':      'Audit Log',
  roles:            'Roles & Access',
}

function TopBar() {
  const location = useLocation()
  const segment = location.pathname.replace(/^\//, '')
  const label = PAGE_LABELS[segment] || 'Admin'

  return (
    <div className="flex-shrink-0 h-14 bg-surface-base/80 backdrop-blur border-b border-surface-border px-4 md:px-8 flex items-center justify-between gap-4">
      {/* Breadcrumb — on mobile shifted right to clear hamburger */}
      <div className="flex items-center gap-2 text-sm text-ink-faint ml-12 md:ml-0">
        <span>Admin</span>
        <span>›</span>
        <span className="text-ink font-medium">{label}</span>
      </div>

      {/* Status indicator */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        <span className="text-ink-faint text-xs hidden sm:inline">System Online</span>
      </div>
    </div>
  )
}

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-surface-base overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopBar />

        {/* Scrollable page area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
            <Routes>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard"       element={<DashboardHome />} />
              <Route path="system-overview" element={<SystemOverviewPage />} />
              <Route path="game-modules"    element={<GameModulesPage />} />
              <Route path="bingo-module"    element={<BingoModulePage />} />
              <Route path="dama-module"     element={<DamaModulePage />} />
              <Route path="xo-module"       element={<XoModulePage />} />
              <Route path="ludo-module"     element={<LudoModulePage />} />
              <Route path="games"           element={<GamesPage />} />
              <Route path="game-tokens"     element={<GameTokensPage />} />
              <Route path="users"           element={<UsersPage />} />
              <Route path="cashier"         element={<CashierPage />} />
              <Route path="transactions"    element={<TransactionsPage />} />
              <Route path="sessions"        element={<SessionsPage />} />
              <Route path="audit-log"       element={<AuditLogPage />} />
              <Route path="roles"           element={<RolesPage />} />
              <Route path="*"               element={<Navigate to="dashboard" replace />} />
            </Routes>
          </div>
        </div>
      </main>
    </div>
  )
}
