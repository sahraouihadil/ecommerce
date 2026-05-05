import { useEffect, useState } from 'react'
import {
  Eye, Pencil, Trash2, Plus, Calendar,
  LayoutDashboard, Megaphone, BadgePercent,
  Mail, FileText, X, Check, Loader2,
  ChevronDown,
} from 'lucide-react'
import api from '../../services/api'
import Sidebar from '../ui/Sidebar'
import Header from '../ui/Header'

// ─── Constants ───────────────────────────────────────────────────────────────

const PURPLE = '#5B47E0'

const STATUS_OPTIONS = ['active', 'draft', 'paused', 'completed']

const CHANNEL_OPTIONS = [
  'Facebook',
  'Instagram',
]

const statusStyle = {
  active:    { bg: '#ECFDF5', color: '#16A34A' },
  draft:     { bg: '#FEF9C3', color: '#B45309' },
  paused:    { bg: '#FFF7ED', color: '#C2410C' },
  completed: { bg: '#EFF6FF', color: '#2563EB' },
}

const EMPTY_FORM = {
  name: '', channel: 'Email', status: 'draft',
  budget: 0, start_date: '', end_date: '',
}

  const marketingmanagerLinks = [
    { to: "/marketing-manager-dash",             label: "Dashboard",     icon: <LayoutDashboard size={18} />, end: true },
    { to: "/marketing-manager-dash/campaigns",   label: "Campaigns",     icon: <Megaphone size={18} /> },
    { to: "/marketing-manager-dash/promotions",  label: "Promotions",    icon: <BadgePercent size={18} /> },
    { to: "/marketing-manager-dash/newsletters", label: "Newsletters",   icon: <Mail size={18} /> },
    { to: "/marketing-manager-dash/blogs",       label: "Blogs",         icon: <FileText size={18} /> },
  ]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n) {
  const num = Number(n) || 0
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`
  return num.toLocaleString()
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const labelStyle = {
  display: 'block',
  fontSize: '0.6875rem',
  fontWeight: 600,
  letterSpacing: '0.07em',
  color: '#6B7280',
  textTransform: 'uppercase',
  marginBottom: '6px',
}

const inputStyle = {
  width: '100%',
  border: '1px solid #E5E7EB',
  borderRadius: '10px',
  padding: '10px 14px',
  fontSize: '0.875rem',
  color: '#111827',
  outline: 'none',
  boxSizing: 'border-box',
  background: '#fff',
  appearance: 'none',
}

// ─── Campaign Modal ───────────────────────────────────────────────────────────

function CampaignModal({ initial, onClose, onSaved }) {
  const isEdit = !!initial?.id
  const [form, setForm] = useState(
    initial
      ? {
          name:       initial.name       ?? '',
          channel:    initial.channel    ?? 'Email',
          status:     initial.status     ?? 'draft',
          budget:     initial.budget     ?? 0,
          start_date: initial.start_date ?? '',
          end_date:   initial.end_date   ?? '',
        }
      : EMPTY_FORM
  )
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async () => {
    if (!form.name.trim())                       return setError('Campaign name is required.')
    if (!form.start_date)                        return setError('Start date is required.')
    if (!form.end_date)                          return setError('End date is required.')
    if (form.start_date > form.end_date)         return setError('Start date must be before end date.')
    setError('')
    setSaving(true)
    try {
      const payload = {
        name:        form.name.trim(),
        channel:     form.channel,
        status:      form.status,
        budget:      parseFloat(form.budget) || 0,
        spent:       initial?.spent        ?? 0,
        impressions: initial?.impressions  ?? 0,
        clicks:      initial?.clicks       ?? 0,
        start_date:  form.start_date,
        end_date:    form.end_date,
      }
      const res = isEdit
        ? await api.put(`/api/campaigns/${initial.id}`, payload)
        : await api.post('/api/campaigns/', payload)
      onSaved(res.data, isEdit)
      onClose()
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  const backdrop = e => { if (e.target === e.currentTarget) onClose() }

  return (
    <div
      onClick={backdrop}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
        background: 'rgba(0,0,0,0.25)',
        backdropFilter: 'blur(3px)',
      }}
    >
      <div style={{
        background: '#fff', borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        width: '100%', maxWidth: '480px', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '22px 24px 18px', borderBottom: '1px solid #F3F4F6',
        }}>
          <span style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#111827' }}>
            {isEdit ? 'Edit Campaign' : 'New Campaign'}
          </span>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 4, borderRadius: 8 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Name */}
          <div>
            <label style={labelStyle}>Campaign Name</label>
            <input
              style={inputStyle}
              value={form.name}
              onChange={set('name')}
              onFocus={e => e.target.style.borderColor = PURPLE}
              onBlur={e  => e.target.style.borderColor = '#E5E7EB'}
            />
          </div>

          {/* Channel */}
          <div>
            <label style={labelStyle}>Channel</label>
            <div style={{ position: 'relative' }}>
              <select
                style={{ ...inputStyle, paddingRight: 36 }}
                value={form.channel}
                onChange={set('channel')}
              >
                {CHANNEL_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9CA3AF' }}>
                <ChevronDown size={15} />
              </span>
            </div>
          </div>

          {/* Status */}
          <div>
            <label style={labelStyle}>Status</label>
            <div style={{ position: 'relative' }}>
              <select
                style={{ ...inputStyle, paddingRight: 36 }}
                value={form.status}
                onChange={set('status')}
              >
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
              <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9CA3AF' }}>
                <ChevronDown size={15} />
              </span>
            </div>
          </div>

          {/* Budget + Start Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Budget (DA)</label>
              <input
                style={inputStyle}
                type="number"
                min="0"
                value={form.budget}
                onChange={set('budget')}
                onFocus={e => e.target.style.borderColor = PURPLE}
                onBlur={e  => e.target.style.borderColor = '#E5E7EB'}
              />
            </div>
            <div>
              <label style={labelStyle}>Start Date</label>
              <input
                style={inputStyle}
                type="date"
                value={form.start_date}
                onChange={set('start_date')}
                onFocus={e => e.target.style.borderColor = PURPLE}
                onBlur={e  => e.target.style.borderColor = '#E5E7EB'}
              />
            </div>
          </div>

          {/* End Date */}
          <div>
            <label style={labelStyle}>End Date</label>
            <input
              style={inputStyle}
              type="date"
              value={form.end_date}
              onChange={set('end_date')}
              onFocus={e => e.target.style.borderColor = PURPLE}
              onBlur={e  => e.target.style.borderColor = '#E5E7EB'}
            />
          </div>

          {error && (
            <p style={{ fontSize: '0.8125rem', color: '#EF4444', background: '#FEF2F2', padding: '8px 12px', borderRadius: 8 }}>
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 24px 20px', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              padding: '9px 20px', borderRadius: 10, border: '1px solid #E5E7EB',
              background: '#fff', color: '#374151', fontSize: '0.875rem',
              fontWeight: 500, cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '9px 22px', borderRadius: 10, border: 'none',
              background: PURPLE, color: '#fff', fontSize: '0.875rem',
              fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1,
            }}
          >
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
  const backdrop = e => { if (e.target === e.currentTarget) onClose() }
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
        width: '100%', maxWidth: '400px', padding: '28px 24px',
      }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: 8 }}>Delete Campaign</h2>
        <p style={{ fontSize: '0.875rem', color: '#6B7280', lineHeight: 1.6, marginBottom: 24 }}>
          Are you sure you want to delete <strong style={{ color: '#374151' }}>"{item.name}"</strong>? This cannot be undone.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              padding: '9px 20px', borderRadius: 10, border: '1px solid #E5E7EB',
              background: '#fff', color: '#374151', fontSize: '0.875rem',
              fontWeight: 500, cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '9px 22px', borderRadius: 10, border: 'none',
              background: '#EF4444', color: '#fff', fontSize: '0.875rem',
              fontWeight: 600, cursor: deleting ? 'not-allowed' : 'pointer',
              opacity: deleting ? 0.7 : 1,
            }}
          >
            {deleting && <Loader2 size={14} />}
            {deleting ? 'Deleting…' : 'Yes, Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Channel Icon ─────────────────────────────────────────────────────────────

function ChannelIcon({ channel }) {
  const icons = {
    Facebook:     { emoji: '📘', bg: '#E7F0FD' },
    Instagram:    { emoji: '📸', bg: '#FDE7F3' },
    TikTok:       { emoji: '🎵', bg: '#E7FDF8' },
    YouTube:      { emoji: '▶️',  bg: '#FDE7E7' },
    'Twitter / X':{ emoji: '🐦', bg: '#E7F5FD' },
    LinkedIn:     { emoji: '💼', bg: '#E7EEF9' },
    Snapchat:     { emoji: '👻', bg: '#FDFBE7' },
    Pinterest:    { emoji: '📌', bg: '#FDE7E7' },
    WhatsApp:     { emoji: '💬', bg: '#E7FDE9' },
    Telegram:     { emoji: '✈️',  bg: '#E7F5FD' },
    Email:        { emoji: '📧', bg: '#EEF0FF' },
    AR:           { emoji: '🥽', bg: '#F3E7FD' },
    Search:       { emoji: '🔍', bg: '#FDF5E7' },
    Display:      { emoji: '🖥️', bg: '#E7FDFC' },
  }
  const { emoji, bg } = icons[channel] || { emoji: '📣', bg: '#EEF0FF' }
  return (
    <div style={{
      width: 40, height: 40, borderRadius: 12, background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '1.1rem', flexShrink: 0,
    }}>
      {emoji}
    </div>
  )
}

// ─── Campaign Card ────────────────────────────────────────────────────────────

function CampaignCard({ item, onEdit, onDelete }) {
  const pct = item.budget > 0 ? Math.min(100, Math.round((item.spent / item.budget) * 100)) : 0
  const st  = statusStyle[item.status] || { bg: '#F3F4F6', color: '#6B7280' }

  return (
    <div
      style={{
        background: '#fff', borderRadius: 16, border: '1px solid #F0F0F5',
        boxShadow: '0 1px 6px rgba(0,0,0,0.04)', padding: '20px',
        display: 'flex', flexDirection: 'column', gap: 16, transition: 'box-shadow 0.2s',
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 6px rgba(0,0,0,0.04)'}
    >
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ChannelIcon channel={item.channel} />
          <div>
            <p style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#111827', marginBottom: 2 }}>
              {item.name}
            </p>
            <p style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{item.channel}</p>
          </div>
        </div>
        <span style={{
          padding: '4px 12px', borderRadius: 999,
          fontSize: '0.6875rem', fontWeight: 600,
          background: st.bg, color: st.color, flexShrink: 0,
        }}>
          {item.status}
        </span>
      </div>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px' }}>
        {[
          { label: 'Budget',      value: `${Number(item.budget).toLocaleString()} DA` },
          { label: 'Spent',       value: `${Number(item.spent).toLocaleString()} DA` },
          { label: 'Impressions', value: fmt(item.impressions) },
          { label: 'Clicks',      value: fmt(item.clicks) },
        ].map(m => (
          <div key={m.label}>
            <p style={{ fontSize: '0.6875rem', color: '#9CA3AF', marginBottom: 2 }}>{m.label}</p>
            <p style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#111827' }}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Budget bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: '0.6875rem', color: '#9CA3AF' }}>Budget Used</span>
          <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#374151' }}>{pct}%</span>
        </div>
        <div style={{ height: 5, borderRadius: 99, background: '#F0F0F5', overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${pct}%`, background: PURPLE,
            borderRadius: 99, transition: 'width 0.5s ease',
          }} />
        </div>
      </div>

      {/* Footer */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: 12, borderTop: '1px solid #F3F4F6',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', color: '#9CA3AF' }}>
          <Calendar size={12} />
          <span>{item.start_date} → {item.end_date}</span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {[
            { icon: <Pencil size={14} />, color: '#F59E0B', hover: '#FFFBEB', action: () => onEdit(item) },
            { icon: <Trash2 size={14} />, color: '#EF4444', hover: '#FEF2F2', action: () => onDelete(item) },
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
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CampaignsPage() {
  const [items,        setItems]        = useState([])
  const [loading,      setLoading]      = useState(true)
  const [openBar,      setOpenBar]      = useState(window.innerWidth >= 600)
  const [showCreate,   setShowCreate]   = useState(false)
  const [editTarget,   setEditTarget]   = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting,     setDeleting]     = useState(false)

  useEffect(() => {
    api.get('/api/campaigns/')
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
      await api.delete(`/api/campaigns/${deleteTarget.id}`)
      setItems(prev => prev.filter(i => i.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch (err) { console.error(err) }
    finally { setDeleting(false) }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F4F6FB', fontFamily: 'system-ui, sans-serif' }}>

      {/* Sidebar */}
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

        {/* ── Shared Header ── */}
        <Header concept="Campaigns"/>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>

          {/* Page header row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#9CA3AF' }}>Track and manage marketing campaigns</p>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                background: PURPLE, color: '#fff',
                padding: '10px 20px', borderRadius: 12,
                border: 'none', fontSize: '0.875rem', fontWeight: 600,
                cursor: 'pointer', boxShadow: '0 4px 12px rgba(91,71,224,0.3)',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#4a38cc'}
              onMouseLeave={e => e.currentTarget.style.background = PURPLE}
            >
              <Plus size={16} /> New Campaign
            </button>
          </div>

          {/* Grid */}
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                border: `2px solid ${PURPLE}`, borderTopColor: 'transparent',
                animation: 'spin 0.8s linear infinite',
              }} />
            </div>
          ) : items.length === 0 ? (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', padding: '100px 0', gap: 12, color: '#9CA3AF',
            }}>
              <Megaphone size={44} style={{ opacity: 0.25 }} />
              <p style={{ fontSize: '0.875rem' }}>No campaigns yet — click New Campaign to get started.</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 20,
            }}>
              {items.map(item => (
                <CampaignCard
                  key={item.id}
                  item={item}
                  onEdit={setEditTarget}
                  onDelete={setDeleteTarget}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      {showCreate   && <CampaignModal initial={null}       onClose={() => setShowCreate(false)} onSaved={handleSaved} />}
      {editTarget   && <CampaignModal initial={editTarget} onClose={() => setEditTarget(null)}  onSaved={handleSaved} />}
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