/**
 * HomePage.jsx - Main Landing Page
 * ===================================
 * NOTE: No TopAppBar here — the global Header.jsx handles navigation.
 *
 * SECTIONS:
 *   1. Hero         - Asymmetric banner with Roomie AI overlay + stats row
 *   2. Stats        - Bento-style 3-card highlights
 *   3. Collection   - Category filter + bento product grid
 *   4. How It Works - 3-step: Browse → AR Preview → Ask Roomie
 *   5. Newsletter   - "Join the Circle of Odd" CTA
 *   6. Footer       - Simple branding line
 *   7. BottomNavBar - Mobile sticky nav (md:hidden)
 *   8. Roomie FAB   - Floating action button
 *
 * Products come from data/products.js (replace the inline stub below).
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import products from '../data/products';   ← uncomment when ready

// ─── Inline product stub (replace with real import above) ────────────────────
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
    description: 'Hand-carved organic geometry.',
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

// ─── Constants ────────────────────────────────────────────────────────────────
const categoryIcons = { seating: '🛋️', lighting: '💡', tables: '🍄' };

const stats = [
  { icon: 'star_outline', value: '450+', label: 'Unique Pieces', highlight: false },
  { icon: 'view_in_ar', value: '100%', label: 'AR Try-on', highlight: true },
  { icon: 'smart_toy', value: '24/7', label: 'Smart Assistant', highlight: false },
];

const steps = [
  { num: '1', title: 'Browse', desc: 'Explore our collection of weird and wonderful furniture pieces.' },
  { num: '2', title: 'Preview in AR', desc: "Place any piece in your room using your phone's camera." },
  { num: '3', title: 'Ask Roomie', desc: 'Chat with our AI assistant for styling tips and recommendations.' },
];

const navItems = [
  { label: 'Home', icon: 'home', href: '#' },
  { label: 'Browse', icon: 'explore', href: '#collection' },
  { label: 'Roomie', icon: 'robot_2', href: '#' },
  { label: 'Cart', icon: 'shopping_cart', href: '#' },
];

// =============================================================================
export function HomePage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeNav, setActiveNav] = useState('Home');
  const navigate = useNavigate();

  const categories = ['all', ...new Set(products.map((p) => p.category))];
  const filtered = activeCategory === 'all'
    ? products
    : products.filter((p) => p.category === activeCategory);

  return (
    <div className="bg-[#f7f6f8] text-[#2d2f30] font-['Be_Vietnam_Pro'] min-h-screen">

      <main className="max-w-screen-xl mx-auto px-6 pt-12 pb-36">

        {/* ── HERO ──────────────────────────────────────────────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-32">

          {/* Left copy */}
          <div className="lg:col-span-7 z-10">
            <span className="inline-block bg-[#fed01b] text-[#594700] px-4 py-1 rounded-full
              text-xs font-bold tracking-widest uppercase mb-6">
              AR-Powered Shopping
            </span>
            <h2 className="text-7xl md:text-8xl font-extrabold font-['Plus_Jakarta_Sans']
              tracking-tighter leading-[0.9] text-[#6448b2] mb-6">
              Weird.<br />Wonderful.<br />Furniture.
            </h2>
            <p className="text-xl md:text-2xl text-[#5b5b5d] max-w-xl mb-10 leading-relaxed">
              Furniture that sparks conversation. See every piece in your space with
              augmented reality before you buy.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="#collection"
                className="bg-[#fed01b] text-[#594700] px-10 py-5 rounded-full font-bold text-lg
                  shadow-[0px_20px_40px_rgba(254,208,27,0.25)] hover:scale-105 transition-transform"
              >
                Explore Collection
              </a>
              <button className="bg-white text-[#6448b2] px-10 py-5 rounded-full font-bold text-lg
                shadow-[0px_20px_40px_rgba(45,47,48,0.06)] hover:bg-[#f1f0f3] transition-colors
                border border-[#adadaf]/20">
                Try AR Mode
              </button>
            </div>

            {/* Inline stats */}
            <div className="flex gap-10 mt-12">
              {[
                { value: `${products.length}`, label: 'Unique Pieces' },
                { value: 'AR', label: 'Try in Your Room' },
                { value: 'AI', label: 'Smart Assistant' },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-3xl font-black font-['Plus_Jakarta_Sans'] text-[#6448b2]">{s.value}</p>
                  <p className="text-xs uppercase tracking-widest text-[#5b5b5d] mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right visual */}
          <div className="lg:col-span-5 relative">
            <div className="relative w-full aspect-square rounded-[2rem] overflow-hidden
              shadow-[0px_40px_80px_rgba(45,47,48,0.1)] rotate-3 hover:rotate-0 transition-transform duration-500">
              <img
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-ZlSyzlvP1zaKAVmQV0uD9Gz11RXYzKO_OreqTH3t3h-zMP5KbIjKZSxs4GwSyFhy1uWz82JIqXMylrdDwfrNL5tIdWRfygrFtx4caY13sDVlHEM9Guo9jr4G2DM6zFWoKnhZL7bp3k5RnRQBTkaoU9iiFVcg2TwDQBfHlpSUt4Roj2Au5e94_f8Vs9aJ62NsVE8hzfzdRuuOntjUfDRPASZiU2ybcigeEeUL2aYWRBpqliMYRD8CKNbXxW654ezgNRZ4mMuzMhU"
                alt="Modern sculptural lounge chair"
              />
              <div className="absolute inset-0 bg-[#6448b2]/10 mix-blend-multiply" />
            </div>
            {/* Hand-Picked Oddities badge */}
            <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-[#fed01b] rounded-full
              flex items-center justify-center p-5 -rotate-12 shadow-xl z-10">
              <p className="text-[#594700] font-black font-['Plus_Jakarta_Sans'] text-center
                leading-tight uppercase tracking-tighter text-sm">
                Hand-Picked Oddities
              </p>
            </div>
            {/* Roomie AI glassmorphism chip */}
            <div className="absolute -top-6 -right-6 backdrop-blur-xl bg-white/70 p-5
              rounded-[1rem] shadow-2xl border border-white/40 max-w-[200px]">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-[#6448b2] text-base">robot_2</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#6448b2]">Roomie AI</span>
              </div>
              <p className="text-sm font-medium leading-snug">
                "This blob sofa would fit perfectly in your corner."
              </p>
            </div>
          </div>
        </section>

        {/* ── STATS ─────────────────────────────────────────────────────────── */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-32">
          {stats.map((s) => (
            <div
              key={s.label}
              className={`p-10 rounded-[2rem] flex flex-col items-center text-center
                ${s.highlight
                  ? 'bg-[#6448b2] text-[#f7f0ff] shadow-[0px_20px_40px_rgba(100,72,178,0.22)] scale-105 z-10'
                  : 'bg-white text-[#2d2f30] shadow-[0px_20px_40px_rgba(45,47,48,0.06)]'}`}
            >
              <span className={`material-symbols-outlined text-5xl mb-4
                ${s.highlight ? 'text-[#fed01b]' : 'text-[#6448b2]'}`}>
                {s.icon}
              </span>
              <h3 className="text-5xl font-black font-['Plus_Jakarta_Sans'] mb-2">{s.value}</h3>
              <p className={`font-medium uppercase tracking-widest text-sm
                ${s.highlight ? 'text-[#f7f0ff]/80' : 'text-[#5b5b5d]'}`}>
                {s.label}
              </p>
            </div>
          ))}
        </section>

        {/* ── COLLECTION ────────────────────────────────────────────────────── */}
        <section className="mb-32" id="collection">
          <div className="flex justify-between items-end mb-8">
            <div>
              <span className="bg-[#fed01b] text-[#594700] px-4 py-1 rounded-full
                text-xs font-bold tracking-widest uppercase mb-3 inline-block">
                Curated
              </span>
              <h2 className="text-5xl font-bold font-['Plus_Jakarta_Sans'] tracking-tight">
                Our Collection
              </h2>
              <p className="text-lg text-[#5b5b5d] mt-2 max-w-xl">
                Each piece is designed to be{' '}
                <em className="not-italic font-semibold text-[#6448b2]">delightfully unexpected</em>,
                blending whimsical geometry with everyday function.
              </p>
            </div>
            <button className="hidden md:flex items-center gap-2 text-[#6448b2] font-bold hover:gap-4 transition-all">
              View All <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-10 items-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-7 py-3 rounded-full font-medium text-sm transition-all
                  ${activeCategory === cat
                    ? 'bg-[#6448b2] text-[#f7f0ff] shadow-lg shadow-[#6448b2]/20 scale-105'
                    : 'bg-[#f1f0f3] text-[#5b5b5d] hover:bg-[#e2e2e5]'}`}
              >
                {cat === 'all'
                  ? 'All'
                  : `${categoryIcons[cat] || ''} ${cat.charAt(0).toUpperCase() + cat.slice(1)}`}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2 text-[#5b5b5d] text-sm
              uppercase tracking-widest bg-white px-4 py-2 rounded-full cursor-pointer
              hover:bg-[#f1f0f3] transition-colors">
              <span>Filter by</span>
              <span className="material-symbols-outlined text-base">tune</span>
            </div>
          </div>

          {/* Bento grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {filtered.map((product) => {
              const isWide = product.featured;
              return (
                <div
                  key={product.id}
                  className={`group cursor-pointer ${isWide ? 'md:col-span-8' : 'md:col-span-4'}`}
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <div className={`relative overflow-hidden rounded-[2rem]
                    bg-gradient-to-br from-white to-[#ab8ffe]/10
                    ${isWide ? 'aspect-[16/9]' : 'aspect-square'}`}>
                    <img
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      src={product.img}
                      alt={product.name}
                    />
                    {product.badge && (
                      <div className="absolute top-4 left-4">
                        <span className="bg-[#fed01b] text-[#594700] px-4 py-1 rounded-full
                          font-bold text-[10px] tracking-widest uppercase">
                          {product.badge}
                        </span>
                      </div>
                    )}
                    {!isWide && (
                      <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md p-2
                        rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="material-symbols-outlined text-[#6448b2] text-base">favorite</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-[#6448b2]/5 opacity-0
                      group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="bg-white/90 backdrop-blur-md px-8 py-3 rounded-full
                        font-bold text-[#6448b2] shadow-xl text-sm">
                        View in 3D
                      </div>
                    </div>
                  </div>

                  <div className={`mt-5 flex justify-between
                    ${isWide ? 'items-end' : 'items-start flex-col gap-1'}`}>
                    <div>
                      <h3 className={`font-bold font-['Plus_Jakarta_Sans'] mb-1
                        ${isWide ? 'text-3xl' : 'text-2xl'}`}>
                        {product.name}
                      </h3>
                      <p className="text-[#5b5b5d]">{product.description}</p>
                      {product.variants?.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {product.variants.slice(0, 3).map((v, i) => (
                            <span
                              key={i}
                              className="w-4 h-4 rounded-full border border-[#adadaf]/40 inline-block"
                              style={{ backgroundColor: v.color }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    <p className={`font-black font-['Plus_Jakarta_Sans'] text-[#6448b2]
                      ${isWide ? 'text-2xl' : 'text-xl mt-2'}`}>
                      ${product.price.toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
        <section className="mb-32">
          <div className="text-center mb-14">
            <span className="bg-[#65fde6] text-[#004a41] px-4 py-1 rounded-full
              text-xs font-bold tracking-widest uppercase mb-4 inline-block">
              Simple Process
            </span>
            <h2 className="text-5xl font-bold font-['Plus_Jakarta_Sans'] tracking-tight">
              How It Works
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
            {steps.map((step, idx) => (
              <React.Fragment key={step.num}>
                <div className="bg-white rounded-[2rem] p-8 text-center
                  shadow-[0px_20px_40px_rgba(45,47,48,0.06)] flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full bg-[#6448b2] text-[#f7f0ff]
                    font-black font-['Plus_Jakarta_Sans'] text-2xl flex items-center justify-center
                    mb-5 shadow-lg shadow-[#6448b2]/20">
                    {step.num}
                  </div>
                  <h3 className="text-xl font-bold font-['Plus_Jakarta_Sans'] mb-2">{step.title}</h3>
                  <p className="text-[#5b5b5d] text-sm leading-relaxed">{step.desc}</p>
                </div>
                {idx < steps.length - 1 && (
                  <div className="hidden md:flex justify-center text-[#6448b2] text-3xl font-black">→</div>
                )}
              </React.Fragment>
            ))}
          </div>
        </section>

        {/* ── NEWSLETTER ────────────────────────────────────────────────────── */}
        <section className="bg-[#f1f0f3] rounded-[2rem] p-12 md:p-24 flex flex-col
          items-center text-center overflow-hidden relative">
          <div className="absolute top-0 left-0 w-64 h-64 bg-[#ab8ffe]/20 rounded-full
            blur-[100px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#fed01b]/10 rounded-full
            blur-[120px] translate-x-1/3 translate-y-1/3 pointer-events-none" />
          <h2 className="text-5xl md:text-6xl font-bold font-['Plus_Jakarta_Sans']
            mb-6 relative z-10 tracking-tight">
            Join Our Creative Circle
          </h2>
          <p className="text-lg md:text-xl text-[#5b5b5d] max-w-2xl mb-10 relative z-10 leading-relaxed">
            Discover unique furniture pieces designed to elevate your space, 
            with early access to our latest collections and smart styling inspiration.
          </p>
          <div className="w-full max-w-md flex bg-white p-2 rounded-full shadow-lg relative z-10">
            <input
              className="bg-transparent border-none focus:ring-0 px-6 py-4 flex-grow
                font-medium outline-none placeholder:text-[#767779] text-sm"
              placeholder="Your weird email address…"
              type="email"
            />
            <button className="bg-[#6448b2] text-[#f7f0ff] px-8 py-3 rounded-full font-bold
              text-sm hover:bg-[#583ba5] transition-colors">
              Join
            </button>
          </div>
        </section>

      </main>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="max-w-screen-xl mx-auto px-6 py-6 text-center text-[#5b5b5d] text-sm mb-20 md:mb-4">
        <p>ARoom — Weird Wonderful Furniture, Seen in Your Space</p>
      </footer>

      {/* ── BOTTOM NAV — mobile only ───────────────────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center
          px-4 py-3 bg-white/80 backdrop-blur-xl rounded-t-[3rem]
          shadow-[0px_-20px_40px_rgba(45,47,48,0.06)]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {navItems.map((item) => {
          const active = activeNav === item.label;
          return (
            <a
              key={item.label}
              href={item.href}
              onClick={() => setActiveNav(item.label)}
              className={`flex flex-col items-center justify-center px-5 py-2 rounded-full transition-all
                ${active
                  ? 'bg-violet-100 text-violet-700 scale-105'
                  : 'text-gray-400 hover:text-violet-500'}`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="font-medium text-[11px] tracking-wide uppercase mt-0.5">
                {item.label}
              </span>
            </a>
          );
        })}
      </nav>

    </div>
  );
}

export default HomePage;