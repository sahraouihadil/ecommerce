import { Link } from "react-router-dom";
import { useState } from "react";

const socials = [
  {
    name: "Facebook",
    href: "https://www.facebook.com/aroom.dz",
    gradient: "linear-gradient(135deg, #1877f2, #0d5fc4)",
    d: "M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.883v2.27h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z",
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/aroom.dz/",
    gradient: "linear-gradient(135deg, #f58529, #dd2a7b, #8134af, #515bd4)",
    d: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
  },
  {
    name: "Pinterest",
    href: "https://www.pinterest.com/aroom_dz/",
    gradient: "linear-gradient(135deg, #e60023, #ad081b)",
    d: "M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z",
  },
  {
    name: "TikTok",
    href: "https://www.tiktok.com/@aroom.dz",
    gradient: "linear-gradient(135deg, #010101, #69c9d0)",
    d: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z",
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com/@aroom.dz",
    gradient: "linear-gradient(135deg, #ff0000, #cc0000)",
    d: "M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  },
  {
    name: "X",
    href: "https://x.com/aroom_dz",
    gradient: "linear-gradient(135deg, #111, #444)",
    d: "M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z",
  },
];

// ── Social Icon ──────────────────────────────────────────────────────────────
function SocialIcon({ name, href, gradient, d }) {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={name}
      title={name}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? gradient : "rgba(255,255,255,0.5)",
        color: hovered ? "#fff" : "#7a6e65",
        transform: hovered
          ? "translateY(-5px) scale(1.1)"
          : "translateY(0) scale(1)",
        boxShadow: hovered ? "0 16px 32px rgba(0,0,0,0.12)" : "none",
        transition: "all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "44px",
        height: "44px",
        borderRadius: "14px",
        border: "1px solid rgba(200,185,170,0.4)",
        textDecoration: "none",
        flexShrink: 0,
        cursor: "pointer",
      }}
    >
      <svg
        viewBox="0 0 24 24"
        style={{ width: 20, height: 20, fill: "currentColor" }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d={d} />
      </svg>
    </a>
  );
}

// ── Trust Badges ─────────────────────────────────────────────────────────────
const badges = [
  {
    label: "AR Preview",
    sub: "See it in your room",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22 }}>
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  {
    label: "Free Returns",
    sub: "30-day hassle-free",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22 }}>
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
      </svg>
    ),
  },
  {
    label: "Secure Payment",
    sub: "SSL encrypted checkout",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22 }}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    label: "AI Stylist",
    sub: "Roomie helps you decide",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22 }}>
        <path d="M12 2a4 4 0 0 1 4 4c0 1.5-.8 2.8-2 3.5V11h1a7 7 0 0 1 7 7H2a7 7 0 0 1 7-7h1V9.5A4 4 0 0 1 8 6a4 4 0 0 1 4-4z" />
      </svg>
    ),
  },
];

function TrustBadge({ icon, label, sub }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "12px 18px",
        borderRadius: "14px",
        border: "1px solid rgba(200,185,170,0.3)",
        background: "rgba(255,255,255,0.55)",
        backdropFilter: "blur(4px)",
        flex: "1 1 180px",
        minWidth: 0,
      }}
    >
      <span style={{ color: "#b89a7e", flexShrink: 0 }}>{icon}</span>
      <div>
        <p style={{ fontSize: "0.78rem", fontWeight: 500, color: "#3a3330", letterSpacing: "0.01em", lineHeight: 1.2 }}>
          {label}
        </p>
        <p style={{ fontSize: "0.68rem", color: "#9E8E7A", marginTop: "2px", lineHeight: 1.3 }}>
          {sub}
        </p>
      </div>
    </div>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
export function Footer() {
  return (
    <>
      <footer className="bg-cream pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* — Top row: brand + nav — */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10 mb-16">
            <div>
              <Link
                to="/"
                style={{ fontFamily: "'Cinzel Decorative', cursive" }}
                className="text-2xl font-bold text-primary hover:text-accent2 transition-colors duration-300 select-none"
              >
                ARoom
              </Link>
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontStyle: "italic",
                  fontWeight: 300,
                  fontSize: "1rem",
                  lineHeight: 1.85,
                  color: "#9E8E7A",
                  marginTop: "0.75rem",
                  maxWidth: "18rem",
                }}
              >
                AR-powered furniture shopping. Preview any piece in your real
                room before you buy, with AI styling help from Roomie.
              </p>
            </div>

            <nav className="flex flex-wrap gap-x-10 gap-y-3">
              {[
                { label: "Shop", to: "/furniture" },
                { label: "Journal", to: "/journal" },
                { label: "How It Works", to: "/aboutus" },
                { label: "Contact", to: "/contactus" },
              ].map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="text-muted text-sm hover:text-charcoal transition-colors duration-300"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* — Trust Badges — */}
          <div className="mb-14">
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {badges.map((b) => (
                <TrustBadge key={b.label} {...b} />
              ))}
            </div>
          </div>

          {/* — Follow Us — */}
          <div className="mb-14">
            <p className="text-[10px] tracking-[0.2em] uppercase text-muted/70 mb-5">
              Follow us
            </p>
            <div className="flex flex-wrap gap-3">
              {socials.map((social) => (
                <SocialIcon key={social.name} {...social} />
              ))}
            </div>
          </div>

          {/* — Divider — */}
          <div className="h-px bg-blush mb-8" />

          {/* — Bottom row — */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-muted text-xs">
              &copy; {new Date().getFullYear()} ARoom. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link
                to="/privacy"
                className="text-muted text-xs hover:text-charcoal transition-colors duration-300"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="text-muted text-xs hover:text-charcoal transition-colors duration-300"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}