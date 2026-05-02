import { useEffect, useState } from 'react'
import {
  Eye, Pencil, Trash2, Plus, Users, CheckCircle, XCircle,
  LayoutDashboard, Megaphone, BadgePercent, Mail, FileText,
  X, Check, Loader2, ChevronDown,
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
    { to: "/marketing-manager-dash",             label: "Dashboard",     icon: <LayoutDashboard size={18} />, end: true },
    { to: "/marketing-manager-dash/campaigns",   label: "Campaigns",     icon: <Megaphone size={18} /> },
    { to: "/marketing-manager-dash/promotions",  label: "Promotions",    icon: <BadgePercent size={18} /> },
    { to: "/marketing-manager-dash/newsletters", label: "Newsletters",   icon: <Mail size={18} /> },
    { to: "/marketing-manager-dash/blogs",       label: "Blogs",         icon: <FileText size={18} /> },
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

// ─── Subscriber Modal ─────────────────────────────────────────────────────────

function SubscriberModal({ initial, onClose, onSaved }) {
  const isEdit = !!initial?.id

  const parseTags = (raw) => {
    if (!raw) return []
    if (Array.isArray(raw)) return raw
    return raw.split(',').map(t => t.trim()).filter(Boolean)
  }

  const [form, setForm] = useState(
    initial
      ? {
          name:   initial.name   ?? '',
          email:  initial.email  ?? '',
          status: initial.status ?? 'subscribed',
          tags:   parseTags(initial.tags),
        }
      : EMPTY_FORM
  )
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const toggleTag = (tag) => {
    setForm(f => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag],
    }))
  }

  const handleSubmit = async () => {
    if (!form.name.trim())  return setError('Name is required.')
    if (!form.email.trim()) return setError('Email is required.')
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
      const res = isEdit
        ? await api.put(`/api/newsletters/${initial.id}`, payload)
        : await api.post('/api/newsletters/', payload)
      onSaved(res.data, isEdit)
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
            {isEdit ? 'Edit Subscriber' : 'New Subscriber'}
          </span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 4, borderRadius: 8 }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Name */}
          <div>
            <label style={labelStyle}>Full Name</label>
            <input style={inputBase} value={form.name} onChange={set('name')} onFocus={focus} onBlur={blur} placeholder="e.g. Sarah Johnson" />
          </div>

          {/* Email */}
          <div>
            <label style={labelStyle}>Email</label>
            <input style={inputBase} type="email" value={form.email} onChange={set('email')} onFocus={focus} onBlur={blur} placeholder="sarah@example.com" />
          </div>

          {/* Status */}
          <div>
            <label style={labelStyle}>Status</label>
            <div style={{ position: 'relative' }}>
              <select style={{ ...inputBase, paddingRight: 36 }} value={form.status} onChange={set('status')}>
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
              <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9CA3AF' }}>
                <ChevronDown size={15} />
              </span>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label style={labelStyle}>Tags</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {TAG_OPTIONS.map(tag => {
                const selected = form.tags.includes(tag)
                const tc = tagColor[tag] || { bg: '#F3F4F6', color: '#6B7280' }
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    style={{
                      padding: '5px 14px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 600,
                      cursor: 'pointer', transition: 'all 0.15s',
                      background: selected ? tc.bg    : '#F9FAFB',
                      color:      selected ? tc.color : '#9CA3AF',
                      border:     selected ? `1.5px solid ${tc.color}` : '1.5px solid #E5E7EB',
                    }}
                  >
                    {tag}
                  </button>
                )
              })}
            </div>
          </div>

          {error && (
            <p style={{ fontSize: '0.8125rem', color: '#EF4444', background: '#FEF2F2', padding: '8px 12px', borderRadius: 8 }}>
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 24px 20px', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onClose} style={{
            padding: '9px 20px', borderRadius: 10, border: '1px solid #E5E7EB',
            background: '#fff', color: '#374151', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer',
          }}>Cancel</button>
          <button onClick={handleSubmit} disabled={saving} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '9px 22px', borderRadius: 10, border: 'none',
            background: PURPLE, color: '#fff', fontSize: '0.875rem',
            fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
          }}>
            {saving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={14} />}
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
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: 8 }}>Remove Subscriber</h2>
        <p style={{ fontSize: '0.875rem', color: '#6B7280', lineHeight: 1.6, marginBottom: 24 }}>
          Are you sure you want to remove <strong style={{ color: '#374151' }}>{item.name}</strong> ({item.email})? This cannot be undone.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onClose} style={{
            padding: '9px 20px', borderRadius: 10, border: '1px solid #E5E7EB',
            background: '#fff', color: '#374151', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer',
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
  const [items,        setItems]        = useState([])
  const [loading,      setLoading]      = useState(true)
  const [openBar,      setOpenBar]      = useState(window.innerWidth >= 600)
  const [showCreate,   setShowCreate]   = useState(false)
  const [editTarget,   setEditTarget]   = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting,     setDeleting]     = useState(false)

  useEffect(() => {
    api.get('/api/newsletters/')
      .then(r  => setItems(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleSaved = (saved, isEdit) => {
    setItems(prev =>
      isEdit ? prev.map(i => i.id === saved.id ? saved : i) : [saved, ...prev]
    )
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

  const parseTags = (raw) => {
    if (!raw) return []
    if (Array.isArray(raw)) return raw
    return raw.split(',').map(t => t.trim()).filter(Boolean)
  }

  const total  = items.length
  const active = items.filter(i => i.status === 'subscribed').length
  const unsub  = items.filter(i => i.status === 'unsubscribed').length

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F4F6FB', fontFamily: 'system-ui, sans-serif' }}>

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

        <main style={{ flex: 1, overflowY: 'auto', padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Page header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#9CA3AF' }}>Manage subscriber list and preferences</p>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                background: PURPLE, color: '#fff', padding: '10px 20px',
                borderRadius: 12, border: 'none', fontSize: '0.875rem',
                fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(91,71,224,0.3)',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#4a38cc'}
              onMouseLeave={e => e.currentTarget.style.background = PURPLE}
            >
              <Plus size={16} /> Add Subscriber
            </button>
          </div>

          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
            {[
              { icon: <Users size={18} color="#3B82F6" />,      bg: '#EFF6FF', label: 'Total Subscribers', value: total  },
              { icon: <CheckCircle size={18} color="#16A34A" />, bg: '#F0FDF4', label: 'Active',            value: active },
              { icon: <XCircle size={18} color="#DC2626" />,     bg: '#FEF2F2', label: 'Unsubscribed',      value: unsub  },
            ].map(s => (
              <div key={s.label} style={{
                background: '#fff', borderRadius: 16, padding: '18px 20px',
                border: '1px solid #F0F0F5', boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
                display: 'flex', alignItems: 'center', gap: 14,
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>{s.icon}</div>
                <div>
                  <p style={{ fontSize: '0.6875rem', color: '#9CA3AF', marginBottom: 2 }}>{s.label}</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', lineHeight: 1 }}>{s.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Table */}
          <div style={{
            background: '#fff', borderRadius: 16,
            border: '1px solid #F0F0F5', boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
            overflow: 'hidden',
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700, fontSize: '0.875rem' }}>
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
                  ) : items.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '60px 0', color: '#9CA3AF', fontSize: '0.875rem' }}>
                        No subscribers yet — click Add Subscriber to get started.
                      </td>
                    </tr>
                  ) : items.map((item, idx) => {
                    const tags = parseTags(item.tags)
                    const isLast = idx === items.length - 1
                    return (
                      <tr
                        key={item.id}
                        style={{ borderBottom: isLast ? 'none' : '1px solid #F9FAFB', transition: 'background 0.15s' }}
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
                        <td style={{ padding: '14px 20px', color: '#9CA3AF', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                          {item.created_at ? new Date(item.created_at).toLocaleDateString() : '—'}
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ display: 'flex', gap: 4 }}>
                            {[
                              { icon: <Eye size={14} />,    color: '#3B82F6', hover: '#EFF6FF', action: null },
                              { icon: <Pencil size={14} />, color: '#F59E0B', hover: '#FFFBEB', action: () => setEditTarget(item) },
                              { icon: <Trash2 size={14} />, color: '#EF4444', hover: '#FEF2F2', action: () => setDeleteTarget(item) },
                            ].map((btn, i) => (
                              <button
                                key={i}
                                onClick={btn.action}
                                style={{
                                  padding: 6, border: 'none', background: 'transparent',
                                  cursor: 'pointer', color: btn.color, borderRadius: 8,
                                  display: 'flex', alignItems: 'center',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = btn.hover}
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

      {/* Modals */}
      {showCreate   && <SubscriberModal initial={null}      onClose={() => setShowCreate(false)} onSaved={handleSaved} />}
      {editTarget   && <SubscriberModal initial={editTarget} onClose={() => setEditTarget(null)} onSaved={handleSaved} />}
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