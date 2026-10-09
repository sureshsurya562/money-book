export function formatINR(value: number, compact = false) {
  if (compact) {
    const abs = Math.abs(value);
    if (abs >= 10000000) {
      return `₹${(value / 10000000).toFixed(2)} Cr`;
    }
    if (abs >= 100000) {
      return `₹${(value / 100000).toFixed(2)} L`;
    }
    if (abs >= 1000) {
      return `₹${(value / 1000).toFixed(1)}K`;
    }
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export function formatPct(value: number) {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

export function platformLogo(platform: string | null | undefined) {
  if (!platform) return null;
  const key = platform.toLowerCase();
  // Clearbit-style public logos where available; graceful fallback in UI
  const map: Record<string, string> = {
    groww: 'https://logo.clearbit.com/groww.in',
    'wintwealth': 'https://logo.clearbit.com/wintwealth.com',
    'yono sbi': 'https://logo.clearbit.com/sbi.co.in',
    'imobile (icici)': 'https://logo.clearbit.com/icicibank.com',
    'ib group': 'https://logo.clearbit.com/ibgroup.com',
    zerodha: 'https://logo.clearbit.com/zerodha.com',
  };
  for (const [k, url] of Object.entries(map)) {
    if (key.includes(k)) return url;
  }
  return null;
}
