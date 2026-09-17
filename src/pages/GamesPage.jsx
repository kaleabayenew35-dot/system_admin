import React, { useState, useRef, useEffect } from 'react'
import { useToast } from '../context/ToastContext'
import { useGames } from '../hooks/useGames'
import Modal from '../components/Modal'
import Spinner from '../components/Spinner'
import { Button, Card, PageHeader, EmptyState } from '../components/ui'
import { Input } from '../components/ui/Input'

const EMPTY_FORM = { name: '', game_url: '', mini_app_url: '', backend_url: '' }

function isValidUrl(str) {
  try {
    const u = new URL(str)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch { return false }
}

function GameForm({ form, setForm, saving, isEdit, onSubmit, onCancel, nameRef, urlRef, interactedRef }) {
  const handleNameKey = (e) => { if (e.key === 'Enter') { e.preventDefault(); urlRef.current?.focus() } }
  const handleUrlKey  = (e) => { if (e.key === 'Enter') { e.preventDefault(); onSubmit() } }

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit() }} className="flex flex-col gap-4">
      <div>
        <label className="block text-ink-faint text-xs mb-1.5 uppercase tracking-wide font-medium">Game Name *</label>
        <Input
          ref={nameRef}
          placeholder="e.g. Chess, Trivia..."
          value={form.name}
          onChange={e => { interactedRef.current = true; setForm(p => ({ ...p, name: e.target.value })) }}
          onFocus={() => { interactedRef.current = true }}
          onKeyDown={handleNameKey}
          autoComplete="off"
        />
      </div>
      <div>
        <label className="block text-ink-faint text-xs mb-1.5 uppercase tracking-wide font-medium">Frontend URL *</label>
        <Input
          ref={urlRef}
          placeholder="https://game.example.com"
          value={form.game_url}
          onChange={e => { interactedRef.current = true; setForm(p => ({ ...p, game_url: e.target.value || '' })) }}
          onFocus={e => {
            interactedRef.current = true
            if (!form.game_url) {
              setForm(p => ({ ...p, game_url: 'https://' }))
              setTimeout(() => { const el = e.target; el.selectionStart = el.selectionEnd = el.value.length }, 0)
            }
          }}
          onKeyDown={handleUrlKey}
          autoComplete="off"
        />
      </div>
      <div>
        <label className="block text-ink-faint text-xs mb-1.5 uppercase tracking-wide font-medium">Mini App URL (Telegram WebApp)</label>
        <Input
          placeholder="https://yourgame.example.com/telegram-webapp"
          value={form.mini_app_url}
          onChange={e => { interactedRef.current = true; setForm(p => ({ ...p, mini_app_url: e.target.value })) }}
          onFocus={() => { interactedRef.current = true }}
          autoComplete="off"
        />
      </div>
      <div>
        <label className="block text-ink-faint text-xs mb-1.5 uppercase tracking-wide font-medium">Backend URL *</label>
        <Input
          placeholder="https://your-game-backend.onrender.com"
          value={form.backend_url}
          onChange={e => { interactedRef.current = true; setForm(p => ({ ...p, backend_url: e.target.value })) }}
          onFocus={() => { interactedRef.current = true }}
          autoComplete="off"
        />
        <p className="text-ink-faint text-xs mt-1">Used by the game token and game API integration.</p>
      </div>
      <div className="flex gap-2 pt-1">
        <Button type="submit" loading={saving} className="flex-1">{isEdit ? 'Save Changes' : 'Add Game'}</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  )
}

export default function GamesPage() {
  const toast = useToast()
  const { games, loading, addGame, updateGame, deleteGame, toggleStatus } = useGames()
  const [saving, setSaving]   = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [search, setSearch]   = useState('')

  const [addOpen, setAddOpen]   = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editGame, setEditGame] = useState(null)
  const [form, setForm]         = useState(EMPTY_FORM)

  const nameRef      = useRef(null)
  const urlRef       = useRef(null)
  const interactedRef = useRef(false)

  useEffect(() => {
    if (addOpen || editOpen) {
      interactedRef.current = false
      const t = setTimeout(() => {
        const active = document.activeElement
        const isTyping = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')
        if (isTyping || interactedRef.current) return
        nameRef.current?.focus()
        nameRef.current?.select()
      }, 120)
      return () => clearTimeout(t)
    }
  }, [addOpen, editOpen])

  const resetForm = () => { setForm(EMPTY_FORM); setEditGame(null) }

  const handleAdd = async () => {
    if (!form.name.trim()) return toast.error('Game name is required')
    if (!isValidUrl(form.game_url.trim())) return toast.error('Enter a valid URL (http/https)')
    if (form.mini_app_url.trim() && !isValidUrl(form.mini_app_url.trim())) return toast.error('Enter a valid Mini App URL (http/https)')
    if (!isValidUrl(form.backend_url.trim())) return toast.error('Enter a valid backend URL (http/https)')
    setSaving(true)
    try {
      await addGame({ name: form.name.trim(), game_url: form.game_url.trim(), mini_app_url: form.mini_app_url.trim() || null, backend_url: form.backend_url.trim() })
      setAddOpen(false); resetForm()
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to add game') }
    finally { setSaving(false) }
  }

  const handleEdit = async () => {
    if (!form.name.trim()) return toast.error('Game name is required')
    if (!isValidUrl(form.game_url.trim())) return toast.error('Enter a valid URL (http/https)')
    if (form.mini_app_url.trim() && !isValidUrl(form.mini_app_url.trim())) return toast.error('Enter a valid Mini App URL (http/https)')
    if (!isValidUrl(form.backend_url.trim())) return toast.error('Enter a valid backend URL (http/https)')
    setSaving(true)
    try {
      await updateGame(editGame.id, { name: form.name.trim(), game_url: form.game_url.trim(), mini_app_url: form.mini_app_url.trim() || null, backend_url: form.backend_url.trim(), status: editGame.status || 'active' })
      setEditOpen(false); resetForm()
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to update') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    setDeleting(id)
    try { await deleteGame(id) }
    catch { toast.error('Failed to delete game') }
    finally { setDeleting(null) }
  }

  const filtered = games.filter(g => g.status === 'active' && (
    g.name?.toLowerCase().includes(search.toLowerCase()) ||
    g.description?.toLowerCase().includes(search.toLowerCase())
  ))

  const formProps = {
    form, setForm, saving, nameRef, urlRef, interactedRef,
    onCancel: () => { setAddOpen(false); setEditOpen(false); resetForm() },
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <PageHeader
        title="Games"
        subtitle="Manage all games in the system"
        action={
          <Button onClick={() => { resetForm(); setAddOpen(true) }}>
            + Add Game
          </Button>
        }
      />

      {/* Search + stats */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <Input
          className="max-w-xs"
          placeholder="Search games..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="flex gap-3 sm:ml-auto text-sm text-ink-faint">
          <span className="text-green-400">{games.filter(g => g.status === 'active').length} active</span>
          <span>·</span>
          <span>{games.filter(g => g.status !== 'active').length} inactive</span>
          <span>·</span>
          <span>{games.length} total</span>
        </div>
      </div>

      {/* Game cards grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-16">
            <Spinner />
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full">
            <EmptyState
              icon="🎮"
              title={search ? 'No active games match your search' : 'No active games yet'}
              action={!search && <Button onClick={() => { resetForm(); setAddOpen(true) }}>+ Add First Game</Button>}
            />
          </div>
        ) : (
          filtered.map(game => (
            <Card key={game.id} className="hover:border-brand-500/30 transition-colors duration-200">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-ink font-semibold truncate">{game.name}</p>
                  <p className="text-ink-muted text-sm mt-1 line-clamp-2">{game.description || 'No description'}</p>
                </div>
                <span className={`flex-shrink-0 ${game.status === 'active' ? 'badge-active' : 'badge-inactive'}`}>
                  {game.status || 'active'}
                </span>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-brand-400 text-xs">URL</span>
                  {game.game_url ? (
                    <a href={game.game_url} target="_blank" rel="noreferrer"
                      className="text-brand-300 hover:text-brand-200 text-xs font-mono truncate">
                      {new URL(game.game_url).hostname}
                    </a>
                  ) : <span className="text-ink-faint text-xs">—</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400 text-xs">API</span>
                  {game.backend_url ? (
                    <a href={game.backend_url} target="_blank" rel="noreferrer" className="text-cyan-300 hover:text-cyan-200 text-xs font-mono truncate">
                      {game.backend_url.replace(/^https?:\/\//, '')}
                    </a>
                  ) : <span className="text-red-400 text-xs">No backend URL</span>}
                </div>
                {!game.mini_app_url && !game.game_url && (
                  <span className="text-red-400 text-xs">⚠ No launch URL set — won't show in bot</span>
                )}
                <div className="flex gap-2 flex-wrap">
                  <span className="badge badge-blue">Players {game.min_players}–{game.max_players}</span>
                  <span className="badge badge-gray">ID {game.id}</span>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <Button variant="success" size="sm" onClick={() => { setEditGame(game); setForm({ name: game.name || '', game_url: game.game_url || '', mini_app_url: game.mini_app_url || '', backend_url: game.backend_url || '' }); setEditOpen(true) }}>
                  Edit
                </Button>
                <Button variant="danger" size="sm" loading={deleting === game.id} onClick={() => handleDelete(game.id)}>
                  Delete
                </Button>
                <button
                  onClick={() => toggleStatus(game).catch(() => toast.error('Failed to update status'))}
                  className={`btn-toggle ${game.status === 'active' ? 'btn-toggle-on' : 'btn-toggle-off'}`}
                >
                  {game.status === 'active' ? '🔛 ON' : '⛔ OFF'}
                </button>
              </div>
            </Card>
          ))
        )}
      </div>

      <Modal open={addOpen} onClose={() => { setAddOpen(false); resetForm() }} title="Add New Game">
        <GameForm {...formProps} isEdit={false} onSubmit={handleAdd} />
      </Modal>
      <Modal open={editOpen} onClose={() => { setEditOpen(false); resetForm() }} title={`Edit: ${editGame?.name}`}>
        <GameForm {...formProps} isEdit={true} onSubmit={handleEdit} />
      </Modal>
    </div>
  )
}
