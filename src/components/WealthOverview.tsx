'use client';

import { TrendingUp, TrendingDown, Wallet, Activity, Shield, Target } from 'lucide-react';
import { formatCurrency, formatPercent, getScoreColor, getScoreBgColor } from '@/lib/utils';
import { useSettings } from '@/components/SettingsProvider';
import type { Asset, AssetCategory } from '@/types';

type WealthOverviewProps = {
  assets: Asset[];
};

const liquidCategories: AssetCategory[] = ['cash', 'stocks', 'bonds', 'crypto', 'commodities'];

export default function WealthOverview({ assets }: WealthOverviewProps) {
  const { defaultCurrency } = useSettings();
  const totalsByCategory = assets.reduce<Record<AssetCategory, number>>((acc, asset) => {
    acc[asset.category] = (acc[asset.category] ?? 0) + asset.value;
    return acc;
  }, {} as Record<AssetCategory, number>);

  const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);
  const totalChange = assets.reduce((sum, asset) => sum + (asset.change24h ?? 0), 0);
  const changePercent = totalValue > 0 ? (totalChange / (totalValue - totalChange)) * 100 : 0;
  const isPositive = totalChange >= 0;

  const categoryCount = Object.keys(totalsByCategory).length;
  const diversificationScore = (() => {
    if (totalValue <= 0 || categoryCount === 0) return 0;
    if (categoryCount === 1) return 0;
    const hhi = Object.values(totalsByCategory)
      .map(value => (value / totalValue) ** 2)
      .reduce((sum, value) => sum + value, 0);
    const minHhi = 1 / categoryCount;
    const normalized = (1 - hhi) / (1 - minHhi);
    return Math.max(0, Math.min(1, normalized)) * 100;
  })();

  const liquidValue = assets
    .filter(asset => liquidCategories.includes(asset.category))
    .reduce((sum, asset) => sum + asset.value, 0);
  const liquidityScore = totalValue > 0 ? (liquidValue / totalValue) * 100 : 0;

  const maxCategoryShare = totalValue > 0
    ? Math.max(...Object.values(totalsByCategory).map(value => value / totalValue))
    : 0;
  const concentrationScore = Math.max(0, 100 - maxCategoryShare * 100);

  const cashValue = totalsByCategory.cash ?? 0;
  const cashRatio = totalValue > 0 ? cashValue / totalValue : 0;
  const cashScore = Math.min(cashRatio / 0.2, 1) * 100;

  // Wellness score is 0 when user has no assets (not logged in or no assets added)
  const wellnessScore = assets.length === 0 ? 0 : Math.round(
    (diversificationScore + liquidityScore + concentrationScore + cashScore) / 4
  );

  // Individual scores are also 0 when no assets
  const displayDiversificationScore = assets.length === 0 ? 0 : Math.round(diversificationScore);
  const displayLiquidityScore = assets.length === 0 ? 0 : Math.round(liquidityScore);

  const stats = [
    {
      label: 'Total Wealth',
      value: formatCurrency(totalValue, defaultCurrency),
      change: formatPercent(changePercent),
      isPositive,
      icon: Wallet,
      color: 'from-indigo-500 to-purple-500',
    },
    {
      label: 'Wellness Score',
      value: wellnessScore.toString(),
      suffix: '/100',
      icon: Activity,
      color: 'from-emerald-500 to-teal-500',
      score: wellnessScore,
    },
    {
      label: 'Diversification',
      value: displayDiversificationScore.toString(),
      suffix: '/100',
      icon: Shield,
      color: 'from-blue-500 to-cyan-500',
      score: displayDiversificationScore,
    },
    {
      label: 'Liquidity Score',
      value: displayLiquidityScore.toString(),
      suffix: '/100',
      icon: Target,
      color: 'from-amber-500 to-orange-500',
      score: displayLiquidityScore,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className="relative overflow-hidden bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        >
          {/* Background decoration */}
          <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-5 rounded-full -translate-y-1/2 translate-x-1/2`} />
          
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className={`text-2xl font-bold ${stat.score ? getScoreColor(stat.score) : 'text-gray-900'}`}>
                  {stat.value}
                </span>
                {stat.suffix && (
                  <span className="text-sm text-gray-400">{stat.suffix}</span>
                )}
              </div>
              {stat.change && (
                <div className={`flex items-center gap-1 mt-2 ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                  {isPositive ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span className="text-sm font-medium">{stat.change}</span>
                  <span className="text-xs text-gray-400">24h</span>
                </div>
              )}
              {stat.score && (
                <div className="mt-3">
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getScoreBgColor(stat.score)} transition-all duration-500`}
                      style={{ width: `${stat.score}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
            <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
