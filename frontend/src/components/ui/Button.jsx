/**
 * Button — Pill-shaped button primitive
 *
 * Variants: "black" (default), "outline", "blush"
 * Sizes: "md" (default), "sm", "lg"
 *
 * Renders as <button> by default, or as any element via `as` prop.
 * Passes through all extra props (onClick, disabled, type, etc.)
 */
export function Button({
  children,
  variant = 'black',
  size = 'md',
  className = '',
  as: Component = 'button',
  ...props
}) {
  const base = 'btn-pill';

  const variants = {
    black: 'btn-pill-black',
    outline: 'btn-pill-outline',
    blush: 'btn-pill-blush',
  };

  const sizes = {
    sm: 'py-2.5 px-6 text-[0.75rem]',
    md: '',
    lg: 'py-4 px-10 text-[0.875rem]',
  };

  return (
    <Component
      className={`${base} ${variants[variant] || variants.black} ${sizes[size] || ''} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
