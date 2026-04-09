import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
  const [liked, setLiked] = useState(false);
  const [hovered, setHovered] = useState(false);

  const { id = 1, name = 'Elm Lounge Chair', category = 'Chairs', price = 649, image = null } = product || {};

  const bgColors = ['#E8DDD0', '#D6E0D8', '#DDD6E0', '#E0D8D6', '#D8DDE0'];
  const bg = bgColors[id % bgColors.length];

  return (
    <div
      className="group relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image area */}
      <div className="relative overflow-hidden aspect-[4/5]" style={{ backgroundColor: bg }}>
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" opacity="0.25">
              <rect x="20" y="35" width="40" height="25" rx="3" fill="#1C1C1A" />
              <rect x="10" y="28" width="60" height="10" rx="3" fill="#1C1C1A" />
              <rect x="22" y="60" width="6" height="12" fill="#1C1C1A" />
              <rect x="52" y="60" width="6" height="12" fill="#1C1C1A" />
            </svg>
          </div>
        )}

        {/* Wishlist */}
        <button
          onClick={() => setLiked(!liked)}
          className={`absolute top-3 right-3 w-9 h-9 flex items-center justify-center transition-all duration-200 ${
            liked ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={liked ? '#D4956A' : 'none'} stroke={liked ? '#D4956A' : '#1C1C1A'} strokeWidth="1.5">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        {/* Quick add */}
        <div className={`absolute bottom-0 left-0 right-0 transition-all duration-300 ${hovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
          <Link
            to={`/product/${id}`}
            className="block w-full bg-[#1C1C1A] text-[#F5F0E8] text-center py-3 text-xs tracking-widest uppercase hover:bg-[#8B6F47] transition-colors"
          >
            View Product
          </Link>
        </div>
      </div>

      {/* Info */}
      <div className="mt-4">
        <p className="text-[11px] tracking-widest uppercase text-[#8A8478] mb-1">{category}</p>
        <Link to={`/product/${id}`} className="font-['Cormorant_Garamond'] text-xl font-light text-[#1C1C1A] hover:text-[#8B6F47] transition-colors block">
          {name}
        </Link>
        <p className="text-sm text-[#1C1C1A] mt-1 font-medium">${price.toLocaleString()}</p>
      </div>
    </div>
  );
}
