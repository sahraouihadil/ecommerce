import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CircularImage } from './ui';

export default function ProductCard({ product }) {
  const {
    id = 1,
    name = 'Elm Lounge Chair',
    category = 'Chairs',
    price = 649,
    image = null,
    badge = null,
  } = product || {};

  return (
    <Link to={`/product/${id}`} className="group block">
      <Card
        variant="white"
        className="relative flex flex-col items-center text-center transition-shadow duration-300 hover:shadow-[0_8px_32px_rgba(26,26,26,0.08)]"
      >
        {badge && (
          <span className="absolute top-4 right-4 z-10 bg-white text-charcoal text-[0.625rem] uppercase tracking-[0.1em] font-semibold px-3 py-1 rounded-full shadow-sm">
            {badge}
          </span>
        )}

        <div className="relative mb-6">
          <CircularImage
            src={image}
            alt={name}
            size="xl"
            className="transition-transform duration-500 group-hover:scale-105"
          />
          <span className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 bg-charcoal text-cream text-[0.7rem] font-semibold tracking-wide px-4 py-1 rounded-full whitespace-nowrap shadow-md">
            ${price.toLocaleString()}
          </span>
        </div>

        <p className="text-[0.6875rem] text-muted uppercase tracking-[0.15em] mb-1.5 mt-6">
          {category}
        </p>
        <h3 className="font-serif text-lg text-charcoal leading-snug group-hover:text-rose transition-colors duration-300">
          {name}
        </h3>
      </Card>
    </Link>
  );
}
