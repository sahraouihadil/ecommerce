import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProductViewer from '../component/ProductViewer/ProductViewer';
import products from '../data/products';

// Product detail page — shows 3D viewer and product info
export function ProductPage() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:8000/api/products`)
      .then((res) => res.json())
      .then((data) => {
        const found = data.find((p) => p.id === parseInt(productId));
        if (found) {
          // Merge with local products.js for 3D model data
          const local = products.find((p) => p.id === parseInt(productId));
          setProduct({ ...found, ...local });
        }
      });
  }, [productId]);

  if (!product) return <p>Loading...</p>;

  return (
    <div style={{ padding: '20px' }}>
      <ProductViewer
        modelSrc={product.modelSrc}
        iosSrc={product.iosSrc}
        productName={product.name}
        price={product.price}
        variants={product.variants}
      />
      <p>{product.description}</p>
    </div>
  );
}