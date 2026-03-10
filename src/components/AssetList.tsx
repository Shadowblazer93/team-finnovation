'use client';

import { formatCurrency, formatPercent, getCategoryColor, getCategoryLabel } from '@/lib/utils';
import { useSettings } from '@/components/SettingsProvider';
import { TrendingUp, TrendingDown, ExternalLink, ChevronDown, Filter, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Asset, AssetCategory } from '@/types';

type AssetListProps = {
  assets: Asset[];
  isLoading?: boolean;
  onAddAsset?: () => void;
};

export default function AssetList({ assets, isLoading = false, onAddAsset }: AssetListProps) {
  const { defaultCurrency } = useSettings();
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<'value' | 'change'>('value');

  const filteredAssets = useMemo(() => {
    return assets
      .filter(asset => selectedCategory === 'all' || asset.category === selectedCategory)
      .sort((a, b) => {
        if (sortBy === 'value') return b.value - a.value;
        return b.changePercent - a.changePercent;
      });
  }, [assets, selectedCategory, sortBy]);

  const categories: (AssetCategory | 'all')[] = [
    'all',
    'stocks',
    'bonds',
    'real_estate',
    'crypto',
    'cash',
    'private_equity',
    'commodities',
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Wealth Wallet</h2>
            <p className="text-sm text-gray-500">All your assets in one place</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as AssetCategory | 'all')}
                className="appearance-none pl-3 pr-8 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white cursor-pointer"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Assets' : getCategoryLabel(cat)}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
            <button
              onClick={() => setSortBy(sortBy === 'value' ? 'change' : 'value')}
              className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
            >
              <Filter className="w-4 h-4" />
              {sortBy === 'value' ? 'By Value' : 'By Change'}
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="p-10 text-center text-sm text-gray-500">Loading your assets...</div>
        ) : filteredAssets.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-base font-semibold text-gray-900">No assets yet</p>
            <p className="text-sm text-gray-500 mt-2">Add your holdings to see them appear here.</p>
            {onAddAsset && (
              <button
                onClick={onAddAsset}
                className="inline-flex items-center gap-2 mt-5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add your first asset
              </button>
            )}
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Asset</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Category</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Value</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">24h Change</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Platform</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAssets.map((asset) => {
                const isPositive = asset.changePercent >= 0;
                const changeBarWidth = Math.min(Math.abs(asset.changePercent), 10) * 10;
                return (
                  <tr key={asset.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-semibold text-sm"
                          style={{ backgroundColor: getCategoryColor(asset.category) }}
                        >
                          {asset.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{asset.name}</p>
                          <p className="text-xs text-gray-500">{defaultCurrency}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: `${getCategoryColor(asset.category)}15`,
                          color: getCategoryColor(asset.category),
                        }}
                      >
                        {getCategoryLabel(asset.category)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(asset.value, defaultCurrency)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className={`flex items-center justify-end gap-1 ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                        {isPositive ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        <span className="font-medium">{formatPercent(asset.changePercent)}</span>
                      </div>
                      <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`${isPositive ? 'bg-emerald-500' : 'bg-red-500'} h-full transition-all`}
                          style={{ width: `${changeBarWidth}%` }}
                        />
                      </div>
                      <div className={`mt-1 text-xs font-medium ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                        {formatPercent(asset.changePercent)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 text-gray-500">
                        <span className="text-sm">{asset.platform || '—'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="p-4 border-t border-gray-100 bg-gray-50">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">
            Showing {filteredAssets.length} of {assets.length} assets
          </span>
          <button className="text-indigo-600 font-medium hover:text-indigo-700 transition-colors">
            View All Assets →
          </button>
        </div>
      </div>
    </div>
  );
}
