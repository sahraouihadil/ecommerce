import { useEffect, useState } from 'react'
import {
  Eye, Pencil, Trash2, Users, CheckCircle, XCircle,
  LayoutDashboard, Megaphone, BadgePercent, Mail, FileText,
  X, Check, Loader2, ChevronDown, Search, Plus,
} from 'lucide-react'
import api from '../../services/api'
import Sidebar from '../ui/Sidebar'
import Header from '../ui/Header'

// ─── Constants ────────────────────────────────────────────────────────────────

const PURPLE = '#5B47E0'

const TAG_OPTIONS    = ['VIP', 'Deals', 'New Arrivals', 'Sales']
const STATUS_OPTIONS = ['subscribed', 'unsubscribed']

const tagColor = {
  'VIP':          { bg: '#F5F3FF', color: '#7C3AED' },
  'Deals':        { bg: '#EFF6FF', color: '#2563EB' },
  'New Arrivals': { bg: '#F0FDF4', color: '#16A34A' },
  'Sales':        { bg: '#FFF7ED', color: '#C2410C' },
}

const EMPTY_FORM = { name: '', email: '', status: 'subscribed', tags: [] }

const marketingmanagerLinks = [
  { to: "/marketing-manager-dash",             label: "Dashboard",   icon: <LayoutDashboard size={18} />, end: true },
  { to: "/marketing-manager-dash/campaigns",   label: "Campaigns",   icon: <Megaphone size={18} /> },
  { to: "/marketing-manager-dash/newsletters", label: "Newsletters", icon: <Mail size={18} /> },
  { to: "/marketing-manager-dash/blogs",       label: "Blogs",       icon: <FileText size={18} /> },
]

// ─── Shared styles ────────────────────────────────────────────────────────────

const labelStyle = {
  display: 'block', fontSize: '0.6875rem', fontWeight: 600,
  letterSpacing: '0.07em', color: '#6B7280',
  textTransform: 'uppercase', marginBottom: '6px',
}

const inputBase = {
  width: '100%', border: '1px solid #E5E7EB', borderRadius: '10px',
  padding: '10px 14px', fontSize: '0.875rem', color: '#111827',
  outline: 'none', boxSizing: 'border-box', background: '#fff',
  appearance: 'none', fontFamily: 'inherit',
}

const focus = (e) => (e.target.style.borderColor = PURPLE)
const blur  = (e) => (e.target.style.borderColor = '#E5E7EB')

// ─── Helper: normalise tags from any API shape ────────────────────────────────

const parseTags = (raw) => {
  if (!raw) return []
  if (Array.isArray(raw)) return raw.map(t => String(t).trim()).filter(Boolean)
  if (typeof raw === 'string') {
    const trimmed = raw.trim()
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed)
        if (Array.isArray(parsed)) return parsed.map(t => String(t).trim()).filter(Boolean)
      } catch { /* fall through */ }
    }
    return trimmed.split(',').map(t => t.trim()).filter(Boolean)
  }
  return []
}

// ─── Create Modal (name + email + status + tags) ──────────────────────────────

function CreateModal({ onClose, onSaved }) {
  const [form,   setForm]   = useState({ ...EMPTY_FORM })
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const toggleTag = (tag) =>
    setForm((f) => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag],
    }))

  const handleSubmit = async () => {
    if (!form.name.trim())         return setError('Name is required.')
    if (!form.email.trim())        return setError('Email is required.')
    if (!form.email.includes('@')) return setError('Enter a valid email.')
    setError('')
    setSaving(true)
    try {
      const payload = {
        name:   form.name.trim(),
        email:  form.email.trim().toLowerCase(),
        status: form.status,
        tags:   form.tags,
      }
      const res = await api.post('/api/newsletters/', payload)
      onSaved(res.data, false)
      onClose()
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  const backdrop = (e) => { if (e.target === e.currentTarget) onClose() }

  return (
    <div
      onClick={backdrop}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem', background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(3px)',
      }}
    >
      <div style={{
        background: '#fff', borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        width: '100%', maxWidth: '460px', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '22px 24px 18px', borderBottom: '1px solid #F3F4F6',
        }}>
          <span style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#111827' }}>
            New Subscriber
          </span>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#9CA3AF', padding: 4, borderRadius: 8,
          }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          <div>
            <label style={labelStyle}>Full Name</label>
            <input
              style={inputBase}
              value={form.name}
              onChange={set('name')}
              onFocus={focus}
              onBlur={blur}
              placeholder="e.g. Sarah Johnson"
            />
          </div>

          <div>
            <label style={labelStyle}>Email</label>
            <input
              style={inputBase}
              type="email"
              value={form.email}
              onChange={set('email')}
              onFocus={focus}
              onBlur={blur}
              placeholder="sarah@example.com"
            />
          </div>

          <div>
            <label style={labelStyle}>Status</label>
            <div style={{ position: 'relative' }}>
              <select
                style={{ ...inputBase, paddingRight: 36 }}
                value={form.status}
                onChange={set('status')}
              >
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
              <span style={{
                position: 'absolute', right: 12, top: '50%',
                transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9CA3AF',
              }}>
                <ChevronDown size={15} />
              </span>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Tags</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {TAG_OPTIONS.map((tag) => {
                const selected = form.tags.includes(tag)
                const tc = tagColor[tag] || { bg: '#F3F4F6', color: '#6B7280' }
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    style={{
                      padding: '6px 16px', borderRadius: 999,
                      fontSize: '0.75rem', fontWeight: 600,
                      cursor: 'pointer', transition: 'all 0.15s',
                      background: selected ? tc.bg    : '#F9FAFB',
                      color:      selected ? tc.color : '#9CA3AF',
                      border:     selected ? `1.5px solid ${tc.color}` : '1.5px solid #E5E7EB',
                      display: 'flex', alignItems: 'center', gap: 5,
                    }}
                  >
                    {selected && <Check size={11} strokeWidth={3} style={{ color: tc.color }} />}
                    {tag}
                  </button>
                )
              })}
            </div>
            {form.tags.length > 0 && (
              <p style={{ marginTop: 8, fontSize: '0.75rem', color: '#9CA3AF', lineHeight: 1.4 }}>
                Selected: {form.tags.join(', ')}
              </p>
            )}
          </div>

          {error && (
            <p style={{
              fontSize: '0.8125rem', color: '#EF4444',
              background: '#FEF2F2', padding: '8px 12px', borderRadius: 8,
            }}>
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 24px 20px', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onClose} style={{
            padding: '9px 20px', borderRadius: 10, border: '1px solid #E5E7EB',
            background: '#fff', color: '#374151', fontSize: '0.875rem',
            fontWeight: 500, cursor: 'pointer',
          }}>Cancel</button>
          <button onClick={handleSubmit} disabled={saving} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '9px 22px', borderRadius: 10, border: 'none',
            background: PURPLE, color: '#fff', fontSize: '0.875rem',
            fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
          }}>
            {saving
              ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
              : <Check size={14} />
            }
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Edit Tags Modal (tags only) ──────────────────────────────────────────────

function EditTagsModal({ item, onClose, onSaved }) {
  const [tags,   setTags]   = useState(() => parseTags(item.tags))
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  const toggleTag = (tag) =>
    setTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )

  const handleSubmit = async () => {
    setError('')
    setSaving(true)
    console.log(item.id)
    try {
      const res = await api.put(`/api/newsletters/${item.id ?? item.user_id }`, {
        tags,
      })
      onSaved(res.data, true)
      onClose()
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  const backdrop = (e) => { if (e.target === e.currentTarget) onClose() }

  return (
    <div
      onClick={backdrop}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem', background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(3px)',
      }}
    >
      <div style={{
        background: '#fff', borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        width: '100%', maxWidth: '400px', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '22px 24px 18px', borderBottom: '1px solid #F3F4F6',
        }}>
          <div>
            <span style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#111827' }}>
              Edit Tags
            </span>
            <p style={{ fontSize: '0.8125rem', color: '#9CA3AF', margin: '4px 0 0' }}>
              {item.name} · {item.email}
            </p>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#9CA3AF', padding: 4, borderRadius: 8,
          }}>
            <X size={18} />
          </button>
        </div>

        {/* Body — tags only */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>Tags</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {TAG_OPTIONS.map((tag) => {
                const selected = tags.includes(tag)
                const tc = tagColor[tag] || { bg: '#F3F4F6', color: '#6B7280' }
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    style={{
                      padding: '8px 18px', borderRadius: 999,
                      fontSize: '0.8125rem', fontWeight: 600,
                      cursor: 'pointer', transition: 'all 0.15s',
                      background: selected ? tc.bg    : '#F9FAFB',
                      color:      selected ? tc.color : '#9CA3AF',
                      border:     selected ? `1.5px solid ${tc.color}` : '1.5px solid #E5E7EB',
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}
                  >
                    {selected && <Check size={12} strokeWidth={3} style={{ color: tc.color }} />}
                    {tag}
                  </button>
                )
              })}
            </div>

            <p style={{
              marginTop: 10, fontSize: '0.75rem', color: '#9CA3AF',
              lineHeight: 1.4, minHeight: 18,
            }}>
              {tags.length > 0 ? `Selected: ${tags.join(', ')}` : 'No tags selected.'}
            </p>
          </div>

          {error && (
            <p style={{
              fontSize: '0.8125rem', color: '#EF4444',
              background: '#FEF2F2', padding: '8px 12px', borderRadius: 8,
            }}>
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '0 24px 20px', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onClose} style={{
            padding: '9px 20px', borderRadius: 10, border: '1px solid #E5E7EB',
            background: '#fff', color: '#374151', fontSize: '0.875rem',
            fontWeight: 500, cursor: 'pointer',
          }}>Cancel</button>
          <button onClick={handleSubmit} disabled={saving} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '9px 22px', borderRadius: 10, border: 'none',
            background: PURPLE, color: '#fff', fontSize: '0.875rem',
            fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
          }}>
            {saving
              ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
              : <Check size={14} />
            }
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Delete Modal ─────────────────────────────────────────────────────────────

function DeleteModal({ item, onClose, onConfirm, deleting }) {
  const backdrop = (e) => { if (e.target === e.currentTarget) onClose() }
  return (
    <div onClick={backdrop} style={{
      position: 'fixed', inset: 0, zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem', background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(3px)',
    }}>
      <div style={{
        background: '#fff', borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        width: '100%', maxWidth: '400px', padding: '28px 24px',
      }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: 8 }}>
          Remove Subscriber
        </h2>
        <p style={{ fontSize: '0.875rem', color: '#6B7280', lineHeight: 1.6, marginBottom: 24 }}>
          Are you sure you want to remove{' '}
          <strong style={{ color: '#374151' }}>{item.name}</strong>{' '}
          ({item.email})? This cannot be undone.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onClose} style={{
            padding: '9px 20px', borderRadius: 10, border: '1px solid #E5E7EB',
            background: '#fff', color: '#374151', fontSize: '0.875rem',
            fontWeight: 500, cursor: 'pointer',
          }}>Cancel</button>
          <button onClick={onConfirm} disabled={deleting} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '9px 22px', borderRadius: 10, border: 'none',
            background: '#EF4444', color: '#fff', fontSize: '0.875rem',
            fontWeight: 600, cursor: deleting ? 'not-allowed' : 'pointer', opacity: deleting ? 0.7 : 1,
          }}>
            {deleting && <Loader2 size={14} />}
            {deleting ? 'Removing…' : 'Yes, Remove'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NewslettersPage() {
  const [items,         setItems]         = useState([])
  const [loading,       setLoading]       = useState(true)
  const [openBar,       setOpenBar]       = useState(window.innerWidth >= 600)
  const [editTarget,    setEditTarget]    = useState(null)
  const [deleteTarget,  setDeleteTarget]  = useState(null)
  const [deleting,      setDeleting]      = useState(false)
  const [filterStatus,  setFilterStatus]  = useState('all')
  const [searchQuery,   setSearchQuery]   = useState('')
  const [searchFocused, setSearchFocused] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    api.get('/api/newsletters/')
      .then(r => { if (active) setItems(r.data) })
      .catch(console.error)
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const normalizeItem = (item) => ({
    ...item,
    status: (item.status ?? '').toString().trim().toLowerCase(),
    tags:   parseTags(item.tags),
  })

  const handleSaved = (saved, isEdit) => {
    const norm = normalizeItem(saved)
    setItems(prev => {
      if (isEdit) return prev.map(i => i.id === norm.id ? norm : i)
      if (prev.some(i => i.id === norm.id)) return prev
      return [norm, ...prev]
    })
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await api.delete(`/api/newsletters/${deleteTarget.id}`)
      setItems(prev => prev.filter(i => i.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch (err) { console.error(err) }
    finally { setDeleting(false) }
  }

  const total  = items.length
  const subbed = items.filter(i => i.status === 'subscribed').length
  const unsub  = items.filter(i => i.status === 'unsubscribed').length

  const handleCardClick = (filter) =>
    setFilterStatus(prev => prev === filter ? 'all' : filter)

  const statusFiltered = filterStatus === 'all'
    ? items
    : items.filter(i => i.status === filterStatus)

  const filteredItems = searchQuery.trim() === ''
    ? statusFiltered
    : statusFiltered.filter(i => {
        const q = searchQuery.trim().toLowerCase()
        return (
          i.name?.toLowerCase().includes(q) ||
          i.email?.toLowerCase().includes(q)
        )
      })

  const statCards = [
    { icon: <Users size={18} color="#3B82F6" />,      bg: '#EFF6FF', label: 'Total',        value: total,  filter: 'all'          },
    { icon: <CheckCircle size={18} color="#16A34A" />, bg: '#F0FDF4', label: 'Subscribed',   value: subbed, filter: 'subscribed'   },
    { icon: <XCircle size={18} color="#DC2626" />,     bg: '#FEF2F2', label: 'Unsubscribed', value: unsub,  filter: 'unsubscribed' },
  ]

  return (
    <div style={{
      display: 'flex', minHeight: '100vh',
      background: '#F4F6FB', fontFamily: 'system-ui, sans-serif',
    }}>
      <Sidebar
        openBar={openBar}
        setOpenBar={setOpenBar}
        links={marketingmanagerLinks}
        title="MarketingCore"
        subtitle="Enterprise Suite"
        role="Marketing Manager"
        profilePath="/marketing-manager-dash/profile"
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header concept="Newsletter Subscriptions" onToggleSidebar={() => setOpenBar(p => !p)} />

        <main style={{
          flex: 1, overflowY: 'auto', padding: '28px 32px',
          display: 'flex', flexDirection: 'column', gap: 24,
        }}>

          {/* Page header row */}
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', flexWrap: 'wrap', gap: 12,
          }}>
            <p style={{ fontSize: '0.875rem', color: '#9CA3AF', margin: 0 }}>
              Manage subscriber list and preferences
            </p>

            <div style={{
              display: 'flex', gap: 10, alignItems: 'center',
              flexWrap: 'wrap', flex: 1, justifyContent: 'flex-end',
            }}>
              {/* Search */}
              <div style={{ position: 'relative', minWidth: 240, maxWidth: 340, flex: '1 1 240px' }}>
                <span style={{
                  position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                  color: searchFocused ? PURPLE : '#9CA3AF', pointerEvents: 'none',
                  transition: 'color 0.2s', display: 'flex', alignItems: 'center',
                }}>
                  <Search size={15} />
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  placeholder="Search by name or email…"
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    border: `1.5px solid ${searchFocused ? PURPLE : '#E5E7EB'}`,
                    borderRadius: 12, padding: '10px 36px',
                    fontSize: '0.875rem', color: '#111827',
                    outline: 'none', background: '#fff', fontFamily: 'inherit',
                    boxShadow: searchFocused ? `0 0 0 3px rgba(91,71,224,0.1)` : 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    style={{
                      position: 'absolute', right: 10, top: '50%',
                      transform: 'translateY(-50%)', background: '#F3F4F6',
                      border: 'none', borderRadius: '50%',
                      width: 18, height: 18, display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: '#6B7280', padding: 0,
                    }}
                  >
                    <X size={11} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Stat cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 16,
          }}>
            {statCards.map(s => {
              const isActive = filterStatus === s.filter
              return (
                <div
                  key={s.label}
                  onClick={() => handleCardClick(s.filter)}
                  style={{
                    background: '#fff', borderRadius: 16, padding: '18px 20px',
                    border: isActive ? `2px solid ${PURPLE}` : '1px solid #F0F0F5',
                    boxShadow: isActive
                      ? `0 4px 16px rgba(91,71,224,0.15)`
                      : '0 1px 6px rgba(0,0,0,0.04)',
                    display: 'flex', alignItems: 'center', gap: 14,
                    cursor: 'pointer',
                    transform: isActive ? 'translateY(-2px)' : 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: 12,
                    background: s.bg, display: 'flex',
                    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>{s.icon}</div>
                  <div>
                    <p style={{ fontSize: '0.6875rem', color: '#9CA3AF', marginBottom: 2 }}>{s.label}</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', lineHeight: 1 }}>{s.value}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Active filter badges */}
          {(filterStatus !== 'all' || searchQuery.trim()) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8125rem', color: '#6B7280' }}>Filtering by:</span>

              {filterStatus !== 'all' && (
                <span style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '4px 12px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 600,
                  background: filterStatus === 'subscribed' ? '#ECFDF5' : '#FEF2F2',
                  color:      filterStatus === 'subscribed' ? '#16A34A' : '#DC2626',
                }}>
                  {filterStatus}
                  <button
                    onClick={() => setFilterStatus('all')}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      padding: 0, lineHeight: 1, display: 'flex', alignItems: 'center',
                      color: filterStatus === 'subscribed' ? '#16A34A' : '#DC2626',
                    }}
                  >
                    <X size={12} />
                  </button>
                </span>
              )}

              {searchQuery.trim() && (
                <span style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '4px 12px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 600,
                  background: '#F5F3FF', color: PURPLE,
                }}>
                  "{searchQuery.trim()}"
                  <button
                    onClick={() => setSearchQuery('')}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      padding: 0, lineHeight: 1, display: 'flex', alignItems: 'center',
                      color: PURPLE,
                    }}
                  >
                    <X size={12} />
                  </button>
                </span>
              )}

              <span style={{ fontSize: '0.8125rem', color: '#9CA3AF' }}>
                ({filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''})
              </span>
            </div>
          )}

          {/* Table */}
          <div style={{
            background: '#fff', borderRadius: 16,
            border: '1px solid #F0F0F5', boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
            overflow: 'hidden',
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%', borderCollapse: 'collapse',
                minWidth: 700, fontSize: '0.875rem',
              }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #F3F4F6' }}>
                    {['Name', 'Email', 'Status', 'Tags', 'Joined', 'Actions'].map(h => (
                      <th key={h} style={{
                        textAlign: 'left', padding: '14px 20px',
                        fontSize: '0.6875rem', fontWeight: 600,
                        color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.07em',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '60px 0' }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: '50%', margin: '0 auto',
                          border: `2px solid ${PURPLE}`, borderTopColor: 'transparent',
                          animation: 'spin 0.8s linear infinite',
                        }} />
                      </td>
                    </tr>
                  ) : filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{
                        textAlign: 'center', padding: '60px 0',
                        color: '#9CA3AF', fontSize: '0.875rem',
                      }}>
                        {searchQuery.trim()
                          ? `No subscribers match "${searchQuery.trim()}".`
                          : filterStatus !== 'all'
                            ? `No ${filterStatus} subscribers found.`
                            : 'No subscribers yet.'
                        }
                      </td>
                    </tr>
                  ) : filteredItems.map((item, idx) => {
                    const tags   = parseTags(item.tags)
                    const isLast = idx === filteredItems.length - 1
                    return (
                      <tr
                        key={item.id ?? item.user_id}
                        style={{
                          borderBottom: isLast ? 'none' : '1px solid #F9FAFB',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        {/* Name */}
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                              width: 32, height: 32, borderRadius: '50%',
                              background: '#EEF0FF', color: PURPLE,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
                            }}>
                              {item.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <span style={{ fontWeight: 600, color: '#111827' }}>{item.name}</span>
                          </div>
                        </td>

                        {/* Email */}
                        <td style={{ padding: '14px 20px', color: '#6B7280' }}>{item.email}</td>

                        {/* Status */}
                        <td style={{ padding: '14px 20px' }}>
                          <span style={{
                            padding: '4px 12px', borderRadius: 999,
                            fontSize: '0.6875rem', fontWeight: 600,
                            background: item.status === 'subscribed' ? '#ECFDF5' : '#FEF2F2',
                            color:      item.status === 'subscribed' ? '#16A34A' : '#DC2626',
                          }}>
                            {item.status}
                          </span>
                        </td>

                        {/* Tags */}
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                            {tags.length === 0
                              ? <span style={{ color: '#D1D5DB', fontSize: '0.75rem' }}>—</span>
                              : tags.map(tag => {
                                  const tc = tagColor[tag] || { bg: '#F3F4F6', color: '#6B7280' }
                                  return (
                                    <span key={tag} style={{
                                      padding: '3px 10px', borderRadius: 999,
                                      fontSize: '0.6875rem', fontWeight: 600,
                                      background: tc.bg, color: tc.color,
                                    }}>{tag}</span>
                                  )
                                })
                            }
                          </div>
                        </td>

                        {/* Joined */}
                        <td style={{
                          padding: '14px 20px', color: '#9CA3AF',
                          fontSize: '0.8125rem', whiteSpace: 'nowrap',
                        }}>
                          {item.created_at ? new Date(item.created_at).toLocaleDateString() : '—'}
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ display: 'flex', gap: 4 }}>
                            {[
                              { icon: <Pencil size={14} />, color: '#F59E0B', hover: '#FFFBEB', action: () => setEditTarget(item) },
                              { icon: <Trash2 size={14} />, color: '#EF4444', hover: '#FEF2F2', action: () => setDeleteTarget(item) },
                            ].map((btn, i) => (
                              <button
                                key={i}
                                onClick={btn.action}
                                style={{
                                  padding: 6, border: 'none', background: 'transparent',
                                  cursor: btn.action ? 'pointer' : 'default',
                                  color: btn.color, borderRadius: 8,
                                  display: 'flex', alignItems: 'center',
                                }}
                                onMouseEnter={e => { if (btn.action) e.currentTarget.style.background = btn.hover }}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                              >
                                {btn.icon}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </main>
      </div>


      {/* Edit modal — tags only */}
      {editTarget && (
        <EditTagsModal
          item={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={handleSaved}
        />
      )}

      {/* Delete modal */}
      {deleteTarget && (
        <DeleteModal
          item={deleteTarget}
          deleting={deleting}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
        />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}