/**
 * Divider — Thin hairline with optional diamond ornament
 *
 * Variants: "line" (default), "diamond"
 */
export function Divider({ variant = 'line', className = '' }) {
  if (variant === 'diamond') {
    return (
      <div className={`divider-diamond ${className}`}>
        <span>&#9830;</span>
      </div>
    );
  }

  return <div className={`divider-line ${className}`} />;
}
