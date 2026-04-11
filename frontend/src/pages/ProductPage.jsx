import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductViewer from '../component/ProductViewer/ProductViewer';
import products from '../data/products';

// Product detail page — shows 3D viewer and full product info
export function ProductPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const product = products.find((p) => p.id === parseInt(productId));

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
          <button className="add-to-cart-btn">Add to Cart</button>
        </div>
      </div>
    </div>
  );
}