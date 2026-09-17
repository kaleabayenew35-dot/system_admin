import React, { useState } from 'react'
import { useToast } from '../context/ToastContext'
import { useTransactions } from '../hooks/useTransactions'
import Modal from '../components/Modal'
import Spinner from '../components/Spinner'
import { Button, Card, PageHeader, EmptyState, StatCard } from '../components/ui'
import { DataTable, THead, TBody, TR, TH, TD } from '../components/ui/Table'
import { Input, Textarea } from '../components/ui/Input'

// ── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (d) => {
  if (!d) return '—'
  const dt = new Date(d)
  return dt.toLocaleDateString() + ' ' + dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
const isToday = (d) => { if (!d) return false; const dt = new Date(d), n = new Date(); return dt.toDateString() === n.toDateString() }
const inRange = (d, from, to) => {
  if (!d) return false; const dt = new Date(d)
  if (from && dt < new Date(from + 'T00:00:00')) return false
  if (to   && dt > new Date(to   + 'T23:59:59')) return false
  return true
}

// ── Badge components ─────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  if (status === 'done')     return <span className="badge badge-green">✅ Successful</span>
  if (status === 'rejected') return <span className="badge badge-red">❌ Rejected</span>
  return <span className="badge badge-yellow">⏳ Pending</span>
}
const TypeBadge = ({ type }) =>
  type === 'deposit'
    ? <span className="badge badge-blue">💰 Deposit</span>
    : <span className="badge" style={{ background: 'rgb(168 85 247 / 0.15)', color: '#c084fc', borderColor: 'rgb(168 85 247 / 0.25)' }}>💸 Withdraw</span>

const CashierTypeBadge = ({ type }) =>
  type === 'cashier_deposit'
    ? <span className="badge" style={{ background: 'rgb(16 185 129 / 0.15)', color: '#6ee7b7', borderColor: 'rgb(16 185 129 / 0.25)' }}>📥 Admin Deposit</span>
    : <span className="badge" style={{ background: 'rgb(249 115 22 / 0.15)', color: '#fdba74', borderColor: 'rgb(249 115 22 / 0.25)' }}>📤 Admin Withdraw</span>

const STATUS_TABS = [
  { key: 'all',     label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'done',    label: 'Successful' },
  { key: 'rejected',label: 'Rejected' },
  { key: 'today',   label: 'Today' },
  { key: 'custom',  label: 'Custom Date' },
]

// ── Main Page ────────────────────────────────────────────────────────────────
export default function TransactionsPage() {
  const toast = useToast()
  const { transactions, cashierTransactions, adminBalance, summary, loading, refetch, approve, reject } = useTransactions()
  const [mainTab, setMainTab] = useState('user')
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [updating, setUpdating] = useState(null)

  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectTarget, setRejectTarget] = useState(null)
  const [rejectReason, setRejectReason] = useState('')

  const handleApprove = async (tx) => {
    setUpdating(tx.id)
    try { await approve(tx.id); if (selected?.id === tx.id) setDetailOpen(false) }
    catch (err) { toast.error(err.response?.data?.error || 'Approve failed') }
    finally { setUpdating(null) }
  }

  const openReject = (tx) => { setRejectTarget(tx); setRejectReason(''); setRejectOpen(true) }

  const handleReject = async () => {
    if (!rejectReason.trim()) return toast.error('Enter a rejection reason')
    setUpdating(rejectTarget.id)
    try {
      await reject(rejectTarget.id, rejectReason.trim())
      setRejectOpen(false); if (selected?.id === rejectTarget.id) setDetailOpen(false)
    } catch (err) { toast.error(err.response?.data?.error || 'Reject failed') }
    finally { setUpdating(null) }
  }

  // Filtering
  const filterList = (list, isUser) => list.filter(tx => {
    if (isUser) {
      if (activeTab === 'pending'  && tx.status !== 'pending')  return false
      if (activeTab === 'done'     && tx.status !== 'done')     return false
      if (activeTab === 'rejected' && tx.status !== 'rejected') return false
    } else {
      if (activeTab === 'pending') return false
      if (activeTab === 'done'     && tx.type !== 'cashier_deposit')  return false
      if (activeTab === 'rejected' && tx.type !== 'cashier_withdraw') return false
    }
    if (activeTab === 'today'  && !isToday(tx.created_at))  return false
    if (activeTab === 'custom' && !inRange(tx.created_at, dateFrom, dateTo)) return false
    if (search) {
      const q = search.toLowerCase()
      return isUser
        ? (tx.username?.toLowerCase().includes(q) || tx.phone_number?.includes(q) || tx.transaction_id?.toLowerCase().includes(q) || tx.method?.toLowerCase().includes(q) || String(tx.id).includes(q))
        : (tx.cashier_name?.toLowerCase().includes(q) || tx.cashier_username?.toLowerCase().includes(q) || tx.note?.toLowerCase().includes(q) || String(tx.id).includes(q))
    }
    return true
  })

  const filteredUsers    = filterList(transactions, true)
  const filteredCashiers = filterList(cashierTransactions, false)
  const activeList       = mainTab === 'user' ? filteredUsers : filteredCashiers

  const userCounts = {
    all: transactions.length, pending: transactions.filter(t => t.status === 'pending').length,
    done: transactions.filter(t => t.status === 'done').length, rejected: transactions.filter(t => t.status === 'rejected').length,
    today: transactions.filter(t => isToday(t.created_at)).length, custom: activeTab === 'custom' ? filteredUsers.length : 0,
  }
  const cashierCounts = {
    all: cashierTransactions.length, pending: 0,
    done: cashierTransactions.filter(t => t.type === 'cashier_deposit').length,
    rejected: cashierTransactions.filter(t => t.type === 'cashier_withdraw').length,
    today: cashierTransactions.filter(t => isToday(t.created_at)).length,
    custom: activeTab === 'custom' ? filteredCashiers.length : 0,
  }
  const counts = mainTab === 'user' ? userCounts : cashierCounts

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader title="Transactions" subtitle="Manage all user and cashier transaction logs" />
        <div className="flex flex-wrap items-center gap-3">
          {/* Main tab switcher */}
          <div className="flex bg-surface-raised border border-surface-border rounded-xl p-1">
            {[{ key: 'user', label: '👤 User' }, { key: 'cashier', label: '🏦 Cashier' }].map(t => (
              <button key={t.key} onClick={() => { setMainTab(t.key); setActiveTab('all'); setSearch('') }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${mainTab === t.key ? 'bg-brand-600 text-white shadow' : 'text-ink-muted hover:text-ink'}`}>
                {t.label}
              </button>
            ))}
          </div>
          <div className="px-3 py-1.5 rounded-xl border border-surface-border bg-surface-raised text-xs font-semibold flex items-center gap-1.5">
            <span className="text-ink-faint">Admin Balance:</span>
            <span className="text-green-400">${adminBalance.toFixed(2)}</span>
          </div>
          <Button variant="secondary" onClick={refetch}>⟳ Refresh</Button>
        </div>
      </div>

      {/* Balance summary (user tab only) */}
      {mainTab === 'user' && summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Total Balance',   value: `$${Number(summary.total_balance   || 0).toFixed(2)}`, color: 'text-ink' },
            { label: 'Total Deposited', value: `$${Number(summary.total_deposited || 0).toFixed(2)}`, color: 'text-green-400' },
            { label: 'Total Withdrawn', value: `$${Number(summary.total_withdrawn || 0).toFixed(2)}`, color: 'text-red-400' },
            { label: 'Pending Amount',  value: `$${Number(summary.pending_amount  || 0).toFixed(2)}`, color: 'text-amber-400' },
            { label: 'Approved TX',     value: summary.done_count  || 0,                              color: 'text-green-400' },
            { label: 'Total Users',     value: summary.total_users || 0,                              color: 'text-brand-300' },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-3 border border-surface-border bg-surface-raised/60 flex flex-col gap-1">
              <p className="text-ink-faint text-xs leading-tight">{s.label}</p>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Count cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label={mainTab === 'user' ? 'Total User TX' : 'Total Cashier TX'} value={counts.all}      color="text-ink" />
        <StatCard label={mainTab === 'user' ? 'Pending'       : 'Pending Ops'}      value={counts.pending}  color="text-amber-400" />
        <StatCard label={mainTab === 'user' ? 'Successful'    : 'Deposits'}         value={counts.done}     color="text-green-400" />
        <StatCard label={mainTab === 'user' ? 'Rejected'      : 'Withdrawals'}      value={counts.rejected} color="text-red-400" />
      </div>

      {/* Filter tabs + search */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex gap-1 bg-surface-raised border border-surface-border rounded-xl p-1 flex-wrap">
            {STATUS_TABS.filter(t => !(mainTab === 'cashier' && t.key === 'pending')).map(tab => {
              let label = tab.label
              if (mainTab === 'cashier') {
                if (tab.key === 'done')     label = 'Deposits'
                if (tab.key === 'rejected') label = 'Withdrawals'
              }
              return (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap
                    ${activeTab === tab.key ? 'bg-surface-overlay text-ink shadow' : 'text-ink-faint hover:text-ink-muted'}`}>
                  {label}
                  {tab.key !== 'custom' && <span className={`ml-1.5 text-xs ${activeTab === tab.key ? 'text-ink-faint' : 'text-ink-faint/50'}`}>{counts[tab.key]}</span>}
                </button>
              )
            })}
          </div>
          <div className="relative flex-1 min-w-[200px] max-w-sm ml-auto">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint text-sm">🔍</span>
            <Input className="pl-9"
              placeholder={mainTab === 'user' ? 'Search username, TX ID...' : 'Search cashier, note...'}
              value={search} onChange={e => setSearch(e.target.value)} />
            {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink text-lg leading-none">×</button>}
          </div>
        </div>

        {activeTab === 'custom' && (
          <div className="flex items-center flex-wrap gap-3 p-4 bg-surface-raised border border-surface-border rounded-xl">
            <span className="text-cyan-400 text-sm font-medium">📅 Date Range:</span>
            {[['From', dateFrom, setDateFrom], ['To', dateTo, setDateTo]].map(([lbl, val, set]) => (
              <div key={lbl}>
                <label className="block text-ink-faint text-xs mb-1">{lbl}</label>
                <Input type="date" className="w-auto text-xs py-1.5" value={val} onChange={e => set(e.target.value)} />
              </div>
            ))}
            <span className="text-ink-faint text-xs mt-4">{activeList.length} results</span>
            {(dateFrom || dateTo) && <Button variant="secondary" size="sm" className="mt-4" onClick={() => { setDateFrom(''); setDateTo('') }}>Clear</Button>}
          </div>
        )}
      </div>

      {/* Table */}
      <Card noPad className="overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16"><Spinner /></div>
        ) : activeList.length === 0 ? (
          <EmptyState icon="📋" title={search ? 'No transactions match your search' : 'No transactions found'} />
        ) : mainTab === 'user' ? (
          <DataTable>
            <THead>
              <TR><TH>#</TH><TH>User</TH><TH>Type</TH><TH>Amount</TH><TH>Method</TH><TH>TX ID</TH><TH>Status</TH><TH>Date</TH><TH right>Actions</TH></TR>
            </THead>
            <TBody>
              {filteredUsers.map(tx => (
                <TR key={tx.id} onClick={() => { setSelected(tx); setDetailOpen(true) }}>
                  <TD><span className="text-ink-faint font-mono text-xs">#{tx.id}</span></TD>
                  <TD>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-brand-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{tx.username?.[0]?.toUpperCase() || 'U'}</div>
                      <div><p className="text-ink text-xs font-medium">{tx.username || '—'}</p><p className="text-ink-faint text-xs">{tx.phone_number || '—'}</p></div>
                    </div>
                  </TD>
                  <TD><TypeBadge type={tx.type} /></TD>
                  <TD><span className={`font-bold text-sm ${tx.type === 'deposit' ? 'text-green-400' : 'text-red-400'}`}>{tx.type === 'deposit' ? '+' : '-'}${Number(tx.amount).toFixed(2)}</span></TD>
                  <TD><span className="text-ink-muted text-xs capitalize">{tx.method || '—'}</span></TD>
                  <TD><span className="text-ink-faint font-mono text-xs">{tx.transaction_id || '—'}</span></TD>
                  <TD><StatusBadge status={tx.status} /></TD>
                  <TD><span className="text-ink-faint text-xs whitespace-nowrap">{fmt(tx.created_at)}</span></TD>
                  <TD right onClick={e => e.stopPropagation()}>
                    {tx.status === 'pending' ? (
                      <div className="flex gap-1 justify-end">
                        <Button variant="success" size="sm" loading={updating === tx.id} onClick={() => handleApprove(tx)}>✓</Button>
                        <Button variant="danger"  size="sm" disabled={updating === tx.id} onClick={() => openReject(tx)}>✕</Button>
                      </div>
                    ) : <span className="text-ink-faint text-xs block text-right">—</span>}
                  </TD>
                </TR>
              ))}
            </TBody>
          </DataTable>
        ) : (
          <DataTable>
            <THead>
              <TR><TH>#</TH><TH>Cashier</TH><TH>Type</TH><TH>Amount</TH><TH>Note</TH><TH>Date</TH></TR>
            </THead>
            <TBody>
              {filteredCashiers.map(tx => (
                <TR key={tx.id}>
                  <TD><span className="text-ink-faint font-mono text-xs">#{tx.id}</span></TD>
                  <TD>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-emerald-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{tx.cashier_name?.[0]?.toUpperCase() || 'C'}</div>
                      <div><p className="text-ink text-xs font-medium">{tx.cashier_name || '—'}</p><p className="text-ink-faint text-xs">@{tx.cashier_username || '—'}</p></div>
                    </div>
                  </TD>
                  <TD><CashierTypeBadge type={tx.type} /></TD>
                  <TD><span className={`font-bold text-sm ${tx.type === 'cashier_deposit' ? 'text-green-400' : 'text-red-400'}`}>{tx.type === 'cashier_deposit' ? '+' : '-'}${Number(tx.amount).toFixed(2)}</span></TD>
                  <TD><span className="text-ink-muted text-xs">{tx.note || '—'}</span></TD>
                  <TD><span className="text-ink-faint text-xs">{fmt(tx.created_at)}</span></TD>
                </TR>
              ))}
            </TBody>
          </DataTable>
        )}
      </Card>

      {/* Detail Modal */}
      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title={`Transaction #${selected?.id}`}>
        {selected && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 p-3 bg-surface-overlay/40 rounded-xl">
              <div className="w-10 h-10 bg-brand-600 rounded-full flex items-center justify-center font-bold">{selected.username?.[0]?.toUpperCase()}</div>
              <div><p className="text-ink font-medium">{selected.username}</p><p className="text-ink-faint text-xs">{selected.phone_number}</p></div>
              <div className="ml-auto flex flex-col items-end gap-1"><TypeBadge type={selected.type} /><StatusBadge status={selected.status} /></div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {[
                ['Amount',    `${selected.type === 'deposit' ? '+' : '-'}$${Number(selected.amount).toFixed(2)}`],
                ['Method',    selected.method || '—'],
                ['TX ID',     selected.transaction_id || '—'],
                ['TX Number', selected.transaction_number || '—'],
                ['Date',      fmt(selected.created_at)],
                ['Note',      selected.note || '—'],
              ].map(([k, v]) => (
                <div key={k} className="bg-surface-overlay/40 rounded-lg p-3">
                  <p className="text-ink-faint text-xs mb-1">{k}</p>
                  <p className={`text-sm font-medium font-mono break-all ${k === 'Amount' && selected.type === 'deposit' ? 'text-green-400' : k === 'Amount' ? 'text-red-400' : 'text-ink'}`}>{v}</p>
                </div>
              ))}
            </div>
            {selected.status === 'rejected' && selected.rejection_reason && (
              <div className="bg-red-500/10 border border-red-500/25 rounded-xl p-3">
                <p className="text-red-400 text-xs font-medium mb-1">Rejection Reason</p>
                <p className="text-red-300 text-sm">{selected.rejection_reason}</p>
              </div>
            )}
            {selected.status === 'pending' && (
              <div className="flex gap-2">
                <Button loading={updating === selected.id} className="flex-1 justify-center" style={{ background: 'rgb(22 163 74)' }} onClick={() => handleApprove(selected)}>✓ Approve</Button>
                <Button loading={updating === selected.id} className="flex-1 justify-center" style={{ background: 'rgb(220 38 38)' }} onClick={() => { setDetailOpen(false); openReject(selected) }}>✕ Reject</Button>
              </div>
            )}
            {selected.status !== 'pending' && (
              <div className={`flex items-center gap-2 p-3 rounded-xl text-sm ${selected.status === 'done' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                {selected.status === 'done' ? '✅ Approved and balance updated.' : '❌ This transaction was rejected.'}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal open={rejectOpen} onClose={() => setRejectOpen(false)} title="Reject Transaction">
        {rejectTarget && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/25 rounded-xl">
              <span className="text-2xl">❌</span>
              <div>
                <p className="text-ink text-sm font-medium">{rejectTarget.username}</p>
                <p className="text-ink-muted text-xs">{rejectTarget.type === 'deposit' ? '💰' : '💸'} ${Number(rejectTarget.amount).toFixed(2)} · {rejectTarget.method}</p>
              </div>
            </div>
            <div>
              <label className="block text-ink-faint text-xs mb-1.5 uppercase tracking-wide font-medium">Rejection Reason *</label>
              <Textarea rows={3} placeholder="e.g. Invalid transaction number, payment not received..." value={rejectReason} onChange={e => setRejectReason(e.target.value)} autoFocus />
              <p className="text-ink-faint text-xs mt-1">This reason will be saved with the transaction record.</p>
            </div>
            <div className="flex gap-2">
              <Button loading={!!updating} className="flex-1 justify-center" style={{ background: 'rgb(220 38 38)' }} onClick={handleReject}>✕ Confirm Reject</Button>
              <Button variant="secondary" onClick={() => setRejectOpen(false)}>Cancel</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
