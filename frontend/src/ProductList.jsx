import { useEffect, useState } from 'react';

function ProductList() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8000/api/products')
      .then((res) => res.json())
      .then((data) => setProducts(data));
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