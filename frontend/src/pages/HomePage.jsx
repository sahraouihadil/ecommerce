import React, { useState,useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Section, Divider } from '../components/ui';
import api from '../services/api';

const steps = [
  { num: '01', title: 'Browse', desc: 'Explore the full furniture catalog — filter by category, style, or room.' },
  { num: '02', title: 'Preview in AR', desc: "Place any piece in your real room using your phone's camera. See exactly how it fits." },
  { num: '03', title: 'Ask Roomie', desc: 'Get AI-powered styling advice, color matching, and layout recommendations.' },
];

export function HomePage() {

    const [activeCategory, setActiveCategory] = useState('all');
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    console.log("useEffect running");
    api.get("/api/products").then((res) => {
      setProducts(res.data);
      console.log(res.data);
    }).catch((err) => {
      console.error("FAILED:", err);
    });
  }, []);

  const categories = ['all', ...new Set(products.map(p => p.category))];
  const filtered = activeCategory === 'all' ? products : products.filter(p => p.category === activeCategory);

if (!products || products.length === 0) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
      <div className="animate-pulse">
        <div className="w-24 h-24 rounded-full bg-gray-200 mb-6"></div>
      </div>

      <h2 className="text-xl font-semibold text-charcoal mb-2">
        Loading furniture...
      </h2>

      <p className="text-muted text-sm max-w-xs">
        We're bringing beautiful pieces to your space ✨
      </p>
    </div>
  );
}

  const featuredProduct = products[0] || null;
  console.log(products)

  // ↓ THIS is the fix — don't render until data is ready
  if (!featuredProduct) return null;

  return (
    <div className="bg-cream text-charcoal min-h-screen">

      {/* ── HERO ── */}
      <section className="min-h-[90vh] flex items-center overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full py-20 md:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Left — copy */}
            <div className="order-2 lg:order-1">
              <p className="text-muted text-[0.8125rem] uppercase tracking-[0.2em] font-semibold mb-8">
                AR-Powered Furniture Shopping
              </p>
              <h1 className="font-serif text-[clamp(3rem,6vw,5.5rem)] font-bold leading-[0.95] tracking-tight mb-8">
                See It in
                <br />
                Your Space
              </h1>
              <p className="text-muted text-lg font-light max-w-md mb-12 leading-relaxed">
                Preview any piece of furniture in your actual room with AR before you buy. Plus AI styling help from Roomie.
              </p>
              <Button
                as="a"
                href="#shop"
                variant="black"
                size="lg"
              >
                Start Shopping
              </Button>
            </div>

            {/* Right — featured image */}
            <div className="order-1 lg:order-2 relative flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[480px]">
                <div className="rounded-3xl overflow-hidden aspect-[3/4] bg-surface shadow-[0_8px_40px_rgba(26,26,26,0.06)]">
                  <img
                     src={
                         featuredProduct.image_url?.startsWith("http")
                         ? featuredProduct.image_url
                         : `http://127.0.0.1:8000/${featuredProduct.image_url}`
                           }
                           alt={featuredProduct.name}
                          />
                </div>
                {featuredProduct.badge && (
                  <span className="absolute top-6 right-6 bg-white text-charcoal text-[0.6875rem] uppercase tracking-[0.1em] font-semibold px-4 py-2 rounded-full shadow-sm">
                    {featuredProduct.badge}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Divider variant="diamond" className="max-w-7xl mx-auto px-6" />

      {/* ── SHOP FURNITURE ── */}
      <Section size="lg" id="shop">
        <h2 className="font-serif text-[2.5rem] font-bold tracking-tight mb-16">
          Shop Furniture
        </h2>

        {/* Filter - pill buttons */}
        <div className="flex flex-wrap gap-3 mb-16">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={activeCategory === cat ? 'black' : 'blush'}
              size="sm"
              onClick={() => setActiveCategory(cat)}
            >
              {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Button>
          ))}
        </div>

        {/* Product grid — circular image cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {filtered.map((product) => (
            <div
              key={product.id}
              className="group relative cursor-pointer flex flex-col items-center text-center bg-white rounded-3xl pt-10 pb-8 px-6 shadow-[0_4px_24px_rgba(26,26,26,0.04)] hover:shadow-[0_8px_32px_rgba(26,26,26,0.08)] transition-shadow duration-300"
              onClick={() => navigate(`/product/${product.id}`)}
            >
              {product.badge && (
                <span className="absolute top-4 right-4 z-10 bg-charcoal text-cream text-[0.625rem] uppercase tracking-[0.1em] font-semibold px-3 py-1 rounded-full shadow-sm">
                  {product.badge}
                </span>
              )}

              <div className="relative mb-8">
                <div className="w-[220px] h-[220px] md:w-[260px] md:h-[260px] rounded-full overflow-hidden bg-surface shadow-[0_4px_24px_rgba(26,26,26,0.05)] transition-transform duration-500 ease-out group-hover:scale-[1.03]">
                 <img
                  src={
                      product.image_url?.startsWith("http")
                       ? product.image_url
                       : `http://127.0.0.1:8000/${product.image_url}`
                          }
                       alt={product.name}
                       />
                </div>
                <span className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 bg-charcoal text-cream text-[0.75rem] font-semibold tracking-wide px-5 py-2 rounded-full shadow-md whitespace-nowrap">
                  ${product.price.toLocaleString()}
                </span>
              </div>

              <h3 className="font-serif text-lg font-semibold mt-8 mb-1 group-hover:text-rose transition-colors duration-300">
                {product.name}
              </h3>
              <p className="text-muted text-sm leading-relaxed max-w-[220px]">
                {product.description}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Divider className="max-w-7xl mx-auto" />

      {/* ── HOW IT WORKS ── */}
      <Section size="lg">
        <h2 className="font-serif text-[2.5rem] font-bold tracking-tight text-center mb-24">
          How It Works
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-12 max-w-4xl mx-auto">
          {steps.map((step) => (
            <Card key={step.num} variant="surface" className="text-center">
              <p className="font-serif text-5xl font-bold text-blush mb-6">
                {step.num}
              </p>
              <h3 className="font-serif text-xl font-semibold mb-3">
                {step.title}
              </h3>
              <p className="text-muted text-sm leading-relaxed">
                {step.desc}
              </p>
            </Card>
          ))}
        </div>
      </Section>

      <Divider variant="diamond" className="max-w-3xl mx-auto" />

      {/* ── QUOTE ── */}
      <Section size="md" maxWidth="3xl">
        <blockquote className="text-center">
          <p className="font-serif text-[clamp(1.5rem,3vw,2.5rem)] font-bold tracking-tight leading-[1.4] italic text-charcoal/80">
            Try it in your room before you commit.
            That's the ARoom difference.
          </p>
        </blockquote>
      </Section>

      {/* ── NEWSLETTER ── */}
      <section className="bg-charcoal w-full">
        <div className="max-w-xl mx-auto px-6 py-20 md:py-28 text-center">
          <h2 className="font-serif text-cream text-[2.5rem] font-bold tracking-tight mb-4">
            Stay in touch
          </h2>
          <p className="text-cream/50 text-sm mb-12">
            New arrivals, AR features, and exclusive drops — straight to your inbox.
          </p>

          <div className="flex max-w-md mx-auto">
            <input
              className="flex-1 bg-transparent border-b border-cream/20 px-0 py-4 text-cream text-sm
                placeholder:text-cream/25 focus:border-rose focus:ring-0 outline-none transition-colors duration-300"
              placeholder="your@email.com"
              type="email"
            />
            <Button variant="outline" size="sm" className="ml-6 border-cream/40 text-cream/80 hover:bg-cream hover:text-charcoal hover:border-cream flex-shrink-0">
              Subscribe
            </Button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-cream">
        <Divider className="max-w-7xl mx-auto" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-16">
            <div>
              <h3 className="font-serif text-2xl font-bold mb-4 text-charcoal">
                ARoom
              </h3>
              <p className="text-muted text-sm leading-[1.8] max-w-xs">
                AR-powered furniture shopping. Preview any piece in your real room
                before you buy, with AI styling help from Roomie.
              </p>
            </div>

            <div>
              <p className="text-[0.8125rem] font-semibold uppercase tracking-[0.1em] text-charcoal mb-5">Navigate</p>
              <div className="flex flex-col gap-3">
                {[
                  { label: 'Shop', href: '/furniture' },
                  { label: 'How It Works', href: '/aboutus' },
                  { label: 'Contact', href: '/contactus' },
                ].map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-sm text-muted font-light hover:text-charcoal transition-colors duration-300 w-fit"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[0.8125rem] font-semibold uppercase tracking-[0.1em] text-charcoal mb-5">Contact</p>
              <div className="flex flex-col gap-3 text-sm text-muted font-light">
                <span>hello@aroom.com</span>
                <span>+1 (555) 123-4567</span>
                <span>Mon - Fri, 9am - 6pm</span>
              </div>
            </div>
          </div>

          <Divider className="mb-8" />
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-muted/50 text-sm font-light">
              &copy; 2024 ARoom
            </p>
            <div className="flex gap-6">
              {['Privacy', 'Terms'].map((link) => (
                <a
                  key={link}
                  href="#"
                  className="text-muted/40 text-sm font-light hover:text-charcoal transition-colors duration-300"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
    
  );
}

export default HomePage;
