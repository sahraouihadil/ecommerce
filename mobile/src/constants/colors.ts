// ARoom Design Tokens — Color Palette
// Derived from the web app's luxury furniture aesthetic

export const Colors = {
  // Primary brand colors
  primary: '#1C1916',        // Rich black
  primaryLight: '#3D2F1F',   // Dark brown
  accent: '#C8A96A',         // Gold
  accentDark: '#9A7D4A',     // Dark gold
  accentLight: '#E8D49A',    // Light gold

  // Backgrounds
  bg: '#F5F0E8',             // Warm cream (main bg)
  bgCard: '#FFFFFF',         // Card background
  bgInput: '#EDE7D9',        // Input field bg
  bgDark: '#1C1916',         // Dark sections

  // Text
  text: '#1C1916',           // Primary text
  textSecondary: '#7A6B5A',  // Secondary text
  textMuted: '#9E8E7A',      // Muted text
  textLight: '#F5F0E8',      // Light text on dark bg

  // Status colors
  success: '#4A7C59',        // Delivered
  warning: '#D97706',        // In transit / shipped
  info: '#6B7A9A',           // Confirmed
  error: '#993333',          // Error / canceled
  errorBg: 'rgba(200,80,80,0.07)',

  // Borders & dividers
  border: 'rgba(200,169,106,0.22)',
  borderFocused: 'rgba(200,169,106,0.65)',
  divider: 'rgba(200,169,106,0.2)',

  // Overlay
  overlay: 'rgba(28,20,10,0.55)',

  // Status badge colors
  statusDelivered: { bg: '#F0FDF4', text: '#16A34A' },
  statusShipped: { bg: '#FFFBEB', text: '#D97706' },
  statusCanceled: { bg: '#FEE2E2', text: '#EF4444' },
  statusPending: { bg: '#F5F5F5', text: '#666666' },
  statusPartial: { bg: '#F0FDF4', text: '#4ADE80' },
  statusProblem: { bg: '#FEF3C7', text: '#F59E0B' },
  statusProcessing: { bg: '#EFF6FF', text: '#3B82F6' },
} as const;

export const getStatusColor = (status?: string) => {
  switch (status?.toLowerCase()) {
    case 'delivered': return Colors.statusDelivered;
    case 'shipped': return Colors.statusShipped;
    case 'canceled': return Colors.statusCanceled;
    case 'pending': return Colors.statusPending;
    case 'partial': return Colors.statusPartial;
    case 'problem': return Colors.statusProblem;
    case 'processing': return Colors.statusProcessing;
    default: return Colors.statusPending;
  }
};
