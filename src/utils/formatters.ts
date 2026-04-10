export const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export const numberFormatter = new Intl.NumberFormat('en-US');

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value || 0);
}

export function formatRating(rating?: number): string {
  return typeof rating === 'number' ? `${rating}` : 'Not rated';
}

export function titleCase(value: string): string {
  return value
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((part) => `${part[0]?.toUpperCase() ?? ''}${part.slice(1)}`)
    .join(' ');
}
