'use client';

import { formatCurrency, getScoreColor, getScoreBgColor } from '@/lib/utils';
import { Droplets, Clock, ShieldCheck, AlertCircle } from 'lucide-react';
import type { Asset, AssetCategory } from '@/types';

type LiquidityPanelProps = {
  assets: Asset[];
};

const liquidCategories: AssetCategory[] = ['cash', 'stocks', 'bonds', 'crypto', 'commodities'];

export default function LiquidityPanel({ assets }: LiquidityPanelProps) {
  const liquidAssets = assets
    .filter(asset => liquidCategories.includes(asset.category))
    .reduce((sum, asset) => sum + asset.value, 0);
  const totalAssets = assets.reduce((sum, asset) => sum + asset.value, 0);
  const illiquidAssets = Math.max(totalAssets - liquidAssets, 0);
  const liquidityRatio = totalAssets > 0 ? liquidAssets / totalAssets : 0;
  const liquidityScore = Math.round(liquidityRatio * 100);
  const emergencyFundMonths = liquidityRatio > 0 ? Math.round(liquidityRatio * 24) : 0;

  const recommendations = [] as string[];
  if (liquidityRatio < 0.2) {
    recommendations.push('Increase liquid holdings to cover short-term needs.');
  }
  if (liquidityRatio < 0.3) {
    recommendations.push('Build a 6-12 month emergency reserve in cash-like assets.');
  }
  if (liquidityRatio > 0.6) {
    recommendations.push('Consider deploying excess cash into long-term growth assets.');
  }
  if (recommendations.length === 0) {
    recommendations.push('Your liquidity mix looks balanced for current holdings.');
  }

  const stats = [
    {
      label: 'Liquid Assets',
      value: formatCurrency(liquidAssets),
      icon: Droplets,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Illiquid Assets',
      value: formatCurrency(illiquidAssets),
      icon: Clock,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      label: 'Liquidity Ratio',
      value: `${(liquidityRatio * 100).toFixed(1)}%`,
      icon: ShieldCheck,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Emergency Fund',
      value: `${emergencyFundMonths} months`,
      icon: AlertCircle,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Liquidity Analysis</h2>
          <p className="text-sm text-gray-500">Your ability to access funds when needed</p>
        </div>
        <div className={`text-2xl font-bold ${getScoreColor(liquidityScore)}`}>
          {liquidityScore}/100
        </div>
      </div>

      {/* Score Bar */}
      <div className="mb-6">
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full ${getScoreBgColor(liquidityScore)} transition-all duration-500`}
            style={{ width: `${liquidityScore}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {stats.map((stat) => (
          <div key={stat.label} className={`p-4 rounded-xl ${stat.bg}`}>
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
              <span className="text-xs font-medium text-gray-500">{stat.label}</span>
            </div>
            <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-3">Recommendations</p>
        <ul className="space-y-2">
          {recommendations.map((rec, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
              {rec}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
