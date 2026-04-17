/**
 * Section — Page section wrapper with generous padding
 *
 * Sizes: "md" (default), "sm", "lg"
 * Supports optional maxWidth constraint.
 */
export function Section({
  children,
  size = 'md',
  maxWidth = '7xl',
  className = '',
  as: Component = 'section',
  ...props
}) {
  const paddings = {
    sm: 'py-12 md:py-16',
    md: 'py-16 md:py-24',
    lg: 'py-20 md:py-32',
  };

  const widths = {
    '3xl': 'max-w-3xl',
    '5xl': 'max-w-5xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full',
  };

  return (
    <Component
      className={`${widths[maxWidth] || widths['7xl']} mx-auto px-6 lg:px-8 ${paddings[size] || paddings.md} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
