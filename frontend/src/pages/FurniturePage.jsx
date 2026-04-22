import { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import { Section, Button, Divider } from '../components/ui';
import api from '../services/api';

const CATEGORIES = ["All", "Chairs", "Tables", "Lamps", "Sofas"];

export function FurniturePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");

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

  const filtered = activeCategory === "All"
    ? products
    : products.filter(p => p.category?.toLowerCase() === activeCategory.toLowerCase());

  if (loading)
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-rose border-t-transparent rounded-full animate-spin" />
          <p className="text-muted text-sm">Loading collection...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-muted text-sm">{error}</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-cream">
      {/* Page header */}
      <Section size="sm" className="pt-36 pb-8">
        <p className="text-[0.8125rem] uppercase tracking-[0.2em] font-semibold text-muted mb-4">
          Shop
        </p>
        <h1 className="font-serif text-5xl md:text-7xl font-bold text-charcoal tracking-tight mb-5">
          Shop Furniture
        </h1>
        <p className="text-muted text-lg max-w-xl leading-relaxed">
          Browse the full catalog. Every piece can be previewed in your room with AR before you buy.
        </p>
      </Section>

      {/* Divider between header and grid */}
      <Section size="sm" className="py-0">
        <Divider variant="diamond" />
      </Section>

      {/* Category filter pills */}
      <Section size="sm" className="pt-10 pb-4">
        <div className="flex flex-wrap items-center gap-3">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat}
              variant={activeCategory === cat ? 'blush' : 'outline'}
              size="sm"
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </Button>
          ))}
          <span className="ml-auto text-muted text-sm hidden md:block">
            {filtered.length} piece{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      </Section>

      {/* Product grid */}
      <Section size="lg" className="pt-8">
        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-muted text-sm">No pieces found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
