import { useEffect, useState } from 'react';

function ProductList() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8000/api/products')
      .then((res) => res.json())
      .then((data) => setProducts(data));
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>ARoom Luxury Furniture</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        {products.map((p) => (
          <div key={p.id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
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