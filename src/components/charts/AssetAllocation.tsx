'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency, getCategoryColor, getCategoryLabel } from '@/lib/utils';
import type { Asset, AssetCategory } from '@/types';

type AssetAllocationProps = {
  assets: Asset[];
};

export default function AssetAllocation({ assets }: AssetAllocationProps) {
  const totalsByCategory = assets.reduce<Record<AssetCategory, number>>((acc, asset) => {
    acc[asset.category] = (acc[asset.category] ?? 0) + asset.value;
    return acc;
  }, {} as Record<AssetCategory, number>);

  const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);
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

  const data = Object.entries(totalsByCategory).map(([category, value]) => {
    const percent = totalValue > 0 ? (value / totalValue) * 100 : 0;
    return {
      name: getCategoryLabel(category as AssetCategory),
      value,
      percentage: percent,
      color: getCategoryColor(category as AssetCategory),
    };
  });

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: typeof data[0] }> }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white px-4 py-3 rounded-xl shadow-lg border border-gray-100">
          <p className="font-semibold text-gray-900">{item.name}</p>
          <p className="text-sm text-gray-600">{formatCurrency(item.value)}</p>
          <p className="text-sm text-gray-500">{item.percentage.toFixed(1)}% of portfolio</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Asset Allocation</h2>
          <p className="text-sm text-gray-500">Portfolio distribution by asset class</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Diversification Score:</span>
          <span className="text-lg font-bold text-blue-600">
            {Math.round(diversificationScore)}
          </span>
        </div>
      </div>
      
      <div className="h-[300px]" style={{ minWidth: 0, minHeight: 0 }}>
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-gray-500">
            Add assets to see allocation.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <div className="min-w-0">
              <p className="text-xs text-gray-600 truncate">{item.name}</p>
              <p className="text-sm font-medium text-gray-900">{item.percentage.toFixed(1)}%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
