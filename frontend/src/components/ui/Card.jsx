/**
 * Card — Rounded-3xl container with soft shadow
 *
 * Variants: "cream" (default), "white", "surface"
 * Accepts children and passes through className + extra props.
 */
export function Card({
  children,
  variant = 'cream',
  className = '',
  as: Component = 'div',
  ...props
}) {
  const variants = {
    cream: 'bg-cream',
    white: 'bg-white',
    surface: 'bg-surface',
  };

  return (
    <Component
      className={`rounded-3xl shadow-[0_4px_24px_rgba(26,26,26,0.04)] p-8 ${variants[variant] || variants.cream} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
