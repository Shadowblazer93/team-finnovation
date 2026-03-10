import { AssetCategory } from '@/types';

export function formatCurrency(value: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number, decimals: number = 2): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

export function formatCompactNumber(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return formatCurrency(value);
}

export function getScoreStatus(score: number): 'excellent' | 'good' | 'fair' | 'poor' {
  if (score >= 85) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 50) return 'fair';
  return 'poor';
}

export function getScoreColor(score: number): string {
  if (score >= 85) return 'text-emerald-500';
  if (score >= 70) return 'text-blue-500';
  if (score >= 50) return 'text-amber-500';
  return 'text-red-500';
}

export function getScoreBgColor(score: number): string {
  if (score >= 85) return 'bg-emerald-500';
  if (score >= 70) return 'bg-blue-500';
  if (score >= 50) return 'bg-amber-500';
  return 'bg-red-500';
}

export function getScoreGradient(score: number): string {
  if (score >= 85) return 'from-emerald-500 to-emerald-600';
  if (score >= 70) return 'from-blue-500 to-blue-600';
  if (score >= 50) return 'from-amber-500 to-amber-600';
  return 'from-red-500 to-red-600';
}

export function getCategoryColor(category: AssetCategory): string {
  const colors: Record<AssetCategory, string> = {
    stocks: '#3B82F6',
    bonds: '#10B981',
    real_estate: '#8B5CF6',
    crypto: '#F59E0B',
    cash: '#6B7280',
    private_equity: '#EC4899',
    commodities: '#F97316',
    alternatives: '#06B6D4',
  };
  return colors[category];
}

export function getCategoryLabel(category: AssetCategory): string {
  const labels: Record<AssetCategory, string> = {
    stocks: 'Stocks',
    bonds: 'Bonds',
    real_estate: 'Real Estate',
    crypto: 'Crypto',
    cash: 'Cash',
    private_equity: 'Private Equity',
    commodities: 'Commodities',
    alternatives: 'Alternatives',
  };
  return labels[category];
}

export function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
