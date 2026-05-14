import { MATERIAL_OPTIONS, FURNITURE_TYPES } from '../hooks/useFurnitureConfig'

const TYPE_ICONS = {
  wardrobe: '🚪',
  bookshelf: '📚',
  cabinet: '🗄️',
}

const s = {
  panel: {
    width: '320px',
    minWidth: '300px',
    height: '100vh',
    overflowY: 'auto',
    background: '#F5F0E8',
    borderRight: '1px solid rgba(200,169,106,0.2)',
    display: 'flex',
    flexDirection: 'column',
    padding: '2rem 1.75rem',
    boxSizing: 'border-box',
  },

  header: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: '2rem',
    paddingBottom: '1.25rem',
    borderBottom: '1px solid rgba(200,169,106,0.2)',
  },

  title: {
    fontFamily: "'Cinzel Decorative', serif",
    fontSize: '1.1rem',
    fontWeight: 700,
    color: '#1C1916',
    letterSpacing: '0.04em',
    margin: 0,
  },

  resetBtn: {
    fontFamily: 'sans-serif',
    fontSize: '0.55rem',
    letterSpacing: '0.28em',
    textTransform: 'uppercase',
    color: '#B0A090',
    background: 'transparent',
    border: '1px solid rgba(200,169,106,0.25)',
    borderRadius: '2rem',
    padding: '0.3rem 0.85rem',
    cursor: 'pointer',
  },

  section: {
    marginBottom: '1.75rem',
    paddingBottom: '1.75rem',
    borderBottom: '1px solid rgba(200,169,106,0.12)',
  },

  sectionLabel: {
    fontFamily: 'sans-serif',
    fontSize: '0.55rem',
    letterSpacing: '0.32em',
    textTransform: 'uppercase',
    color: '#9E8E7A',
    margin: '0 0 1rem 0',
  },

  typeRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.4rem',
  },

  sliderRow: {
    marginBottom: '1.1rem',
  },

  sliderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: '0.45rem',
  },

  sliderLabel: {
    fontFamily: 'sans-serif',
    fontSize: '0.58rem',
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: '#7A6B5A',
  },

  sliderValue: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: '0.88rem',
    fontStyle: 'italic',
    color: '#9A7D4A',
  },

  sliderRange: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '0.3rem',
  },

  sliderRangeSpan: {
    fontFamily: 'sans-serif',
    fontSize: '0.5rem',
    color: 'rgba(176,160,144,0.6)',
  },

  swatches: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.45rem',
  },

  summary: {
    background: 'rgba(200,169,106,0.06)',
    border: '1px solid rgba(200,169,106,0.18)',
    borderRadius: '3px',
    padding: '1rem 1.1rem',
    marginBottom: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
  },

  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },

  summaryKey: {
    fontFamily: 'sans-serif',
    fontSize: '0.52rem',
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
    color: '#9E8E7A',
  },

  summaryVal: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: '0.88rem',
    fontStyle: 'italic',
    color: '#5C4A35',
  },

  price: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: '1.35rem',
    fontStyle: 'italic',
    color: '#9A7D4A',
    textAlign: 'center',
    margin: '0.75rem 0',
  },

  ctaBtn: {
    width: '100%',
    padding: '0.85rem',
    fontFamily: 'sans-serif',
    fontSize: '0.6rem',
    letterSpacing: '0.28em',
    textTransform: 'uppercase',
    fontWeight: 600,
    color: '#F5F0E8',
    background: 'linear-gradient(135deg, #C8A96A 0%, #9A7D4A 100%)',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    marginTop: 'auto',
  },
}

const MATERIAL_PRICE = {
  oak: 1.0,
  walnut: 1.4,
  white: 0.8,
  charcoal: 0.9,
  pine: 0.7,
}

function calcPrice(config) {
  const volume = config.width * config.height * config.depth
  const base = 15000
  const factor = MATERIAL_PRICE[config.material.id] ?? 1
  const shelfCost = config.shelves * 800

  return (
    Math.round((base + volume * 40000 + shelfCost) * factor / 100) * 100
  )
}

function DimensionSlider({
  label,
  value,
  min,
  max,
  step = 0.05,
  unit = 'm',
  onChange,
}) {
  return (
    <div style={s.sliderRow}>
      <div style={s.sliderHeader}>
        <span style={s.sliderLabel}>{label}</span>

        <span style={s.sliderValue}>
          {step < 1 ? value.toFixed(2) : value}
          {unit}
        </span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{
          width: '100%',
          accentColor: '#C8A96A',
          cursor: 'pointer',
        }}
      />

      <div style={s.sliderRange}>
        <span style={s.sliderRangeSpan}>
          {min}
          {unit}
        </span>

        <span style={s.sliderRangeSpan}>
          {max}
          {unit}
        </span>
      </div>
    </div>
  )
}

function MaterialPicker({ selected, onChange }) {
  return (
    <div style={s.section}>
      <p style={s.sectionLabel}>Material</p>

      <div style={s.swatches}>
        {MATERIAL_OPTIONS.map((mat) => (
          <button
            key={mat.id}
            onClick={() => onChange(mat)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.55rem 0.85rem',
              border: `1px solid ${
                selected.id === mat.id
                  ? 'rgba(200,169,106,0.6)'
                  : 'rgba(200,169,106,0.18)'
              }`,
              borderRadius: '3px',
              cursor: 'pointer',
              background:
                selected.id === mat.id
                  ? 'rgba(200,169,106,0.08)'
                  : 'transparent',
            }}
          >
            <span
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: mat.color,
                flexShrink: 0,
                border: '1px solid rgba(0,0,0,0.08)',
                display: 'inline-block',
              }}
            />

            <span
              style={{
                fontFamily: 'sans-serif',
                fontSize: '0.58rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: '#7A6B5A',
              }}
            >
              {mat.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

function TypeSelector({ selected, onChange }) {
  return (
    <div style={s.section}>
      <p style={s.sectionLabel}>Type</p>

      <div style={s.typeRow}>
        {FURNITURE_TYPES.map((type) => (
          <button
            key={type.id}
            onClick={() => onChange(type)}
            style={{
              fontFamily: 'sans-serif',
              fontSize: '0.58rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              padding: '0.45rem 1.1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              border: `1px solid ${
                selected.id === type.id
                  ? 'rgba(200,169,106,0.55)'
                  : 'rgba(200,169,106,0.22)'
              }`,
              borderRadius: '2rem',
              cursor: 'pointer',
              background:
                selected.id === type.id
                  ? 'rgba(200,169,106,0.12)'
                  : 'transparent',
              color:
                selected.id === type.id
                  ? '#9A7D4A'
                  : '#B0A090',
            }}
          >
            <span style={{ fontSize: '0.75rem' }}>
              {TYPE_ICONS[type.id] || '□'}
            </span>

            {type.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function DoorToggle({ isOpen, onToggle }) {
  return (
    <div
      style={{
        ...s.section,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <p style={{ ...s.sectionLabel, margin: 0 }}>Doors</p>

      <button
        onClick={onToggle}
        style={{
          fontFamily: 'sans-serif',
          fontSize: '0.55rem',
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          padding: '0.4rem 1.1rem',
          border: `1px solid ${
            isOpen
              ? 'rgba(200,169,106,0.6)'
              : 'rgba(200,169,106,0.25)'
          }`,
          borderRadius: '2rem',
          cursor: 'pointer',
          background: isOpen
            ? 'rgba(200,169,106,0.12)'
            : 'transparent',
          color: isOpen ? '#9A7D4A' : '#B0A090',
          transition: 'all 0.2s ease',
        }}
      >
        {isOpen ? '↔ Open' : '▣ Closed'}
      </button>
    </div>
  )
}

export function ConfigPanel({
  config,
  update,
  reset,
  onAddToCart,
  isOpen,
  onToggleDoor,
  hasDoors,
}) {
  const price = calcPrice(config)

  return (
    <aside style={s.panel}>
      <div style={s.header}>
        <h1 style={s.title}>Configure</h1>

        <button style={s.resetBtn} onClick={reset}>
          Reset
        </button>
      </div>

      <TypeSelector
        selected={config.type}
        onChange={(v) => update('type', v)}
      />

      {hasDoors && (
        <DoorToggle
          isOpen={isOpen}
          onToggle={onToggleDoor}
        />
      )}

      <div style={s.section}>
        <p style={s.sectionLabel}>Dimensions</p>

        <DimensionSlider
          label="Width"
          value={config.width}
          min={0.6}
          max={2.4}
          onChange={(v) => update('width', v)}
        />

        <DimensionSlider
          label="Height"
          value={config.height}
          min={0.8}
          max={2.8}
          onChange={(v) => update('height', v)}
        />

        <DimensionSlider
          label="Depth"
          value={config.depth}
          min={0.3}
          max={0.9}
          onChange={(v) => update('depth', v)}
        />
      </div>

      <div style={s.section}>
        <p style={s.sectionLabel}>Shelves</p>

        <DimensionSlider
          label="Count"
          value={config.shelves}
          min={0}
          max={8}
          step={1}
          unit=""
          onChange={(v) => update('shelves', v)}
        />
      </div>

      <MaterialPicker
        selected={config.material}
        onChange={(v) => update('material', v)}
      />

      <div style={s.summary}>
        <div style={s.summaryRow}>
          <span style={s.summaryKey}>Dimensions</span>

          <span style={s.summaryVal}>
            {config.width.toFixed(2)}W ×{' '}
            {config.height.toFixed(2)}H ×{' '}
            {config.depth.toFixed(2)}D m
          </span>
        </div>

        <div style={s.summaryRow}>
          <span style={s.summaryKey}>Material</span>

          <span style={s.summaryVal}>
            {config.material.label}
          </span>
        </div>

        <div style={s.summaryRow}>
          <span style={s.summaryKey}>Shelves</span>

          <span style={s.summaryVal}>
            {config.shelves}
          </span>
        </div>
      </div>

      <p style={s.price}>
        {price.toLocaleString()} DA
      </p>

      <button
        style={s.ctaBtn}
        onClick={onAddToCart}
      >
        Add Custom Order →
      </button>
    </aside>
  )
}

export default ConfigPanel