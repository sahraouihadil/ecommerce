import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useFurnitureConfig } from '../hooks/useFurnitureConfig'
import { SceneCanvas } from '../components/SceneCanvas'
import { ConfigPanel } from '../components/ConfigPanel'

// ← OUTSIDE the component
const MATERIAL_PRICE = { oak: 1.0, walnut: 1.4, white: 0.8, charcoal: 0.9, pine: 0.7 }

function calcPrice(cfg) {
  const volume = cfg.width * cfg.height * cfg.depth
  const factor = MATERIAL_PRICE[cfg.material.id] ?? 1
  return Math.round((15000 + volume * 40000 + cfg.shelves * 800) * factor / 100) * 100
}

function Toast({ message, visible }) {
  return (
    <div style={{
      position: 'fixed', bottom: '1.75rem', left: '50%',
      transform: `translateX(-50%) translateY(${visible ? '0' : '5rem'})`,
      opacity: visible ? 1 : 0,
      transition: 'transform 0.42s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease',
      background: 'rgba(248,244,238,0.96)', border: '1px solid rgba(200,169,106,0.35)',
      borderRadius: '2rem', padding: '0.5rem 1.35rem',
      display: 'flex', alignItems: 'center', gap: '0.55rem',
      backdropFilter: 'blur(10px)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
      pointerEvents: 'none', whiteSpace: 'nowrap', zIndex: 1000,
    }}>
      <div style={{ width: '0.42rem', height: '0.42rem', borderRadius: '50%', background: '#C8A96A', flexShrink: 0 }} />
      <span style={{ fontFamily: 'sans-serif', fontSize: '0.58rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#7A6540' }}>
        {message}
      </span>
    </div>
  )
}

export default function FurnitureConfigPage() {
  const navigate = useNavigate()
  const { config, update, reset } = useFurnitureConfig()
  const [isOpen, setIsOpen] = useState(false)
  const [toast, setToast] = useState({ visible: false, message: '' })
  let toastTimer = null

  const showToast = (message) => {
    clearTimeout(toastTimer)
    setToast({ visible: true, message })
    toastTimer = setTimeout(() => setToast(t => ({ ...t, visible: false })), 2800)
  }

  const handleAddToCart = async () => {
    try {
      await api.post('/api/cart/custom', {
        type:     config.type.id,
        material: config.material.id,
        width:    config.width,
        height:   config.height,
        depth:    config.depth,
        shelves:  config.shelves,
        price:    calcPrice(config),  // ← called fresh with latest config
      })
      showToast('Custom order added to cart')
      window.dispatchEvent(new CustomEvent('aroom:counts', { detail: { cart: true } }))
    } catch (err) {
      if (err.response?.status === 401) navigate('/login')
      else showToast('Failed to add — please try again')
    }
  }

  const hasDoors = config.type.id === 'wardrobe' || config.type.id === 'cabinet'

  const handleUpdate = (key, value) => {
    if (key === 'type' && value.id !== 'wardrobe' && value.id !== 'cabinet') {
      setIsOpen(false)
    }
    update(key, value)
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#EDE8DF' }}>

      <ConfigPanel
        config={config}
        update={handleUpdate}
        reset={reset}
        onAddToCart={handleAddToCart}
        isOpen={isOpen}
        onToggleDoor={() => setIsOpen(o => !o)}
        hasDoors={hasDoors}
      />

      <div style={{ flex: 1, position: 'relative' }}>
        <SceneCanvas config={config} isOpen={isOpen} />

        <button
          onClick={() => navigate('/furniture')}
          style={{
            position: 'absolute', top: '1.25rem', left: '1.5rem', zIndex: 10,
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            fontFamily: 'sans-serif', fontSize: '0.55rem', letterSpacing: '0.28em',
            textTransform: 'uppercase', color: '#9A7D4A',
            background: 'rgba(245,240,232,0.82)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(200,169,106,0.3)', borderRadius: '2rem',
            padding: '0.45rem 1rem', cursor: 'pointer', transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(200,169,106,0.6)'; e.currentTarget.style.background = 'rgba(245,240,232,0.96)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(200,169,106,0.3)'; e.currentTarget.style.background = 'rgba(245,240,232,0.82)' }}
        >
          ← Back to catalogue
        </button>

        {hasDoors && (
          <button
            onClick={() => setIsOpen(o => !o)}
            style={{
              position: 'absolute', bottom: '3.5rem', left: '50%', transform: 'translateX(-50%)',
              fontFamily: 'sans-serif', fontSize: '0.52rem', letterSpacing: '0.26em',
              textTransform: 'uppercase', color: '#9A7D4A',
              background: 'rgba(245,240,232,0.88)', backdropFilter: 'blur(8px)',
              border: '1px solid rgba(200,169,106,0.35)', borderRadius: '2rem',
              padding: '0.45rem 1.25rem', cursor: 'pointer', whiteSpace: 'nowrap',
            }}
          >
            {isOpen ? '× Close doors' : '↔ Open doors'}
          </button>
        )}

        <div style={{
          position: 'absolute', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)',
          fontFamily: 'sans-serif', fontSize: '0.5rem', letterSpacing: '0.38em',
          textTransform: 'uppercase', color: 'rgba(154,125,74,0.45)',
          pointerEvents: 'none', whiteSpace: 'nowrap',
        }}>
          Drag to rotate · Scroll to zoom
        </div>
      </div>

      <Toast visible={toast.visible} message={toast.message} />
    </div>
  )
}