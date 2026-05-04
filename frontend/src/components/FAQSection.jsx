import { useState } from "react";

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

function FAQItem({ q, a, isOpen, onToggle }) {
  return (
    <div
      style={{
        borderBottom: "1px solid rgba(200,185,170,0.4)",
      }}
    >
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        style={{
          width: "100%",
          background: "none",
          border: "none",
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "22px 0",
          gap: "16px",
          textAlign: "left",
        }}
      >
        <span
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "1.15rem",
            fontWeight: 400,
            color: isOpen ? "#3a3330" : "#9E8E7A",
            lineHeight: 1.4,
            transition: "color 0.25s ease",
          }}
        >
          {q}
        </span>

        {/* +/× icon */}
        <span
          style={{
            flexShrink: 0,
            width: "20px",
            height: "20px",
            position: "relative",
          }}
          aria-hidden="true"
        >
          {/* horizontal bar */}
          <span
            style={{
              position: "absolute",
              width: "12px",
              height: "1px",
              background: "#b89a7e",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              borderRadius: "2px",
            }}
          />
          {/* vertical bar */}
          <span
            style={{
              position: "absolute",
              width: "1px",
              height: "12px",
              background: "#b89a7e",
              top: "50%",
              left: "50%",
              transform: `translate(-50%, -50%) rotate(${isOpen ? "90deg" : "0deg"})`,
              opacity: isOpen ? 0 : 1,
              borderRadius: "2px",
              transition: "transform 0.3s ease, opacity 0.3s ease",
            }}
          />
        </span>
      </button>

      {/* Answer — animated height */}
      <div
        style={{
          maxHeight: isOpen ? "400px" : "0",
          overflow: "hidden",
          transition: "max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <p
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: "1.05rem",
            color: "#6b5d52",
            lineHeight: 1.85,
            paddingBottom: "24px",
          }}
        >
          {a}
        </p>
      </div>
    </div>
  );
}

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section
      style={{
        background: "#faf7f4",
        padding: "80px 32px",
      }}
    >
      <div style={{ maxWidth: "780px", margin: "0 auto" }}>
        {/* Header */}
        <p
          style={{
            fontSize: "10px",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#b89a7e",
            marginBottom: "14px",
          }}
        >
          Got questions?
        </p>
        <h2
          style={{
            fontFamily: "'Cinzel Decorative', cursive",
            fontSize: "clamp(1.2rem, 3vw, 1.65rem)",
            color: "#3a3330",
            marginBottom: "48px",
            lineHeight: 1.3,
          }}
        >
          Frequently asked questions
        </h2>

        {/* Items */}
        <div style={{ borderTop: "1px solid rgba(200,185,170,0.4)" }}>
          {faqs.map((item, i) => (
            <FAQItem
              key={i}
              q={item.q}
              a={item.a}
              isOpen={openIndex === i}
              onToggle={() => toggle(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
