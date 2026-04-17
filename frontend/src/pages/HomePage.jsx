import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Section, Divider } from '../components/ui';

const products = [
  {
    id: 1,
    name: 'The Cloud Lounger',
    category: 'seating',
    description: 'Floating comfort for the bold dreamer.',
    price: 1850,
    badge: 'New Arrival',
    featured: true,
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBVfrvbRRQIUNPpLjfF8-420RxORkmtRI22XCeDt_SN-l0OjcoJBTJSu-XCF83LaVvq4aeVQQjk-c4JIX8LL8K819-cnBWRf8U90Th9i_8YGCrSYGJ3nIM7Ll5VPI3z2pdmT0fMpDwxo9GO7HIiiva9umMzSeg1pC2nd4SIckUdB0xtbFGTdHFRYAJVquq1qiXggY71bQcfjrJTBOkVjH1waJdV_1MMc4zC2Woi5WvgIyW603ZX-326-3AXdCBEv-6V0oiQdvkpsnQ',
    variants: [{ color: '#e8e8ea' }, { color: '#f7f0ff' }, { color: '#d3d4d7' }],
  },
  {
    id: 2,
    name: 'Jellyfish Glow Lamp',
    category: 'lighting',
    description: 'Soft, ambient, and slightly weird.',
    price: 290,
    badge: null,
    featured: false,
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwvePOCZ8H454R4zKa7exI7F-NgMxyuiPnSeX4m0IqQgJwkZmqxrCLYS2QhMdp7XF8FezGBEwqYyg4yc-A-aA4Sia0d8PwZS2ecpTP2fExncKDdMrS-zacXyGsqlFeqTJEKASNluAv1DQRlUtE7dQx9bv8OyToZulRPdCe1Zt2kPMaBQ5qvfvDG8nVEdP-tQ4kUnT--sLknVudkPHdlD87pl695swo-gz596mq6RkB07kQT6JMrhqklLY7w264AdySkHE3e0tQK-g',
    variants: [{ color: '#ab8ffe' }, { color: '#65fde6' }],
  },
  {
    id: 3,
    name: 'The Hug Chair',
    category: 'seating',
    description: 'Like a warm embrace in velvet.',
    price: 520,
    badge: null,
    featured: false,
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAztZLtscB3S4bj5n9TPVIOM4O4yysW8lhBl73R37huhbMkyKQzcrGvYWBbX2jFO020xP1W2wYASY7sDKPsi0TheFJAd3Csq1CmBK2m7buB-qtjNRMhl25dU9GJzvWiMixADaKVn9dJW2kUjNUQM90AiwFNvSv3Cix9nbqnh7cIbnpfD2qi1W48vXQkLSlcqNuQcZKTFJs0sv_sXBnXZ09IhMQ7moH927r6vXW1tC1VFxyUsCxmdAZadgAFWSapUAWXKqqeo-1fpZY',
    variants: [{ color: '#ab8ffe' }, { color: '#fed01b' }],
  },
  {
    id: 4,
    name: 'Mushroom Side Table',
    category: 'tables',
    description: 'Compact organic geometry.',
    price: 410,
    badge: null,
    featured: true,
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCV_a7Hf-uTNJwz0UIUMytXliCvPYmUDpcNg1YZWOZrtpVS1t-i42pphJV8bjX60zj_i8Y3V0X4WTWewRIgOfRb0hTOzisnTT4jEvE4s--TcIYM15GzR1HcDkMMoVUFHJZYphEpo_C5cHdPeAjwkn2rCcblMncZyUb07iQy2gsamx0PmSs6jPThX2GYwDkX4CAh7-FKD0LQjEQXGpU-1Qv2oK5OcGXm8PeWT7H46tGK8s7trFU7zBXEhC_ZC65YoHmlkYQc5qPYGzc',
    variants: [{ color: '#d3d4d7' }, { color: '#2d2f30' }],
  },
  {
    id: 5,
    name: 'Melted Velvet Armchair',
    category: 'seating',
    description: 'Deep Moss Green.',
    price: 1299,
    badge: null,
    featured: false,
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDsKnhCKINOmqAnpMwjedvnelwbJBtxYDzzr4AK7Zlp25aZBC02rZSyn_oph2BoZGoLVwOIjSO-8nDjmE1pZsk4wVG5h_nTLxdOoJniEkcGT7VI04AaKi6q_cAqguqV1PdAMCA1WYDEkE7NcNAMALPCXcqvXrCC1m97sMZsc7KzvPzfM6UXwqxP9kwSaXQb1vFONqin3pSnxkLuqyYDaZtRe64pNhUPa9hiYzI0nArNeorP_4dR1U6MYjfNigECVInCKS5Ak1OmH7w',
    variants: [{ color: '#005a50' }, { color: '#2d2f30' }],
  },
  {
    id: 6,
    name: 'Orbital Floor Light',
    category: 'lighting',
    description: 'Smoked Glass.',
    price: 425,
    badge: null,
    featured: false,
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9sG3Y08BdBcH-TFQPdIeo8-ETnnGHbWFMaH4zmCSqW5-umOrqFM0VUJzvuwPzrGXnT-C96yFbL3SQS7huEd_bsh4J3ePZYbTXctHTtHo6Dao1QkzTKQdgOGnaBMVtT0P3akKp02uZuNkS95CtzV5hF8vAdv61jQSwwXpSWzjB6hsh6PWnZvmidMd935GgR2jghBA_ENJp14eEkdlNyt2TShIQJDxYNHOHI0kfvFF-G_EGHBtl8XQP3A8QiLXAeHsDRqiizjllMzo',
    variants: [{ color: '#5b5b5d' }, { color: '#dcdddf' }],
  },
];

const steps = [
  { num: '01', title: 'Browse', desc: 'Explore the full furniture catalog — filter by category, style, or room.' },
  { num: '02', title: 'Preview in AR', desc: "Place any piece in your real room using your phone's camera. See exactly how it fits." },
  { num: '03', title: 'Ask Roomie', desc: 'Get AI-powered styling advice, color matching, and layout recommendations.' },
];

export function HomePage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const navigate = useNavigate();

  const categories = ['all', ...new Set(products.map((p) => p.category))];
  const filtered = activeCategory === 'all'
    ? products
    : products.filter((p) => p.category === activeCategory);

  const featuredProduct = products.find((p) => p.featured);

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
                    className="w-full h-full object-cover"
                    src={featuredProduct.img}
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
                    className="w-full h-full object-cover"
                    src={product.img}
                    alt={product.name}
                    loading="lazy"
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
