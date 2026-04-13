/**
 * ProductList.jsx - Simple Product List Component
 * =================================================
 * Fetches all products from the backend API and displays them in a basic list.
 * This is a minimal component used for testing — the main store uses
 * FurniturePage.jsx with ProductCard.jsx for a richer UI.
 */

import { useEffect, useState } from 'react';
import api from './services/api';

function ProductList() {
  // products: array of product objects fetched from the API
  const [products, setProducts] = useState([]);

  // Fetch products once when the component first renders
  useEffect(() => {
    api.get('/api/products')
      .then((res) => setProducts(res.data))
      .catch((err) => console.error('Failed to load products:', err));
  }, []);

  return (
    <div>
      <h1>ARoom Luxury Furniture</h1>
      <div>
        {products.map((p) => (
          <div key={p.id}>
            <h3>{p.name}</h3>
            <p>{p.description}</p>
            <p><strong>${p.price}</strong></p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductList;