/**
 * HomePage.jsx - Main Landing Page
 * ===================================
 * The first page users see when they visit the site.
 *
 * SECTIONS:
 *   1. Hero       - Big banner with 3D sofa preview and "Explore Collection" CTA
 *   2. Collection - Category filter + product grid (from local data/products.js)
 *   3. How It Works - 3-step explanation: Browse -> AR Preview -> Ask Roomie
 *   4. Footer     - Simple branding footer
 *
 * Products shown here come from a LOCAL file (data/products.js), not the API.
 * The FurniturePage fetches from the backend API instead.
 */

import React, { useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from '../components/Search';
import products from '../data/products';
import './Home.css';

// Category icons displayed next to filter buttons
const categoryIcons = {
  seating: '🛋️',
  lighting: '💡',
  tables: '🍄',
};

// Homepage — hero section, category filter, and product grid
export function HomePage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const navigate = useNavigate();

  const categories = ['all', ...new Set(products.map((p) => p.category))];
  const filtered = activeCategory === 'all'
    ? products
    : products.filter((p) => p.category === activeCategory);

  return (
    <div className="app">
      <section className="hero">
        <div className="hero-content">
          <span className="hero-tag">AR-Powered Shopping</span>
          <h1 className="hero-title">Weird. Wonderful.<br />Furniture.</h1>
          <p className="hero-subtitle">
            Furniture that sparks conversation. See every piece in your space with augmented reality before you buy.
          </p>
          <div className="hero-actions">
            <a href="#collection" className="hero-btn primary">Explore Collection</a>
            <span className="hero-hint">or ask Roomie for help →</span>
          </div>
          <div className="hero-stats">
            <div className="stat"><strong>{products.length}</strong><span>Unique Pieces</span></div>
            <div className="stat"><strong>AR</strong><span>Try in Your Room</span></div>
            <div className="stat"><strong>AI</strong><span>Smart Assistant</span></div>
          </div>
        </div>
        <div className="hero-visual">
          <model-viewer
            src="/models/sofa.glb"
            auto-rotate
            camera-controls
            shadow-intensity="0.8"
            shadow-softness="1"
            interaction-prompt="none"
            alt="3D furniture preview"
            style={{ width: '100%', height: '400px', background: 'transparent' }}
          ></model-viewer>
        </div>
      </section>

      <section className="collection" id="collection">
        <div className="collection-header">
          <h2 className="section-title">Our Collection</h2>
          <p className="section-subtitle">Each piece is designed to be delightfully unexpected</p>
        </div>
        <Search />
        <div className="category-filter">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
        <div className="product-grid">
          {filtered.map((product) => (
            <div
              key={product.id}
              className="product-card"
              onClick={() => navigate(`/product/${product.id}`)}
            >
              {product.badge && <span className="card-badge">{product.badge}</span>}
              <div className="card-preview">
                <span className="card-icon">{categoryIcons[product.category] || '🪑'}</span>
              </div>
              <div className="card-body">
                <span className="card-category">{product.category}</span>
                <h3>{product.name}</h3>
                <p className="card-desc">{product.description}</p>
                <div className="card-footer">
                  <p className="card-price">${product.price}</p>
                  <div className="card-swatches">
                    {product.variants.slice(0, 3).map((v, i) => (
                      <span key={i} className="mini-swatch" style={{ backgroundColor: v.color }} title={v.name} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="card-hover-label">View in 3D</div>
            </div>
          ))}
        </div>
      </section>

      <section className="features-section">
        <h2 className="section-title">How It Works</h2>
        <div className="how-it-works">
          <div className="step"><div className="step-num">1</div><h3>Browse</h3><p>Explore our collection of weird and wonderful furniture pieces</p></div>
          <div className="step-arrow">→</div>
          <div className="step"><div className="step-num">2</div><h3>Preview in AR</h3><p>Place any piece in your room using your phone's camera</p></div>
          <div className="step-arrow">→</div>
          <div className="step"><div className="step-num">3</div><h3>Ask Roomie</h3><p>Chat with our AI assistant for styling tips and recommendations</p></div>
        </div>
      </section>

      <footer className="app-footer">
        <p>ARoomX — Weird Wonderful Furniture, Seen in Your Space</p>
      </footer>
    </div>
  );
}