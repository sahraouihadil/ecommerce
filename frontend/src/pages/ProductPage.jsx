/**
 * ProductPage.jsx - Individual Product Detail Page
 * ===================================================
 * Shows a single product with:
 *   - 3D model viewer (with AR support via ProductViewer component)
 *   - Color variant selector
 *   - Product details (name, price, category, description)
 *   - "Add to Cart" and "Add to Favorites" buttons
 *
 * ROUTE: /product/:productId  (e.g. /product/3)
 * The productId comes from the URL and is used to find the product in the local data.
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductViewer from '../components/ProductViewer/ProductViewer';
import products from '../data/products';
import api from '../services/api';

export function ProductPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [cartMsg, setCartMsg] = useState("");
  const [favMsg, setFavMsg] = useState("");
  const product = products.find((p) => p.id === parseInt(productId));

  const handleAddToCart = async () => {
    try {
      await api.post("/api/cart", null, { params: { product_id: product.id, quantity: 1 } });
      setCartMsg("Added to cart!");
      setTimeout(() => setCartMsg(""), 2000);
    } catch (err) {
      if (err.response?.status === 401) navigate("/login");
      else setCartMsg("Failed to add");
    }
  };

  const handleAddToFavorites = async () => {
    try {
      await api.post("/api/favorites", null, { params: { product_id: product.id } });
      setFavMsg("Added to favorites!");
      setTimeout(() => setFavMsg(""), 2000);
    } catch (err) {
      if (err.response?.status === 401) navigate("/login");
      else setFavMsg("Failed to add");
    }
  };

  if (!product) return <p>Product not found.</p>;

  return (
    <div className="product-page">
      <button className="back-btn" onClick={() => navigate('/')}>
        ← Back to Collection
      </button>
      <div className="product-page-layout">
        <div className="product-page-viewer">
          <ProductViewer
            modelSrc={product.modelSrc}
            iosSrc={product.iosSrc}
            productName={product.name}
            price={product.price}
            variants={product.variants}
          />
        </div>
        <div className="product-page-details">
          <span className="detail-category">{product.category}</span>
          <h1 className="detail-name">{product.name}</h1>
          <p className="detail-price">${product.price}</p>
          <p className="detail-desc">{product.description}</p>
          <div className="detail-features">
            <div className="feature">
              <span className="feature-icon">📐</span>
              <div><strong>AR Preview</strong><p>See it in your room before buying</p></div>
            </div>
            <div className="feature">
              <span className="feature-icon">🎨</span>
              <div><strong>Custom Colors</strong><p>{product.variants.length} color options available</p></div>
            </div>
            <div className="feature">
              <span className="feature-icon">🚚</span>
              <div><strong>Free Delivery</strong><p>Arrives in 5-7 business days</p></div>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button className="add-to-cart-btn" onClick={handleAddToCart}>Add to Cart</button>
            <button className="add-to-cart-btn" onClick={handleAddToFavorites} style={{background: '#e53e3e'}}>♥ Favorite</button>
          </div>
          {cartMsg && <p className="text-green-600 mt-2">{cartMsg}</p>}
          {favMsg && <p className="text-red-500 mt-2">{favMsg}</p>}
        </div>
      </div>
    </div>
  );
}