/**
 * FurniturePage.jsx - Product Catalog Page
 * ===========================================
 * Displays all products from the database in a responsive grid.
 * Unlike HomePage (which uses local data), this page fetches
 * REAL products from the backend API.
 *
 * API: GET /api/products
 * Each product is rendered using the ProductCard component.
 */

import { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import api from '../services/api';

export function FurniturePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get("/api/products");

        console.log("PRODUCTS:", response.data); 

        setProducts(response.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div className="text-center mt-10">Loading products...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Furniture Collection</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.length === 0 ? (
          <p className="text-gray-500">No products found.</p>
        ) : (
          products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))
        )}
      </div>
    </div>
  );
}
