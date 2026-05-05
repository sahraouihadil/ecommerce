import React, { useState, useRef, useEffect } from 'react';
import './ProductViewer.css';

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return [r, g, b, 1];
}

function applyColor(viewer, hex) {
  if (!viewer || !viewer.model) return;
  const material = viewer.model.materials[0];
  if (material) {
    material.pbrMetallicRoughness.setBaseColorFactor(hexToRgb(hex));
  }
}

function ProductViewer({ modelSrc, model3d, iosSrc, productName, price, variants }) {
  const [activeVariant, setActiveVariant] = useState(0);
  const viewerRef = useRef(null);

  const currentSrc =  model3d ? model3d : modelSrc;

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    function handleLoad() {
      if (variants && variants.length > 0) {
        applyColor(viewer, variants[0].color);
      }
    }

    viewer.addEventListener('load', handleLoad);
    return () => viewer.removeEventListener('load', handleLoad);
  }, [variants, currentSrc]);

  function handleVariantClick(index, color) {
    setActiveVariant(index);
    applyColor(viewerRef.current, color);
  }

  return (
    <div className="product-viewer">

      <model-viewer
        ref={viewerRef}
        src={currentSrc}
        ios-src={iosSrc || undefined}
        ar
        ar-modes="webxr scene-viewer quick-look"
        ar-scale="fixed"
        camera-controls
        auto-rotate
        shadow-intensity="1"
        shadow-softness="1"
        alt={productName}
        style={{ width: '100%', height: '400px' }}
      ></model-viewer>

      <div className="product-info">
        <h2>{productName}</h2>
        <p>{price}DA</p>
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