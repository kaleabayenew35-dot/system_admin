import React from 'react'
import { Card, PageHeader, Badge } from '../components/ui'

const ROLES = [
  {
    name: 'Super Admin',
    description: 'Full system access. Can manage admins, roles, and all resources.',
    color: 'red',
    perms: ['All permissions', 'Manage roles', 'Manage admins', 'View audit log', 'System config'],
  },
  {
    name: 'Admin',
    description: 'Standard admin. Can manage users, transactions, games, and cashiers.',
    color: 'blue',
    perms: ['Manage users', 'Approve transactions', 'Manage games', 'Manage cashiers', 'View audit log'],
  },
  {
    name: 'Cashier',
    description: 'Restricted role for cashier staff. Can only handle balance operations.',
    color: 'green',
    perms: ['Deposit / withdraw user balance', 'View transaction list', 'View user list (read-only)'],
  },
  {
    name: 'Viewer',
    description: 'Read-only access to the dashboard and statistics.',
    color: 'gray',
    perms: ['View dashboard', 'View games (read-only)', 'View transactions (read-only)'],
  },
]

export default function RolesPage() {
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <PageHeader
        title="Roles & Access"
        subtitle="Role-based permission management"
        action={
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-semibold">
            🚧 Coming Soon
          </div>
        }
      />

      {/* Banner */}
      <div className="p-5 bg-brand-500/10 border border-brand-500/25 rounded-2xl flex items-start gap-4">
        <span className="text-3xl">🛡</span>
        <div>
          <p className="text-ink font-semibold">Role-based access control is planned for a future release</p>
          <p className="text-ink-muted text-sm mt-1">
            This page will allow you to assign fine-grained permission levels to admin accounts,
            restricting what each user can see and do in the panel.
          </p>
        </div>
      </div>

      {/* Role cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {ROLES.map(role => (
          <Card key={role.name} className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-ink font-semibold">{role.name}</h3>
              <Badge color={role.color}>{role.name}</Badge>
            </div>
            <p className="text-ink-muted text-sm">{role.description}</p>
            <ul className="flex flex-col gap-1 mt-1">
              {role.perms.map(p => (
                <li key={p} className="flex items-center gap-2 text-xs text-ink-muted">
                  <span className="text-green-400">✓</span> {p}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      {/* Planned features */}
      <Card>
        <h2 className="text-ink font-semibold text-sm mb-4">📌 Planned Features</h2>
        <ul className="flex flex-col gap-2 text-sm text-ink-muted">
          {[
            'Create and edit custom roles with per-permission toggles',
            'Assign roles to admin accounts',
            'Route-level and component-level access guards',
            'Audit log integration — log who changed what permission',
            'Invitation system for new admin accounts',
          ].map(f => (
            <li key={f} className="flex items-center gap-2">
              <span className="text-brand-400">◦</span> {f}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
