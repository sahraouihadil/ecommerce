import { useEffect, useRef, useState } from 'react'
import {
  Pencil, Trash2, Plus, Calendar,
  LayoutDashboard, Megaphone,
  Mail, FileText, X, Check, Loader2,
  ChevronDown, ImagePlus, Trash, Store, Globe, ChevronUp,
  Heart, MessageCircle, Share2, Bookmark, MoreHorizontal,
  ThumbsUp, Send, Tag, Users, Hash, Clock, AlertCircle,
  ShieldCheck, ShieldOff,
} from 'lucide-react'
import api from '../../services/api'
import Sidebar from '../ui/Sidebar'
import Header from '../ui/Header'
import icon from "../../assets/icon.jpg";

const BASE = "http://127.0.0.1:8000"

const img = path => {
  if (!path) return null
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  return `${BASE}/${path.startsWith('/') ? path.slice(1) : path}`
}

const PURPLE = '#5B47E0'

// ─── Status helpers ───────────────────────────────────────────────────────────

/**
 * Derive the display status for a campaign.
 * If the campaign's own status is already 'draft' or 'paused', keep it.
 * If end_date has passed and status is 'active', show as 'completed'.
 * Otherwise use the stored status.
 */
function deriveStatus(item) {
  if (!item) return 'draft'
  if (item.status === 'draft' || item.status === 'paused') return item.status
  if (item.status === 'completed') return 'completed'
  if (item.end_date) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const end = new Date(item.end_date)
    end.setHours(0, 0, 0, 0)
    if (end < today) return 'completed'
  }
  return item.status // 'active' or anything else
}

/**
 * Build the status options available in the dropdown depending on the
 * campaign's CURRENT (stored) status.
 *
 * Rules:
 *  - 'completed' is NEVER shown in the dropdown.
 *  - 'paused' only appears when the current status is 'active'
 *    (so the user can pause a live campaign).
 *  - When editing a paused campaign the user can go back to draft or active.
 */
function getStatusOptions(currentStatus) {
  if (currentStatus === 'active') {
    return ['draft', 'active', 'paused']
  }
  if (currentStatus === 'paused') {
    return ['draft', 'active', 'paused']
  }
  // draft (or anything else, e.g. new form)
  return ['draft', 'active']
}

const statusStyle = {
  active:    { bg: '#ECFDF5', color: '#16A34A' },
  draft:     { bg: '#FEF9C3', color: '#B45309' },
  paused:    { bg: '#E0F2FE', color: '#0369A1' },
  completed: { bg: '#F3F4F6', color: '#6B7280' },
}

const VALIDATION_BADGE = {
  pending_review:    { bg: '#FEF9C3', color: '#B45309', icon: <Clock size={10} />, label: 'Pending Review' },
  Pending:           { bg: '#FEF9C3', color: '#B45309', icon: <Clock size={10} />, label: 'Pending Review' },
  Approved:          { bg: '#ECFDF5', color: '#16A34A', icon: <Check size={10} />, label: 'Approved' },
  Rejected:          { bg: '#FEF2F2', color: '#DC2626', icon: <AlertCircle size={10} />, label: 'Rejected' },
  deletion_pending:  { bg: '#FEE2E2', color: '#991B1B', icon: <Trash2 size={10} />, label: 'Deletion Pending Admin Approval' },
}

const storefrontBadge = (status) =>
  status === 'active'
    ? { bg: '#ECFDF5', color: '#16A34A', icon: <ShieldCheck size={10} />, label: 'Live on Storefront' }
    : { bg: '#F3F4F6', color: '#6B7280', icon: <ShieldOff  size={10} />, label: 'Hidden from Storefront' }

const EMPTY_FORM = {
  name: '', title: '',
  tactics: { shop: false, facebook: false, instagram: false },
  status: 'draft', budget: 0,
  start_date: '', end_date: '',
  discount: '', discount_type: 'percentage',
  code: '', usage_max: 0, usage_current: 0,
}

const marketingmanagerLinks = [
  { to: "/marketing-manager-dash",             label: "Dashboard",   icon: <LayoutDashboard size={18} />, end: true },
  { to: "/marketing-manager-dash/campaigns",   label: "Campaigns",   icon: <Megaphone size={18} /> },
  { to: "/marketing-manager-dash/newsletters", label: "Newsletters", icon: <Mail size={18} /> },
  { to: "/marketing-manager-dash/blogs",       label: "Blogs",       icon: <FileText size={18} /> },
]

function fmt(n) {
  const num = Number(n) || 0
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`
  return num.toLocaleString()
}

function tacticsToChannel(t) {
  const parts = []
  if (t.shop)      parts.push('Ads on Shop')
  if (t.facebook)  parts.push('Facebook')
  if (t.instagram) parts.push('Instagram')
  return parts.join(', ') || 'None'
}

function channelToTactics(channel) {
  if (!channel) return { shop: false, facebook: false, instagram: false }
  return {
    shop:      channel.includes('Ads on Shop'),
    facebook:  channel.includes('Facebook'),
    instagram: channel.includes('Instagram'),
  }
}

function parseApiError(err) {
  const detail = err?.response?.data?.detail
  if (!detail) return 'Failed to save.'
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    return detail.map(e => {
      const field = Array.isArray(e.loc) ? e.loc.filter(l => l !== 'body').join(' → ') : ''
      return field ? `${field}: ${e.msg}` : e.msg
    }).join('\n')
  }
  return JSON.stringify(detail)
}

function fmtDiscount(discount, discount_type) {
  if (discount == null || discount === '') return null
  const num = Number(discount)
  if (isNaN(num) || num <= 0) return null
  return discount_type === 'percentage' ? `${num}% off` : `${num} DA off`
}

const labelStyle = {
  display: 'block', fontSize: '0.6875rem', fontWeight: 600,
  letterSpacing: '0.07em', color: '#6B7280', textTransform: 'uppercase', marginBottom: '6px',
}
const inputStyle = {
  width: '100%', border: '1px solid #E5E7EB', borderRadius: '10px',
  padding: '10px 14px', fontSize: '0.875rem', color: '#111827',
  outline: 'none', boxSizing: 'border-box', background: '#fff', appearance: 'none',
}

// ─── Facebook Ad Preview ──────────────────────────────────────────────────────
function FacebookPreview({ title, previewImg }) {
  return (
    <div style={{ border: '1px solid #E4E6EB', borderRadius: 12, overflow: 'hidden', background: '#fff', fontFamily: 'Helvetica Neue, Arial, sans-serif', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
      <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src={icon} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
          <div>
            <p style={{ fontWeight: 700, fontSize: '0.875rem', color: '#050505', margin: 0 }}>{'ARoom'}</p>
            <p style={{ fontSize: '0.6875rem', color: '#65676B', margin: 0 }}>Sponsored · 🌐</p>
          </div>
        </div>
        <MoreHorizontal size={18} color="#65676B" />
      </div>
      <div style={{ padding: '0 14px 10px' }}>
        <p style={{ fontSize: '0.875rem', color: '#050505', margin: 0, lineHeight: 1.5 }}>
          {title || "Discover our latest offer — don't miss out!"}
        </p>
      </div>
      <div style={{ width: '100%', height: 200, background: 'linear-gradient(135deg, #EEF0FF 0%, #F5F3FF 100%)', overflow: 'hidden' }}>
        {previewImg
          ? <img src={previewImg} alt="Ad" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <div style={{ fontSize: '2.5rem' }}>📘</div>
              <p style={{ fontSize: '0.75rem', color: '#9CA3AF', margin: 0 }}>Ad image preview</p>
            </div>
        }
      </div>
      <div style={{ padding: '10px 14px', background: '#F0F2F5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ fontSize: '0.6875rem', color: '#65676B', margin: 0 }}>marketingcore.app</p>
          <p style={{ fontWeight: 700, fontSize: '0.875rem', color: '#050505', margin: 0 }}>{title || 'Shop Now'}</p>
        </div>
        <button style={{ padding: '6px 16px', borderRadius: 6, border: 'none', background: '#E4E6EB', color: '#050505', fontWeight: 700, fontSize: '0.8125rem', cursor: 'pointer' }}>Shop now</button>
      </div>
      <div style={{ padding: '8px 14px', display: 'flex', gap: 4 }}>
        {[{ icon: <ThumbsUp size={14} />, label: 'Like' }, { icon: <MessageCircle size={14} />, label: 'Comment' }, { icon: <Share2 size={14} />, label: 'Share' }].map(a => (
          <button key={a.label} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '6px 0', border: 'none', background: 'transparent', color: '#65676B', fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer', borderRadius: 6 }}>
            {a.icon} {a.label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Instagram Ad Preview ─────────────────────────────────────────────────────
function InstagramPreview({ name, title, previewImg }) {
  return (
    <div style={{ border: '1px solid #DBDBDB', borderRadius: 12, overflow: 'hidden', background: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
      <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src={icon} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
          <div>
            <p style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#262626', margin: 0 }}>{'ARoom'}</p>
            <p style={{ fontSize: '0.6875rem', color: '#8E8E8E', margin: 0 }}>Sponsored</p>
          </div>
        </div>
        <MoreHorizontal size={18} color="#262626" />
      </div>
      <div style={{ width: '100%', aspectRatio: '1', background: 'linear-gradient(135deg, #FFECD2, #FCB69F)', overflow: 'hidden' }}>
        {previewImg
          ? <img src={previewImg} alt="Ad" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <div style={{ fontSize: '2.5rem' }}>📸</div>
              <p style={{ fontSize: '0.75rem', color: '#fff', margin: 0, fontWeight: 600 }}>Ad image preview</p>
            </div>
        }
      </div>
      <div style={{ padding: '10px 14px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 14 }}>
          <Heart size={22} color="#262626" />
          <MessageCircle size={22} color="#262626" />
          <Send size={22} color="#262626" />
        </div>
        <Bookmark size={22} color="#262626" />
      </div>
      <div style={{ padding: '4px 14px 14px' }}>
        <p style={{ fontSize: '0.8125rem', color: '#262626', margin: '0 0 4px', lineHeight: 1.5 }}>
          <span style={{ fontWeight: 700 }}>{(name || 'your_brand').toLowerCase().replace(/\s+/g, '_')}</span>
          {' '}{title || 'Check out our latest collection! Tap the link in bio to explore. 🔥'}
        </p>
        <button style={{ marginTop: 6, width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #DBDBDB', background: '#fff', color: '#262626', fontWeight: 700, fontSize: '0.8125rem', cursor: 'pointer' }}>Shop Now</button>
      </div>
    </div>
  )
}

// ─── Image Upload Field ───────────────────────────────────────────────────────
function ImageUploadField({ pendingFile, existingUrl, onFile, onClear }) {
  const inputRef = useRef(null)
  const [drag, setDrag] = useState(false)
  const [blobUrl, setBlobUrl] = useState(null)

  useEffect(() => {
    if (pendingFile) {
      const url = URL.createObjectURL(pendingFile)
      setBlobUrl(url)
      return () => URL.revokeObjectURL(url)
    } else { setBlobUrl(null) }
  }, [pendingFile])

  const preview = pendingFile ? blobUrl : existingUrl || null
  const handleFiles = (files) => {
    if (!files?.length) return
    const f = files[0]
    if (!f.type.startsWith('image/')) return
    onFile(f)
  }

  return (
    <div>
      <label style={labelStyle}>Campaign Image <span style={{ color: '#D1D5DB', fontWeight: 400 }}>(optional)</span></label>
      <div
        onDragOver={e => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); handleFiles(e.dataTransfer.files) }}
        onClick={() => !preview && inputRef.current?.click()}
        style={{
          position: 'relative', height: preview ? 'auto' : 110, minHeight: preview ? 0 : 110,
          borderRadius: 12, border: drag ? `2px dashed ${PURPLE}` : preview ? 'none' : '2px dashed #E5E7EB',
          background: drag ? '#F5F3FF' : preview ? 'transparent' : '#FAFAFA',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: 8, cursor: preview ? 'default' : 'pointer',
          overflow: 'hidden', transition: 'border-color 0.2s, background 0.2s',
        }}
      >
        {preview ? (
          <>
            <img src={preview} alt="Campaign banner" style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 12, display: 'block' }} />
            <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 6 }}>
              <button type="button" onClick={e => { e.stopPropagation(); inputRef.current?.click() }}
                style={{ padding: '5px 10px', borderRadius: 8, border: 'none', background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                <ImagePlus size={12} /> Change
              </button>
              <button type="button" onClick={e => { e.stopPropagation(); onClear() }}
                style={{ padding: '5px 8px', borderRadius: 8, border: 'none', background: 'rgba(239,68,68,0.85)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <Trash size={12} />
              </button>
            </div>
          </>
        ) : (
          <>
            <ImagePlus size={22} color="#D1D5DB" />
            <p style={{ fontSize: '0.8125rem', color: '#9CA3AF', margin: 0, textAlign: 'center' }}>
              Drag & drop or <span style={{ color: PURPLE, fontWeight: 600 }}>browse</span>
            </p>
            <p style={{ fontSize: '0.6875rem', color: '#D1D5DB', margin: 0 }}>JPEG, PNG, WebP · max 5 MB</p>
          </>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif"
        style={{ display: 'none' }} onChange={e => handleFiles(e.target.files)} />
    </div>
  )
}

// ─── Toggle Switch ────────────────────────────────────────────────────────────
function Toggle({ on }) {
  return (
    <div style={{ width: 40, height: 22, borderRadius: 99, background: on ? PURPLE : '#D1D5DB', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: 3, left: on ? 20 : 3, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
    </div>
  )
}

// ─── Tactics Selector ─────────────────────────────────────────────────────────
function TacticsSelector({ tactics, onChange, previewImg, campaignName, campaignTitle }) {
  const [platformOpen, setPlatformOpen] = useState(tactics.facebook || tactics.instagram)
  const [activePreview, setActivePreview] = useState(
    tactics.instagram ? 'instagram' : tactics.facebook ? 'facebook' : null
  )

  const toggle = key => {
    const next = { ...tactics, [key]: !tactics[key] }
    onChange(next)
    if ((key === 'facebook' || key === 'instagram') && !tactics[key]) {
      setPlatformOpen(true)
      setActivePreview(key)
    }
    if ((key === 'facebook' || key === 'instagram') && tactics[key]) {
      if (key === 'facebook' && tactics.instagram) setActivePreview('instagram')
      else if (key === 'instagram' && tactics.facebook) setActivePreview('facebook')
      else setActivePreview(null)
    }
  }

  const anyPlatform = tactics.facebook || tactics.instagram
  const activeCount = [tactics.facebook, tactics.instagram].filter(Boolean).length

  return (
    <div>
      <label style={labelStyle}>Ad Placement <span style={{ color: '#D1D5DB', fontWeight: 400 }}>(select all that apply)</span></label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div onClick={() => toggle('shop')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: 10, cursor: 'pointer', border: `1px solid ${tactics.shop ? PURPLE : '#E5E7EB'}`, background: tactics.shop ? '#F5F3FF' : '#FAFAFA', transition: 'all 0.15s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: tactics.shop ? PURPLE : '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}>
              <Store size={16} color={tactics.shop ? '#fff' : '#9CA3AF'} />
            </div>
            <div>
              <p style={{ fontWeight: 600, fontSize: '0.8125rem', color: '#111827', margin: 0 }}>Ads on Shop</p>
              <p style={{ fontSize: '0.6875rem', color: '#9CA3AF', margin: 0 }}>Featured placements across Shop</p>
            </div>
          </div>
          <Toggle on={tactics.shop} />
        </div>

        <div style={{ border: `1px solid ${anyPlatform ? PURPLE : '#E5E7EB'}`, borderRadius: 10, overflow: 'hidden' }}>
          <div onClick={() => setPlatformOpen(p => !p)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: anyPlatform ? '#F5F3FF' : '#FAFAFA', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: anyPlatform ? PURPLE : '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Globe size={16} color={anyPlatform ? '#fff' : '#9CA3AF'} />
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.8125rem', color: '#111827', margin: 0 }}>Ads on Platforms</p>
                <p style={{ fontSize: '0.6875rem', color: '#9CA3AF', margin: 0 }}>
                  {anyPlatform
                    ? [tactics.facebook && 'Facebook', tactics.instagram && 'Instagram'].filter(Boolean).join(' + ') + ' selected'
                    : 'Facebook & Instagram'}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {anyPlatform && <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: PURPLE, background: '#EEF0FF', padding: '2px 8px', borderRadius: 99 }}>{activeCount} active</span>}
              {platformOpen ? <ChevronUp size={14} color="#9CA3AF" /> : <ChevronDown size={14} color="#9CA3AF" />}
            </div>
          </div>

          {platformOpen && (
            <div style={{ padding: '14px 16px', borderTop: '1px solid #E5E7EB', background: '#fff', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                {[
                  { key: 'facebook',  label: 'Facebook',  emoji: '📘', color: '#1877F2', bg: '#E7F0FD' },
                  { key: 'instagram', label: 'Instagram', emoji: '📸', color: '#E1306C', bg: '#FDE7F3' },
                ].map(({ key, label, emoji, color, bg }) => {
                  const active = tactics[key]
                  return (
                    <div key={key}
                      onClick={e => { e.stopPropagation(); toggle(key); setActivePreview(key) }}
                      style={{ flex: 1, padding: '10px 12px', borderRadius: 10, cursor: 'pointer', border: `2px solid ${active ? color : '#E5E7EB'}`, background: active ? bg : '#FAFAFA', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.15s' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <span style={{ fontSize: '1.1rem' }}>{emoji}</span>
                        <span style={{ fontWeight: 600, fontSize: '0.8125rem', color: active ? color : '#6B7280' }}>{label}</span>
                      </div>
                      <Toggle on={active} />
                    </div>
                  )
                })}
              </div>
              {anyPlatform && (
                <div>
                  {tactics.facebook && tactics.instagram && (
                    <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                      {[{ key: 'facebook', label: '📘 Facebook' }, { key: 'instagram', label: '📸 Instagram' }].map(t => (
                        <button key={t.key} onClick={() => setActivePreview(t.key)}
                          style={{ padding: '5px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.75rem', background: activePreview === t.key ? PURPLE : '#F3F4F6', color: activePreview === t.key ? '#fff' : '#6B7280', transition: 'all 0.15s' }}>
                          {t.label}
                        </button>
                      ))}
                    </div>
                  )}
                  {(() => {
                    const show = activePreview || (tactics.facebook ? 'facebook' : 'instagram')
                    if (show === 'facebook' && tactics.facebook) return <FacebookPreview title={campaignTitle} previewImg={previewImg} />
                    if (show === 'instagram' && tactics.instagram) return <InstagramPreview name={campaignName} title={campaignTitle} previewImg={previewImg} />
                    if (tactics.facebook) return <FacebookPreview title={campaignTitle} previewImg={previewImg} />
                    if (tactics.instagram) return <InstagramPreview name={campaignName} title={campaignTitle} previewImg={previewImg} />
                    return null
                  })()}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Discount Section ─────────────────────────────────────────────────────────
function DiscountSection({ form, set, setForm, isEdit }) {
  const hasDiscount = form.discount !== '' && Number(form.discount) > 0
  return (
    <div style={{ border: '1px solid #E5E7EB', borderRadius: 12 }}>
      <div style={{ padding: '14px 16px', background: hasDiscount ? '#F5F3FF' : '#FAFAFA', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: 8, background: hasDiscount ? PURPLE : '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}>
          <Tag size={16} color={hasDiscount ? '#fff' : '#9CA3AF'} />
        </div>
        <div>
          <p style={{ fontWeight: 600, fontSize: '0.8125rem', color: '#111827', margin: 0 }}>Discount & Coupon</p>
          <p style={{ fontSize: '0.6875rem', color: '#9CA3AF', margin: 0 }}>
            {hasDiscount
              ? `${form.discount_type === 'percentage' ? form.discount + '%' : form.discount + ' DA'} off · max ${form.usage_max || '∞'} uses`
              : 'Optional — add a discount code to this campaign'}
          </p>
        </div>
      </div>
      <div style={{ padding: '16px', borderTop: '1px solid #F3F4F6', display: 'flex', flexDirection: 'column', gap: 14, background: '#fff' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Discount Value</label>
            <input style={inputStyle} type="number" min="0" step="0.01" placeholder="e.g. 20" value={form.discount} onChange={set('discount')} onFocus={e => e.target.style.borderColor = PURPLE} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
          </div>
          <div>
            <label style={labelStyle}>Discount Type</label>
            <div style={{ position: 'relative' }}>
              <select style={{ ...inputStyle, paddingRight: 36 }} value={form.discount_type} onChange={set('discount_type')}>
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed (DA)</option>
              </select>
              <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9CA3AF' }}><ChevronDown size={15} /></span>
            </div>
          </div>
        </div>
        <div>
          <label style={labelStyle}>Coupon Code <span style={{ color: '#D1D5DB', fontWeight: 400, marginLeft: 4 }}>(optional)</span></label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }}><Hash size={14} /></span>
            <input style={{ ...inputStyle, paddingLeft: 34, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, fontFamily: 'monospace' }} placeholder="e.g. SUMMER25" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} onFocus={e => e.target.style.borderColor = PURPLE} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Max Redemptions <span style={{ color: '#D1D5DB', fontWeight: 400, marginLeft: 4 }}>(0 = unlimited)</span></label>
            <input style={inputStyle} type="number" min="0" placeholder="e.g. 500" value={form.usage_max} onChange={set('usage_max')} onFocus={e => e.target.style.borderColor = PURPLE} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
          </div>
          <div>
            <label style={labelStyle}>Current Redemptions {!isEdit && <span style={{ color: '#D1D5DB', fontWeight: 400, marginLeft: 4 }}>(starts at 0)</span>}</label>
            <input style={{ ...inputStyle, background: !isEdit ? '#F9FAFB' : '#fff', color: !isEdit ? '#9CA3AF' : '#111827' }} type="number" min="0" placeholder="0" value={form.usage_current} onChange={set('usage_current')} disabled={!isEdit} onFocus={e => { if (isEdit) e.target.style.borderColor = PURPLE }} onBlur={e => { if (isEdit) e.target.style.borderColor = '#E5E7EB' }} />
          </div>
        </div>
        {isEdit && Number(form.usage_max) > 0 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: '0.6875rem', color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 4 }}><Users size={10} /> Redemption Progress</span>
              <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#374151' }}>{form.usage_current} / {form.usage_max}</span>
            </div>
            {(() => {
              const pct = Math.min(100, Math.round((Number(form.usage_current) / Number(form.usage_max)) * 100))
              const barColor = pct >= 90 ? '#EF4444' : pct >= 60 ? '#F59E0B' : '#10B981'
              return (
                <div style={{ height: 5, borderRadius: 99, background: '#F0F0F5', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 99, transition: 'width 0.5s ease' }} />
                </div>
              )
            })()}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Resolve the save button label based on status ────────────────────────────
function getSaveLabel({ saving, isEdit, status }) {
  if (saving) return 'Saving…'
  if (status === 'active') return isEdit ? 'Save & Re-submit for Approval' : 'Submit for Approval'
  return 'Save'
}

// ─── Campaign Modal ───────────────────────────────────────────────────────────
function CampaignModal({ initial, onClose, onSaved }) {
  const isEdit = !!initial?.id

  // The stored status from the API (used to compute dropdown options)
  const storedStatus = initial?.status ?? 'draft'

  const [form, setForm] = useState(
    initial ? {
      name:          initial.name          ?? '',
      title:         initial.title         ?? '',
      tactics:       channelToTactics(initial.channel),
      status:        storedStatus,
      budget:        initial.budget        ?? 0,
      start_date:    initial.start_date    ? initial.start_date.slice(0, 10) : '',
      end_date:      initial.end_date      ? initial.end_date.slice(0, 10)   : '',
      discount:      initial.discount != null ? initial.discount : '',
      discount_type: initial.discount_type ?? 'percentage',
      code:          initial.code          ?? '',
      usage_max:     initial.usage_max     ?? 0,
      usage_current: initial.usage_current ?? 0,
    } : EMPTY_FORM
  )
  const [saving,      setSaving]      = useState(false)
  const [error,       setError]       = useState('')
  const [pendingFile, setPendingFile] = useState(null)
  const [clearImage,  setClearImage]  = useState(false)
  const [blobPreview, setBlobPreview] = useState(null)

  useEffect(() => {
    if (pendingFile) {
      const url = URL.createObjectURL(pendingFile)
      setBlobPreview(url)
      return () => URL.revokeObjectURL(url)
    } else { setBlobPreview(null) }
  }, [pendingFile])

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  // Status options depend on the stored (original) status of the campaign
  const statusOptions = getStatusOptions(storedStatus)

  const needsApproval = form.status === 'active'

  const handleSubmit = async () => {
    if (!form.name.trim())               return setError('Campaign name is required.')
    if (!form.title.trim())              return setError('Headline is required.')
    if (!form.start_date)                return setError('Start date is required.')
    if (!form.budget)                    return setError('Budget is required.')
    if (!form.end_date)                  return setError('End date is required.')
    if (form.start_date > form.end_date) return setError('Start date must be before end date.')
    const channel = tacticsToChannel(form.tactics)
    if (channel === 'None')              return setError('Select at least one ad placement.')

    const discountVal = form.discount !== '' ? parseFloat(form.discount) : null
    if (discountVal !== null && isNaN(discountVal)) return setError('Discount value must be a number.')
    if (discountVal !== null && discountVal < 0)    return setError('Discount value cannot be negative.')
    if (form.discount_type === 'percentage' && discountVal > 100) return setError('Percentage discount cannot exceed 100%.')

    const usageMax     = parseInt(form.usage_max) || 0
    const usageCurrent = parseInt(form.usage_current) || 0
    if (usageMax > 0 && usageCurrent > usageMax) return setError('Current redemptions cannot exceed max redemptions.')

    setError('')
    setSaving(true)

    try {
      const payload = {
        name:          form.name.trim(),
        title:         form.title.trim(),
        channel,
        status:        form.status,
        budget:        parseFloat(form.budget) || 0,
        spent:         initial?.spent       ?? 0,
        impressions:   initial?.impressions ?? 0,
        clicks:        initial?.clicks      ?? 0,
        start_date:    form.start_date,
        end_date:      form.end_date,
        discount:      discountVal,
        discount_type: discountVal != null ? form.discount_type : null,
        code:          form.code.trim() || null,
        usage_max:     usageMax,
        usage_current: usageCurrent,
      }

      const res = isEdit
        ? await api.put(`/api/campaigns/${initial.id}`, payload)
        : await api.post('/api/campaigns/', payload)
      let saved = res.data

      if (pendingFile) {
        const fd = new FormData()
        fd.append('file', pendingFile)
        const imgRes = await api.post(`/api/campaigns/${saved.id}/image`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        saved = imgRes.data
      }

      if (clearImage && !pendingFile && isEdit && initial?.image_url) {
        const imgRes = await api.delete(`/api/campaigns/${saved.id}/image`)
        saved = imgRes.data
      }

      onClose()
      onSaved(saved, isEdit)
    } catch (err) {
      setError(parseApiError(err))
    } finally {
      setSaving(false)
    }
  }

  const backdrop    = e => { if (e.target === e.currentTarget) onClose() }
  const existingUrl = clearImage ? null : (initial?.image_url ? img(initial.image_url) : null)
  const livePreview = blobPreview || existingUrl

  return (
    <div onClick={backdrop} style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}>
      <div style={{ background: '#fff', borderRadius: '18px', boxShadow: '0 24px 64px rgba(0,0,0,0.18)', width: '100%', maxWidth: '520px', overflow: 'hidden', maxHeight: '94vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 24px 18px', borderBottom: '1px solid #F3F4F6', flexShrink: 0 }}>
          <div>
            <span style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#111827' }}>{isEdit ? 'Edit Campaign' : 'New Campaign'}</span>
            <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={11} />
              {needsApproval
                ? isEdit
                  ? 'Saving changes will re-submit this campaign for admin approval'
                  : 'Requires admin approval to go live on the storefront'
                : 'Campaign will be saved — set status to Active to submit for approval'}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 4, borderRadius: 8 }}><X size={18} /></button>
        </div>

        <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto', flex: 1, minHeight: 0 }}>
          <ImageUploadField
            pendingFile={pendingFile} existingUrl={existingUrl}
            onFile={f => { setPendingFile(f); setClearImage(false) }}
            onClear={() => { setPendingFile(null); setClearImage(true) }}
          />
          <div>
            <label style={labelStyle}>Campaign Name</label>
            <input style={inputStyle} value={form.name} onChange={set('name')} placeholder="e.g. Summer Sale 2025" onFocus={e => e.target.style.borderColor = PURPLE} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
          </div>
          <div>
            <label style={labelStyle}>Headline</label>
            <input style={inputStyle} value={form.title} onChange={set('title')} placeholder="e.g. Discover our biggest deals of the year" onFocus={e => e.target.style.borderColor = PURPLE} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
          </div>
          <TacticsSelector tactics={form.tactics} onChange={t => setForm(f => ({ ...f, tactics: t }))} previewImg={livePreview} campaignName={form.name} campaignTitle={form.title} />
          <DiscountSection form={form} set={set} setForm={setForm} isEdit={isEdit} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>
                Status
                <span style={{ color: '#D1D5DB', fontWeight: 400, marginLeft: 4, textTransform: 'none', letterSpacing: 0 }}>(operational)</span>
              </label>
              <div style={{ position: 'relative' }}>
                <select style={{ ...inputStyle, paddingRight: 36 }} value={form.status} onChange={set('status')}>
                  {statusOptions.map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
                <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9CA3AF' }}><ChevronDown size={15} /></span>
              </div>
              {storedStatus === 'active' && (
                <p style={{ fontSize: '0.6875rem', color: '#9CA3AF', margin: '5px 0 0' }}>
                  Select <strong>Paused</strong> to temporarily stop this campaign.
                </p>
              )}
            </div>
            <div>
              <label style={labelStyle}>Budget (DA)</label>
              <input style={inputStyle} type="number" min="0" value={form.budget} onChange={set('budget')} onFocus={e => e.target.style.borderColor = PURPLE} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
            </div>
          </div>

          {isEdit && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, background: initial?.status === 'active' ? '#ECFDF5' : '#F3F4F6', border: `1px solid ${initial?.status === 'active' ? '#BBF7D0' : '#E5E7EB'}` }}>
              {initial?.status === 'active' ? <ShieldCheck size={15} color="#16A34A" /> : <ShieldOff size={15} color="#9CA3AF" />}
              <div>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: initial?.status === 'active' ? '#16A34A' : '#6B7280', margin: 0 }}>
                  {initial?.status === 'active' ? 'Currently Live on Storefront' : 'Currently Hidden from Storefront'}
                </p>
                <p style={{ fontSize: '0.6875rem', color: '#9CA3AF', margin: 0 }}>
                  {initial?.status === 'active' ? 'Changes will require admin re-approval' : 'Set status to Active and save to request approval'}
                </p>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Start Date</label>
              <input style={inputStyle} type="date" value={form.start_date} onChange={set('start_date')} onFocus={e => e.target.style.borderColor = PURPLE} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
            </div>
            <div>
              <label style={labelStyle}>End Date</label>
              <input style={inputStyle} type="date" value={form.end_date} onChange={set('end_date')} onFocus={e => e.target.style.borderColor = PURPLE} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
            </div>
          </div>
          {error && (
            <div style={{ fontSize: '0.8125rem', color: '#EF4444', background: '#FEF2F2', padding: '8px 12px', borderRadius: 8 }}>
              {error.split('\n').map((line, i) => <p key={i} style={{ margin: i === 0 ? 0 : '4px 0 0' }}>{line}</p>)}
            </div>
          )}
        </div>

        <div style={{ padding: '14px 24px 20px', display: 'flex', justifyContent: 'flex-end', gap: 10, flexShrink: 0, borderTop: '1px solid #F3F4F6' }}>
          <button onClick={onClose} style={{ padding: '9px 20px', borderRadius: 10, border: '1px solid #E5E7EB', background: '#fff', color: '#374151', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '9px 22px', borderRadius: 10, border: 'none',
              background: PURPLE, color: '#fff',
              fontSize: '0.875rem', fontWeight: 600,
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={14} />}
            {getSaveLabel({ saving, isEdit, status: form.status })}
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
    <div onClick={backdrop} style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(3px)' }}>
      <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', width: '100%', maxWidth: '400px', padding: '28px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Trash2 size={18} color="#EF4444" />
          </div>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', margin: 0 }}>Request Campaign Deletion</h2>
        </div>
        <p style={{ fontSize: '0.875rem', color: '#6B7280', lineHeight: 1.6, marginBottom: 12 }}>
          Are you sure you want to request deletion of <strong style={{ color: '#374151' }}>"{item.name}"</strong>?
        </p>
        <div style={{ fontSize: '0.8125rem', color: '#92400E', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 8, padding: '10px 12px', marginBottom: 24, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
          <Clock size={14} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>This will send a deletion request to the admin. The campaign will only be removed after admin approval.</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onClose} style={{ padding: '9px 20px', borderRadius: 10, border: '1px solid #E5E7EB', background: '#fff', color: '#374151', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
          <button onClick={onConfirm} disabled={deleting} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 22px', borderRadius: 10, border: 'none', background: '#EF4444', color: '#fff', fontSize: '0.875rem', fontWeight: 600, cursor: deleting ? 'not-allowed' : 'pointer', opacity: deleting ? 0.7 : 1 }}>
            {deleting && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
            {deleting ? 'Submitting…' : 'Request Deletion'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Channel Badges ───────────────────────────────────────────────────────────
function ChannelBadges({ channel }) {
  const map = {
    'Ads on Shop': { emoji: '🛍️', bg: '#EEF0FF', color: '#5B47E0' },
    'Facebook':    { emoji: '📘', bg: '#E7F0FD', color: '#1877F2' },
    'Instagram':   { emoji: '📸', bg: '#FDE7F3', color: '#E1306C' },
  }
  const parts = (channel || '').split(',').map(s => s.trim()).filter(Boolean)
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
      {parts.map(p => {
        const m = map[p] || { emoji: '📣', bg: '#F3F4F6', color: '#6B7280' }
        return (
          <span key={p} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 9px', borderRadius: 99, background: m.bg, color: m.color, fontSize: '0.6875rem', fontWeight: 600 }}>
            {m.emoji} {p}
          </span>
        )
      })}
    </div>
  )
}

// ─── Validation Status Banner ─────────────────────────────────────────────────
function ValidationBanner({ validationStatus, rejectionNote, isDeletionPending }) {
  if (isDeletionPending) {
    return (
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 12px', borderRadius: 8, background: '#FEE2E2', color: '#991B1B', fontSize: '0.6875rem', fontWeight: 600 }}>
        <span style={{ marginTop: 1, flexShrink: 0 }}><Trash2 size={10} /></span>
        <span>Deletion request pending admin approval</span>
      </div>
    )
  }
  const badge = VALIDATION_BADGE[validationStatus] || VALIDATION_BADGE['pending_review']
  const isRejected = validationStatus === 'Rejected'
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 12px', borderRadius: 8, background: badge.bg, color: badge.color, fontSize: '0.6875rem', fontWeight: 600 }}>
      <span style={{ marginTop: 1, flexShrink: 0 }}>{badge.icon}</span>
      <div style={{ minWidth: 0 }}>
        <span>Admin review: {badge.label}</span>
        {isRejected && rejectionNote && (
          <p style={{ margin: '3px 0 0', fontWeight: 400, color: '#B91C1C', lineHeight: 1.4, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{rejectionNote}</p>
        )}
      </div>
    </div>
  )
}

// ─── Storefront Visibility Badge ──────────────────────────────────────────────
function StorefrontBadge({ status }) {
  const badge = storefrontBadge(status)
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 8, background: badge.bg, color: badge.color, fontSize: '0.6875rem', fontWeight: 600 }}>
      {badge.icon}
      {badge.label}
    </div>
  )
}

// ─── Campaign Card ────────────────────────────────────────────────────────────
function CampaignCard({ item, validationInfo, deletionInfo, onEdit, onDelete }) {
  // Compute display status — auto-completed when end_date has passed
  const displayStatus = deriveStatus(item)

  const pct           = item.budget > 0 ? Math.min(100, Math.round((item.spent / item.budget) * 100)) : 0
  const st            = statusStyle[displayStatus] || { bg: '#F3F4F6', color: '#6B7280' }
  const imageUrl      = img(item.image_url)
  const usagePct      = item.usage_max > 0 ? Math.min(100, Math.round((item.usage_current / item.usage_max) * 100)) : null
  const discountLabel = fmtDiscount(item.discount, item.discount_type)

  const valStatus         = validationInfo?.status ?? 'Approved'
  const isPending         = valStatus === 'Pending'
  const isRejected        = valStatus === 'Rejected'
  const isDeletionPending = deletionInfo?.status === 'Pending'

  // Completed campaigns are read-only; pending/deletion-pending are locked too
  const isCompleted = displayStatus === 'completed'
  const isLocked    = isPending || isDeletionPending || isCompleted

  const showValidationHighlight = item.status === 'active'

  return (
    <div
      style={{ background: '#fff', borderRadius: 16, border: `1px solid ${showValidationHighlight && isDeletionPending ? '#FECACA' : showValidationHighlight && isPending ? '#FDE68A' : showValidationHighlight && isRejected ? '#FECACA' : '#F0F0F5'}`, boxShadow: '0 1px 6px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', transition: 'box-shadow 0.2s', overflow: 'hidden' }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 6px rgba(0,0,0,0.04)'}
    >
      {imageUrl && (
        <div style={{ position: 'relative', width: '100%', height: 160, flexShrink: 0 }}>
          <img src={imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={e => { e.currentTarget.parentElement.style.display = 'none' }} />
          <span style={{ position: 'absolute', top: 10, right: 10, padding: '4px 12px', borderRadius: 999, fontSize: '0.6875rem', fontWeight: 600, background: st.bg, color: st.color, boxShadow: '0 1px 4px rgba(0,0,0,0.12)' }}>{displayStatus}</span>
          {discountLabel && (
            <span style={{ position: 'absolute', top: 10, left: 10, padding: '4px 10px', borderRadius: 999, fontSize: '0.6875rem', fontWeight: 700, background: '#FEF9C3', color: '#B45309', display: 'flex', alignItems: 'center', gap: 4, boxShadow: '0 1px 4px rgba(0,0,0,0.10)' }}>
              <Tag size={10} /> {discountLabel}
            </span>
          )}
        </div>
      )}

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#111827', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</p>
            {item.title && <p style={{ fontSize: '0.8rem', color: PURPLE, fontWeight: 500, marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</p>}
            <ChannelBadges channel={item.channel} />
          </div>
          {!imageUrl && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0, marginLeft: 10 }}>
              <span style={{ padding: '4px 12px', borderRadius: 999, fontSize: '0.6875rem', fontWeight: 600, background: st.bg, color: st.color }}>{displayStatus}</span>
              {discountLabel && (
                <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: '0.6875rem', fontWeight: 700, background: '#FEF9C3', color: '#B45309', display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Tag size={9} /> {discountLabel}
                </span>
              )}
            </div>
          )}
        </div>

        <StorefrontBadge status={item.status} />

        {item.status === 'active' && (validationInfo || isDeletionPending) && (
          <ValidationBanner
            validationStatus={validationInfo?.status}
            rejectionNote={validationInfo?.rejection_note}
            isDeletionPending={isDeletionPending}
          />
        )}

        {/* Completed notice */}
        {isCompleted && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 8, background: '#F3F4F6', color: '#6B7280', fontSize: '0.6875rem', fontWeight: 600 }}>
            <Check size={10} />
            Campaign ended — read-only
          </div>
        )}

        {item.code && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 6, background: '#F5F3FF', color: PURPLE, fontSize: '0.75rem', fontWeight: 700, fontFamily: 'monospace', letterSpacing: '0.08em', border: `1px dashed ${PURPLE}` }}>
              <Hash size={10} /> {item.code}
            </span>
          </div>
        )}

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

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: '0.6875rem', color: '#9CA3AF' }}>Budget Used</span>
            <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#374151' }}>{pct}%</span>
          </div>
          <div style={{ height: 5, borderRadius: 99, background: '#F0F0F5', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: PURPLE, borderRadius: 99, transition: 'width 0.5s ease' }} />
          </div>
        </div>

        {usagePct !== null && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: '0.6875rem', color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 4 }}><Users size={10} /> Redemptions</span>
              <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#374151' }}>{item.usage_current} / {item.usage_max}</span>
            </div>
            <div style={{ height: 5, borderRadius: 99, background: '#F0F0F5', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${usagePct}%`, background: usagePct >= 90 ? '#EF4444' : usagePct >= 60 ? '#F59E0B' : '#10B981', borderRadius: 99, transition: 'width 0.5s ease' }} />
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid #F3F4F6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', color: '#9CA3AF' }}>
            <Calendar size={12} />
            <span>{item.start_date?.slice(0, 10) || '—'} → {item.end_date?.slice(0, 10) || '—'}</span>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              onClick={() => !isLocked && onEdit(item)}
              title={
                isCompleted        ? 'Campaign has ended — read-only' :
                isPending          ? 'Cannot edit while awaiting admin review' :
                isDeletionPending  ? 'Cannot edit while deletion is pending' :
                                     'Edit campaign'
              }
              style={{ padding: 6, border: 'none', background: 'transparent', cursor: isLocked ? 'not-allowed' : 'pointer', color: isLocked ? '#D1D5DB' : '#F59E0B', borderRadius: 8, display: 'flex', alignItems: 'center', opacity: isLocked ? 0.5 : 1 }}
              onMouseEnter={e => { if (!isLocked) e.currentTarget.style.background = '#FFFBEB' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => !isDeletionPending && onDelete(item)}
              title={isDeletionPending ? 'Deletion already pending admin approval' : 'Request deletion'}
              style={{ padding: 6, border: 'none', background: 'transparent', cursor: isDeletionPending ? 'not-allowed' : 'pointer', color: isDeletionPending ? '#D1D5DB' : '#EF4444', borderRadius: 8, display: 'flex', alignItems: 'center', opacity: isDeletionPending ? 0.5 : 1 }}
              onMouseEnter={e => { if (!isDeletionPending) e.currentTarget.style.background = '#FEF2F2' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CampaignsPage() {
  const [items,          setItems]          = useState([])
  const [validationMap,  setValidationMap]  = useState({})
  const [deletionMap,    setDeletionMap]    = useState({})
  const [loading,        setLoading]        = useState(true)
  const [openBar,        setOpenBar]        = useState(window.innerWidth >= 600)
  const [showCreate,     setShowCreate]     = useState(false)
  const [editTarget,     setEditTarget]     = useState(null)
  const [deleteTarget,   setDeleteTarget]   = useState(null)
  const [deleting,       setDeleting]       = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const [campaignsRes, validationRes] = await Promise.all([
          api.get('/api/campaigns/'),
          api.get('/api/validation/', { params: { item_type: 'Campaigns', limit: 500 } }),
        ])

        const deletionRes = await api.get('/api/validation/', {
          params: { item_type: 'Campaigns_Delete', limit: 500 }
        })

        setItems(campaignsRes.data)

        const vMap = {}
        const rows = validationRes.data || []
        const sorted = [...rows].sort((a, b) => {
          if (a.status === 'Pending') return 1
          if (b.status === 'Pending') return -1
          return 0
        })
        for (const row of sorted) {
          vMap[row.item_id] = row
        }
        setValidationMap(vMap)

        const dMap = {}
        for (const row of (deletionRes.data || [])) {
          if (row.status === 'Pending') {
            dMap[row.item_id] = row
          }
        }
        setDeletionMap(dMap)

      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleSaved = (saved, isEdit) => {
    setItems(prev => {
      if (isEdit) return prev.map(i => i.id === saved.id ? saved : i)
      const without = prev.filter(i => i.id !== saved.id)
      return [saved, ...without]
    })
    if (saved.status === 'active') {
      setValidationMap(prev => ({
        ...prev,
        [saved.id]: { status: 'Pending', rejection_note: null, item_id: saved.id },
      }))
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await api.delete(`/api/campaigns/${deleteTarget.id}`)
      setDeletionMap(prev => ({
        ...prev,
        [deleteTarget.id]: { status: 'Pending', item_id: deleteTarget.id },
      }))
      setDeleteTarget(null)
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Failed to submit deletion request.'
      alert(msg)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F4F6FB', fontFamily: 'system-ui, sans-serif' }}>
      <Sidebar openBar={openBar} setOpenBar={setOpenBar} links={marketingmanagerLinks} title="MarketingCore" subtitle="Enterprise Suite" role="Marketing Manager" profilePath="/marketing-manager-dash/profile" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header concept="Campaigns" onToggleSidebar={() => setOpenBar(p => !p)} />
        <main style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#9CA3AF', margin: 0 }}>Track and manage marketing campaigns</p>
              <p style={{ fontSize: '0.75rem', color: '#D1D5DB', margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={11} /> Campaigns set to Active require admin approval to appear on the storefront
              </p>
            </div>
            <button onClick={() => setShowCreate(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 7, background: PURPLE, color: '#fff', padding: '10px 20px', borderRadius: 12, border: 'none', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(91,71,224,0.3)' }}
              onMouseEnter={e => e.currentTarget.style.background = '#4a38cc'}
              onMouseLeave={e => e.currentTarget.style.background = PURPLE}>
              <Plus size={16} /> New Campaign
            </button>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', border: `2px solid ${PURPLE}`, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
            </div>
          ) : items.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 0', gap: 12, color: '#9CA3AF' }}>
              <Megaphone size={44} style={{ opacity: 0.25 }} />
              <p style={{ fontSize: '0.875rem' }}>No campaigns yet — click New Campaign to get started.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
              {items.map(item => (
                <CampaignCard
                  key={item.id}
                  item={item}
                  validationInfo={validationMap[item.id] ?? null}
                  deletionInfo={deletionMap[item.id] ?? null}
                  onEdit={setEditTarget}
                  onDelete={setDeleteTarget}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {showCreate   && <CampaignModal initial={null}       onClose={() => setShowCreate(false)} onSaved={handleSaved} />}
      {editTarget   && <CampaignModal initial={editTarget} onClose={() => setEditTarget(null)}  onSaved={handleSaved} />}
      {deleteTarget && <DeleteModal item={deleteTarget} deleting={deleting} onClose={() => setDeleteTarget(null)} onConfirm={handleConfirmDelete} />}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}