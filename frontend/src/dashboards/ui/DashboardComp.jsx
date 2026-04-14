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
export function StatCard({ title, value,icon}){
  return(
    <div className="bg-white rounded-2xl shadow p-5">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <h3 className="text-2xl font-bold p-1">{value}</h3>
          <span className="text-white bg-green-500 text-sm rounded-2xl p-0.5">{icon}</span>
      </div>
    </div>
  )
}