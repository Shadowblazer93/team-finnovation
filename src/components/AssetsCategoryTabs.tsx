'use client';

import { useMemo, useState } from 'react';
import { Asset, AssetCategory } from '@/types';
import { formatCurrency, formatPercent, getCategoryColor, getCategoryLabel } from '@/lib/utils';
import { MoreHorizontal } from 'lucide-react';

const tabs: Array<AssetCategory | 'overview'> = [
  'overview',
  'stocks',
  'bonds',
  'real_estate',
  'private_equity',
  'crypto',
  'cash',
  'commodities',
];

type AssetsCategoryTabsProps = {
  assets: Asset[];
  isLoading?: boolean;
  onOpenAssetMenu?: (asset: Asset) => void;
};

export default function AssetsCategoryTabs({
  assets,
  isLoading = false,
  onOpenAssetMenu,
}: AssetsCategoryTabsProps) {
  const [activeTab, setActiveTab] = useState<AssetCategory | 'overview'>('overview');

  const filteredAssets = useMemo(() => {
    if (activeTab === 'overview') {
      return [...assets].sort((a, b) => b.value - a.value).slice(0, 5);
    }
    return assets.filter(asset => asset.category === activeTab);
  }, [assets, activeTab]);

  const activeLabel = activeTab === 'overview' ? 'Overview' : getCategoryLabel(activeTab);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 pt-5">
        <div className="flex flex-wrap gap-2 rounded-2xl bg-gray-100 p-2">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {tab === 'overview' ? 'Overview' : getCategoryLabel(tab)}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{activeLabel} Ledger</h2>
          <p className="text-sm text-gray-500">
            {activeTab === 'overview'
              ? 'Your top 5 holdings by value.'
              : 'Track every holding in this category.'}
          </p>
        </div>
        <span className="text-sm text-gray-500">
          {filteredAssets.length} asset{filteredAssets.length === 1 ? '' : 's'}
        </span>
      </div>

      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="p-10 text-center text-sm text-gray-500">Loading assets...</div>
        ) : filteredAssets.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-500">
            {activeTab === 'overview'
              ? 'Add assets to see your top holdings here.'
              : 'No assets added for this category yet.'}
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-y border-gray-100">
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Asset</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Holdings</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Platform</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Updated</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Value</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Menu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAssets.map(asset => (
                <tr key={asset.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {asset.logoUrl ? (
                        <img src={asset.logoUrl} alt="" className="w-10 h-10 rounded-xl" />
                      ) : (
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-semibold text-sm"
                          style={{ backgroundColor: getCategoryColor(asset.category) }}
                        >
                          {asset.name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{asset.name}</p>
                        {asset.symbol && (
                          <p className="text-xs text-gray-500 uppercase">{asset.symbol}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {asset.quantity && asset.symbol ? (
                      <span className="text-sm text-gray-700">
                        {asset.quantity} {asset.symbol}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-500">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm text-gray-600">{asset.platform || '—'}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm text-gray-500">
                      {new Date(asset.lastUpdated).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-base font-semibold text-gray-900">{formatCurrency(asset.value)}</span>
                    <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`${asset.changePercent >= 0 ? 'bg-emerald-500' : 'bg-red-500'} h-full transition-all`}
                        style={{ width: `${Math.min(Math.abs(asset.changePercent), 10) * 10}%` }}
                      />
                    </div>
                    <div
                      className={`mt-1 text-xs font-medium ${
                        asset.changePercent >= 0 ? 'text-emerald-600' : 'text-red-600'
                      }`}
                    >
                      {formatPercent(asset.changePercent)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => onOpenAssetMenu?.(asset)}
                      className="inline-flex items-center justify-center w-10 h-10 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
                      aria-label="Open asset menu"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
