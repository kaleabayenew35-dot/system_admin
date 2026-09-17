import React, { useState } from 'react'
import { useToast } from '../context/ToastContext'
import { useCashier } from '../hooks/useCashier'
import Modal from '../components/Modal'
import Spinner from '../components/Spinner'
import { Button, Card, PageHeader, EmptyState, StatCard } from '../components/ui'
import { DataTable, THead, TBody, TR, TH, TD } from '../components/ui/Table'
import { Input, Select } from '../components/ui/Input'

const fmt = (d) => {
  if (!d) return '—'
  const dt = new Date(d)
  return dt.toLocaleDateString() + ' ' + dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
const EMPTY_FORM = { name: '', username: '', password: '', status: 'active' }

function CashierForm({ isEdit, form, setForm, showPass, setShowPass, saving, onSubmit, onCancel }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-ink-faint text-xs mb-1.5 uppercase tracking-wide font-medium">Full Name *</label>
          <Input placeholder="e.g. John Doe" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
        </div>
        <div>
          <label className="block text-ink-faint text-xs mb-1.5 uppercase tracking-wide font-medium">Username *</label>
          <Input placeholder="cashier_john" value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))} />
        </div>
        <div>
          <label className="block text-ink-faint text-xs mb-1.5 uppercase tracking-wide font-medium">
            {isEdit ? 'New Password' : 'Password *'}
          </label>
          <div className="relative">
            <Input type={showPass ? 'text' : 'password'} placeholder={isEdit ? 'Leave blank to keep' : 'Min 6 chars'}
              value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} className="pr-10" />
            <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink text-sm">
              {showPass ? '🙈' : '👁'}
            </button>
          </div>
        </div>
        {isEdit && (
          <div>
            <label className="block text-ink-faint text-xs mb-1.5 uppercase tracking-wide font-medium">Status</label>
            <Select className="w-full" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
          </div>
        )}
      </div>
      <div className="flex gap-2 pt-1">
        <Button loading={saving} className="flex-1 justify-center" onClick={onSubmit}>
          {isEdit ? 'Save Changes' : 'Add Cashier'}
        </Button>
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  )
}

export default function CashierPage() {
  const toast = useToast()
  const { cashiers, adminBalance, loading, refetch, addCashier, updateCashier, deleteCashier, deposit, withdraw } = useCashier()
  const [saving, setSaving]   = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [opBusy, setOpBusy]   = useState(null)

  const [addOpen, setAddOpen]     = useState(false)
  const [editOpen, setEditOpen]   = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [opModal, setOpModal]     = useState(null)
  const [opAmount, setOpAmount]   = useState('')
  const [form, setForm]           = useState(EMPTY_FORM)
  const [showPass, setShowPass]   = useState(false)

  const handleAdd = async () => {
    if (!form.name.trim() || !form.username.trim() || !form.password.trim()) {
      return toast.error('Name, username and password are required')
    }
    setSaving(true)
    try { await addCashier({ name: form.name, username: form.username, password: form.password, balance: 0 }); setAddOpen(false); setForm(EMPTY_FORM) }
    catch (err) { toast.error(err.response?.data?.error || 'Failed to add') }
    finally { setSaving(false) }
  }

  const openEdit = (c) => {
    setEditTarget(c); setForm({ name: c.name, username: c.username, password: '', status: c.status }); setShowPass(false); setEditOpen(true)
  }

  const handleEdit = async () => {
    if (!form.name.trim() || !form.username.trim()) return toast.error('Name and username are required')
    setSaving(true)
    try { await updateCashier(editTarget.id, { name: form.name, username: form.username, password: form.password || undefined, status: form.status }); setEditOpen(false) }
    catch (err) { toast.error(err.response?.data?.error || 'Failed to update') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    setDeleting(id)
    try { await deleteCashier(id) }
    catch { toast.error('Delete failed') }
    finally { setDeleting(null) }
  }

  const handleOp = async () => {
    const amt = parseFloat(opAmount)
    if (!amt || amt <= 0) return toast.error('Enter a valid amount')
    setOpBusy(opModal.cashier.id)
    try {
      if (opModal.type === 'deposit') await deposit(opModal.cashier.id, amt)
      else await withdraw(opModal.cashier.id, amt)
      setOpModal(null); setOpAmount('')
    } catch (err) { toast.error(err.response?.data?.error || 'Operation failed') }
    finally { setOpBusy(null) }
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <PageHeader
        title="Cashier"
        subtitle="Manage cashier accounts and their balances"
        action={
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl border border-surface-border bg-surface-raised text-xs font-semibold flex items-center gap-1.5">
              <span className="text-ink-faint">Admin Balance:</span>
              <span className="text-green-400">${adminBalance.toFixed(2)}</span>
            </div>
            <Button onClick={() => { setForm(EMPTY_FORM); setShowPass(false); setAddOpen(true) }}>+ Add Cashier</Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Total Cashiers" value={cashiers.length}                                    color="text-ink" />
        <StatCard label="Active"         value={cashiers.filter(c => c.status === 'active').length} color="text-green-400" />
        <StatCard label="Inactive"       value={cashiers.filter(c => c.status !== 'active').length} color="text-red-400" />
      </div>

      {/* Table */}
      <Card noPad className="overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16"><Spinner /></div>
        ) : cashiers.length === 0 ? (
          <EmptyState icon="🏦" title="No cashiers yet" action={<Button onClick={() => { setForm(EMPTY_FORM); setAddOpen(true) }}>+ Add First Cashier</Button>} />
        ) : (
          <DataTable>
            <THead>
              <TR><TH>#</TH><TH>Name</TH><TH>Username</TH><TH>Balance</TH><TH>Status</TH><TH>Created</TH><TH right>Actions</TH></TR>
            </THead>
            <TBody>
              {cashiers.map(c => (
                <TR key={c.id}>
                  <TD><span className="text-ink-faint font-mono text-xs">#{c.id}</span></TD>
                  <TD>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-brand-600 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {c.name?.[0]?.toUpperCase()}
                      </div>
                      <span className="text-ink font-medium">{c.name}</span>
                    </div>
                  </TD>
                  <TD><span className="text-ink-muted font-mono text-xs">@{c.username}</span></TD>
                  <TD><span className="text-green-400 font-bold">${Number(c.balance || 0).toFixed(2)}</span></TD>
                  <TD><span className={c.status === 'active' ? 'badge-active' : 'badge-inactive'}>{c.status}</span></TD>
                  <TD><span className="text-ink-faint text-xs">{fmt(c.created_at)}</span></TD>
                  <TD right>
                    <div className="flex gap-1 justify-end">
                      <button title="Deposit" onClick={() => { setOpModal({ type: 'deposit', cashier: c }); setOpAmount('') }}
                        className="w-8 h-8 flex items-center justify-center bg-green-500/15 hover:bg-green-500/30 text-green-400 rounded-lg border border-green-500/25 transition-all">💰</button>
                      <button title="Withdraw" onClick={() => { setOpModal({ type: 'withdraw', cashier: c }); setOpAmount('') }}
                        className="w-8 h-8 flex items-center justify-center bg-red-500/15 hover:bg-red-500/30 text-red-400 rounded-lg border border-red-500/25 transition-all">💸</button>
                      <button title="Edit" onClick={() => openEdit(c)}
                        className="w-8 h-8 flex items-center justify-center bg-brand-500/15 hover:bg-brand-500/30 text-brand-400 rounded-lg border border-brand-500/25 transition-all">✏️</button>
                      <button title="Delete" onClick={() => handleDelete(c.id)} disabled={deleting === c.id}
                        className="w-8 h-8 flex items-center justify-center bg-red-900/30 hover:bg-red-900/60 text-red-400 rounded-lg border border-red-800/40 transition-all">
                        {deleting === c.id ? <Spinner size="sm" /> : '🗑️'}
                      </button>
                    </div>
                  </TD>
                </TR>
              ))}
            </TBody>
          </DataTable>
        )}
      </Card>

      {/* Add Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add New Cashier">
        <CashierForm isEdit={false} form={form} setForm={setForm} showPass={showPass} setShowPass={setShowPass} saving={saving}
          onSubmit={handleAdd} onCancel={() => setAddOpen(false)} />
      </Modal>

      {/* Edit Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title={`Edit: ${editTarget?.name}`}>
        <CashierForm isEdit={true} form={form} setForm={setForm} showPass={showPass} setShowPass={setShowPass} saving={saving}
          onSubmit={handleEdit} onCancel={() => setEditOpen(false)} />
      </Modal>

      {/* Deposit / Withdraw Modal */}
      <Modal open={!!opModal} onClose={() => { setOpModal(null); setOpAmount('') }}
        title={opModal?.type === 'deposit' ? '💰 Deposit to Cashier' : '💸 Withdraw from Cashier'}>
        {opModal && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 p-3 bg-surface-overlay/40 rounded-xl">
              <div className="w-9 h-9 bg-brand-600 rounded-full flex items-center justify-center font-bold text-sm">{opModal.cashier.name?.[0]?.toUpperCase()}</div>
              <div>
                <p className="text-ink font-medium text-sm">{opModal.cashier.name}</p>
                <p className="text-ink-faint text-xs">@{opModal.cashier.username} · Balance: <span className="text-green-400 font-semibold">${Number(opModal.cashier.balance || 0).toFixed(2)}</span></p>
              </div>
            </div>
            <div>
              <label className="block text-ink-faint text-xs mb-1.5 uppercase tracking-wide font-medium">Amount ($) *</label>
              <Input type="number" min="0.01" step="0.01" placeholder="e.g. 500.00" value={opAmount} onChange={e => setOpAmount(e.target.value)} autoFocus />
              {opModal.type === 'withdraw' && opAmount && parseFloat(opAmount) > (opModal.cashier.balance || 0) && (
                <p className="text-red-400 text-xs mt-1">⚠ Exceeds cashier balance</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button loading={!!opBusy} disabled={!opAmount} className="flex-1 justify-center"
                style={{ background: opModal.type === 'deposit' ? 'rgb(22 163 74)' : 'rgb(220 38 38)' }} onClick={handleOp}>
                {opModal.type === 'deposit' ? '💰 Confirm Deposit' : '💸 Confirm Withdraw'}
              </Button>
              <Button variant="secondary" onClick={() => { setOpModal(null); setOpAmount('') }}>Cancel</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
