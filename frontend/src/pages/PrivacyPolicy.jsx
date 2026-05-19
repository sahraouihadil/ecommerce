import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const LAST_UPDATED = "May 2, 2026";
const COMPANY = "ARoom";
const EMAIL = "privacy@aroom.dz";
const COUNTRY = "Algeria";

const sections = [
  {
    id: "information",
    title: "1. Information We Collect",
    content: [
      {
        subtitle: "Account Information",
        text: "When you create an account, we collect your name, email address, and password (encrypted). You may optionally provide a profile picture and address for delivery purposes.",
      },
      {
        subtitle: "Order & Payment Data",
        text: "When you place an order, we collect billing/shipping address, order details, and transaction identifiers. We do not store full payment card numbers — payments are processed securely by our payment provider.",
      },
      {
        subtitle: "Newsletter Subscription",
        text: "If you subscribe to our newsletter, we collect your email address and track open/click rates to improve our communications. You may unsubscribe at any time.",
      },
      {
        subtitle: "AR & Usage Data",
        text: "When you use our AR preview feature, we may collect device sensor data (camera access) solely to render furniture in your space. This data is processed locally on your device and is not transmitted to our servers.",
      },
      {
        subtitle: "Analytics & Cookies",
        text: "We use cookies and similar technologies (e.g. Google Analytics) to understand how visitors interact with our site. This includes pages visited, time on site, and referring URLs. You can manage cookie preferences in your browser settings.",
      },
    ],
  },
  {
    id: "use",
    title: "2. How We Use Your Information",
    content: [
      {
        subtitle: null,
        text: "We use your personal data to: process and fulfill your orders; manage your account; send transactional emails (order confirmation, shipping updates); send marketing emails if you opted in; improve our website, AR features, and product recommendations; comply with legal obligations under Algerian law.",
      },
    ],
  },
  {
    id: "sharing",
    title: "3. Sharing Your Information",
    content: [
      {
        subtitle: null,
        text: "We do not sell your personal data. We may share it with trusted third parties strictly to operate our services: shipping and logistics partners (for order delivery); payment processors (for secure transactions); email service providers (for newsletters and transactional emails); analytics providers (Google Analytics). All third parties are contractually bound to protect your data.",
      },
    ],
  },
  {
    id: "retention",
    title: "4. Data Retention",
    content: [
      {
        subtitle: null,
        text: "We retain your account data for as long as your account is active. Order records are kept for a minimum of 5 years to comply with Algerian commercial regulations. Newsletter preferences are kept until you unsubscribe. You may request deletion of your account and associated data at any time by contacting us.",
      },
    ],
  },
  {
    id: "rights",
    title: "5. Your Rights",
    content: [
      {
        subtitle: null,
        text: "You have the right to access the personal data we hold about you; correct inaccurate data; request deletion of your data (right to be forgotten); opt out of marketing communications at any time; withdraw consent where processing is based on consent. To exercise any of these rights, email us at " + EMAIL + ".",
      },
    ],
  },
  {
    id: "security",
    title: "6. Data Security",
    content: [
      {
        subtitle: null,
        text: "We implement industry-standard security measures including SSL/TLS encryption for data in transit, encrypted password storage, and access controls. While we strive to protect your data, no method of transmission over the internet is 100% secure.",
      },
    ],
  },
  {
    id: "cookies",
    title: "7. Cookies",
    content: [
      {
        subtitle: null,
        text: "We use strictly necessary cookies (for login sessions and cart), functional cookies (for preferences), and analytics cookies (to measure performance). You may disable non-essential cookies via your browser settings or our cookie banner, though this may affect site functionality.",
      },
    ],
  },
  {
    id: "children",
    title: "8. Children's Privacy",
    content: [
      {
        subtitle: null,
        text: "ARoom is not directed at children under 16. We do not knowingly collect personal data from minors. If you believe a minor has provided us with personal information, please contact us and we will delete it promptly.",
      },
    ],
  },
  {
    id: "changes",
    title: "9. Changes to This Policy",
    content: [
      {
        subtitle: null,
        text: "We may update this Privacy Policy periodically. We will notify registered users by email of material changes. Continued use of our services after changes constitutes acceptance of the updated policy.",
      },
    ],
  },
  {
    id: "contact",
    title: "10. Contact Us",
    content: [
      {
        subtitle: null,
        text: "For any privacy-related questions or requests, contact us at: " + EMAIL + ". ARoom, Algeria.",
      },
    ],
  },
];

/* ── Stagger hook ── */
function useStaggerVisible(count, delayBase = 80) {
  const [visible, setVisible] = useState([]);
  useEffect(() => {
    let timers = [];
    for (let i = 0; i < count; i++) {
      timers.push(
        setTimeout(() => setVisible(v => [...v, i]), 120 + i * delayBase)
      );
    }
    return () => timers.forEach(clearTimeout);
  }, [count, delayBase]);
  return visible;
}

/* ── Animated section wrapper ── */
function AnimSection({ children, index, visible }) {
  const isVisible = visible.includes(index);
  return (
    <div
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(22px)",
        transition: "opacity 0.55s ease, transform 0.55s ease",
      }}
    >
      {children}
    </div>
  );
}

function TableOfContents({ active, onClick }) {
  return (
    <nav
      style={{
        position: "sticky",
        top: "100px",
        background: "rgba(250,247,244,0.9)",
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(200,185,170,0.3)",
        borderRadius: "16px",
        padding: "24px",
        width: "220px",
        flexShrink: 0,
        alignSelf: "flex-start",
      }}
    >
      <p
        style={{
          fontSize: "9px",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "#b89a7e",
          marginBottom: "16px",
          fontWeight: 500,
        }}
      >
        Contents
      </p>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
        {sections.map((s) => (
          <li key={s.id}>
            <button
              onClick={() => onClick(s.id)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                padding: "4px 8px",
                borderRadius: "6px",
                fontSize: "0.72rem",
                color: active === s.id ? "#5c4a3a" : "#9E8E7A",
                fontWeight: active === s.id ? 500 : 400,
                borderLeft: active === s.id ? "2px solid #b89a7e" : "2px solid transparent",
                transition: "all 0.2s ease",
                width: "100%",
                lineHeight: 1.4,
              }}
            >
              {s.title}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState("information");

  // hero = index 0, banner = 1, toc = 2, sections start at 3
  const totalItems = 3 + sections.length + 1; // +1 for back link
  const visible = useStaggerVisible(totalItems, 75);

  const scrollTo = (id) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div style={{ background: "#faf7f4", minHeight: "100vh" }}>
      <style>{`
        @keyframes heroSlideDown {
          from { opacity: 0; transform: translateY(-18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ── Hero ── */}
      <div
        style={{
          background: "linear-gradient(135deg, #3a2e27 0%, #5c4a3a 60%, #7a6352 100%)",
          padding: "80px 32px 64px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
          opacity: visible.includes(0) ? 1 : 0,
          transform: visible.includes(0) ? "translateY(0)" : "translateY(-18px)",
          transition: "opacity 0.6s ease, transform 0.6s ease",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute", inset: 0,
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            pointerEvents: "none",
          }}
        />
        <p style={{ fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", color: "#b89a7e", marginBottom: "14px" }}>
          Legal
        </p>
        <h1
          style={{
            fontFamily: "'Cinzel Decorative', cursive",
            fontSize: "clamp(1.6rem, 4vw, 2.4rem)",
            color: "#fff",
            lineHeight: 1.25,
            marginBottom: "16px",
          }}
        >
          Privacy Policy
        </h1>
        <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: "italic", color: "rgba(255,255,255,0.55)", fontSize: "1rem" }}>
          Last updated: {LAST_UPDATED}
        </p>
      </div>

      {/* ── Intro banner ── */}
      <div
        style={{
          background: "rgba(184,154,126,0.1)",
          borderBottom: "1px solid rgba(200,185,170,0.3)",
          padding: "18px 32px",
          textAlign: "center",
          opacity: visible.includes(1) ? 1 : 0,
          transform: visible.includes(1) ? "translateY(0)" : "translateY(14px)",
          transition: "opacity 0.5s ease, transform 0.5s ease",
        }}
      >
        <p style={{ fontSize: "0.82rem", color: "#7a6352", maxWidth: "640px", margin: "0 auto", lineHeight: 1.7 }}>
          At {COMPANY}, your privacy matters. This policy explains what data we collect, how we use it, and your rights as a user operating in {COUNTRY}.
        </p>
      </div>

      {/* ── Body ── */}
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          padding: "60px 32px",
          display: "flex",
          gap: "48px",
          alignItems: "flex-start",
        }}
      >
        {/* TOC */}
        <AnimSection index={2} visible={visible}>
          <TableOfContents active={activeSection} onClick={scrollTo} />
        </AnimSection>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {sections.map((section, i) => (
            <AnimSection key={section.id} index={3 + i} visible={visible}>
              <div
                id={section.id}
                style={{ marginBottom: "52px", scrollMarginTop: "100px" }}
              >
                <h2
                  style={{
                    fontFamily: "'Cinzel Decorative', cursive",
                    fontSize: "1rem",
                    color: "#3a3330",
                    marginBottom: "20px",
                    paddingBottom: "10px",
                    borderBottom: "1px solid rgba(200,185,170,0.35)",
                  }}
                >
                  {section.title}
                </h2>
                {section.content.map((block, j) => (
                  <div key={j} style={{ marginBottom: "16px" }}>
                    {block.subtitle && (
                      <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "#5c4a3a", marginBottom: "6px", letterSpacing: "0.02em" }}>
                        {block.subtitle}
                      </p>
                    )}
                    <p style={{ fontSize: "0.88rem", color: "#6b5d52", lineHeight: 1.85 }}>
                      {block.text}
                    </p>
                  </div>
                ))}
              </div>
            </AnimSection>
          ))}

          {/* Back link */}
          <AnimSection index={3 + sections.length} visible={visible}>
            <div style={{ paddingTop: "20px", borderTop: "1px solid rgba(200,185,170,0.3)" }}>
              <Link
                to="/"
                style={{
                  fontSize: "0.78rem",
                  color: "#b89a7e",
                  textDecoration: "none",
                  letterSpacing: "0.05em",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                ← Back to ARoom
              </Link>
            </div>
          </AnimSection>
        </div>
      </div>
    </div>
  );
}