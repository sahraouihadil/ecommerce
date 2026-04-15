/**
 * DashboardComp.jsx - Reusable Dashboard UI Components
 * =======================================================
 * Small, reusable building blocks used across the admin dashboard.
 * These keep the dashboard pages clean and consistent.
 *
 * COMPONENTS:
 *   Card       - White rounded container with shadow (wraps sections)
 *   CardContent - Inner padding for Card content
 *   Button     - Styled black button with hover effect
 *   StatCard   - Metric card showing title, value, and percentage change
 */

import React from "react";

// Card - A white container with rounded corners and shadow
export function Card({ children,className = ""}){
  return (
    <div className={`bg-white rounded-2xl shadow-md ${className}`}>
    {children}
    </div>
  );
}

// CardContent - Adds padding inside a Card
export function CardContent({ children ,className = ""}){
  return(
    <div className={`p-4 ${className}`}>
      {children}
    </div>
  );
}

// Button - Styled button (black background, white text, rounded)
export function Button({ children , className = "", ...props}){
  return(
    <button
    className={`bg-black text-white px-4 py-2 rounded-xl hover:opacity-80 transition ${className}`}
    {...props}
    >
     {children}
    </button>
  )
}

// StatCard - Shows a key metric (e.g. "Total Revenue: $12,345 +12.5%")
export function StatCard({ title, value, change, color, icon }) {
  const isPositive = change && change.startsWith("+");
  return (
    <div style={{
      backgroundColor: "white",
      borderRadius: 14,
      padding: "22px 24px",
      boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
      borderLeft: `4px solid ${color}`,
      display: "flex",
      flexDirection: "column",
      gap: 8,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#8a8a9a", textTransform: "uppercase", letterSpacing: "0.08em" }}>{title}</p>
        <span style={{ fontSize: 20 }}>{icon}</span>
      </div>
      <p style={{ margin: 0, fontSize: 30, fontWeight: 700, color: "#1a1a2e" }}>{value}</p>
      {change && (
        <span style={{
          display: "inline-block",
          fontSize: 12,
          fontWeight: 600,
          padding: "3px 10px",
          borderRadius: 20,
          backgroundColor: isPositive ? "#D4EDDA" : "#F8D7DA",
          color: isPositive ? "#155724" : "#721c24",
          alignSelf: "flex-start",
        }}>{change}</span>
      )}
    </div>
  );
}