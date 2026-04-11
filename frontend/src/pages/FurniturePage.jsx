import { useEffect, useState } from 'react';
import ProductCard from '../component/ProductCard';

export function FurniturePage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8000/api/products')
      .then((res) => res.json())
      .then((data) => {
        const mapped = data.map((p) => ({
          ...p,
          image: p.image_url,
        }));
        setProducts(mapped);
      });
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Furniture</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        {products.length === 0 ? (
          <p>No products found.</p>
        ) : (
          products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))
        )}
      </div>
    </div>
  );
}