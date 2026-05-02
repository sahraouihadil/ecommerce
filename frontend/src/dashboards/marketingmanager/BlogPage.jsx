import { useEffect, useState } from 'react'
import { Eye, Pencil, Trash2, Plus, User, Calendar, LayoutDashboard,
         Megaphone, BadgePercent, Mail, FileText, X, Loader2 } from 'lucide-react'
import api from '../../services/api'
import Sidebar from '../ui/Sidebar'
import Header from '../ui/Header'

const GOLD   = '#5B47E0'
const STATUS_OPTIONS   = ['published', 'draft', 'scheduled']
const CATEGORY_OPTIONS = ['AR', 'Email', 'Promotions', 'Social', 'Branding']

const statusStyle = {
  published: 'bg-green-100 text-green-600',
  draft:     'bg-yellow-100 text-yellow-700',
  scheduled: 'bg-blue-100 text-blue-600',
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

// ── Reusable field components ────────────────────────────────────────────────

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

// ── Blog modal (create / edit) ───────────────────────────────────────────────

function BlogModal({ initial, onClose, onSaved }) {
  const isEdit = !!initial?.id
  const [form, setForm]       = useState(initial ? {
    title:    initial.title    ?? '',
    excerpt:  initial.excerpt  ?? '',
    category: initial.category ?? 'AR',
    status:   initial.status   ?? 'draft',
    author:   initial.author   ?? '',
    image:    initial.image    ?? '',
    tag:      initial.tag      ?? '',
    content:  initial.body     ?? '',   // backend returns "body" mapped from "content"
  } : EMPTY_FORM)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

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
      onSaved(res.data, isEdit)
      onClose()
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // Close on backdrop click
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
              {isEdit ? 'Update the fields below and save.' : 'Fill in the details to publish a new post.'}
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
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
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
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Publish Post'}
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
          <h2 className="text-base font-bold text-gray-800">Delete Blog Post</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            Are you sure you want to delete <span className="font-semibold text-gray-700">"{item.title}"</span>?
            This action cannot be undone.
          </p>
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
            {deleting ? 'Deleting…' : 'Yes, Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Blog card ────────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
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
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-3 hover:shadow-md transition-shadow overflow-hidden">

      {/* Cover image */}
      {item.image && (
        <img
          src={item.image}
          alt={item.title}
          onError={e => e.target.style.display = 'none'}
          className="w-full h-40 object-cover"
        />
      )}

      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex justify-between items-center">
          <CategoryBadge category={item.category} />
          <StatusBadge status={item.status} />
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
              className="p-1.5 rounded-lg hover:bg-yellow-50 text-yellow-400 hover:text-yellow-600 transition"
              title="Edit"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => onDelete(item)}
              className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

  const marketingmanagerLinks = [
    { to: "/marketing-manager-dash",             label: "Dashboard",     icon: <LayoutDashboard size={18} />, end: true },
    { to: "/marketing-manager-dash/campaigns",   label: "Campaigns",     icon: <Megaphone size={18} /> },
    { to: "/marketing-manager-dash/promotions",  label: "Promotions",    icon: <BadgePercent size={18} /> },
    { to: "/marketing-manager-dash/newsletters", label: "Newsletters",   icon: <Mail size={18} /> },
    { to: "/marketing-manager-dash/blogs",       label: "Blogs",         icon: <FileText size={18} /> },
  ]

export default function BlogsPage() {
  const [items,    setItems]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [openBar,  setOpenBar]  = useState(window.innerWidth >= 600)

  // Modal state
  const [editTarget,   setEditTarget]   = useState(null)   // item being edited (null = create mode)
  const [showCreate,   setShowCreate]   = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)   // item pending deletion
  const [deleting,     setDeleting]     = useState(false)

  useEffect(() => {
    api.get('/api/blogs/')
      .then(r  => setItems(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // Called when modal saves successfully
  const handleSaved = (saved, isEdit) => {
    if (isEdit) {
      setItems(prev => prev.map(i => i.id === saved.id ? saved : i))
    } else {
      setItems(prev => [saved, ...prev])
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await api.delete(`/api/blogs/${deleteTarget.id}`)
      setItems(prev => prev.filter(i => i.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch (err) {
      console.error(err)
    } finally {
      setDeleting(false)
    }
  }

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
            <p className="text-sm text-gray-400 mt-0.5">Create and manage marketing blog content</p>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition shadow-sm"
              style={{ background: GOLD }}
            >
              <Plus size={16} /> New Post
            </button>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-[#5B47E0] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
              <FileText size={40} className="opacity-30" />
              <p className="text-sm">No blog posts yet. Click <strong>New Post</strong> to get started.</p>
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