import React, { useState, useRef, useEffect } from 'react'
import { useToast } from '../context/ToastContext'
import { useUsers } from '../hooks/useUsers'
import Modal from '../components/Modal'
import Spinner from '../components/Spinner'
import { Button, Card, PageHeader, EmptyState } from '../components/ui'
import { DataTable, THead, TBody, TR, TH, TD } from '../components/ui/Table'
import { Input } from '../components/ui/Input'

// ── Per-row action dropdown ─────────────────────────────────────────────────
function ActionMenu({ user, onEdit, onResetPassword, onDeposit, onWithdraw, onDelete }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const pick = (fn) => { setOpen(false); fn(user) }

  const items = [
    { label: 'Edit Username',   icon: '✏️',  color: 'text-brand-300', fn: onEdit },
    { label: 'Reset Password',  icon: '🔑',  color: 'text-amber-400', fn: onResetPassword },
    null, // divider
    { label: 'Deposit',         icon: '💰',  color: 'text-green-400', fn: onDeposit },
    { label: 'Withdraw',        icon: '💸',  color: 'text-red-400',   fn: onWithdraw },
    null,
    { label: 'Delete User',     icon: '🗑️',  color: 'text-red-500',   fn: onDelete, danger: true },
  ]

  return (
    <div className="relative" ref={ref}>
      <Button variant="secondary" size="sm" onClick={() => setOpen(o => !o)}>
        Actions
        <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </Button>
      {open && (
        <div className="absolute right-0 z-30 mt-1.5 w-44 bg-surface-raised border border-surface-border rounded-xl shadow-2xl py-1 overflow-hidden">
          {items.map((item, i) =>
            item === null
              ? <div key={i} className="my-1 border-t border-surface-border" />
              : (
                <button
                  key={item.label}
                  onClick={() => pick(item.fn)}
                  className={`w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-surface-overlay transition-colors ${item.danger ? 'text-red-500 hover:text-red-400' : 'text-ink-muted hover:text-ink'}`}
                >
                  <span className={item.color}>{item.icon}</span>
                  {item.label}
                </button>
              )
          )}
        </div>
      )}
    </div>
  )
}

// ── Main Page ───────────────────────────────────────────────────────────────
export default function UsersPage() {
  const toast = useToast()
  const { users, adminBalance, loading, refetch, updateUsername, resetPassword, deposit, withdraw, deleteUser } = useUsers()

  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)
  const [target, setTarget] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deletingStatus, setDeletingStatus] = useState('confirm')
  const [newUsername, setNewUsername] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [amount, setAmount] = useState('')

  const open = (type, user) => {
    setTarget(user); setModal(type)
    setNewUsername(user.username); setNewPassword('')
    setAmount(''); setShowPass(false); setDeletingStatus('confirm')
  }
  const close = () => { setModal(null); setTarget(null) }

  const wrap = async (fn) => {
    setSaving(true)
    try { await fn(); close() }
    catch (err) { toast.error(err.response?.data?.error || 'Operation failed') }
    finally { setSaving(false) }
  }

  const filtered = users.filter(u =>
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone_number?.includes(search) ||
    String(u.id).includes(search)
  )

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <PageHeader
        title="Users"
        subtitle="Manage all registered users"
        action={
          <div className="flex gap-2">
            <div className="px-3 py-1.5 rounded-xl border border-surface-border bg-surface-raised text-xs font-semibold flex items-center gap-1.5">
              <span className="text-ink-faint">Admin Balance:</span>
              <span className="text-green-400">${adminBalance.toFixed(2)}</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl border border-surface-border bg-surface-raised text-xs font-semibold flex items-center gap-1.5">
              <span className="text-ink-faint">Users:</span>
              <span className="text-brand-300">{users.length}</span>
            </div>
          </div>
        }
      />

      {/* Search + refresh */}
      <div className="flex gap-3">
        <Input className="max-w-md" placeholder="Search by username, phone, or ID..." value={search} onChange={e => setSearch(e.target.value)} />
        <Button variant="secondary" onClick={refetch}>⟳ Refresh</Button>
      </div>

      {/* Table */}
      <Card noPad className="overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16"><Spinner /></div>
        ) : filtered.length === 0 ? (
          <EmptyState icon="👥" title={search ? 'No users match your search' : 'No users registered yet'} />
        ) : (
          <DataTable>
            <THead>
              <TR><TH>ID</TH><TH>User</TH><TH>Phone</TH><TH>Balance</TH><TH>Joined</TH><TH right>Actions</TH></TR>
            </THead>
            <TBody>
              {filtered.map(u => (
                <TR key={u.id}>
                  <TD><span className="text-ink-faint font-mono text-xs">#{u.id}</span></TD>
                  <TD>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-brand-600 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {u.username?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="text-ink font-medium">{u.username}</p>
                        <p className="text-ink-faint text-xs">TG: {u.telegram_id}</p>
                      </div>
                    </div>
                  </TD>
                  <TD><span className="text-ink-muted font-mono text-xs">{u.phone_number || '—'}</span></TD>
                  <TD><span className="text-green-400 font-semibold">${(u.balance ?? 0).toFixed(2)}</span></TD>
                  <TD><span className="text-ink-faint text-xs">{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</span></TD>
                  <TD right>
                    <ActionMenu
                      user={u}
                      onEdit={u => open('edit', u)}
                      onResetPassword={u => open('reset-password', u)}
                      onDeposit={u => open('deposit', u)}
                      onWithdraw={u => open('withdraw', u)}
                      onDelete={u => open('delete', u)}
                    />
                  </TD>
                </TR>
              ))}
            </TBody>
          </DataTable>
        )}
      </Card>

      {/* Edit Username */}
      <Modal open={modal === 'edit'} onClose={close} title="Edit Username">
        <div className="flex flex-col gap-4">
          <UserInfo user={target} />
          <div>
            <label className="block text-ink-faint text-xs mb-1.5 uppercase tracking-wide font-medium">New Username</label>
            <Input placeholder="3–20 characters" value={newUsername} onChange={e => setNewUsername(e.target.value)} />
          </div>
          <ModalActions saving={saving} label="✏️ Update Username" onConfirm={() => wrap(() => updateUsername(target.id, newUsername))} onCancel={close} />
        </div>
      </Modal>

      {/* Reset Password */}
      <Modal open={modal === 'reset-password'} onClose={close} title="Reset Password">
        <div className="flex flex-col gap-4">
          <UserInfo user={target} icon="🔑" bg="bg-amber-700" />
          <div>
            <label className="block text-ink-faint text-xs mb-1.5 uppercase tracking-wide font-medium">New Password</label>
            <div className="relative">
              <Input type={showPass ? 'text' : 'password'} placeholder="Min. 6 characters" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="pr-10" />
              <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink text-sm">
                {showPass ? '🙈' : '👁'}
              </button>
            </div>
          </div>
          <ModalActions saving={saving} label="🔑 Reset Password" confirmStyle={{ background: 'rgb(202 138 4)' }}
            onConfirm={() => wrap(async () => {
              if (newPassword.length < 6) throw new Error('Minimum 6 characters')
              await resetPassword(target.id, newPassword)
            })}
            onCancel={close}
          />
        </div>
      </Modal>

      {/* Deposit */}
      <Modal open={modal === 'deposit'} onClose={close} title="Deposit Balance">
        <div className="flex flex-col gap-4">
          <UserInfo user={target} icon="💰" bg="bg-green-700" sub={`Balance: $${(target?.balance ?? 0).toFixed(2)}`} />
          <div>
            <label className="block text-ink-faint text-xs mb-1.5 uppercase tracking-wide font-medium">Amount ($)</label>
            <Input type="number" min="0.01" step="0.01" placeholder="e.g. 50.00" value={amount} onChange={e => setAmount(e.target.value)} />
          </div>
          <ModalActions saving={saving} label="💰 Confirm Deposit" confirmStyle={{ background: 'rgb(22 163 74)' }}
            onConfirm={() => wrap(() => deposit(target.id, parseFloat(amount)))} onCancel={close}
          />
        </div>
      </Modal>

      {/* Withdraw */}
      <Modal open={modal === 'withdraw'} onClose={close} title="Withdraw Balance">
        <div className="flex flex-col gap-4">
          <UserInfo user={target} icon="💸" bg="bg-red-700" sub={`Balance: $${(target?.balance ?? 0).toFixed(2)}`} />
          <div>
            <label className="block text-ink-faint text-xs mb-1.5 uppercase tracking-wide font-medium">Amount ($)</label>
            <Input type="number" min="0.01" step="0.01" placeholder="e.g. 20.00" value={amount} onChange={e => setAmount(e.target.value)} />
            {target && amount && parseFloat(amount) > (target.balance ?? 0) && (
              <p className="text-red-400 text-xs mt-1">⚠ Exceeds current balance</p>
            )}
          </div>
          <ModalActions saving={saving} label="💸 Confirm Withdraw" confirmStyle={{ background: 'rgb(220 38 38)' }}
            onConfirm={() => wrap(() => withdraw(target.id, parseFloat(amount)))} onCancel={close}
          />
        </div>
      </Modal>

      {/* Delete */}
      <Modal open={modal === 'delete'} onClose={close} title="Confirm Deletion">
        <div className="flex flex-col items-center text-center p-2 gap-4">
          {deletingStatus === 'confirm' && (
            <>
              <div className="text-5xl">⚠️</div>
              <div>
                <p className="text-ink text-lg font-medium">Delete "{target?.username}"?</p>
                <p className="text-ink-faint text-sm mt-1">This cannot be undone. All data will be removed.</p>
              </div>
              <div className="flex gap-3 w-full mt-2">
                <Button variant="danger" className="flex-1 py-2 justify-center"
                  onClick={async () => {
                    setDeletingStatus('loading')
                    try { await deleteUser(target.id); setDeletingStatus('success'); setTimeout(close, 1500) }
                    catch (err) { toast.error(err.response?.data?.error || 'Failed'); setDeletingStatus('confirm') }
                  }}
                >
                  Yes, Delete
                </Button>
                <Button variant="secondary" className="flex-1 py-2 justify-center" onClick={close}>Cancel</Button>
              </div>
            </>
          )}
          {deletingStatus === 'loading' && <div className="py-8 flex flex-col items-center gap-3"><Spinner size="lg" /><p className="text-ink-muted text-sm">Deleting...</p></div>}
          {deletingStatus === 'success' && (
            <div className="py-6 flex flex-col items-center gap-3 animate-scale-in">
              <div className="w-14 h-14 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center text-green-400 text-2xl">✓</div>
              <p className="text-ink font-semibold">User Deleted</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}

/* ── Shared sub-components ─────────────────────────────────────────────── */
function UserInfo({ user, icon, bg = 'bg-brand-600', sub }) {
  if (!user) return null
  return (
    <div className="flex items-center gap-3 p-3 bg-surface-overlay/40 rounded-xl">
      <div className={`w-9 h-9 ${bg} rounded-full flex items-center justify-center text-sm flex-shrink-0`}>
        {icon || user.username?.[0]?.toUpperCase()}
      </div>
      <div>
        <p className="text-ink text-sm font-medium">{user.username}</p>
        <p className="text-ink-faint text-xs">{sub || `ID: ${user.id}`}</p>
      </div>
    </div>
  )
}

function ModalActions({ saving, label, onConfirm, onCancel, confirmStyle }) {
  return (
    <div className="flex gap-2 pt-1">
      <Button loading={saving} className="flex-1 justify-center" style={confirmStyle} onClick={onConfirm}>{label}</Button>
      <Button variant="secondary" onClick={onCancel}>Cancel</Button>
    </div>
  )
}
