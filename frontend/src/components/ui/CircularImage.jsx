/**
 * CircularImage — Rounded image frame
 *
 * Sizes: "sm" (48px), "md" (80px), "lg" (120px), "xl" (180px)
 * Supports optional border ring and shadow.
 */
export function CircularImage({
  src,
  alt = '',
  size = 'md',
  ring = false,
  className = '',
  ...props
}) {
  const sizes = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-[120px] h-[120px]',
    xl: 'w-[180px] h-[180px]',
  };

  return (
    <div
      className={`rounded-full overflow-hidden flex-shrink-0 ${sizes[size] || sizes.md} ${
        ring ? 'ring-4 ring-blush ring-offset-2 ring-offset-cream' : ''
      } ${className}`}
      {...props}
    >
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-surface flex items-center justify-center">
          <span className="material-symbols-outlined text-muted/30">image</span>
        </div>
      )}
    </div>
  );
}
