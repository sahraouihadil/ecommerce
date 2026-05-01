import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Section, Divider } from '../components/ui';
import api from '../services/api';
import { Search } from '../components/Search';

const steps = [
  { num: '01', title: 'Browse', desc: 'Explore the full furniture catalog — filter by category, style, or room.' },
  { num: '02', title: 'Preview in AR', desc: "Place any piece in your real room using your phone's camera. See exactly how it fits." },
  { num: '03', title: 'Ask Roomie', desc: 'Get AI-powered styling advice, color matching, and layout recommendations.' },
];

const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&display=swap');

  .font-cinzel    { font-family: 'Cinzel Decorative', serif !important; }
  .font-cormorant { font-family: 'Cormorant Garamond', Georgia, serif !important; }
  .font-serif     { font-family: 'Cormorant Garamond', Georgia, serif !important; }
`;

export function HomePage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [email, setEmail] = useState('');
  const [subMsg, setSubMsg] = useState('');
  const [subLoading, setSubLoading] = useState(false);

  useEffect(() => {
    api.get("/api/products").then((res) => {
      setProducts(res.data);
    }).catch((err) => {
      console.error("FAILED:", err);
    });
  }, []);

  const categories = ['all', ...new Set(products.map(p => p.category))];
  const filtered = activeCategory === 'all' ? products : products.filter(p => p.category === activeCategory);

  const handleSubscribe = async () => {
    if (!email || !email.includes('@')) {
      setSubMsg('Please enter a valid email.');
      setTimeout(() => setSubMsg(''), 3000);
      return;
    }
    setSubLoading(true);
    try {
      await api.post('/api/newsletter', { email });
    } catch (err) { }
    finally {
      setSubMsg("You're in! Welcome to the family 🤍");
      setEmail('');
      setSubLoading(false);
      setTimeout(() => setSubMsg(''), 4000);
    }
  };

  if (!products || products.length === 0) {
    return (
      <>
        <style>{FONTS}</style>
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
          <div className="animate-pulse">
            <div className="w-24 h-24 rounded-full bg-gray-200 mb-6"></div>
          </div>
          <h2 className="font-cinzel text-xl font-semibold text-charcoal mb-2">
            Loading furniture...
          </h2>
          <p className="font-cormorant italic text-muted text-lg max-w-xs">
            We're bringing beautiful pieces to your space ✨
          </p>
        </div>
      </>
    );
  }

  const featuredProduct = products[0] || null;
  if (!featuredProduct) return null;

  return (
    <div className="bg-cream text-charcoal min-h-screen">
      <style>{FONTS}</style>

      {/* ── HERO ── */}
      <section className="min-h-[90vh] flex items-center overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full py-20 md:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            <div className="order-1">
              <p className="font-cormorant italic text-muted text-lg font-light uppercase tracking-[0.2em] mb-8">
                AR-Powered Furniture Shopping
              </p>
              <h1 className="font-cinzel text-[clamp(3rem,6vw,5.5rem)] font-bold leading-[0.95] tracking-tight mb-8">
                Seeing is
                <br />
                Believing
              </h1>
              <p className="font-cormorant italic text-muted text-xl font-light max-w-md mb-12 leading-relaxed">
                Preview any piece of furniture in your actual room with AR before you buy. Plus AI styling help from Roomie.
              </p>
              <Button as="a" href="#shop" variant="black" size="lg">
                Start Shopping
              </Button>
            </div>

            <div className="order-2 relative flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[480px]">
                <div className="rounded-3xl overflow-hidden aspect-[3/4] bg-surface shadow-[0_8px_40px_rgba(26,26,26,0.06)]">
                  <img
                    src={
                      featuredProduct.image_url?.startsWith("http")
                        ? featuredProduct.image_url
                        : `http://127.0.0.1:8000/${featuredProduct.image_url}`
                    }
                    alt={featuredProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {featuredProduct.badge && (
                  <span className="font-cormorant absolute top-6 right-6 bg-white text-charcoal text-sm uppercase tracking-[0.1em] font-semibold px-4 py-2 rounded-full shadow-sm">
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
        <h2 className="font-cinzel text-[clamp(2.5rem,5vw,3.5rem)] font-bold leading-[0.95] tracking-tight mb-8">
          Shop Furniture
        </h2>

        {/* ── SEARCH BAR ── */}
        <div style={{
          background: "#EDE7D9",
          border: "1px solid rgba(200,169,106,0.22)",
          borderRadius: "20px",
          padding: "2rem 2.5rem",
          marginBottom: "2.5rem",
        }}>
          <Search />
        </div>

        {/* ── CATEGORY FILTERS ── */}
        <div className="flex flex-wrap gap-3 mb-16">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={activeCategory === cat ? 'black' : 'blush'}
              size="sm"
              onClick={() => setActiveCategory(cat)}
            >
              <span className="font-cormorant font-semibold tracking-widest uppercase text-sm">
                {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </span>
            </Button>
          ))}
        </div>

        {/* ── PRODUCTS GRID ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {filtered.map((product) => (
            <div
              key={product.id}
              className="group relative cursor-pointer flex flex-col items-center text-center bg-white rounded-3xl pt-10 pb-8 px-6 shadow-[0_4px_24px_rgba(26,26,26,0.04)] hover:shadow-[0_8px_32px_rgba(26,26,26,0.08)] transition-shadow duration-300"
              onClick={() => navigate(`/product/${product.id}`)}
            >
              {product.badge && (
                <span className="font-cormorant absolute top-4 right-4 z-10 bg-charcoal text-cream text-xs uppercase tracking-[0.1em] font-semibold px-3 py-1 rounded-full shadow-sm">
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
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="font-cormorant absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 bg-charcoal text-cream text-base font-semibold tracking-wide px-5 py-2 rounded-full shadow-md whitespace-nowrap">
                  {product.price.toLocaleString()} DA
                </span>
              </div>

              <h3 className="font-cormorant text-xl font-semibold mt-8 mb-1 group-hover:text-rose transition-colors duration-300">
                {product.name}
              </h3>
              <p className="font-cormorant italic text-muted text-base leading-relaxed max-w-[220px]">
                {product.description}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Divider className="max-w-7xl mx-auto" />

      {/* ── HOW IT WORKS ── */}
      <Section size="lg">
        <h2 className="font-cinzel text-[2.5rem] font-bold tracking-tight text-center mb-24">
          How It Works
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-12 max-w-4xl mx-auto">
          {steps.map((step) => (
            <Card key={step.num} variant="surface" className="text-center">
              <p className="font-cinzel text-5xl font-bold text-blush mb-6">
                {step.num}
              </p>
              <h3 className="font-cormorant text-2xl font-semibold mb-3">
                {step.title}
              </h3>
              <p className="font-cormorant italic text-muted text-lg leading-relaxed">
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
          <p className="font-cormorant text-[clamp(1.5rem,3vw,2.5rem)] font-light leading-[1.6] italic text-charcoal/80">
            "Try it in your room before you commit.
            That's the ARoom difference."
          </p>
        </blockquote>
      </Section>

      {/* ── NEWSLETTER ── */}
      <section className="bg-charcoal w-full">
        <div className="max-w-xl mx-auto px-6 py-20 md:py-28 text-center">
          <h2 className="font-cinzel text-cream text-[2.5rem] font-bold tracking-tight mb-4">
            Stay in touch
          </h2>
          <p className="font-cormorant italic text-cream/50 text-xl mb-12">
            New arrivals, AR features, and exclusive drops — straight to your inbox.
          </p>

          <div className="flex max-w-md mx-auto">
            <input
              className="flex-1 bg-transparent border-b border-cream/20 px-0 py-4 text-cream
                placeholder:text-cream/25 focus:border-rose focus:ring-0 outline-none transition-colors duration-300
                font-cormorant italic text-lg"
              placeholder="your@email.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
            />
            <Button
              variant="outline"
              size="sm"
              className="ml-6 border-cream/40 text-cream/80 hover:bg-cream hover:text-charcoal hover:border-cream flex-shrink-0"
              onClick={handleSubscribe}
              disabled={subLoading}
            >
              <span className="font-cormorant font-semibold tracking-widest uppercase">
                {subLoading ? 'Sending...' : 'Subscribe'}
              </span>
            </Button>
          </div>

          {subMsg && (
            <p className="font-cormorant italic mt-6 text-lg text-cream/70 tracking-wide">{subMsg}</p>
          )}

          <p className="font-cinzel mt-16 text-[0.55rem] tracking-[0.5em] uppercase text-cream/20">
            Aroom is your sanctuary.
          </p>
        </div>
      </section>

    </div>
  );
}
//comment to fix the pushing prblm
export default HomePage;