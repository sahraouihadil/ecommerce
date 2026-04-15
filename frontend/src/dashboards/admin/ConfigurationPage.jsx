/**
 * ConfigurationPage.jsx - System Configuration (Admin) — Redesigned
 * Logic unchanged, styling updated to match AdminDashboard.
 */

import Header from "../ui/Header";
import Sidebar from "../ui/Sidebar";
import { useState } from "react";

const S = {
  page:  { display: "flex", minHeight: "100vh", backgroundColor: "#F4F6FB", fontFamily: "'Segoe UI', sans-serif" },
  main:  { flex: 1, padding: "0 0 32px 0", overflowY: "auto" },
  inner: { padding: "28px 32px", display: "flex", flexDirection: "column", gap: 28 },
  card:  { backgroundColor: "#fff", borderRadius: 14, boxShadow: "0 2px 12px rgba(0,0,0,0.07)", padding: "24px 28px" },
  grid2: { display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 20 },
  label: { margin: 0, fontSize: 11, color: "#8a8a9a", textTransform: "uppercase", letterSpacing: "0.08em" },
};

function Toggle({ on, onToggle }) {
  return (
    <div
      onClick={onToggle}
      style={{
        width: 44, height: 24, borderRadius: 99, cursor: "pointer",
        background: on ? "#4f8ef7" : "#dde1ec",
        position: "relative", transition: "background 0.2s", flexShrink: 0,
      }}
    >
      <div style={{
        position: "absolute", top: 3,
        left: on ? 22 : 3,
        width: 18, height: 18, borderRadius: "50%",
        background: "#fff", transition: "left 0.2s",
        boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
      }} />
    </div>
  );
}

const initialProducts = [
  { name: "Product 1", type: "Table",  active: true  },
  { name: "Product 2", type: "Table",  active: true  },
  { name: "Product 3", type: "Chair",  active: true  },
  { name: "Product 4", type: "Shelf",  active: true  },
  { name: "Product 5", type: "Desk",   active: true  },
];

export default function ConfigurationPage() {
  const [openBar, setOpenBar]   = useState(window.innerWidth >= 600);
  const [arOn, setArOn]         = useState(true);
  const [botOn, setBotOn]       = useState(true);
  const [products, setProducts] = useState(initialProducts);

  const toggleProduct = i =>
    setProducts(prev => prev.map((p, idx) => idx === i ? { ...p, active: !p.active } : p));

  return (
    <div style={S.page}>
      <Sidebar openBar={openBar} setOpenBar={setOpenBar} />

      <main style={S.main}>
        <Header concept="Configuration" setOpenBar={setOpenBar} openBar={openBar} />

        <div style={S.inner}>

          {/* Title */}
          <div>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: "#8a8a9a" }}>Manage global features and product AR settings.</p>
          </div>

          <div style={S.grid2}>

            {/* LEFT — Global Feature Control */}
            <div style={S.card}>
              <h2 style={{ margin: "0 0 20px", fontSize: 17, fontWeight: 600, color: "#1a1a2e" }}>Global Feature Control</h2>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

                {/* AR Toggle */}
                <div style={{ background: "#F4F6FB", borderRadius: 12, padding: "16px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: "#1a1a2e" }}>Global AR Support</p>
                    <p style={{ margin: "3px 0 0", fontSize: 12, color: "#8a8a9a" }}>Master switch for all AR features</p>
                  </div>
                  <Toggle on={arOn} onToggle={() => setArOn(v => !v)} />
                </div>

                {/* Bot Toggle */}
                <div style={{ background: "#F4F6FB", borderRadius: 12, padding: "16px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: "#1a1a2e" }}>AI Support Chatbot</p>
                    <p style={{ margin: "3px 0 0", fontSize: 12, color: "#8a8a9a" }}>Automated customer assistance</p>
                  </div>
                  <Toggle on={botOn} onToggle={() => setBotOn(v => !v)} />
                </div>

              </div>
            </div>

            {/* RIGHT — Product AR Management */}
            <div style={S.card}>
              <h2 style={{ margin: "0 0 20px", fontSize: 17, fontWeight: 600, color: "#1a1a2e" }}>Product AR Management</h2>

              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {products.map((p, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "13px 0",
                      borderBottom: i < products.length - 1 ? "1px solid #f0f0f5" : "none",
                    }}
                  >
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: "#1a1a2e" }}>{p.name}</p>
                      <p style={{ margin: "2px 0 0", fontSize: 12, color: "#8a8a9a" }}>{p.type}</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{
                        fontSize: 11, padding: "3px 10px", borderRadius: 99, fontWeight: 500,
                        background: p.active ? "#e8f0fe" : "#f0f0f5",
                        color:      p.active ? "#4f8ef7" : "#8a8a9a",
                      }}>
                        {p.active ? "AR ACTIVE" : "AR HIDDEN"}
                      </span>
                      <Toggle on={p.active} onToggle={() => toggleProduct(i)} />
                    </div>
                  </div>
                ))}
              </div>

              <button style={{ marginTop: 16, width: "100%", background: "none", border: "1.5px dashed #dde1ec", borderRadius: 10, padding: "10px", fontSize: 13, color: "#8a8a9a", cursor: "pointer" }}>
                + Manage All
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
