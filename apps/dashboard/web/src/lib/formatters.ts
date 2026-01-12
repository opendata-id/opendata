export function formatRupiah(amount: number): string {
  if (amount >= 1_000_000) {
    const millions = amount / 1_000_000;
    return `${millions.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}jt`;
  }
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

export function formatRupiahFull(amount: number): string {
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

export function formatPercent(value: number, showSign = true): string {
  const sign = showSign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

export function formatNumber(value: number): string {
  return value.toLocaleString('id-ID');
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatCompactNumber(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toString();
}
