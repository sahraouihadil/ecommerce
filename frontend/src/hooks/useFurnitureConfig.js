import { useState, useCallback } from 'react'

export const MATERIAL_OPTIONS = [
  { id: 'oak',      label: 'Oak',       color: '#c8a96e', roughness: 0.8 },
  { id: 'walnut',   label: 'Walnut',    color: '#5c3d2e', roughness: 0.75 },
  { id: 'white',    label: 'White',     color: '#f0ece4', roughness: 0.9 },
  { id: 'charcoal', label: 'Charcoal',  color: '#2d2926', roughness: 0.85 },
  { id: 'pine',     label: 'Pine',      color: '#e8c99a', roughness: 0.7 },
]

export const FURNITURE_TYPES = [
  { id: 'wardrobe',  label: 'Wardrobe'  },
  { id: 'bookshelf', label: 'Bookshelf' },
  { id: 'cabinet',   label: 'Cabinet'   },
]

const DEFAULTS = {
  width:    1.2,
  height:   2.0,
  depth:    0.55,
  shelves:  3,
  material: MATERIAL_OPTIONS[0],
  type:     FURNITURE_TYPES[0],
}

export function useFurnitureConfig() {
  const [config, setConfig] = useState(DEFAULTS)

  const update = useCallback((key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }, [])

  const reset = useCallback(() => setConfig(DEFAULTS), [])

  return { config, update, reset }
}