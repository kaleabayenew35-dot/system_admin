import React, { useState } from 'react'
import { useToast } from '../context/ToastContext'
import { useGameTokens } from '../hooks/useGameTokens'
import { getBackendByKey } from '../config/gameBackends'
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

const detectBackendUrl = (game) => {
  const name = (game?.name || '').toLowerCase()
  const key = name.includes('bingo') ? 'bingo'
    : name.includes('dama') ? 'dama'
      : name.includes('ludo') ? 'ludo'
        : name.includes('tic') || name.includes('xo') ? 'xo'
          : null
  return game?.backend_url || (key ? getBackendByKey(key)?.url : '') || ''
}

export default function GameTokensPage() {
  const toast = useToast()
  const { tokens, games, loading, generateToken, updateToken, deleteToken, refetch } = useGameTokens()
  const [saving, setSaving]   = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [copied, setCopied]   = useState(null)
  const [search, setSearch]   = useState('')
  const [filterGame, setFilterGame] = useState('all')

  // Generate modal state
  const [genOpen, setGenOpen]           = useState(false)
  const [genGameId, setGenGameId]       = useState('')
  const [genBackendUrl, setGenBackendUrl] = useState('')

  // Edit modal state
  const [editOpen, setEditOpen]             = useState(false)
  const [editTarget, setEditTarget]         = useState(null)
  const [editToken, setEditToken]           = useState('')
  const [editBackendUrl, setEditBackendUrl] = useState('')

  const copyToken = (tkn) => {
    navigator.clipboard.writeText(tkn).then(() => {
      setCopied(tkn); toast.success('Copied!')
      setTimeout(() => setCopied(null), 2000)
    })
  }

  const openGenerate = (game = null) => {
    setGenGameId(game ? String(game.id) : '')
    setGenBackendUrl(game ? detectBackendUrl(game) : '')
    setGenOpen(true)
  }

  const selectGenerateGame = (value) => {
    setGenGameId(value)
    const game = games.find(item => String(item.id) === String(value))
    setGenBackendUrl(detectBackendUrl(game))
  }

  const handleGenerate = async () => {
    if (!genGameId)            return toast.error('Select a game')
    if (!genBackendUrl.trim()) return toast.error('Backend URL is required')
    setSaving(true)
    try {
      await generateToken({ game_id: genGameId, backend_url: genBackendUrl.trim() })
      setGenOpen(false); setGenGameId(''); setGenBackendUrl('')
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to generate') }
    finally { setSaving(false) }
  }

  const openEdit = (t) => { setEditTarget(t); setEditToken(t.token || ''); setEditBackendUrl(t.backend_url || ''); setEditOpen(true) }

  const handleEdit = async () => {
    if (!editToken.trim())      return toast.error('Token value cannot be empty')
    if (!editBackendUrl.trim()) return toast.error('Backend URL is required')
    setSaving(true)
    try {
      await updateToken(editTarget.id, { token: editToken.trim(), backend_url: editBackendUrl.trim() })
      setEditOpen(false)
    } catch (err) { toast.error(err.response?.data?.error || 'Update failed') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    setDeleting(id)
    try { await deleteToken(id) }
    catch { toast.error('Delete failed') }
    finally { setDeleting(null) }
  }

  const autoGenerate = async (game) => {
    const backendUrl = detectBackendUrl(game)
    if (!backendUrl) return toast.error(`No backend URL detected for ${game.name}`)
    setSaving(true)
    try {
      await generateToken({ game_id: game.id, backend_url: backendUrl })
    } catch (err) { toast.error(err.response?.data?.error || `Failed to generate ${game.name} token`) }
    finally { setSaving(false) }
  }

  const filtered = tokens.filter(t => {
    if (filterGame !== 'all' && String(t.game_id) !== filterGame) return false
    if (search) {
      const q = search.toLowerCase()
      return t.token?.toLowerCase().includes(q) || t.game_name?.toLowerCase().includes(q) || t.label?.toLowerCase().includes(q)
    }
    return true
  })

  const visibleGames = games.filter(g => {
    if (filterGame !== 'all' && String(g.id) !== filterGame) return false
    if (!search) return true
    const q = search.toLowerCase()
    return g.name?.toLowerCase().includes(q) || g.description?.toLowerCase().includes(q)
  })

  const counts = {
    total:    tokens.length,
    active:   tokens.filter(t => t.status === 'active').length,
    inactive: tokens.filter(t => t.status !== 'active').length,
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <PageHeader
        title="Game Tokens"
        subtitle="Generate and manage access tokens for each game"
        action={
          <Button onClick={() => openGenerate()}>
            ⚡ Generate Token
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Total Tokens" value={counts.total}    color="text-ink" />
        <StatCard label="Active"       value={counts.active}   color="text-green-400" />
        <StatCard label="Inactive"     value={counts.inactive} color="text-red-400" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <Select value={filterGame} onChange={e => setFilterGame(e.target.value)} className="w-auto">
          <option value="all">All Games</option>
          {games.map(g => <option key={g.id} value={String(g.id)}>{g.name}</option>)}
        </Select>
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint text-sm">🔍</span>
          <Input className="pl-9" placeholder="Search token, game..." value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink text-lg leading-none">×</button>}
        </div>
        <Button variant="secondary" onClick={refetch} className="ml-auto gap-1.5">⟳ Refresh</Button>
      </div>

      {/* Table */}
      <Card noPad className="overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-surface-border">
          <h2 className="text-ink font-semibold text-sm">Games and Token Coverage</h2>
          <p className="text-ink-faint text-xs mt-1">Every active database game can generate its launch token automatically.</p>
        </div>
        {loading ? <div className="flex items-center justify-center py-10"><Spinner /></div> : (
          <DataTable>
            <THead><TR><TH>Game</TH><TH>Detected Backend</TH><TH>Token</TH><TH>Status</TH><TH right>Action</TH></TR></THead>
            <TBody>
              {visibleGames.map(game => {
                const gameToken = tokens.find(t => String(t.game_id) === String(game.id) && t.status === 'active')
                const backendUrl = detectBackendUrl(game)
                return <TR key={game.id}>
                  <TD><span className="text-ink text-sm font-medium">🎮 {game.name}</span><span className="block text-ink-faint text-xs">ID #{game.id}</span></TD>
                  <TD>{backendUrl ? <span className="text-cyan-400 text-xs font-mono">{backendUrl.replace(/^https?:\/\//, '')}</span> : <span className="text-red-400 text-xs">Not detected</span>}</TD>
                  <TD>{gameToken ? <code className="text-brand-300 text-xs font-mono">{gameToken.token}</code> : <span className="text-amber-400 text-xs">Not generated</span>}</TD>
                  <TD><span className={game.status === 'active' && gameToken ? 'badge-active' : 'badge-inactive'}>{game.status === 'active' && gameToken ? 'Ready' : game.status === 'active' ? 'Needs token' : 'Inactive'}</span></TD>
                  <TD right><Button size="sm" loading={saving} disabled={game.status !== 'active' || Boolean(gameToken) || !backendUrl} onClick={() => autoGenerate(game)}>⚡ Auto Generate</Button></TD>
                </TR>
              })}
            </TBody>
          </DataTable>
        )}
      </Card>

      <Card noPad className="overflow-hidden flex flex-col">
        {loading ? (
          <div className="flex items-center justify-center py-16"><Spinner /></div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="🔑"
            title={search || filterGame !== 'all' ? 'No tokens match your filter' : 'No tokens yet'}
            action={<Button onClick={() => openGenerate()}>⚡ Generate First Token</Button>}
          />
        ) : (
          <DataTable>
            <THead>
              <TR>
                <TH>#</TH><TH>Game</TH><TH>Token</TH><TH>Backend URL</TH><TH>Status</TH><TH>Created</TH><TH right>Actions</TH>
              </TR>
            </THead>
            <TBody>
              {filtered.map(t => (
                <TR key={t.id}>
                  <TD><span className="text-ink-faint font-mono text-xs">#{t.id}</span></TD>
                  <TD>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-brand-600/30 rounded-lg flex items-center justify-center text-sm flex-shrink-0">🎮</div>
                      <div>
                        <p className="text-ink text-xs font-medium">{t.game_name}</p>
                        <span className={`text-xs ${t.game_status === 'active' ? 'text-green-400' : 'text-red-400'}`}>{t.game_status}</span>
                      </div>
                    </div>
                  </TD>
                  <TD>
                    <div className="flex items-center gap-2">
                      <code className="text-brand-300 text-xs font-mono bg-brand-900/30 px-2 py-0.5 rounded border border-brand-500/20 max-w-[180px] truncate block">
                        {t.token}
                      </code>
                      <button
                        onClick={() => copyToken(t.token)}
                        className={`text-xs px-2 py-1 rounded-lg border transition-all flex-shrink-0 ${
                          copied === t.token
                            ? 'bg-green-500/20 text-green-400 border-green-500/30'
                            : 'bg-surface-overlay text-ink-muted border-surface-border hover:text-ink'
                        }`}
                      >
                        {copied === t.token ? '✓' : '⎘'}
                      </button>
                    </div>
                  </TD>
                  <TD>
                    {t.backend_url
                      ? <a href={t.backend_url} target="_blank" rel="noreferrer" className="text-cyan-400 hover:text-cyan-300 text-xs font-mono truncate max-w-[140px] block">{t.backend_url.replace(/^https?:\/\//, '')}</a>
                      : <span className="text-ink-faint text-xs">—</span>
                    }
                  </TD>
                  <TD><span className={t.status === 'active' ? 'badge-active' : 'badge-inactive'}>{t.status}</span></TD>
                  <TD><span className="text-ink-faint text-xs">{fmt(t.created_at)}</span></TD>
                  <TD right>
                    <div className="flex gap-1.5 justify-end">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(t)}>✏️ Edit</Button>
                      <Button variant="danger" size="sm" loading={deleting === t.id} onClick={() => handleDelete(t.id)}>🗑</Button>
                    </div>
                  </TD>
                </TR>
              ))}
            </TBody>
          </DataTable>
        )}
      </Card>

      {/* Generate Modal */}
      <Modal open={genOpen} onClose={() => setGenOpen(false)} title="⚡ Generate Game Token">
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-ink-faint text-xs mb-1.5 uppercase tracking-wide font-medium">Select Game *</label>
            <Select className="w-full" value={genGameId} onChange={e => selectGenerateGame(e.target.value)}>
              <option value="">— Choose a game —</option>
              {games.map(g => <option key={g.id} value={g.id}>{g.name}{g.status !== 'active' ? ' (inactive)' : ''}</option>)}
            </Select>
          </div>

          {genGameId && tokens.some(t => String(t.game_id) === String(genGameId)) && (
            <div className="flex gap-2 p-3 bg-amber-500/10 border border-amber-500/25 rounded-xl">
              <span className="text-amber-400 mt-0.5">⚠️</span>
              <div>
                <p className="text-amber-400 text-xs font-semibold">This game already has a token</p>
                <p className="text-amber-500/70 text-xs mt-0.5">Only one token can be active at a time.</p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-ink-faint text-xs mb-1.5 uppercase tracking-wide font-medium">Detected Backend URL *</label>
            <Input placeholder="https://your-backend.com" value={genBackendUrl} onChange={e => setGenBackendUrl(e.target.value)} />
            <p className="text-ink-faint text-xs mt-1">Detected from the selected game and editable when needed.</p>
          </div>
          <div className="flex gap-2 pt-1">
            <Button loading={saving} disabled={!genGameId} className="flex-1" onClick={handleGenerate}>⚡ Generate</Button>
            <Button variant="secondary" onClick={() => setGenOpen(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Token">
        {editTarget && (
          <div className="flex flex-col gap-4">
            <div className="p-3 bg-surface-overlay/40 rounded-xl">
              <p className="text-ink-faint text-xs mb-1">Game</p>
              <p className="text-ink text-sm font-medium">🎮 {editTarget.game_name}</p>
            </div>
            <div>
              <label className="block text-ink-faint text-xs mb-1.5 uppercase tracking-wide font-medium">Token Value *</label>
              <Input className="font-mono text-xs" value={editToken} onChange={e => setEditToken(e.target.value)} />
            </div>
            <div>
              <label className="block text-ink-faint text-xs mb-1.5 uppercase tracking-wide font-medium">Backend URL *</label>
              <Input placeholder="https://your-backend.com" value={editBackendUrl} onChange={e => setEditBackendUrl(e.target.value)} />
            </div>
            <div className="flex gap-2 pt-1">
              <Button loading={saving} className="flex-1" onClick={handleEdit}>Save Changes</Button>
              <Button variant="secondary" onClick={() => setEditOpen(false)}>Cancel</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
