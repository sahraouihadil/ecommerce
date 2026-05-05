import { useState, useEffect, useRef } from 'react';

// ── Animation keyframes ────────────────────────────────────────────
const ANIM_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&display=swap');

  @keyframes heroReveal {
    from { opacity: 0; transform: scale(1.06); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes overlayFade {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(32px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeUpFast {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes lineGrow {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }
  @keyframes promoPulse {
    0%,100% { opacity:1; }
    50%      { opacity:0.5; }
  }

  /* scroll-reveal */
  .sr-faq {
    opacity: 0;
    transform: translateY(28px);
    transition: opacity 0.45s cubic-bezier(0.16,1,0.3,1),
                transform 0.45s cubic-bezier(0.16,1,0.3,1);
  }
  .sr-faq.visible { opacity: 1 !important; transform: none !important; }
  .sr-faq-d1 { transition-delay: 0.04s; }
  .sr-faq-d2 { transition-delay: 0.09s; }
  .sr-faq-d3 { transition-delay: 0.14s; }
  .sr-faq-d4 { transition-delay: 0.19s; }
  .sr-faq-d5 { transition-delay: 0.24s; }
  .sr-faq-d6 { transition-delay: 0.29s; }
  .sr-faq-d7 { transition-delay: 0.34s; }
  .sr-faq-d8 { transition-delay: 0.39s; }
`;

// ── Scroll-reveal hook ─────────────────────────────────────────────
function useScrollReveal() {
    const ref = useRef(null);
    useEffect(() => {
        const container = ref.current;
        if (!container) return;
        const targets = container.querySelectorAll('.sr-faq');
        if (!targets.length) return;
        const io = new IntersectionObserver(
            entries => entries.forEach(e => {
                if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
            }),
            { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
        );
        targets.forEach(t => io.observe(t));
        return () => io.disconnect();
    }, []);
    return ref;
}

// ── FAQ data ───────────────────────────────────────────────────────
const faqs = [
    {
        q: "How does the AR preview feature work?",
        a: "Simply tap 'Preview in your room' on any product page. Point your camera at the spot where you want to place the furniture and ARoom will render a true-to-scale 3D model right in your space. No app download required — it works directly from your browser.",
    },
    {
        q: "Are the AR dimensions accurate?",
        a: "Our AR preview is built for accuracy, but results can vary slightly depending on your device's camera and lighting conditions. We always recommend double-checking the listed product dimensions before purchasing — every product page includes a detailed size guide.",
    },
    {
        q: "Can Roomie, your AI stylist, help me choose furniture?",
        a: "Absolutely. Roomie is available at any time via the chat widget. Describe your space, your style, or your budget and Roomie will suggest pieces that work together — from sofas to accent lighting. Think of it as having a personal interior designer on call.",
    },
    {
        q: "What is your return policy?",
        a: "We offer free returns within 30 days of delivery. Items must be unused and in their original packaging. Custom or made-to-order pieces are non-returnable. Once we receive your return, refunds are processed within 7–14 business days to your original payment method.",
    },
    {
        q: "How long does delivery take?",
        a: "Standard delivery across Algeria typically takes 3–7 business days depending on your wilaya. You'll receive a tracking link by email as soon as your order is dispatched. For remote areas, delivery may take slightly longer.",
    },
    {
        q: "Do you ship across all of Algeria?",
        a: "Yes — we deliver to all 58 wilayas. Shipping costs and estimated delivery times are calculated at checkout based on your exact location.",
    },
    {
        q: "Is my payment information secure?",
        a: "Yes. All transactions are SSL-encrypted and processed through our certified payment partner. ARoom never stores your full card details. You can also track all your orders and payment history from your account dashboard.",
    },
    {
        q: "How do I track my order?",
        a: "Once your order is shipped, you'll receive a confirmation email with a tracking link. You can also follow your delivery in real time from the 'My Orders' section of your ARoom account.",
    },
];

// ── FAQItem ────────────────────────────────────────────────────────
function FAQItem({ q, a, isOpen, onToggle, delay }) {
    return (
        <div
            className={`sr-faq sr-faq-d${delay}`}
            style={{ borderBottom: "1px solid rgba(200,185,170,0.4)" }}
        >
            <button
                onClick={onToggle}
                aria-expanded={isOpen}
                style={{
                    width: "100%", background: "none", border: "none", cursor: "pointer",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "22px 0", gap: "16px", textAlign: "left",
                }}
            >
                <span style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: "1.15rem", fontWeight: 400,
                    color: isOpen ? "#3a3330" : "#9E8E7A",
                    lineHeight: 1.4, transition: "color 0.25s ease",
                }}>
                    {q}
                </span>

                {/* +/× icon */}
                <span style={{ flexShrink: 0, width: "20px", height: "20px", position: "relative" }} aria-hidden="true">
                    <span style={{
                        position: "absolute", width: "12px", height: "1px", background: "#b89a7e",
                        top: "50%", left: "50%", transform: "translate(-50%, -50%)", borderRadius: "2px",
                    }} />
                    <span style={{
                        position: "absolute", width: "1px", height: "12px", background: "#b89a7e",
                        top: "50%", left: "50%",
                        transform: `translate(-50%, -50%) rotate(${isOpen ? "90deg" : "0deg"})`,
                        opacity: isOpen ? 0 : 1, borderRadius: "2px",
                        transition: "transform 0.3s ease, opacity 0.3s ease",
                    }} />
                </span>
            </button>

            {/* Answer — animated height */}
            <div style={{
                maxHeight: isOpen ? "400px" : "0",
                overflow: "hidden",
                transition: "max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            }}>
                <p style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontStyle: "italic", fontWeight: 400,
                    fontSize: "1.05rem", color: "#6b5d52",
                    lineHeight: 1.85, paddingBottom: "24px",
                }}>
                    {a}
                </p>
            </div>
        </div>
    );
}

// ── FAQSection (with scroll-reveal) ───────────────────────────────
function FAQSection() {
    const [openIndex, setOpenIndex] = useState(null);
    const ref = useScrollReveal();
    const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

    return (
        <section style={{ background: "#faf7f4", padding: "80px 32px" }}>
            <div style={{ maxWidth: "780px", margin: "0 auto" }} ref={ref}>

                {/* Header */}
                <p className="sr-faq sr-faq-d1" style={{
                    fontSize: "10px", letterSpacing: "0.22em", textTransform: "uppercase",
                    color: "#b89a7e", marginBottom: "14px", fontFamily: "sans-serif",
                }}>
                    Got questions?
                </p>

                <h2 className="sr-faq sr-faq-d2" style={{
                    fontFamily: "'Cinzel Decorative', cursive",
                    fontSize: "clamp(1.2rem, 3vw, 1.65rem)", color: "#3a3330",
                    marginBottom: "12px", lineHeight: 1.3,
                }}>
                    Frequently asked questions
                </h2>

                {/* Decorative line — animated */}
                <div className="sr-faq sr-faq-d3" style={{ marginBottom: "48px" }}>
                    <div style={{
                        display: "flex", alignItems: "center", gap: "8px", maxWidth: "14rem",
                    }}>
                        <div style={{
                            height: "1px", flex: 1, background: "#C8A96A", opacity: 0.55,
                            transformOrigin: "left",
                            animation: "lineGrow 0.6s cubic-bezier(0.16,1,0.3,1) 0.3s both",
                        }} />
                        <div style={{
                            width: "4px", height: "4px", background: "#C8A96A",
                            transform: "rotate(45deg)", opacity: 0.7, flexShrink: 0,
                        }} />
                        <div style={{
                            height: "1px", flex: 1, background: "#C8A96A", opacity: 0.55,
                            transformOrigin: "right",
                            animation: "lineGrow 0.6s cubic-bezier(0.16,1,0.3,1) 0.3s both",
                        }} />
                    </div>
                </div>

                {/* Items */}
                <div style={{ borderTop: "1px solid rgba(200,185,170,0.4)" }}>
                    {faqs.map((item, i) => (
                        <FAQItem
                            key={i}
                            q={item.q}
                            a={item.a}
                            isOpen={openIndex === i}
                            onToggle={() => toggle(i)}
                            delay={Math.min(i + 1, 8)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

// ── FAQPage (main) ─────────────────────────────────────────────────
export function FAQPage() {
    const [heroLoaded, setHeroLoaded] = useState(false);

    return (
        <div>
            <style>{ANIM_CSS}</style>

            {/* ── HERO IMAGE with entrance animation ── */}
            <div style={{
                width: '100%',
                height: '420px',
                overflow: 'hidden',
                position: 'relative',
            }}>
                <img
                    src="https://i.pinimg.com/1200x/34/b9/90/34b990b448c7aa48a199e7f7350f8a54.jpg"
                    alt="FAQ hero"
                    onLoad={() => setHeroLoaded(true)}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center',
                        animation: heroLoaded ? 'heroReveal 0.9s cubic-bezier(0.16,1,0.3,1) both' : 'none',
                        // slight zoom-out on load — cinematic feel
                        transformOrigin: 'center center',
                    }}
                />

                {/* Dark overlay — fades in with hero */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to bottom, rgba(26,20,14,0.18) 0%, rgba(26,20,14,0.45) 100%)',
                    animation: heroLoaded ? 'overlayFade 1s ease both' : 'none',
                }} />

                {/* Hero text — staggered fadeUp */}
                {heroLoaded && (
                    <div style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                        textAlign: 'center', gap: '12px',
                        padding: '2rem',
                    }}>
                        <p style={{
                            fontFamily: 'sans-serif', fontSize: '10px',
                            letterSpacing: '0.35em', textTransform: 'uppercase',
                            color: 'rgba(200,169,106,0.85)',
                            animation: 'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.3s both',
                        }}>
                            We're here to help
                        </p>

                        <h1 style={{
                            fontFamily: "'Cinzel Decorative', cursive",
                            fontSize: 'clamp(1.8rem, 5vw, 3.2rem)',
                            fontWeight: 700, color: '#FAF8F4',
                            lineHeight: 1.1, margin: 0,
                            animation: 'fadeUp 0.55s cubic-bezier(0.16,1,0.3,1) 0.42s both',
                        }}>
                            Questions &amp; Answers
                        </h1>

                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            animation: 'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.55s both',
                        }}>
                            <div style={{ height: '1px', width: '40px', background: 'rgba(200,169,106,0.6)' }} />
                            <div style={{ width: '4px', height: '4px', background: '#C8A96A', transform: 'rotate(45deg)' }} />
                            <div style={{ height: '1px', width: '40px', background: 'rgba(200,169,106,0.6)' }} />
                        </div>

                        <p style={{
                            fontFamily: "'Cormorant Garamond', Georgia, serif",
                            fontSize: '1.1rem', fontStyle: 'italic', fontWeight: 300,
                            color: 'rgba(255,255,255,0.65)', maxWidth: '380px', lineHeight: 1.8,
                            animation: 'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.65s both',
                        }}>
                            Everything you need to know about ARoom, AR preview, and delivery.
                        </p>
                    </div>
                )}
            </div>

            {/* ── FAQ SECTION with scroll-reveal ── */}
            <div style={{
                paddingTop: '60px',
                animation: 'fadeUpFast 0.5s cubic-bezier(0.16,1,0.3,1) 0.2s both',
            }}>
                <FAQSection />
            </div>
        </div>
    );
}

export default FAQPage;