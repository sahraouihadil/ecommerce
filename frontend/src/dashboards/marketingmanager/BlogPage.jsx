import { useEffect, useState } from 'react'
import {
  Eye, Pencil, Trash2, Plus, User, Calendar, LayoutDashboard,
  Megaphone, BadgePercent, Mail, FileText, X, Loader2, Clock,
  AlertTriangle,
} from 'lucide-react'
import api from '../../services/api'
import Sidebar from '../ui/Sidebar'
import Header from '../ui/Header'

const GOLD = '#5B47E0'

const STATUS_OPTIONS   = ['published', 'draft']
const CATEGORY_OPTIONS = ['AR', 'Email', 'Promotions', 'Social', 'Branding']

const statusStyle = {
  published: 'bg-green-100 text-green-600',
  draft:     'bg-yellow-100 text-yellow-700',
  pending:   'bg-purple-100 text-purple-600',
}

const categoryStyle = {
  AR:         'bg-violet-50 text-violet-600',
  Email:      'bg-blue-50   text-blue-600',
  Promotions: 'bg-orange-50 text-orange-600',
  Social:     'bg-pink-50   text-pink-600',
  Branding:   'bg-teal-50   text-teal-600',
}

const EMPTY_FORM = {
  title: '', excerpt: '', category: 'AR', status: 'draft',
  author: '', image: '', tag: '', content: '',
}

// ── Reusable field ───────────────────────────────────────────────────────────

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  )
}

const inputCls = `w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800
  focus:outline-none focus:ring-2 focus:ring-[#5B47E0]/30 focus:border-[#5B47E0] transition`

// ── Banners ──────────────────────────────────────────────────────────────────

function Banner({ icon: Icon, color, bg, border, title, body, onClose }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 12,
      padding: '14px 18px', borderRadius: 14,
      background: bg, border: `1.5px solid ${border}`,
    }}>
      <Icon size={18} style={{ color, flexShrink: 0, marginTop: 1 }} />
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color }}>{title}</p>
        <p style={{ margin: '3px 0 0', fontSize: 12, color, opacity: 0.85, lineHeight: 1.5 }}
          dangerouslySetInnerHTML={{ __html: body }}
        />
      </div>
      {onClose && (
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color, opacity: 0.6, padding: 2 }}
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}

function PendingCreateBanner({ onClose }) {
  return (
    <Banner
      icon={Clock}
      color="#5b21b6"
      bg="linear-gradient(135deg,#f5f3ff,#ede9fe)"
      border="#c4b5fd"
      title="Blog submitted for admin review"
      body="Your post has been saved and is pending validation. It will go live on the Journal page once an admin approves it."
      onClose={onClose}
    />
  )
}

function PendingEditBanner({ onClose }) {
  return (
    <Banner
      icon={Clock}
      color="#1d4ed8"
      bg="linear-gradient(135deg,#eff6ff,#dbeafe)"
      border="#93c5fd"
      title="Edit submitted for admin review"
      body="Your changes have been saved as <strong>draft</strong>. An admin must re-approve before the updated post goes live on the Journal."
      onClose={onClose}
    />
  )
}

function PendingSaveBanner({ onClose }) {
  return (
    <Banner
      icon={Clock}
      color="#047857"
      bg="linear-gradient(135deg,#ecfdf5,#d1fae5)"
      border="#6ee7b7"
      title="Draft saved"
      body="Your post has been saved as <strong>draft</strong>. It will not go live until you resubmit it for admin review."
      onClose={onClose}
    />
  )
}

function PendingDeleteBanner({ onClose }) {
  return (
    <Banner
      icon={AlertTriangle}
      color="#b45309"
      bg="linear-gradient(135deg,#fffbeb,#fef3c7)"
      border="#fcd34d"
      title="Deletion request submitted for admin review"
      body="The blog post has been flagged for deletion and is awaiting admin approval. It will remain visible to managers until the request is resolved."
      onClose={onClose}
    />
  )
}

// ── Blog modal (create / edit) ───────────────────────────────────────────────

function BlogModal({ initial, onClose, onSaved }) {
  const isEdit      = !!initial?.id
  const isPublished = initial?.status === 'published'

  const [form, setForm]     = useState(initial ? {
    title:    initial.title    ?? '',
    excerpt:  initial.excerpt  ?? '',
    category: initial.category ?? 'AR',
    status:   initial.status   ?? 'draft',
    author:   initial.author   ?? '',
    image:    initial.image    ?? '',
    tag:      initial.tag      ?? '',
    content:  initial.body     ?? '',
  } : EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  // ── Derived state based on current status selection ────────────────────────
  // draft     → "Save"           (persist only, no review request sent)
  // published → "Submit for Review" / "Save for Review"
  const wantsReview = form.status === 'published'

  const submitLabel = wantsReview
    ? (isEdit ? 'Save for Review' : 'Submit for Review')
    : 'Save'

  // Notice text changes to reflect the chosen status
  const noticeText = wantsReview
    ? isEdit
      ? 'Saving will reset this post to draft and require admin re-approval.'
      : 'New posts require admin approval before being published on the Journal.'
    : isEdit
      ? 'This post will be saved as draft — it won\'t go live until submitted for review.'
      : 'Saving as draft — the post won\'t go live until you resubmit it for review.'

  const noticeColor  = wantsReview ? (isEdit ? '#1e40af' : '#6d28d9') : '#166534'
  const noticeBg     = wantsReview ? (isEdit ? '#eff6ff'  : '#f5f3ff') : '#f0fdf4'
  const noticeBorder = wantsReview ? (isEdit ? '#bfdbfe'  : '#ddd6fe') : '#bbf7d0'
  const NoticeIcon   = wantsReview ? Clock : FileText

  const handleSubmit = async () => {
    if (!form.title.trim())   return setError('Title is required.')
    if (!form.author.trim())  return setError('Author is required.')
    if (!form.excerpt.trim()) return setError('Excerpt is required.')
    setError('')
    setSaving(true)
    try {
      const payload = {
        title:    form.title.trim(),
        excerpt:  form.excerpt.trim(),
        category: form.category,
        status:   form.status,
        author:   form.author.trim(),
        image:    form.image.trim(),
        tag:      form.tag.trim(),
        content:  form.content.trim(),
      }
      const res = isEdit
        ? await api.put(`/api/blogs/${initial.id}`, payload)
        : await api.post('/api/blogs/', payload)
      onSaved(res.data, isEdit, isPublished, wantsReview)
      onClose()
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleBackdrop = (e) => { if (e.target === e.currentTarget) onClose() }

  return (
    <div
      onClick={handleBackdrop}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,12,40,0.45)', backdropFilter: 'blur(4px)' }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-800">
              {isEdit ? 'Edit Blog Post' : 'New Blog Post'}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {wantsReview
                ? (!isEdit
                    ? 'Your post will be sent for admin review before going live.'
                    : 'Your changes will be sent for admin review before going live.')
                : 'Your post will be saved as draft — no review request will be sent.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-5 flex flex-col gap-4">

          {/* Dynamic notice */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '11px 14px', borderRadius: 12,
            background: noticeBg,
            border: `1px solid ${noticeBorder}`,
          }}>
            <NoticeIcon size={14} style={{ color: noticeColor, flexShrink: 0 }} />
            <p style={{ margin: 0, fontSize: 12, color: noticeColor, fontWeight: 600 }}>
              {noticeText}
            </p>
          </div>

          <Field label="Title *">
            <input
              className={inputCls}
              placeholder="e.g. How AR is Changing Interior Design"
              value={form.title}
              onChange={set('title')}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Author *">
              <input
                className={inputCls}
                placeholder="e.g. Sara Benali"
                value={form.author}
                onChange={set('author')}
              />
            </Field>
            <Field label="Tag">
              <input
                className={inputCls}
                placeholder="e.g. Augmented Reality"
                value={form.tag}
                onChange={set('tag')}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Category">
              <select className={inputCls} value={form.category} onChange={set('category')}>
                {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>

            <Field label="Status">
              <select className={inputCls} value={form.status} onChange={set('status')}>
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Image URL">
            <input
              className={inputCls}
              placeholder="https://example.com/image.jpg"
              value={form.image}
              onChange={set('image')}
            />
            {form.image && (
              <img
                src={form.image}
                alt="preview"
                onError={e => e.target.style.display = 'none'}
                className="mt-2 h-32 w-full object-cover rounded-xl border border-gray-100"
              />
            )}
          </Field>

          <Field label="Excerpt *">
            <textarea
              className={`${inputCls} resize-none`}
              rows={2}
              placeholder="A short summary shown in the blog card…"
              value={form.excerpt}
              onChange={set('excerpt')}
            />
          </Field>

          <Field label="Content">
            <textarea
              className={`${inputCls} resize-none`}
              rows={6}
              placeholder="Full blog post body…"
              value={form.content}
              onChange={set('content')}
            />
          </Field>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 px-4 py-2.5 rounded-xl">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition shadow-sm disabled:opacity-60"
            style={{ background: GOLD }}
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {saving ? 'Saving…' : submitLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Delete confirm modal ─────────────────────────────────────────────────────

function DeleteModal({ item, onClose, onConfirm, deleting }) {
  const handleBackdrop = (e) => { if (e.target === e.currentTarget) onClose() }
  return (
    <div
      onClick={handleBackdrop}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,12,40,0.45)', backdropFilter: 'blur(4px)' }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-base font-bold text-gray-800">Request Blog Deletion</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            Are you sure you want to request deletion of{' '}
            <span className="font-semibold text-gray-700">"{item.title}"</span>?
          </p>
          <div style={{
            marginTop: 8, padding: '10px 14px', borderRadius: 10,
            background: '#fffbeb', border: '1px solid #fcd34d',
            display: 'flex', alignItems: 'flex-start', gap: 8,
          }}>
            <AlertTriangle size={14} style={{ color: '#b45309', marginTop: 1, flexShrink: 0 }} />
            <p style={{ margin: 0, fontSize: 12, color: '#92400e', lineHeight: 1.5 }}>
              This will submit a deletion request to an admin.
              The post will <strong>not</strong> be removed until an admin approves the request.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition disabled:opacity-60"
          >
            {deleting && <Loader2 size={14} className="animate-spin" />}
            {deleting ? 'Submitting…' : 'Submit Deletion Request'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Blog card ────────────────────────────────────────────────────────────────

function StatusBadge({ status, pendingValidation, pendingDelete }) {
  if (pendingDelete) {
    return (
      <span className="px-3 py-1 text-xs rounded-full font-medium bg-red-100 text-red-600 flex items-center gap-1">
        <AlertTriangle size={10} /> Deletion pending
      </span>
    )
  }
  if (pendingValidation) {
    return (
      <span className="px-3 py-1 text-xs rounded-full font-medium bg-purple-100 text-purple-600 flex items-center gap-1">
        <Clock size={10} /> Pending review
      </span>
    )
  }
  return (
    <span className={`px-3 py-1 text-xs rounded-full font-medium ${statusStyle[status] || 'bg-gray-100 text-gray-500'}`}>
      {status}
    </span>
  )
}

function CategoryBadge({ category }) {
  return (
    <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${categoryStyle[category] || 'bg-gray-100 text-gray-500'}`}>
      {category}
    </span>
  )
}

function BlogCard({ item, onEdit, onDelete }) {
  const pendingValidation = item.validation_status === 'pending' || item._pendingValidation
  const pendingDelete     = item._pendingDelete

  const ribbon = pendingDelete
    ? { bg: 'linear-gradient(90deg,#ef4444,#fca5a5)', label: 'Awaiting admin — deletion request' }
    : pendingValidation
      ? { bg: 'linear-gradient(90deg,#7c3aed,#a78bfa)', label: 'Awaiting admin approval' }
      : null

  const cardBorderStyle = pendingDelete
    ? { borderColor: '#fca5a5', boxShadow: '0 0 0 2px #fee2e2' }
    : pendingValidation
      ? { borderColor: '#c4b5fd', boxShadow: '0 0 0 2px #ede9fe' }
      : {}

  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-3 hover:shadow-md transition-shadow overflow-hidden"
      style={cardBorderStyle}
    >
      {item.image && (
        <img
          src={item.image}
          alt={item.title}
          onError={e => e.target.style.display = 'none'}
          className="w-full h-40 object-cover"
        />
      )}

      {ribbon && (
        <div style={{
          margin: item.image ? '-8px 0 0' : '0',
          padding: '7px 16px',
          background: ribbon.bg,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          {pendingDelete
            ? <AlertTriangle size={12} style={{ color: '#fff' }} />
            : <Clock size={12} style={{ color: '#fff' }} />}
          <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', letterSpacing: '.04em' }}>
            {ribbon.label}
          </span>
        </div>
      )}

      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex justify-between items-center">
          <CategoryBadge category={item.category} />
          <StatusBadge
            status={item.status}
            pendingValidation={pendingValidation}
            pendingDelete={pendingDelete}
          />
        </div>

        <div className="flex-1">
          <h3 className="font-bold text-gray-800 leading-snug text-base">{item.title}</h3>
          <p className="text-sm text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">{item.excerpt}</p>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-gray-50 mt-auto">
          <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
            <span className="flex items-center gap-1"><User size={11} />{item.author}</span>
            <span className="flex items-center gap-1"><Eye size={11} />{item.views ?? 0}</span>
            <span className="flex items-center gap-1">
              <Calendar size={11} />
              {item.date ? new Date(item.date).toLocaleDateString() : '—'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => onEdit(item)}
              disabled={pendingDelete}
              className="p-1.5 rounded-lg hover:bg-yellow-50 text-yellow-400 hover:text-yellow-600 transition disabled:opacity-30 disabled:cursor-not-allowed"
              title={pendingDelete ? 'Cannot edit while deletion is pending' : 'Edit'}
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => onDelete(item)}
              disabled={pendingDelete}
              className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition disabled:opacity-30 disabled:cursor-not-allowed"
              title={pendingDelete ? 'Deletion already pending' : 'Request deletion'}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Sidebar links ────────────────────────────────────────────────────────────

const marketingmanagerLinks = [
  { to: "/marketing-manager-dash",             label: "Dashboard",   icon: <LayoutDashboard size={18} />, end: true },
  { to: "/marketing-manager-dash/campaigns",   label: "Campaigns",   icon: <Megaphone size={18} /> },
  { to: "/marketing-manager-dash/newsletters", label: "Newsletters", icon: <Mail size={18} /> },
  { to: "/marketing-manager-dash/blogs",       label: "Blogs",       icon: <FileText size={18} /> },
]

// ── Page ─────────────────────────────────────────────────────────────────────

export default function BlogsPage() {
  const [items,   setItems]   = useState([])
  const [loading, setLoading] = useState(true)
  const [openBar, setOpenBar] = useState(window.innerWidth >= 600)

  // Banner state: 'none' | 'create' | 'edit' | 'save' | 'delete'
  const [banner, setBanner] = useState('none')

  const [editTarget,   setEditTarget]   = useState(null)
  const [showCreate,   setShowCreate]   = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting,     setDeleting]     = useState(false)

  useEffect(() => {
    api.get('/api/blogs/')
      .then(r  => setItems(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  /**
   * onSaved is called by BlogModal after a successful API response.
   *
   * @param {object}  saved         - the blog object returned by the server
   * @param {boolean} isEdit        - true when editing an existing post
   * @param {boolean} wasPublished  - true when the edited post was previously published
   * @param {boolean} wantsReview   - true when the user chose status="published"
   *
   * Banner logic:
   *   • New post  + published  → 'create'  (submitted for review)
   *   • New post  + draft      → 'save'    (saved as draft, no review)
   *   • Edit post + published  → 'edit'    (submitted for review)
   *   • Edit post + draft      → 'save'    (saved as draft, no review)
   *
   * _pendingValidation is ONLY set to true when wantsReview is true,
   * i.e. the manager explicitly chose "published" status.
   * Draft saves never show a pending-review ribbon on the card.
   */
  const handleSaved = (saved, isEdit, wasPublished, wantsReview) => {
    if (isEdit) {
      setItems(prev => prev.map(i =>
        i.id === saved.id
          ? {
              ...saved,
              // Only flag as pending if the user submitted for review
              _pendingValidation: wantsReview,
              _pendingDelete: false,
            }
          : i
      ))
      setBanner(wantsReview ? 'edit' : 'save')
    } else {
      setItems(prev => [
        {
          ...saved,
          // Only flag as pending if the user submitted for review
          _pendingValidation: wantsReview,
        },
        ...prev,
      ])
      setBanner(wantsReview ? 'create' : 'save')
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await api.delete(`/api/blogs/${deleteTarget.id}`)
      setItems(prev => prev.map(i =>
        i.id === deleteTarget.id
          ? { ...i, _pendingDelete: true, _pendingValidation: false }
          : i
      ))
      setDeleteTarget(null)
      setBanner('delete')
    } catch (err) {
      console.error(err)
      alert(err?.response?.data?.detail || 'Failed to submit deletion request.')
    } finally {
      setDeleting(false)
    }
  }

  const closeBanner = () => setBanner('none')

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F4F6FB' }}>
      <Sidebar
        openBar={openBar}
        setOpenBar={setOpenBar}
        links={marketingmanagerLinks}
        title="MarketingCore"
        subtitle="Enterprise Suite"
        role="Marketing Manager"
        profilePath="/marketing-manager-dash/profile"
      />

      <main style={{ flex: 1, overflowY: 'auto' }}>
        <Header concept="Blog Posts" setOpenBar={setOpenBar} openBar={openBar} />

        <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Top bar */}
          <div className="flex justify-between items-start">
            <p className="text-sm text-gray-400 mt-0.5">
              Create and manage marketing blog content — published posts require admin approval.
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition shadow-sm"
              style={{ background: GOLD }}
            >
              <Plus size={16} /> New Post
            </button>
          </div>

          {/* Banners */}
          {banner === 'create' && <PendingCreateBanner onClose={closeBanner} />}
          {banner === 'edit'   && <PendingEditBanner   onClose={closeBanner} />}
          {banner === 'save'   && <PendingSaveBanner   onClose={closeBanner} />}
          {banner === 'delete' && <PendingDeleteBanner onClose={closeBanner} />}

          {/* Grid */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-[#5B47E0] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
              <FileText size={40} className="opacity-30" />
              <p className="text-sm">
                No blog posts yet. Click <strong>New Post</strong> to get started.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {items.map(item => (
                <BlogCard
                  key={item.id}
                  item={item}
                  onEdit={setEditTarget}
                  onDelete={setDeleteTarget}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create modal */}
      {showCreate && (
        <BlogModal
          initial={null}
          onClose={() => setShowCreate(false)}
          onSaved={handleSaved}
        />
      )}

      {/* Edit modal */}
      {editTarget && (
        <BlogModal
          initial={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={handleSaved}
        />
      )}

      {/* Delete confirm modal */}
      {deleteTarget && (
        <DeleteModal
          item={deleteTarget}
          deleting={deleting}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  )
}