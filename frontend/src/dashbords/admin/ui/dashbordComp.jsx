import React from "react";

export function Card({ children,className = ""}){
  return (
    <div className={`bg-white rounded-2xl shadow-md ${className}`}>
    {children}
    </div>
  );
}

export function CardContent({ children ,className = ""}){
  return(
    <div className={`p-4 ${className}`}>
      {children}
    </div>
  );
}

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