import { useEffect, useState, useRef } from 'react'
import {
  Eye, Pencil, Trash2, Plus, Layers, LayoutDashboard, Bot,
  Boxes, Truck, RotateCcw, X, Search, CheckCircle2, Loader2,
  AlertTriangle, Box, Smartphone, Globe, ToggleLeft, ToggleRight,
  ChevronRight, ExternalLink,
} from 'lucide-react'
import api from '../../services/api'
import Sidebar from '../ui/Sidebar'
import Header from '../ui/Header'

const statusStyle = {
  active:   'bg-green-100 text-green-600',
  inactive: 'bg-gray-100 text-gray-500',
}

function Badge({ status }) {
  return (
    <span className={`px-3 py-1 text-xs rounded-full font-medium ${statusStyle[status] || 'bg-gray-100 text-gray-500'}`}>
      {status}
    </span>
  )
}

function formatDate(raw) {
  if (!raw) return '—'
  const d = new Date(raw)
  if (isNaN(d)) return raw
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yy = String(d.getFullYear()).slice(-2)
  return `${dd}-${mm}-${yy}`
}

// ─── VIEW AR MODAL ────────────────────────────────────────────────────────────
function ViewARModal({ item, onClose }) {
  const UrlField = ({ label, Icon, value }) => (
    <div>
      <p className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-1">
        <Icon size={11} className="text-gray-400" /> {label}
      </p>
      {value ? (
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
          <span className="font-mono text-xs text-gray-600 flex-1 truncate">{value}</span>
          <a href={value} target="_blank" rel="noopener noreferrer"
            className="text-[#5B47E0] hover:text-[#4a38cc] shrink-0">
            <ExternalLink size={12} />
          </a>
        </div>
      ) : (
        <p className="text-xs text-gray-400 italic px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl">
          Not configured
        </p>
      )}
    </div>
  )

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">

        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
              <Eye size={18} className="text-blue-500" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">AR / 3D Details</h2>
              <p className="text-xs text-gray-400">Read-only view of AR configuration</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition cursor-pointer">
            <X size={15} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">

          {/* Product chip */}
          <div className="flex items-center gap-3 bg-[#EEF0FF] border border-[#5B47E0]/20 rounded-xl px-4 py-3">
            <div className="w-8 h-8 rounded-lg bg-[#5B47E0]/10 flex items-center justify-center shrink-0">
              <Layers size={14} className="text-[#5B47E0]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-800 truncate">{item.name}</p>
              <p className="text-xs text-[#5B47E0] font-medium">SKU: {item.sku} · {item.category}</p>
            </div>
            <Badge status={item.is_active ? 'active' : 'inactive'} />
          </div>

          {/* Toggles read-only */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: '3D Enabled', val: item.able_3d },
              { label: 'AR Enabled', val: item.able_ar },
            ].map(({ label, val }) => (
              <div key={label}
                className={`flex items-center gap-3 p-3.5 rounded-xl border ${
                  val ? 'border-[#5B47E0]/30 bg-[#EEF0FF]' : 'border-gray-200 bg-gray-50'
                }`}>
                {val
                  ? <ToggleRight size={20} className="text-[#5B47E0] shrink-0" />
                  : <ToggleLeft  size={20} className="text-gray-300 shrink-0" />}
                <p className={`text-xs font-bold ${val ? 'text-[#5B47E0]' : 'text-gray-400'}`}>{label}</p>
              </div>
            ))}
          </div>

          {/* URL fields */}
          <div className="space-y-3">
            <UrlField label="AR Model URL (model_src)" Icon={Globe}      value={item.model_src} />
            <UrlField label="3D Model URL (model_3d)"  Icon={Box}        value={item.model_3d}  />
            <UrlField label="iOS AR URL (ios_src)"     Icon={Smartphone} value={item.ios_src}   />
          </div>

          {/* Meta */}
          <div className="flex gap-4 text-xs text-gray-400 pt-1 border-t border-gray-100">
            <span className="pt-3">Views: <span className="font-semibold text-gray-600">{item.views ?? '—'}</span></span>
            <span className="pt-3">Created: <span className="font-semibold text-gray-600">{formatDate(item.created_at)}</span></span>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100">
          <button onClick={onClose}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm text-gray-700 font-medium transition cursor-pointer">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── EDIT AR MODAL ────────────────────────────────────────────────────────────
function EditARModal({ item, onClose, onSaved }) {
  const [modelSrc,  setModelSrc]  = useState(item.model_src || '')
  const [model3d,   setModel3d]   = useState(item.model_3d  || '')
  const [iosSrc,    setIosSrc]    = useState(item.ios_src   || '')
  const [able3d,    setAble3d]    = useState(!!item.able_3d)
  const [ableAr,    setAbleAr]    = useState(!!item.able_ar)
  const [saving,    setSaving]    = useState(false)
  const [saveError, setSaveError] = useState('')

  const handleSave = async () => {
    setSaving(true); setSaveError('')
    try {
      const form = new FormData()
      form.append('name',        item.name        || '')
      form.append('description', item.description || '')
      form.append('price',       item.price       ?? 0)
      form.append('quantity',    item.quantity    ?? 0)
      form.append('sku',         item.sku         || '')
      form.append('category',    item.category    || '')
      form.append('min_stock',   item.min_stock   ?? 5)
      form.append('colors',      JSON.stringify(
        (item.colors || []).map(c => typeof c === 'object' ? c.color : c)
      ))
      form.append('model_src', modelSrc)
      form.append('model_3d',  model3d)
      form.append('ios_src',   iosSrc)
      form.append('able_3d',   able3d)
      form.append('able_ar',   ableAr)

      await api.put(`/api/products/${item.id}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      onSaved()
      onClose()
    } catch (err) {
      console.error(err)
      setSaveError(err.response?.data?.detail || 'Failed to save. Please try again.')
    } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">

        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-yellow-50 flex items-center justify-center">
              <Pencil size={18} className="text-yellow-500" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Edit AR / 3D Config</h2>
              <p className="text-xs text-gray-400">Editing: {item.name}</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition cursor-pointer">
            <X size={15} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">

          {/* Product chip */}
          <div className="flex items-center gap-3 bg-[#EEF0FF] border border-[#5B47E0]/20 rounded-xl px-4 py-3">
            <div className="w-8 h-8 rounded-lg bg-[#5B47E0]/10 flex items-center justify-center shrink-0">
              <Layers size={14} className="text-[#5B47E0]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-800 truncate">{item.name}</p>
              <p className="text-xs text-[#5B47E0] font-medium">SKU: {item.sku} · {item.category}</p>
            </div>
          </div>

          {/* Toggles */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Enable 3D', desc: 'Show 3D model viewer',  val: able3d, set: setAble3d },
              { label: 'Enable AR', desc: 'Show AR try-on button', val: ableAr, set: setAbleAr },
            ].map(({ label, desc, val, set }) => (
              <button key={label} onClick={() => set(v => !v)}
                className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition cursor-pointer ${
                  val ? 'border-[#5B47E0]/30 bg-[#EEF0FF]' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                }`}>
                {val
                  ? <ToggleRight size={20} className="text-[#5B47E0] shrink-0" />
                  : <ToggleLeft  size={20} className="text-gray-300 shrink-0" />}
                <div>
                  <p className={`text-xs font-bold ${val ? 'text-[#5B47E0]' : 'text-gray-600'}`}>{label}</p>
                  <p className="text-[10px] text-gray-400">{desc}</p>
                </div>
              </button>
            ))}
          </div>

          {/* URL inputs */}
          {[
            { label: 'AR Model URL',  desc: 'model_src — .usdz / .glb for web AR', icon: Globe,      val: modelSrc, set: setModelSrc, placeholder: 'https://…/model.glb'  },
            { label: '3D Model URL',  desc: 'model_3d  — .glb for 3D viewer',      icon: Box,        val: model3d,  set: setModel3d,  placeholder: 'https://…/model.glb'  },
            { label: 'iOS AR URL',    desc: 'ios_src   — .usdz for iOS Quick Look',icon: Smartphone, val: iosSrc,   set: setIosSrc,   placeholder: 'https://…/model.usdz' },
          ].map(({ label, desc, icon: Icon, val, set, placeholder }) => (
            <div key={label}>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5">
                <Icon size={11} className="text-gray-400" />
                {label}
                <span className="font-normal text-gray-400">— {desc}</span>
              </label>
              <input type="text" value={val} onChange={e => set(e.target.value)}
                placeholder={placeholder}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B47E0]/30 focus:border-[#5B47E0] bg-gray-50 font-mono placeholder:font-sans placeholder:text-gray-400"
              />
            </div>
          ))}

          {saveError && (
            <p className="flex items-center gap-1.5 text-xs text-red-500 font-medium">
              <AlertTriangle size={12} /> {saveError}
            </p>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm text-gray-700 font-medium transition cursor-pointer">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#5B47E0] hover:bg-[#4a38cc] text-white text-sm font-semibold transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2">
            {saving
              ? <><Loader2 size={14} className="animate-spin" /> Saving…</>
              : <><CheckCircle2 size={14} /> Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── DELETE CONFIRM MODAL ─────────────────────────────────────────────────────
function DeleteARModal({ item, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false)
  const [error,    setError]    = useState('')

  const handleDelete = async () => {
    setDeleting(true); setError('')
    try {
      const form = new FormData()
      // Pass through all required product fields unchanged
      form.append('name',        item.name        || '')
      form.append('description', item.description || '')
      form.append('price',       item.price       ?? 0)
      form.append('quantity',    item.quantity    ?? 0)
      form.append('sku',         item.sku         || '')
      form.append('category',    item.category    || '')
      form.append('min_stock',   item.min_stock   ?? 5)
      form.append('colors',      JSON.stringify(
        (item.colors || []).map(c => typeof c === 'object' ? c.color : c)
      ))
      // Clear all AR fields
      form.append('model_src', '')
      form.append('model_3d',  '')
      form.append('ios_src',   '')
      form.append('able_3d',   false)
      form.append('able_ar',   false)

      await api.put(`/api/products/${item.id}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      onDeleted()
      onClose()
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.detail || 'Failed to remove AR config. Please try again.')
    } finally { setDeleting(false) }
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">

        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
              <Trash2 size={18} className="text-red-500" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Remove AR Config</h2>
              <p className="text-xs text-gray-400">This will clear all AR/3D data</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition cursor-pointer">
            <X size={15} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-4">
            <p className="text-sm font-semibold text-red-700 mb-1">Remove AR configuration for:</p>
            <p className="text-sm text-red-600 font-bold">{item.name}</p>
            <p className="text-xs text-red-400 mt-0.5">SKU: {item.sku}</p>
          </div>

          <p className="text-sm text-gray-500 leading-relaxed">
            This will clear the <span className="font-semibold text-gray-700">model_src</span>,{' '}
            <span className="font-semibold text-gray-700">model_3d</span>, and{' '}
            <span className="font-semibold text-gray-700">ios_src</span> URLs, and disable
            both 3D and AR for this product. The product itself will not be deleted.
          </p>

          {error && (
            <p className="flex items-center gap-1.5 text-xs text-red-500 font-medium">
              <AlertTriangle size={12} /> {error}
            </p>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm text-gray-700 font-medium transition cursor-pointer">
            Cancel
          </button>
          <button onClick={handleDelete} disabled={deleting}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2">
            {deleting
              ? <><Loader2 size={14} className="animate-spin" /> Removing…</>
              : <><Trash2 size={14} /> Remove AR Config</>}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── ADD AR MODAL ─────────────────────────────────────────────────────────────
function AddARModal({ onClose, onSaved }) {
  const [step, setStep]           = useState('sku')
  const [sku, setSku]             = useState('')
  const [skuError, setSkuError]   = useState('')
  const [searching, setSearching] = useState(false)
  const [product, setProduct]     = useState(null)

  const [modelSrc,  setModelSrc]  = useState('')
  const [model3d,   setModel3d]   = useState('')
  const [iosSrc,    setIosSrc]    = useState('')
  const [able3d,    setAble3d]    = useState(false)
  const [ableAr,    setAbleAr]    = useState(false)
  const [saving,    setSaving]    = useState(false)
  const [saveError, setSaveError] = useState('')

  const skuRef = useRef(null)
  useEffect(() => { skuRef.current?.focus() }, [])

  const handleSkuSearch = async () => {
    if (!sku.trim()) { setSkuError('Please enter a SKU'); return }
    setSearching(true); setSkuError('')
    try {
      const res = await api.get(`/api/products/by-sku/${sku.trim()}`)
      const p   = res.data
      console.log(res.data)
      setProduct(p)
      setModelSrc(p.model_src || '')
      setModel3d(p.model_3d   || '')
      setIosSrc(p.ios_src     || '')
      setAble3d(!!p.able_3d)
      setAbleAr(!!p.able_ar)
      setStep('form')
    } catch (err) {
      if (err.response?.status === 404) setSkuError(`No product found with SKU "${sku.trim()}"`)
      else setSkuError('Failed to fetch product. Check the SKU and try again.')
    } finally { setSearching(false) }
  }

  const handleSave = async () => {
    if (!product) return
    setSaving(true); setSaveError('')
    try {
      const form = new FormData()
      form.append('name',        product.name        || '')
      form.append('description', product.description || '')
      form.append('price',       product.price       ?? 0)
      form.append('quantity',    product.quantity    ?? 0)
      form.append('sku',         product.sku         || sku)
      form.append('category',    product.category    || '')
      form.append('min_stock',   product.min_stock   ?? 5)
      form.append('colors',      JSON.stringify(
        (product.colors || []).map(c => typeof c === 'object' ? c.color : c)
      ))
      form.append('model_src', modelSrc)
      form.append('model_3d',  model3d)
      form.append('ios_src',   iosSrc)
      form.append('able_3d',   able3d)
      form.append('able_ar',   ableAr)

      await api.put(`/api/products/${product.id}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      onSaved()
      onClose()
    } catch (err) {
      console.error(err)
      setSaveError(err.response?.data?.detail || 'Failed to save. Please try again.')
    } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">

        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#EEF0FF] flex items-center justify-center">
              <Bot size={18} className="text-[#5B47E0]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                {step === 'sku' ? 'Find Product' : 'Configure AR / 3D'}
              </h2>
              <p className="text-xs text-gray-400">
                {step === 'sku' ? 'Search by SKU to link AR models' : `Editing: ${product?.name}`}
              </p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition cursor-pointer">
            <X size={15} />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 px-6 pt-4">
          {['Find Product', 'AR / 3D Settings'].map((label, i) => {
            const done    = (i === 0 && step === 'form')
            const current = (i === 0 && step === 'sku') || (i === 1 && step === 'form')
            return (
              <div key={label} className="flex items-center gap-2">
                <div className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition ${
                  done    ? 'bg-emerald-100 text-emerald-600' :
                  current ? 'bg-[#EEF0FF] text-[#5B47E0]'    :
                            'bg-gray-100 text-gray-400'
                }`}>
                  {done ? <CheckCircle2 size={11} /> : <span className="w-3.5 text-center">{i + 1}</span>}
                  {label}
                </div>
                {i === 0 && <ChevronRight size={12} className="text-gray-300 shrink-0" />}
              </div>
            )
          })}
        </div>

        <div className="px-6 py-5">
          {step === 'sku' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Product SKU</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input ref={skuRef} type="text" value={sku}
                      onChange={e => { setSku(e.target.value); setSkuError('') }}
                      onKeyDown={e => e.key === 'Enter' && handleSkuSearch()}
                      placeholder="e.g. CHAIR-001"
                      className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B47E0]/30 focus:border-[#5B47E0] bg-gray-50"
                    />
                  </div>
                  <button onClick={handleSkuSearch} disabled={searching}
                    className="flex items-center gap-2 bg-[#5B47E0] hover:bg-[#4a38cc] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer disabled:opacity-60 shrink-0">
                    {searching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                    Search
                  </button>
                </div>
                {skuError && (
                  <p className="flex items-center gap-1.5 text-xs text-red-500 mt-2 font-medium">
                    <AlertTriangle size={12} /> {skuError}
                  </p>
                )}
              </div>
              <p className="text-xs text-gray-400 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                Enter the product SKU to find the product you want to configure with AR / 3D models.
                The SKU can be found in the Product Catalog.
              </p>
            </div>
          )}

          {step === 'form' && product && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-[#EEF0FF] border border-[#5B47E0]/20 rounded-xl px-4 py-3">
                <div className="w-8 h-8 rounded-lg bg-[#5B47E0]/10 flex items-center justify-center shrink-0">
                  <Layers size={14} className="text-[#5B47E0]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800 truncate">{product.name}</p>
                  <p className="text-xs text-[#5B47E0] font-medium">SKU: {product.sku} · {product.category}</p>
                </div>
                <button onClick={() => { setStep('sku'); setProduct(null) }}
                  className="text-xs text-gray-400 hover:text-gray-600 transition cursor-pointer">
                  Change
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Enable 3D', desc: 'Show 3D model viewer',  val: able3d, set: setAble3d },
                  { label: 'Enable AR', desc: 'Show AR try-on button', val: ableAr, set: setAbleAr },
                ].map(({ label, desc, val, set }) => (
                  <button key={label} onClick={() => set(v => !v)}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition cursor-pointer ${
                      val ? 'border-[#5B47E0]/30 bg-[#EEF0FF]' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                    }`}>
                    {val
                      ? <ToggleRight size={20} className="text-[#5B47E0] shrink-0" />
                      : <ToggleLeft  size={20} className="text-gray-300 shrink-0" />}
                    <div>
                      <p className={`text-xs font-bold ${val ? 'text-[#5B47E0]' : 'text-gray-600'}`}>{label}</p>
                      <p className="text-[10px] text-gray-400">{desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              {[
                { label: 'AR Model URL',  desc: 'model_src — .usdz / .glb for web AR', icon: Globe,      val: modelSrc, set: setModelSrc, placeholder: 'https://…/model.glb'  },
                { label: '3D Model URL',  desc: 'model_3d  — .glb for 3D viewer',      icon: Box,        val: model3d,  set: setModel3d,  placeholder: 'https://…/model.glb'  },
                { label: 'iOS AR URL',    desc: 'ios_src   — .usdz for iOS Quick Look',icon: Smartphone, val: iosSrc,   set: setIosSrc,   placeholder: 'https://…/model.usdz' },
              ].map(({ label, desc, icon: Icon, val, set, placeholder }) => (
                <div key={label}>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5">
                    <Icon size={11} className="text-gray-400" />
                    {label}
                    <span className="font-normal text-gray-400">— {desc}</span>
                  </label>
                  <input type="text" value={val} onChange={e => set(e.target.value)}
                    placeholder={placeholder}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B47E0]/30 focus:border-[#5B47E0] bg-gray-50 font-mono placeholder:font-sans placeholder:text-gray-400"
                  />
                </div>
              ))}

              {saveError && (
                <p className="flex items-center gap-1.5 text-xs text-red-500 font-medium">
                  <AlertTriangle size={12} /> {saveError}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm text-gray-700 font-medium transition cursor-pointer">
            Cancel
          </button>
          {step === 'sku' ? (
            <button onClick={handleSkuSearch} disabled={searching || !sku.trim()}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#5B47E0] hover:bg-[#4a38cc] text-white text-sm font-semibold transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2">
              {searching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
              {searching ? 'Searching…' : 'Find Product'}
            </button>
          ) : (
            <button onClick={handleSave} disabled={saving}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#5B47E0] hover:bg-[#4a38cc] text-white text-sm font-semibold transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2">
              {saving
                ? <><Loader2 size={14} className="animate-spin" /> Saving…</>
                : <><CheckCircle2 size={14} /> Save AR Config</>}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function ARPage() {
  const [items,       setItems]       = useState([])
  const [loading,     setLoading]     = useState(true)
  const [openBar,     setOpenBar]     = useState(window.innerWidth >= 600)
  const [showModal,   setShowModal]   = useState(false)
  const [flash,       setFlash]       = useState('')
  const [activeModal, setActiveModal] = useState(null) // { mode: 'view'|'edit'|'delete', item }

  const stockManagerLinks = [
    { to: '/stock-manager-dash',             label: 'Dashboard',         icon: <LayoutDashboard />, end: true },
    { to: '/stock-manager-dash/inventories', label: "Product's Catalog", icon: <Boxes />            },
    { to: '/stock-manager-dash/ar',          label: 'AR/3D Management',  icon: <Bot size={18} />    },
    { to: '/stock-manager-dash/deliveries',  label: 'Delivery',          icon: <Truck />            },
    { to: '/stock-manager-dash/returns',     label: 'Returns',           icon: <RotateCcw />        },
  ]

  const fetchItems = () => {
    setLoading(true)
    api.get('/api/products')
      .then(r => {setItems(r.data); console.log(r.data)})
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchItems() }, [])

  const showFlash = (msg) => {
    setFlash(msg)
    setTimeout(() => setFlash(''), 3500)
  }

  const handleSaved   = () => { showFlash('AR configuration saved successfully!');   fetchItems() }
  const handleDeleted = () => { showFlash('AR configuration removed successfully!'); fetchItems() }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F4F6FB' }}>
      <Sidebar
        openBar={openBar}
        setOpenBar={setOpenBar}
        links={stockManagerLinks}
        title="StockManagerCore"
        subtitle="Enterprise Suite"
        role="Stock Manager"
        profilePath="/stock-manager-dash/profile"
      />

      <main style={{ flex: 1, overflowY: 'auto' }}>
        <Header concept="AR/3D Management" setOpenBar={setOpenBar} openBar={openBar} />

        <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>

          {flash && (
            <div className="flex items-center gap-2 bg-green-50 border-l-4 border-green-500 text-green-800 text-sm font-medium px-4 py-3 rounded-lg">
              <CheckCircle2 size={15} className="shrink-0" /> {flash}
            </div>
          )}

          <div className="flex justify-between items-start">
            <p className="text-sm text-gray-400 mt-0.5">Manage augmented reality product models</p>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-[#5B47E0] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#4a38cc] transition shadow-sm cursor-pointer"
            >
              <Plus size={16} /> Add AR
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
            <table className="w-full text-sm min-w-[860px]">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Product Name', 'Category', 'Model File', 'iOS Model', 'Views', 'Status', 'Created', 'Actions'].map(h => (
                    <th key={h} className="text-left px-5 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12">
                      <div className="flex justify-center">
                        <div className="w-6 h-6 border-2 border-[#5B47E0] border-t-transparent rounded-full animate-spin" />
                      </div>
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-gray-400 text-sm">No AR experiences found.</td>
                  </tr>
                ) : items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#EEF0FF] flex items-center justify-center shrink-0">
                          <Layers size={14} className="text-[#5B47E0]" />
                        </div>
                        <span className="font-medium text-gray-800">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-500">{item.category}</td>
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs bg-gray-50 border border-gray-200 px-2 py-1 rounded-md text-gray-500">
                        {item.model_src || '—'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs bg-gray-50 border border-gray-200 px-2 py-1 rounded-md text-gray-500">
                        {item.ios_src || '—'}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-semibold text-gray-800">{item.views ?? '—'}</td>
                    <td className="px-5 py-4">
                      <Badge status={item.is_active ? 'active' : 'inactive'} />
                    </td>
                    <td className="px-5 py-4 text-gray-400 text-xs">{formatDate(item.created_at)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setActiveModal({ mode: 'view', item })}
                          title="View AR details"
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-400 hover:text-blue-600 transition cursor-pointer"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => setActiveModal({ mode: 'edit', item })}
                          title="Edit AR config"
                          className="p-1.5 rounded-lg hover:bg-yellow-50 text-yellow-400 hover:text-yellow-600 transition cursor-pointer"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setActiveModal({ mode: 'delete', item })}
                          title="Remove AR config"
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition cursor-pointer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </main>

      {/* ── Add AR Modal ── */}
      {showModal && (
        <AddARModal
          onClose={() => setShowModal(false)}
          onSaved={handleSaved}
        />
      )}

      {/* ── View Modal ── */}
      {activeModal?.mode === 'view' && (
        <ViewARModal
          item={activeModal.item}
          onClose={() => setActiveModal(null)}
        />
      )}

      {/* ── Edit Modal ── */}
      {activeModal?.mode === 'edit' && (
        <EditARModal
          item={activeModal.item}
          onClose={() => setActiveModal(null)}
          onSaved={handleSaved}
        />
      )}

      {/* ── Delete Modal ── */}
      {activeModal?.mode === 'delete' && (
        <DeleteARModal
          item={activeModal.item}
          onClose={() => setActiveModal(null)}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  )
}