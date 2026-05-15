import { useEffect, useState, useRef } from 'react'
import { useNavigate } from "react-router-dom";
import {
  Eye, Pencil, Trash2, Plus, Layers, LayoutDashboard, Bot,
  Boxes, Truck, RotateCcw, X, Search, CheckCircle2, Loader2,
  AlertTriangle, Box, Smartphone, Globe, ToggleLeft, ToggleRight,
  ChevronRight, ExternalLink, TriangleAlert, Clock, ShieldCheck, ShieldX,
  Camera, ScanLine, AlertCircle, Send,
} from 'lucide-react'
import api from '../../services/api'
import Sidebar from '../ui/Sidebar'
import Header from '../ui/Header'

// ── Load model-viewer script once ─────────────────────────────────────────────
function useModelViewer() {
  useEffect(() => {
    if (document.querySelector('script[data-mv]')) return
    const s = document.createElement('script')
    s.type = 'module'
    s.setAttribute('data-mv', '1')
    s.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js'
    document.head.appendChild(s)
  }, [])
}

// ── Helpers ───────────────────────────────────────────────────────────────────

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

// ── Validation Status Badge ───────────────────────────────────────────────────

const VAL_STYLE = {
  Pending:  { bg: '#fffbeb', color: '#d97706', Icon: Clock,        label: 'Pending Review' },
  Approved: { bg: '#f0fdf4', color: '#16a34a', Icon: ShieldCheck,  label: 'Approved'       },
  Rejected: { bg: '#fff1f2', color: '#dc2626', Icon: ShieldX,      label: 'Rejected'       },
  None:     { bg: '#f8fafc', color: '#94a3b8', Icon: Clock,        label: 'Not Submitted'  },
}

function ValidationBadge({ valReq }) {
  const key   = valReq?.status ?? 'None'
  const style = VAL_STYLE[key] ?? VAL_STYLE.None
  const { bg, color, Icon, label } = style
  return (
    <span
      title={valReq?.rejection_note || label}
      style={{
        display:      'inline-flex',
        alignItems:   'center',
        gap:          5,
        background:   bg,
        color:        color,
        fontSize:     11,
        fontWeight:   700,
        padding:      '3px 9px',
        borderRadius: 99,
        whiteSpace:   'nowrap',
      }}
    >
      <Icon size={11} />
      {label}
    </span>
  )
}

// ── Submit a validation request for a specific type ────────────────────────────
async function submitValidationRequest(itemType, productId, productName) {
  const labelMap = { AR: 'AR', '3D': '3D', AR_Delete: 'AR Delete', '3D_Delete': '3D Delete' }
  const label    = labelMap[itemType] ?? itemType
  try {
    await api.post('/api/validation/upsert', {
      item_type: itemType,
      item_id:   productId,
      title:     `${label}: ${productName}`,
    })
  } catch (err) {
    console.warn(`${label} validation submission warning:`, err.response?.data?.detail ?? err.message)
  }
}

// ── Determine which validation requests need to be submitted (delta-aware) ────
function computeChangedTypes(prev, next) {
  const changed = new Set()
  const arChanged = prev.able_ar !== next.able_ar || prev.model_src !== next.model_src || prev.ios_src !== next.ios_src
  const tdChanged = prev.able_3d !== next.able_3d || prev.model_3d  !== next.model_3d
  if (arChanged) changed.add('AR')
  if (tdChanged) changed.add('3D')
  return changed
}

// ─── 3D VIEWER MODAL ──────────────────────────────────────────────────────────
function Viewer3DModal({ item, onClose, onBack }) {
  useModelViewer()
  const mvRef = useRef(null)
  const src   = item.model_3d || item.model_src || ''

  useEffect(() => {
    const mv = mvRef.current
    if (!mv || !src) return
    mv.setAttribute('src', src)
    mv.setAttribute('camera-controls', '')
    mv.setAttribute('auto-rotate', '')
    mv.setAttribute('shadow-intensity', '1')
    mv.setAttribute('style', 'width:100%;height:360px;background:#f4f6fb;border-radius:12px;')
  }, [src])

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden">

        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#EEF0FF] flex items-center justify-center">
              <Box size={18} className="text-[#5B47E0]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">3D Model Viewer</h2>
              <p className="text-xs text-gray-400 truncate max-w-[240px]">{item.name}</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition cursor-pointer">
            <X size={15} />
          </button>
        </div>

        <div className="px-6 py-5">
          {src ? (
            <div className="rounded-xl overflow-hidden border border-gray-100 bg-[#f4f6fb]">
              <model-viewer
                ref={mvRef}
                style={{ width: '100%', height: 360, background: '#f4f6fb', borderRadius: 12 }}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400 gap-2">
              <Box size={32} className="opacity-30" />
              <p className="text-sm font-medium">No 3D model URL configured</p>
            </div>
          )}
          <p className="text-xs text-gray-400 mt-3 text-center">
            Drag to rotate · Scroll to zoom · Two-finger pan
          </p>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button onClick={onBack}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm text-gray-700 font-medium transition cursor-pointer">
            ← Back
          </button>
          <button onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#5B47E0] text-white text-sm font-semibold hover:bg-[#4a38cc] transition cursor-pointer">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── AR VIEWER MODAL ──────────────────────────────────────────────────────────
function ViewerARModal({ item, onClose, onBack }) {
  useModelViewer()
  const mvRef                   = useRef(null)
  const [phase, setPhase]       = useState('asking')
  const [launched, setLaunched] = useState(false)
  const src    = item.model_src || item.model_3d || ''
  const iosSrc = item.ios_src || ''

  const requestCamera = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      setPhase('granted')
    } catch {
      setPhase('denied')
    }
  }

  useEffect(() => {
    if (phase !== 'granted') return
    const mv = mvRef.current
    if (!mv) return
    mv.setAttribute('src', src)
    mv.setAttribute('ar', '')
    mv.setAttribute('ar-modes', 'webxr scene-viewer quick-look')
    if (iosSrc) mv.setAttribute('ios-src', iosSrc)
    mv.setAttribute('camera-controls', '')
    mv.setAttribute('shadow-intensity', '1')

    const tryAR = () => {
      if (!launched) { setLaunched(true); mv.activateAR?.() }
    }
    mv.addEventListener('load', tryAR, { once: true })
    if (mv.loaded) tryAR()
  }, [phase, src, iosSrc])

  const launchAR = () => {
    const mv = mvRef.current
    if (mv) { setLaunched(true); mv.activateAR?.() }
  }

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">

        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
              <Camera size={18} className="text-green-500" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">AR Experience</h2>
              <p className="text-xs text-gray-400 truncate max-w-[240px]">{item.name}</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition cursor-pointer">
            <X size={15} />
          </button>
        </div>

        <div className="px-6 py-6">
          {phase === 'asking' && (
            <div className="flex flex-col items-center gap-5 py-4">
              <div className="w-20 h-20 rounded-2xl bg-green-50 border-2 border-green-100 flex items-center justify-center">
                <Camera size={36} className="text-green-500" />
              </div>
              <div className="text-center">
                <h3 className="text-base font-bold text-gray-800 mb-1">Camera Access Required</h3>
                <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">
                  To place <span className="font-semibold text-gray-700">{item.name}</span> in your real
                  environment, we need access to your device camera.
                </p>
              </div>
              <div className="w-full bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex items-start gap-2">
                <AlertCircle size={14} className="text-amber-500 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-700 leading-relaxed">
                  A browser permission prompt will appear. Tap <span className="font-semibold">Allow</span> to
                  continue. Your camera feed is never stored or transmitted.
                </p>
              </div>
              <button onClick={requestCamera}
                className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-3 rounded-xl text-sm font-semibold transition cursor-pointer shadow-sm">
                <Camera size={16} /> Allow Camera & Launch AR
              </button>
            </div>
          )}

          {phase === 'denied' && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
                <AlertTriangle size={28} className="text-red-400" />
              </div>
              <div className="text-center">
                <h3 className="text-sm font-bold text-red-600 mb-1">Camera Access Denied</h3>
                <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">
                  AR requires camera permission. Please allow camera access in your browser settings and try again.
                </p>
              </div>
              <button onClick={requestCamera}
                className="px-5 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-sm text-gray-700 font-medium transition cursor-pointer">
                Try Again
              </button>
            </div>
          )}

          {phase === 'granted' && (
            <div className="space-y-4">
              <div className="rounded-xl overflow-hidden border border-gray-100 bg-[#f4f6fb] relative">
                <model-viewer ref={mvRef}
                  style={{ width: '100%', height: 320, background: '#f4f6fb', borderRadius: 12 }} />
              </div>
              {!src && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  <AlertTriangle size={14} className="text-red-400 shrink-0" />
                  <p className="text-xs text-red-600">No AR model URL is configured for this product.</p>
                </div>
              )}
              {src && (
                <button onClick={launchAR}
                  className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-3 rounded-xl text-sm font-semibold transition cursor-pointer shadow-sm">
                  <ScanLine size={16} /> Launch AR View
                </button>
              )}
              <p className="text-xs text-gray-400 text-center">
                AR works best on a mobile device. Point camera at a flat surface.
              </p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button onClick={onBack}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm text-gray-700 font-medium transition cursor-pointer">
            ← Back
          </button>
          <button onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl bg-gray-800 text-white text-sm font-semibold hover:bg-gray-700 transition cursor-pointer">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── VIEW CHOOSER MODAL ───────────────────────────────────────────────────────
function ViewARModal({ item, arValReq, tdValReq, onClose }) {
  const [mode, setMode] = useState('choose')

  if (mode === '3d') return <Viewer3DModal item={item} onClose={onClose} onBack={() => setMode('choose')} />
  if (mode === 'ar') return <ViewerARModal item={item} onClose={onClose} onBack={() => setMode('choose')} />

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
              <h2 className="text-base font-bold text-gray-900">View Experience</h2>
              <p className="text-xs text-gray-400">Choose how to view this product</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition cursor-pointer">
            <X size={15} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
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

          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setMode('3d')}
              className="group flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-[#5B47E0]/20 bg-[#EEF0FF]/50 hover:bg-[#EEF0FF] hover:border-[#5B47E0]/40 transition cursor-pointer">
              <div className="w-12 h-12 rounded-2xl bg-[#5B47E0]/10 group-hover:bg-[#5B47E0]/20 flex items-center justify-center transition">
                <Box size={24} className="text-[#5B47E0]" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-[#5B47E0]">View in 3D</p>
                <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">Interactive 3D model viewer<br />in your browser</p>
              </div>
              <span style={{
                fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
                background: item.valid_3d ? '#f0fdf4' : '#f8fafc',
                color:      item.valid_3d ? '#16a34a' : '#94a3b8',
              }}>
                3D {item.valid_3d ? '✓ Validated' : '✗ Not validated'}
              </span>
            </button>

            <button onClick={() => setMode('ar')}
              className="group flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-green-200 bg-green-50/50 hover:bg-green-50 hover:border-green-300 transition cursor-pointer">
              <div className="w-12 h-12 rounded-2xl bg-green-100 group-hover:bg-green-200 flex items-center justify-center transition">
                <Camera size={24} className="text-green-600" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-green-700">Try in AR</p>
                <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">Place product in your<br />real environment</p>
              </div>
              <span style={{
                fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
                background: item.valid_ar ? '#f0fdf4' : '#f8fafc',
                color:      item.valid_ar ? '#16a34a' : '#94a3b8',
              }}>
                AR {item.valid_ar ? '✓ Validated' : '✗ Not validated'}
              </span>
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5">
              <p className="text-xs font-semibold text-gray-500">AR Validation</p>
              <ValidationBadge valReq={arValReq} />
            </div>
            <div className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5">
              <p className="text-xs font-semibold text-gray-500">3D Validation</p>
              <ValidationBadge valReq={tdValReq} />
            </div>
          </div>

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

          <div className="space-y-3">
            <UrlField label="AR Model URL (model_src)" Icon={Globe}      value={item.model_src} />
            <UrlField label="3D Model URL (model_3d)"  Icon={Box}        value={item.model_3d}  />
            <UrlField label="iOS AR URL (ios_src)"     Icon={Smartphone} value={item.ios_src}   />
          </div>

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

  const original = {
    model_src: item.model_src || '',
    model_3d:  item.model_3d  || '',
    ios_src:   item.ios_src   || '',
    able_ar:   !!item.able_ar,
    able_3d:   !!item.able_3d,
  }

  const handleSave = async () => {
    setSaving(true); setSaveError('')
    try {
      const next = { model_src: modelSrc, model_3d: model3d, ios_src: iosSrc, able_ar: ableAr, able_3d: able3d }
      const changedTypes = computeChangedTypes(original, next)

      const form = new FormData()
      form.append('model_src', modelSrc)
      form.append('model_3d',  model3d)
      form.append('ios_src',   iosSrc)
      form.append('able_3d',   able3d)
      form.append('able_ar',   ableAr)
      console.log(" HAS AR : ",changedTypes.has('AR'))
      console.log(" HAS 3D : ",changedTypes.has('3D'))
      form.append('valid_ar', changedTypes.has('AR') ? false : !!item.valid_ar)
      form.append('valid_3d', changedTypes.has('3D') ? false : !!item.valid_3d)

      await api.patch(`/api/products/${item.id}/ar`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      if (changedTypes.has('AR')) await submitValidationRequest('AR', item.id, item.name)
      if (changedTypes.has('3D')) await submitValidationRequest('3D', item.id, item.name)

      onSaved(changedTypes)
      onClose()
    } catch (err) {
      console.error(err)
      setSaveError(err.response?.data?.detail || 'Failed to save. Please try again.')
    } finally { setSaving(false) }
  }

  const next = { model_src: modelSrc, model_3d: model3d, ios_src: iosSrc, able_ar: ableAr, able_3d: able3d }
  const changedPreview = computeChangedTypes(original, next)

  const urlFields = [
    ableAr && { label: 'AR Model URL',  desc: 'model_src — .usdz / .glb for web AR',  icon: Globe,      val: modelSrc, set: setModelSrc, placeholder: 'https://…/model.glb'  },
    able3d && { label: '3D Model URL',  desc: 'model_3d  — .glb for 3D viewer',        icon: Box,        val: model3d,  set: setModel3d,  placeholder: 'https://…/model.glb'  },
    ableAr && { label: 'iOS AR URL',    desc: 'ios_src   — .usdz for iOS Quick Look',  icon: Smartphone, val: iosSrc,   set: setIosSrc,   placeholder: 'https://…/model.usdz' },
  ].filter(Boolean)

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
          <div className="flex items-center gap-3 bg-[#EEF0FF] border border-[#5B47E0]/20 rounded-xl px-4 py-3">
            <div className="w-8 h-8 rounded-lg bg-[#5B47E0]/10 flex items-center justify-center shrink-0">
              <Layers size={14} className="text-[#5B47E0]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-800 truncate">{item.name}</p>
              <p className="text-xs text-[#5B47E0] font-medium">SKU: {item.sku} · {item.category}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-xl px-3 py-2">
              <span className="text-xs font-semibold text-gray-500">3D now</span>
              <span style={{
                fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 99,
                background: item.valid_3d ? '#f0fdf4' : '#f8fafc',
                color:      item.valid_3d ? '#16a34a' : '#94a3b8',
              }}>
                {item.valid_3d ? '✓ Active' : '✗ Inactive'}
              </span>
            </div>
            <div className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-xl px-3 py-2">
              <span className="text-xs font-semibold text-gray-500">AR now</span>
              <span style={{
                fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 99,
                background: item.valid_ar ? '#f0fdf4' : '#f8fafc',
                color:      item.valid_ar ? '#16a34a' : '#94a3b8',
              }}>
                {item.valid_ar ? '✓ Active' : '✗ Inactive'}
              </span>
            </div>
          </div>

          {changedPreview.size > 0 ? (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
              <Clock size={14} className="text-amber-500 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700 leading-relaxed">
                Only <span className="font-semibold">{[...changedPreview].join(' and ')}</span> will be reset
                and submitted for review. The other type stays active as-is.
              </p>
            </div>
          ) : (
            <div className="flex items-start gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
              <CheckCircle2 size={14} className="text-gray-400 mt-0.5 shrink-0" />
              <p className="text-xs text-gray-500 leading-relaxed">
                No changes detected yet. Toggle AR or 3D below to configure model URLs.
              </p>
            </div>
          )}

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

          {urlFields.length === 0 ? (
            <div className="flex items-start gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
              <AlertCircle size={14} className="text-gray-400 mt-0.5 shrink-0" />
              <p className="text-xs text-gray-500 leading-relaxed">
                Enable AR or 3D above to configure model URLs.
              </p>
            </div>
          ) : urlFields.map(({ label, desc, icon: Icon, val, set, placeholder }) => (
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
              : <><CheckCircle2 size={14} /> Save & Submit for Review</>}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── DELETE CONFIRM MODAL (NEW: selective AR / 3D / Both with admin approval) ──
function DeleteARModal({ item, onClose, onDeleted }) {
  // 'choice' | 'confirm'
  const [step,       setStep]       = useState('choice')
  // 'AR' | '3D' | 'Both'
  const [deleteType, setDeleteType] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState('')

  const hasAR = (item.model_src || item.ios_src || item.able_ar)
  const has3D = (item.model_3d  || item.able_3d)

  // What gets wiped for each choice
  const OPTION_META = {
    AR: {
      label:    'AR Config',
      color:    '#d97706',
      bg:       '#fffbeb',
      border:   '#fde68a',
      icon:     Camera,
      iconColor:'text-amber-500',
      desc:     'Removes model_src, ios_src and disables AR. Admin must approve.',
      fields:   ['model_src', 'ios_src', 'able_ar → false', 'valid_ar → false'],
    },
    '3D': {
      label:    '3D Config',
      color:    '#5B47E0',
      bg:       '#EEF0FF',
      border:   '#c7c2f8',
      icon:     Box,
      iconColor:'text-[#5B47E0]',
      desc:     'Removes model_3d and disables 3D viewer. Admin must approve.',
      fields:   ['model_3d', 'able_3d → false', 'valid_3d → false'],
    },
    Both: {
      label:    'AR & 3D Config',
      color:    '#dc2626',
      bg:       '#fff1f2',
      border:   '#fecaca',
      icon:     Trash2,
      iconColor:'text-red-500',
      desc:     'Removes all AR and 3D data. Admin must approve before fields are cleared.',
      fields:   ['model_src', 'model_3d', 'ios_src', 'able_ar → false', 'able_3d → false', 'valid_ar → false', 'valid_3d → false'],
    },
  }

  const handleSubmitRequest = async () => {
    setSubmitting(true); setError('')
    try {
      // Submit the relevant admin-approval requests
      if (deleteType === 'AR' || deleteType === 'Both') {
        await submitValidationRequest('AR_Delete', item.id, item.name)
      }
      if (deleteType === '3D' || deleteType === 'Both') {
        await submitValidationRequest('3D_Delete', item.id, item.name)
      }
      onDeleted(deleteType)
      onClose()
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.detail || 'Failed to submit deletion request. Please try again.')
    } finally { setSubmitting(false) }
  }

  const meta = deleteType ? OPTION_META[deleteType] : null

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
              <Trash2 size={18} className="text-red-500" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                {step === 'choice' ? 'Select What to Remove' : 'Confirm Deletion Request'}
              </h2>
              <p className="text-xs text-gray-400">
                {step === 'choice' ? 'Choose which config to send for admin review' : 'A request will be sent to the admin'}
              </p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition cursor-pointer">
            <X size={15} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">

          {/* Product identity pill */}
          <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
            <div className="w-8 h-8 rounded-lg bg-[#EEF0FF] flex items-center justify-center shrink-0">
              <Layers size={14} className="text-[#5B47E0]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-800 truncate">{item.name}</p>
              <p className="text-xs text-gray-400">SKU: {item.sku}</p>
            </div>
          </div>

          {/* ── STEP 1: choose type ── */}
          {step === 'choice' && (
            <>
              <p className="text-xs text-gray-500 font-medium">What would you like to remove?</p>

              <div className="flex flex-col gap-2.5">
                {/* AR option */}
                <button
                  disabled={!hasAR}
                  onClick={() => { setDeleteType('AR'); setStep('confirm') }}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition cursor-pointer group
                    ${!hasAR
                      ? 'border-gray-100 bg-gray-50 opacity-40 cursor-not-allowed'
                      : deleteType === 'AR'
                        ? 'border-amber-400 bg-amber-50'
                        : 'border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50/50'
                    }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                    <Camera size={20} className="text-amber-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800">Remove AR Config</p>
                    <p className="text-xs text-gray-400 leading-relaxed mt-0.5">
                      Clears <code className="text-amber-600 bg-amber-50 px-1 rounded">model_src</code>,{' '}
                      <code className="text-amber-600 bg-amber-50 px-1 rounded">ios_src</code> &amp; disables AR
                    </p>
                    {!hasAR && <p className="text-[10px] text-gray-300 mt-0.5 italic">No AR config found</p>}
                  </div>
                  <ChevronRight size={16} className="text-gray-300 group-hover:text-amber-400 shrink-0 transition" />
                </button>

                {/* 3D option */}
                <button
                  disabled={!has3D}
                  onClick={() => { setDeleteType('3D'); setStep('confirm') }}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition cursor-pointer group
                    ${!has3D
                      ? 'border-gray-100 bg-gray-50 opacity-40 cursor-not-allowed'
                      : deleteType === '3D'
                        ? 'border-[#5B47E0]/50 bg-[#EEF0FF]'
                        : 'border-gray-200 bg-white hover:border-[#5B47E0]/30 hover:bg-[#EEF0FF]/50'
                    }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-[#EEF0FF] flex items-center justify-center shrink-0">
                    <Box size={20} className="text-[#5B47E0]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800">Remove 3D Config</p>
                    <p className="text-xs text-gray-400 leading-relaxed mt-0.5">
                      Clears <code className="text-[#5B47E0] bg-[#EEF0FF] px-1 rounded">model_3d</code> &amp; disables 3D viewer
                    </p>
                    {!has3D && <p className="text-[10px] text-gray-300 mt-0.5 italic">No 3D config found</p>}
                  </div>
                  <ChevronRight size={16} className="text-gray-300 group-hover:text-[#5B47E0] shrink-0 transition" />
                </button>

                {/* Both option */}
                <button
                  disabled={!hasAR && !has3D}
                  onClick={() => { setDeleteType('Both'); setStep('confirm') }}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition cursor-pointer group
                    ${(!hasAR && !has3D)
                      ? 'border-gray-100 bg-gray-50 opacity-40 cursor-not-allowed'
                      : deleteType === 'Both'
                        ? 'border-red-400 bg-red-50'
                        : 'border-gray-200 bg-white hover:border-red-300 hover:bg-red-50/50'
                    }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                    <Trash2 size={20} className="text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800">Remove AR &amp; 3D</p>
                    <p className="text-xs text-gray-400 leading-relaxed mt-0.5">
                      Clears all AR and 3D data from this product
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-gray-300 group-hover:text-red-400 shrink-0 transition" />
                </button>
              </div>

              {/* Info note */}
              <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                <Send size={13} className="text-blue-400 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-700 leading-relaxed">
                  Deletion requests are sent to an <span className="font-semibold">admin for approval</span>.
                  The data is not removed until the admin approves the request.
                </p>
              </div>
            </>
          )}

          {/* ── STEP 2: confirm ── */}
          {step === 'confirm' && meta && (
            <>
              {/* What will be removed */}
              <div
                className="rounded-xl px-4 py-4 border"
                style={{ background: meta.bg, borderColor: meta.border }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <meta.icon size={15} style={{ color: meta.color }} />
                  <p className="text-xs font-bold" style={{ color: meta.color }}>
                    Fields that will be cleared on approval
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {meta.fields.map(f => (
                    <code
                      key={f}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                      style={{ background: 'rgba(0,0,0,0.06)', color: meta.color }}
                    >
                      {f}
                    </code>
                  ))}
                </div>
              </div>

              <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                <Clock size={13} className="text-amber-500 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-700 leading-relaxed">
                  This sends a <span className="font-semibold">deletion request</span> to the admin. The{' '}
                  <span className="font-semibold">{meta.label}</span> remains intact until they approve it.
                  The validation request row will also be removed from the queue on approval.
                </p>
              </div>

              {error && (
                <p className="flex items-center gap-1.5 text-xs text-red-500 font-medium">
                  <AlertTriangle size={12} /> {error}
                </p>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={step === 'choice' ? onClose : () => { setStep('choice'); setDeleteType(null); setError('') }}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm text-gray-700 font-medium transition cursor-pointer"
          >
            {step === 'choice' ? 'Cancel' : '← Back'}
          </button>

          {step === 'confirm' && (
            <button
              onClick={handleSubmitRequest}
              disabled={submitting}
              className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting
                ? <><Loader2 size={14} className="animate-spin" /> Submitting…</>
                : <><Send size={14} /> Send to Admin for Approval</>}
            </button>
          )}
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

  const [original, setOriginal] = useState(null)

  const skuRef = useRef(null)
  useEffect(() => { skuRef.current?.focus() }, [])

  const handleSkuSearch = async () => {
    if (!sku.trim()) { setSkuError('Please enter a SKU'); return }
    setSearching(true); setSkuError('')
    try {
      const res = await api.get(`/api/products/by-sku/${sku.trim()}`)
      const p   = res.data
      setProduct(p)

      const orig = {
        model_src: p.model_src || '',
        model_3d:  p.model_3d  || '',
        ios_src:   p.ios_src   || '',
        able_ar:   !!p.able_ar,
        able_3d:   !!p.able_3d,
      }
      setOriginal(orig)
      setModelSrc(orig.model_src)
      setModel3d(orig.model_3d)
      setIosSrc(orig.ios_src)
      setAble3d(orig.able_3d)
      setAbleAr(orig.able_ar)
      setStep('form')
    } catch (err) {
      if (err.response?.status === 404) setSkuError(`No product found with SKU "${sku.trim()}"`)
      else setSkuError('Failed to fetch product. Check the SKU and try again.')
    } finally { setSearching(false) }
  }

  const handleSave = async () => {
    if (!product || !original) return
    setSaving(true); setSaveError('')
    try {
      const next = { model_src: modelSrc, model_3d: model3d, ios_src: iosSrc, able_ar: ableAr, able_3d: able3d }
      const changedTypes = computeChangedTypes(original, next)

      const form = new FormData()
      form.append('model_src', modelSrc)
      form.append('model_3d',  model3d)
      form.append('ios_src',   iosSrc)
      form.append('able_3d',   able3d)
      form.append('able_ar',   ableAr)
      form.append('valid_ar', changedTypes.has('AR') ? false : !!product.valid_ar)
      form.append('valid_3d', changedTypes.has('3D') ? false : !!product.valid_3d)

      await api.patch(`/api/products/${product.id}/ar`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      if (changedTypes.has('AR')) await submitValidationRequest('AR', product.id, product.name)
      if (changedTypes.has('3D')) await submitValidationRequest('3D', product.id, product.name)

      onSaved(changedTypes)
      onClose()
    } catch (err) {
      console.error(err)
      setSaveError(err.response?.data?.detail || 'Failed to save. Please try again.')
    } finally { setSaving(false) }
  }

  const changedPreview = original
    ? computeChangedTypes(original, { model_src: modelSrc, model_3d: model3d, ios_src: iosSrc, able_ar: ableAr, able_3d: able3d })
    : new Set()

  const urlFields = [
    ableAr && { label: 'AR Model URL',  desc: 'model_src — .usdz / .glb for web AR',  icon: Globe,      val: modelSrc, set: setModelSrc, placeholder: 'https://…/model.glb'  },
    able3d && { label: '3D Model URL',  desc: 'model_3d  — .glb for 3D viewer',        icon: Box,        val: model3d,  set: setModel3d,  placeholder: 'https://…/model.glb'  },
    ableAr && { label: 'iOS AR URL',    desc: 'ios_src   — .usdz for iOS Quick Look',  icon: Smartphone, val: iosSrc,   set: setIosSrc,   placeholder: 'https://…/model.usdz' },
  ].filter(Boolean)

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
                <button onClick={() => { setStep('sku'); setProduct(null); setOriginal(null) }}
                  className="text-xs text-gray-400 hover:text-gray-600 transition cursor-pointer">
                  Change
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-xl px-3 py-2">
                  <span className="text-xs font-semibold text-gray-500">3D now</span>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 99,
                    background: product.valid_3d ? '#f0fdf4' : '#f8fafc',
                    color:      product.valid_3d ? '#16a34a' : '#94a3b8',
                  }}>
                    {product.valid_3d ? '✓ Active' : '✗ Inactive'}
                  </span>
                </div>
                <div className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-xl px-3 py-2">
                  <span className="text-xs font-semibold text-gray-500">AR now</span>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 99,
                    background: product.valid_ar ? '#f0fdf4' : '#f8fafc',
                    color:      product.valid_ar ? '#16a34a' : '#94a3b8',
                  }}>
                    {product.valid_ar ? '✓ Active' : '✗ Inactive'}
                  </span>
                </div>
              </div>

              {changedPreview.size > 0 ? (
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                  <Clock size={14} className="text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-700 leading-relaxed">
                    Only <span className="font-semibold">{[...changedPreview].join(' and ')}</span> will be reset
                    and submitted for review. The other type stays active as-is.
                  </p>
                </div>
              ) : (
                <div className="flex items-start gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                  <CheckCircle2 size={14} className="text-gray-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-gray-500 leading-relaxed">
                    No changes from current config. Toggle AR or 3D below to configure model URLs.
                  </p>
                </div>
              )}

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

              {urlFields.length === 0 ? (
                <div className="flex items-start gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                  <AlertCircle size={14} className="text-gray-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Enable AR or 3D above to configure model URLs.
                  </p>
                </div>
              ) : urlFields.map(({ label, desc, icon: Icon, val, set, placeholder }) => (
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
                : <><CheckCircle2 size={14} /> Save & Submit for Review</>}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── MOBILE CARD VIEW ─────────────────────────────────────────────────────────
function MobileCard({ item, arValReq, tdValReq, onView, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#EEF0FF] flex items-center justify-center shrink-0">
          <Layers size={16} className="text-[#5B47E0]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-800 truncate">{item.name}</p>
          <p className="text-xs text-gray-400">{item.category} · SKU {item.sku}</p>
        </div>
        <Badge status={item.is_active ? 'active' : 'inactive'} />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
          <span className="text-xs font-semibold text-gray-500">AR</span>
          <div className="flex items-center gap-2">
            <ValidationBadge valReq={arValReq} />
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 99,
              background: item.valid_ar ? '#f0fdf4' : '#f8fafc',
              color:      item.valid_ar ? '#16a34a' : '#94a3b8',
            }}>
              {item.valid_ar ? '✓' : '✗'}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
          <span className="text-xs font-semibold text-gray-500">3D</span>
          <div className="flex items-center gap-2">
            <ValidationBadge valReq={tdValReq} />
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 99,
              background: item.valid_3d ? '#f0fdf4' : '#f8fafc',
              color:      item.valid_3d ? '#16a34a' : '#94a3b8',
            }}>
              {item.valid_3d ? '✓' : '✗'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-gray-50">
        <span className="text-xs text-gray-400">
          Views: <span className="font-semibold text-gray-600">{item.views ?? '—'}</span>
          <span className="mx-2">·</span>
          {formatDate(item.created_at)}
        </span>
        <div className="flex items-center gap-1">
          <button onClick={onView}
            className="p-2 rounded-lg hover:bg-blue-50 text-blue-400 hover:text-blue-600 transition cursor-pointer">
            <Eye size={15} />
          </button>
          <button onClick={onEdit}
            className="p-2 rounded-lg hover:bg-yellow-50 text-yellow-400 hover:text-yellow-600 transition cursor-pointer">
            <Pencil size={15} />
          </button>
          <button onClick={onDelete}
            className="p-2 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition cursor-pointer">
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function ARPage() {
  const navigate = useNavigate()

  const [items,       setItems]       = useState([])
  const [arValMap,    setArValMap]    = useState({})
  const [tdValMap,    setTdValMap]    = useState({})
  const [loading,     setLoading]     = useState(true)
  const [openBar,     setOpenBar]     = useState(window.innerWidth >= 600)
  const [showModal,   setShowModal]   = useState(false)
  const [flash,       setFlash]       = useState({ msg: '', type: 'success' })
  const [activeModal, setActiveModal] = useState(null)

  const stockManagerLinks = [
    { to: '/stock-manager-dash',              label: 'Dashboard',         icon: <LayoutDashboard />, end: true },
    { to: '/stock-manager-dash/inventories',  label: "Product's Catalog", icon: <Boxes />            },
    { to: '/stock-manager-dash/ar',           label: 'AR/3D Management',  icon: <Bot size={18} />    },
    { to: '/stock-manager-dash/deliveries',   label: 'Delivery',          icon: <Truck />            },
    { to: '/stock-manager-dash/problems',     label: 'Problems',          icon: <TriangleAlert />    },
    { to: '/stock-manager-dash/returns',      label: 'Returns',           icon: <RotateCcw />        },
  ]

  const fetchItems = async () => {
    setLoading(true)
    try {
      const r = await api.get('/api/products')
      setItems(r.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchValidations = async () => {
    try {
      const [arRes, tdRes, arDelRes, tdDelRes] = await Promise.all([
        api.get('/api/validation/', { params: { item_type: 'AR',        limit: 500 } }),
        api.get('/api/validation/', { params: { item_type: '3D',        limit: 500 } }),
        api.get('/api/validation/', { params: { item_type: 'AR_Delete', limit: 500 } }),
        api.get('/api/validation/', { params: { item_type: '3D_Delete', limit: 500 } }),
      ])
      const buildMap = (rows) => {
        const map = {}
        for (const req of rows) {
          if (!(req.item_id in map)) map[req.item_id] = req
        }
        return map
      }
      setArValMap({ ...buildMap(arRes.data), ...buildMap(arDelRes.data) })
      setTdValMap({ ...buildMap(tdRes.data), ...buildMap(tdDelRes.data) })
    } catch (err) {
      console.error('Failed to fetch validations:', err)
    }
  }

  useEffect(() => {
    fetchItems()
    fetchValidations()
  }, [])

  const showFlash = (msg, type = 'success') => {
    setFlash({ msg, type })
    setTimeout(() => setFlash({ msg: '', type: 'success' }), 4000)
  }

  const handleSaved = (changedTypes) => {
    const parts = []
    if (changedTypes?.has('AR')) parts.push('AR')
    if (changedTypes?.has('3D')) parts.push('3D')
    const submitted = parts.length > 0
      ? `Validation request submitted for: ${parts.join(' and ')}.`
      : 'Config saved. No validation requests needed (nothing changed).'
    showFlash(`AR/3D configuration saved! ${submitted}`)
    fetchItems()
    fetchValidations()
  }

  // deleteType is 'AR' | '3D' | 'Both'
  const handleDeleted = (deleteType) => {
    const label = deleteType === 'Both' ? 'AR & 3D' : deleteType
    showFlash(`Deletion request for ${label} config sent to admin for approval.`)
    fetchValidations()
  }

  const allValRequests = [...Object.values(arValMap), ...Object.values(tdValMap)]
  const valCounts = allValRequests.reduce(
    (acc, v) => { acc[v.status] = (acc[v.status] || 0) + 1; return acc },
    { Pending: 0, Approved: 0, Rejected: 0 }
  )

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

      <main style={{ flex: 1, overflowY: 'auto', minWidth: 0 }}>
        <Header concept="AR/3D Management" setOpenBar={setOpenBar} openBar={openBar} />

        <div className="p-4 sm:p-7 flex flex-col gap-5">

          {flash.msg && (
            <div className={`flex items-center gap-2 text-sm font-medium px-4 py-3 rounded-lg border-l-4 ${
              flash.type === 'success'
                ? 'bg-green-50 border-green-500 text-green-800'
                : 'bg-red-50 border-red-500 text-red-800'
            }`}>
              <CheckCircle2 size={15} className="shrink-0" /> {flash.msg}
            </div>
          )}

          <div className="flex flex-wrap justify-between items-start gap-4">
            <div>
              <p className="text-sm text-gray-400">Manage augmented reality and 3D product models</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {[
                  { label: 'Pending',  count: valCounts.Pending,  bg: '#fffbeb', color: '#d97706' },
                  { label: 'Approved', count: valCounts.Approved, bg: '#f0fdf4', color: '#16a34a' },
                  { label: 'Rejected', count: valCounts.Rejected, bg: '#fff1f2', color: '#dc2626' },
                ].map(s => (
                  <span key={s.label} style={{
                    background: s.bg, color: s.color,
                    fontSize: 11, fontWeight: 700,
                    padding: '2px 10px', borderRadius: 99,
                  }}>
                    {s.label}: {s.count}
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-[#5B47E0] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#4a38cc] transition shadow-sm cursor-pointer shrink-0"
            >
              <Plus size={16} /> Add AR / 3D
            </button>
          </div>

          {/* ── Mobile cards (< md) ── */}
          <div className="flex flex-col gap-3 md:hidden">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-[#5B47E0] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : items.length === 0 ? (
              <p className="text-center py-12 text-gray-400 text-sm">No AR experiences found.</p>
            ) : items.map(item => {
              const arValReq = arValMap[item.id] ?? null
              const tdValReq = tdValMap[item.id] ?? null
              return (
                <MobileCard
                  key={item.id}
                  item={item}
                  arValReq={arValReq}
                  tdValReq={tdValReq}
                  onView={() => setActiveModal({ mode: 'view', item, arValReq, tdValReq })}
                  onEdit={() => setActiveModal({ mode: 'edit', item })}
                  onDelete={() => setActiveModal({ mode: 'delete', item })}
                />
              )
            })}
          </div>

          {/* ── Desktop table (≥ md) ── */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Product Name', 'Category', 'Views', 'AR Validation', '3D Validation', 'Created', 'Actions'].map(h => (
                    <th key={h} className="text-left px-5 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12">
                      <div className="flex justify-center">
                        <div className="w-6 h-6 border-2 border-[#5B47E0] border-t-transparent rounded-full animate-spin" />
                      </div>
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-400 text-sm">No AR experiences found.</td>
                  </tr>
                ) : items.map((item) => {
                  const arValReq = arValMap[item.id] ?? null
                  const tdValReq = tdValMap[item.id] ?? null
                  return (
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
                      <td className="px-5 py-4 font-semibold text-gray-800">{item.views ?? '—'}</td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1">
                          <ValidationBadge valReq={arValReq} />
                          <span style={{
                            fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 99,
                            display: 'inline-block', marginTop: 2,
                            background: item.valid_ar ? '#f0fdf4' : '#f8fafc',
                            color:      item.valid_ar ? '#16a34a' : '#94a3b8',
                          }}>
                            AR {item.valid_ar ? '✓' : '✗'}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1">
                          <ValidationBadge valReq={tdValReq} />
                          <span style={{
                            fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 99,
                            display: 'inline-block', marginTop: 2,
                            background: item.valid_3d ? '#f0fdf4' : '#f8fafc',
                            color:      item.valid_3d ? '#16a34a' : '#94a3b8',
                          }}>
                            3D {item.valid_3d ? '✓' : '✗'}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-400 text-xs">{formatDate(item.created_at)}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setActiveModal({ mode: 'view', item, arValReq, tdValReq })}
                            title="View AR / 3D"
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
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {showModal && (
        <AddARModal onClose={() => setShowModal(false)} onSaved={handleSaved} />
      )}

      {activeModal?.mode === 'view' && (
        <ViewARModal
          item={activeModal.item}
          arValReq={activeModal.arValReq}
          tdValReq={activeModal.tdValReq}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal?.mode === 'edit' && (
        <EditARModal
          item={activeModal.item}
          onClose={() => setActiveModal(null)}
          onSaved={handleSaved}
        />
      )}

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