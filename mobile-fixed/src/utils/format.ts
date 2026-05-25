// Formatting utilities

export const formatPrice = (value?: number | null): string => {
  if (value == null) return '';
  return `${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DA`;
};

export const formatDate = (dateStr?: string | null): string => {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

export const formatShortDate = (dateStr?: string | null): string => {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

export const extractError = (err: any, fallback: string): string => {
  const detail = err?.response?.data?.detail;
  if (Array.isArray(detail)) return detail.map((e: any) => e.msg || JSON.stringify(e)).join(', ');
  if (typeof detail === 'object' && detail !== null) return detail.msg || JSON.stringify(detail);
  return detail || fallback;
};
