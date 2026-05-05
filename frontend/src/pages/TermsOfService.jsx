import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const LAST_UPDATED = "May 2, 2026";
const COMPANY = "ARoom";
const EMAIL = "legal@aroom.dz";

const sections = [
    {
        id: "acceptance",
        title: "1. Acceptance of Terms",
        content: [
            {
                subtitle: null,
                text: "By accessing or using ARoom's website, mobile app, or AR preview features, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services. These terms apply to all visitors, registered users, and customers.",
            },
        ],
    },
    {
        id: "account",
        title: "2. Account Registration",
        content: [
            {
                subtitle: "Eligibility",
                text: "You must be at least 18 years old to create an account and make purchases on ARoom. By registering, you confirm that the information you provide is accurate and up to date.",
            },
            {
                subtitle: "Account Security",
                text: "You are responsible for maintaining the confidentiality of your login credentials. ARoom is not liable for any loss resulting from unauthorized use of your account. Notify us immediately at " + EMAIL + " if you suspect unauthorized access.",
            },
            {
                subtitle: "Account Termination",
                text: "We reserve the right to suspend or terminate accounts that violate these terms, engage in fraudulent activity, or misuse our platform.",
            },
        ],
    },
    {
        id: "orders",
        title: "3. Orders & Payments",
        content: [
            {
                subtitle: "Placing Orders",
                text: "When you place an order, you are making an offer to purchase the selected product(s). ARoom reserves the right to accept or decline any order. Order confirmation emails do not constitute final acceptance — acceptance occurs when the order is dispatched.",
            },
            {
                subtitle: "Pricing",
                text: "All prices are displayed in DZD (Algerian Dinar) or the currency shown at checkout. Prices may change without notice. We are not obligated to honor pricing errors.",
            },
            {
                subtitle: "Payment",
                text: "We accept payment via the methods listed at checkout. All transactions are securely processed. ARoom does not store full card details.",
            },
            {
                subtitle: "Order Cancellation",
                text: "You may cancel an order before it is dispatched by contacting our support team. Once dispatched, the returns policy applies.",
            },
        ],
    },
    {
        id: "shipping",
        title: "4. Shipping & Delivery",
        content: [
            {
                subtitle: null,
                text: "Delivery timelines are estimates and may vary due to carrier delays, location, or unforeseen circumstances. ARoom is not liable for delays caused by third-party carriers. Risk of loss passes to you upon delivery. If your order arrives damaged, contact us within 48 hours with photos.",
            },
        ],
    },
    {
        id: "returns",
        title: "5. Returns & Refunds",
        content: [
            {
                subtitle: "Return Window",
                text: "You may return eligible items within 30 days of delivery. Items must be unused, in original packaging, and in the same condition as received.",
            },
            {
                subtitle: "Non-Returnable Items",
                text: "Custom or made-to-order furniture, items damaged due to misuse, and items without original packaging are not eligible for return.",
            },
            {
                subtitle: "Refunds",
                text: "Once we receive and inspect the return, we will process a refund to your original payment method within 7–14 business days. Shipping costs are non-refundable unless the return is due to our error.",
            },
        ],
    },
    {
        id: "ar",
        title: "6. AR Preview Feature",
        content: [
            {
                subtitle: null,
                text: "Our AR preview tool is provided for visualization purposes only. Rendered dimensions and colors may vary from the actual product due to device screen calibration and lighting conditions. The AR preview is not a guarantee of exact fit or appearance. We recommend verifying measurements before purchasing.",
            },
        ],
    },
    {
        id: "ip",
        title: "7. Intellectual Property",
        content: [
            {
                subtitle: null,
                text: "All content on ARoom — including logos, product images, 3D models, AR assets, text, and design — is the intellectual property of ARoom or its licensors. You may not reproduce, distribute, or use any content without prior written permission. Unauthorized use may result in legal action.",
            },
        ],
    },
    {
        id: "conduct",
        title: "8. Prohibited Conduct",
        content: [
            {
                subtitle: null,
                text: "You agree not to: use ARoom for any unlawful purpose; attempt to gain unauthorized access to our systems; post false reviews or misleading information; resell our products without authorization; scrape, crawl, or extract data from our platform; interfere with the operation of our services.",
            },
        ],
    },
    {
        id: "liability",
        title: "9. Limitation of Liability",
        content: [
            {
                subtitle: null,
                text: "To the maximum extent permitted by Algerian law, ARoom shall not be liable for indirect, incidental, or consequential damages arising from your use of our services. Our total liability for any claim shall not exceed the amount paid by you for the relevant order.",
            },
        ],
    },
    {
        id: "law",
        title: "10. Governing Law",
        content: [
            {
                subtitle: null,
                text: "These Terms of Service are governed by the laws of the People's Democratic Republic of Algeria. Any disputes shall be subject to the exclusive jurisdiction of the competent courts in Algeria. If any provision of these terms is found unenforceable, the remaining provisions continue in full effect.",
            },
        ],
    },
    {
        id: "changes",
        title: "11. Changes to Terms",
        content: [
            {
                subtitle: null,
                text: "We may update these Terms periodically. Registered users will be notified by email of material changes. Continued use of ARoom after changes constitutes acceptance. We encourage you to review this page regularly.",
            },
        ],
    },
    {
        id: "contact",
        title: "12. Contact",
        content: [
            {
                subtitle: null,
                text: "For questions about these Terms, contact us at: " + EMAIL + ". ARoom, Algeria.",
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

export default function TermsOfService() {
    const [activeSection, setActiveSection] = useState("acceptance");

    // hero=0, banner=1, toc=2, sections start at 3
    const totalItems = 3 + sections.length + 1;
    const visible = useStaggerVisible(totalItems, 75);

    const scrollTo = (id) => {
        setActiveSection(id);
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    return (
        <div style={{ background: "#faf7f4", minHeight: "100vh" }}>

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
                    Terms of Service
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
                    Please read these terms carefully before using ARoom. By using our website or placing an order, you agree to these conditions.
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