import { useEffect, useState } from 'react'
import {
  Eye, Pencil, Trash2, Plus,
  LayoutDashboard, Megaphone, BadgePercent,
  Mail, FileText, X, Check, Loader2, ChevronDown,
} from 'lucide-react'
import api from '../../services/api'
import Sidebar from '../ui/Sidebar'
import Header from '../ui/Header'

// ─── Constants ────────────────────────────────────────────────────────────────

const PURPLE = '#5B47E0'

const TYPE_OPTIONS   = ['Percentage', 'Fixed']
const STATUS_OPTIONS = ['active', 'upcoming', 'expired']

const statusStyle = {
  active:   { bg: '#ECFDF5', color: '#16A34A' },
  upcoming: { bg: '#EDE9FE', color: '#7C3AED' },
  expired:  { bg: '#FEF2F2', color: '#DC2626' },
}

const EMPTY_FORM = {
  title: '', code: '', discount: 0,
  discount_type: 'Percentage', usage_max: 0, expiry: '', status: 'upcoming',
}

  const marketingmanagerLinks = [
    { to: "/marketing-manager-dash",             label: "Dashboard",     icon: <LayoutDashboard size={18} />, end: true },
    { to: "/marketing-manager-dash/campaigns",   label: "Campaigns",     icon: <Megaphone size={18} /> },
    { to: "/marketing-manager-dash/promotions",  label: "Promotions",    icon: <BadgePercent size={18} /> },
    { to: "/marketing-manager-dash/newsletters", label: "Newsletters",   icon: <Mail size={18} /> },
    { to: "/marketing-manager-dash/blogs",       label: "Blogs",         icon: <FileText size={18} /> },
  ]
// ─── Shared input styles ──────────────────────────────────────────────────────

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

// ─── Promo Modal ──────────────────────────────────────────────────────────────

function PromoModal({ initial, onClose, onSaved }) {
  const isEdit = !!initial?.id
  const [form, setForm] = useState(
    initial
      ? {
          title:         initial.title         ?? '',
          code:          initial.code          ?? '',
          discount:      initial.discount      ?? 0,
          discount_type: initial.discount_type ?? 'Percentage',
          usage_max:     initial.usage_max     ?? 0,
          expiry: initial.expiry ? initial.expiry.split('T')[0].split(' ')[0] : '',
          status:        initial.status        ?? 'upcoming',
        }
      : EMPTY_FORM
  )
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async () => {
    if (!form.title.trim()) return setError('Title is required.')
    if (!form.code.trim())  return setError('Code is required.')
    if (!form.expiry)       return setError('Expiry date is required.')
    setError('')
    setSaving(true)
    try {
      const payload = {
        title:         form.title.trim(),
        code:          form.code.trim().toUpperCase(),
        discount:      parseFloat(form.discount) || 0,
        discount_type: form.discount_type,
        usage_max:     parseInt(form.usage_max)  || 0,
        expiry:        form.expiry,
        status:        form.status,
      }
      const res = isEdit
        ? await api.put(`/api/promotions/${initial.id}`, payload)
        : await api.post('/api/promotions/', payload)
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
        width: '100%', maxWidth: '480px', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '22px 24px 18px', borderBottom: '1px solid #F3F4F6',
        }}>
          <span style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#111827' }}>
            {isEdit ? 'Edit Promotion' : 'New Promotion'}
          </span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 4, borderRadius: 8 }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Title */}
          <div>
            <label style={labelStyle}>Title</label>
            <input style={inputBase} value={form.title} onChange={set('title')} onFocus={focus} onBlur={blur} />
          </div>

          {/* Code */}
          <div>
            <label style={labelStyle}>Code</label>
            <input
              style={{ ...inputBase, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}
              value={form.code}
              onChange={set('code')}
              onFocus={focus} onBlur={blur}
              placeholder="e.g. SUMMER25"
            />
          </div>

          {/* Discount + Type */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Discount</label>
              <input
                style={inputBase} type="number" min="0"
                value={form.discount} onChange={set('discount')} onFocus={focus} onBlur={blur}
              />
            </div>
            <div>
              <label style={labelStyle}>Type</label>
              <div style={{ position: 'relative' }}>
                <select style={{ ...inputBase, paddingRight: 36 }} value={form.discount_type} onChange={set('discount_type')}>
                  {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9CA3AF' }}>
                  <ChevronDown size={15} />
                </span>
              </div>
            </div>
          </div>

          {/* Max Uses + Expiry */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Max Uses</label>
              <input
                style={inputBase} type="number" min="0"
                value={form.usage_max} onChange={set('usage_max')} onFocus={focus} onBlur={blur}
              />
            </div>
            <div>
              <label style={labelStyle}>Expiry</label>
              <input style={inputBase} type="date" value={form.expiry} onChange={set('expiry')} onFocus={focus} onBlur={blur} />
            </div>
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
          }}>
            Cancel
          </button>
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
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: 8 }}>Delete Promotion</h2>
        <p style={{ fontSize: '0.875rem', color: '#6B7280', lineHeight: 1.6, marginBottom: 24 }}>
          Are you sure you want to delete <strong style={{ color: '#374151' }}>"{item.title}"</strong>? This cannot be undone.
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
            {deleting ? 'Deleting…' : 'Yes, Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function Badge({ status }) {
  const s = statusStyle[status] || { bg: '#F3F4F6', color: '#6B7280' }
  return (
    <span style={{
      padding: '4px 12px', borderRadius: 999,
      fontSize: '0.6875rem', fontWeight: 600,
      background: s.bg, color: s.color,
    }}>
      {status}
    </span>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PromotionsPage() {
  const [items,        setItems]        = useState([])
  const [loading,      setLoading]      = useState(true)
  const [openBar,      setOpenBar]      = useState(window.innerWidth >= 600)
  const [showCreate,   setShowCreate]   = useState(false)
  const [editTarget,   setEditTarget]   = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting,     setDeleting]     = useState(false)

  useEffect(() => {
    api.get('/api/promotions/')
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
      await api.delete(`/api/promotions/${deleteTarget.id}`)
      setItems(prev => prev.filter(i => i.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch (err) { console.error(err) }
    finally { setDeleting(false) }
  }

  const formatDiscount = (item) => {
    if (item.discount_type === 'Percentage') return `${item.discount}%`
    return `${item.discount} DA`
  }

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

        <Header concept="Promotions" onToggleSidebar={() => setOpenBar(p => !p)} />

        <main style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>

          {/* Page header row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#9CA3AF' }}>Manage discount codes and offers</p>
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
              <Plus size={16} /> Add Promo
            </button>
          </div>

          {/* Table */}
          <div style={{
            background: '#fff', borderRadius: 16,
            border: '1px solid #F0F0F5',
            boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
            overflow: 'hidden',
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800, fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #F3F4F6' }}>
                    {['Title', 'Code', 'Discount', 'Type', 'Usage', 'Expiry', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{
                        textAlign: 'left', padding: '14px 20px',
                        fontSize: '0.6875rem', fontWeight: 600,
                        color: '#9CA3AF', textTransform: 'uppercase',
                        letterSpacing: '0.07em', whiteSpace: 'nowrap',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '60px 0' }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: '50%', margin: '0 auto',
                          border: `2px solid ${PURPLE}`, borderTopColor: 'transparent',
                          animation: 'spin 0.8s linear infinite',
                        }} />
                      </td>
                    </tr>
                  ) : items.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '60px 0', color: '#9CA3AF', fontSize: '0.875rem' }}>
                        No promotions yet — click Add Promo to get started.
                      </td>
                    </tr>
                  ) : items.map((item, idx) => {
                    const pct = item.usage_max > 0
                      ? Math.min(100, Math.round((item.usage_current / item.usage_max) * 100))
                      : 0
                    const isLast = idx === items.length - 1
                    return (
                      <tr
                        key={item.id}
                        style={{ borderBottom: isLast ? 'none' : '1px solid #F9FAFB', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        {/* Title */}
                        <td style={{ padding: '16px 20px', fontWeight: 600, color: '#111827' }}>{item.title}</td>

                        {/* Code */}
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{
                            background: '#EEF0FF', color: PURPLE,
                            padding: '4px 10px', borderRadius: 6,
                            fontSize: '0.75rem', fontWeight: 700,
                            fontFamily: 'monospace', letterSpacing: '0.05em',
                          }}>
                            {item.code}
                          </span>
                        </td>

                        {/* Discount */}
                        <td style={{ padding: '16px 20px', fontWeight: 700, color: '#16A34A' }}>
                          {formatDiscount(item)}
                        </td>

                        {/* Type */}
                        <td style={{ padding: '16px 20px', color: '#6B7280' }}>{item.discount_type}</td>

                        {/* Usage */}
                        <td style={{ padding: '16px 20px', minWidth: 110 }}>
                          <span style={{ fontSize: '0.75rem', color: '#6B7280', display: 'block', marginBottom: 5 }}>
                            {item.usage_current}/{item.usage_max}
                          </span>
                          <div style={{ height: 4, borderRadius: 99, background: '#F0F0F5', overflow: 'hidden' }}>
                            <div style={{
                              height: '100%', width: `${pct}%`,
                              background: PURPLE, borderRadius: 99,
                              transition: 'width 0.5s ease',
                            }} />
                          </div>
                        </td>

                        {/* Expiry */}
                        <td style={{ padding: '16px 20px', color: '#9CA3AF', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                          {item.expiry}
                        </td>

                        {/* Status */}
                        <td style={{ padding: '16px 20px' }}>
                          <Badge status={item.status} />
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '16px 20px' }}>
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
      {showCreate   && <PromoModal initial={null}      onClose={() => setShowCreate(false)} onSaved={handleSaved} />}
      {editTarget   && <PromoModal initial={editTarget} onClose={() => setEditTarget(null)} onSaved={handleSaved} />}
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