/**
 * ProductViewer.jsx - 3D Product Viewer with AR Support
 * ========================================================
 * Displays a 3D model of a furniture product using Google's <model-viewer> web component.
 * Users can rotate, zoom, and view the product in augmented reality on their phone.
 *
 * KEY FEATURES:
 *   - 3D preview: rotate and zoom the model with mouse/touch
 *   - AR mode: "View in AR" places the furniture in the user's real room
 *     using WebXR, Scene Viewer (Android), or Quick Look (iOS)
 *   - Color variants: click color swatches to change the model's material color
 *   - Auto-rotate: model slowly spins to show all angles
 *   - Shadows: realistic shadow beneath the model
 *
 * HOW AR WORKS:
 *   The <model-viewer> tag is a web component by Google.
 *   Adding the "ar" attribute enables the AR button automatically.
 *   ar-modes="webxr scene-viewer quick-look" tries each AR method in order:
 *     1. WebXR      - Browser-native AR (Chrome on Android)
 *     2. Scene Viewer - Google's AR viewer app (Android fallback)
 *     3. Quick Look   - Apple's AR viewer (iOS Safari)
 *
 * PROPS:
 *   modelSrc    - Path to the .glb 3D model file (e.g. "/models/sofa.glb")
 *   iosSrc      - Path to .usdz file for iOS AR (optional)
 *   productName - Product name shown below the viewer
 *   price       - Product price shown below the viewer
 *   variants    - Array of color options: [{ name: "Oak", color: "#8B6F47" }, ...]
 *
 * USED IN: ProductPage.jsx
 *
 * DEPENDENCIES:
 *   Requires <script type="module" src="https://unpkg.com/@google/model-viewer">
 *   in index.html for <model-viewer> to work.
 */

import React, { useState, useRef } from 'react';
import './ProductViewer.css';

// Convert hex color string to [r, g, b, 1] array with values 0-1
// This format is required by model-viewer's PBR material API
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return [r, g, b, 1];
}

// Main component: renders the 3D viewer + product info + color swatches
function ProductViewer({ modelSrc, iosSrc, productName, price, variants }) {
  const [activeVariant, setActiveVariant] = useState(0);  // Which color swatch is selected
  const viewerRef = useRef(null);  // Reference to the <model-viewer> DOM element

  // Change the 3D model's color when a swatch is clicked
  // Uses model-viewer's material API to update the base color in real-time
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
      {/* Google's <model-viewer> web component — renders the 3D model
          Key attributes:
          - ar: enables the "View in AR" button
          - ar-modes: which AR technologies to try (in order)
          - ar-scale="fixed": keeps the model at real-world size in AR
          - camera-controls: allows rotate/zoom with mouse/touch
          - auto-rotate: slowly spins the model
          - shadow-*: adds a realistic shadow on the ground plane */}
      <model-viewer
        ref={viewerRef}
        src={modelSrc}
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
        <p className="price">${price}</p>
      </div>

      {/* Color swatches — only shown if the product has multiple variants */}
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
