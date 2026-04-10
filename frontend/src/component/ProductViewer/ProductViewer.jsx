import React, { useState, useRef } from 'react';
import './ProductViewer.css';

// Convert hex color to [r, g, b, 1] array (values 0-1)
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return [r, g, b, 1];
}

// 3D product viewer with AR support and color variants
function ProductViewer({ modelSrc, iosSrc, productName, price, variants }) {
  const [activeVariant, setActiveVariant] = useState(0);
  const viewerRef = useRef(null);

  // Change the model material color when a swatch is clicked
  function handleVariantClick(index, color) {
    setActiveVariant(index);
    const viewer = viewerRef.current;
    if (viewer && viewer.model) {
      const material = viewer.model.materials[0];
      if (material) {
        material.pbrMetallicRoughness.setBaseColorFactor(hexToRgb(color));
      }
    }
  }

  return (
    <div className="product-viewer">
      <model-viewer
        ref={viewerRef}
        src={modelSrc}
        ios-src={iosSrc || undefined}
        ar
        ar-modes="webxr scene-viewer quick-look"
        camera-controls
        auto-rotate
        shadow-intensity="1"
        shadow-softness="1"
        alt={productName}
        style={{ width: '100%', height: '400px' }}
      ></model-viewer>

      <div className="product-info">
        <h2>{productName}</h2>
        <p className="price">${price}</p>
      </div>

      {variants && variants.length > 0 && (
        <div className="variants">
          <span className="variant-label">Colors:</span>
          {variants.map((v, i) => (
            <div
              key={i}
              className={`swatch ${i === activeVariant ? 'active' : ''}`}
              style={{ backgroundColor: v.color }}
              title={v.name}
              onClick={() => handleVariantClick(i, v.color)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductViewer;
