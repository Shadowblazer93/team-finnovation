'use client';

import { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Building2, 
  Bitcoin, 
  BarChart3, 
  Sparkles,
  Target,
  PieChart,
  AlertCircle,
  Plus,
  Loader2,
  Shield,
  Wallet,
  Landmark,
  Gem,
  DollarSign,
  CheckCircle2
} from 'lucide-react';
import type { Asset, AssetCategory } from '@/types';

interface AssetBrowserProps {
  assets: Asset[];
  onAddAsset?: () => void;
}

interface RecommendedAsset {
  symbol: string;
  name: string;
  type: string;
  logoUrl?: string;
  reason: string;
}

interface CategoryRecommendation {
  category: AssetCategory;
  categoryLabel: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  priority: 'high' | 'medium' | 'low';
  reason: string;
  suggestedAllocation: string;
  currentAllocation: number;
  assets: RecommendedAsset[];
}

// Asset data for recommendations
const stocksData: RecommendedAsset[] = [
  { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', type: 'ETF', reason: 'Broad market exposure' },
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF', type: 'ETF', reason: 'Large-cap US stocks' },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust', type: 'ETF', reason: 'Tech-focused growth' },
  { symbol: 'VIG', name: 'Vanguard Dividend Appreciation', type: 'ETF', reason: 'Dividend growth' },
  { symbol: 'SCHD', name: 'Schwab US Dividend Equity', type: 'ETF', reason: 'High dividend yield' },
];

const cryptoData: RecommendedAsset[] = [
  { symbol: 'BTC', name: 'Bitcoin', type: 'Layer 1', logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1.png', reason: 'Digital gold, store of value' },
  { symbol: 'ETH', name: 'Ethereum', type: 'Layer 1', logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png', reason: 'Smart contract platform' },
  { symbol: 'SOL', name: 'Solana', type: 'Layer 1', logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5426.png', reason: 'High-speed blockchain' },
];

const realEstateData: RecommendedAsset[] = [
  { symbol: 'VNQ', name: 'Vanguard Real Estate ETF', type: 'REIT ETF', reason: 'Diversified REIT exposure' },
  { symbol: 'SCHH', name: 'Schwab U.S. REIT ETF', type: 'REIT ETF', reason: 'Low-cost REIT access' },
  { symbol: 'O', name: 'Realty Income Corp', type: 'Retail REIT', reason: 'Monthly dividends' },
];

const bondsData: RecommendedAsset[] = [
  { symbol: 'BND', name: 'Vanguard Total Bond Market', type: 'Bond ETF', reason: 'Broad bond exposure' },
  { symbol: 'AGG', name: 'iShares Core US Aggregate Bond', type: 'Bond ETF', reason: 'Investment-grade bonds' },
  { symbol: 'TLT', name: 'iShares 20+ Year Treasury', type: 'Treasury ETF', reason: 'Long-term treasuries' },
];

const commoditiesData: RecommendedAsset[] = [
  { symbol: 'GLD', name: 'SPDR Gold Shares', type: 'Gold ETF', reason: 'Gold exposure, inflation hedge' },
  { symbol: 'SLV', name: 'iShares Silver Trust', type: 'Silver ETF', reason: 'Silver exposure' },
  { symbol: 'IAU', name: 'iShares Gold Trust', type: 'Gold ETF', reason: 'Low-cost gold access' },
];

const cashData: RecommendedAsset[] = [
  { symbol: 'VMFXX', name: 'Vanguard Federal Money Market', type: 'Money Market', reason: 'High-yield cash parking' },
  { symbol: 'SPAXX', name: 'Fidelity Government Money Market', type: 'Money Market', reason: 'Liquid cash reserve' },
];

const categoryConfig: Record<AssetCategory, { label: string; icon: React.ElementType; color: string; bgColor: string; borderColor: string; data: RecommendedAsset[] }> = {
  stocks: { label: 'Stocks', icon: TrendingUp, color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', data: stocksData },
  crypto: { label: 'Cryptocurrency', icon: Bitcoin, color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200', data: cryptoData },
  real_estate: { label: 'Real Estate', icon: Building2, color: 'text-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200', data: realEstateData },
  bonds: { label: 'Bonds', icon: Landmark, color: 'text-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-200', data: bondsData },
  commodities: { label: 'Commodities', icon: Gem, color: 'text-amber-600', bgColor: 'bg-amber-50', borderColor: 'border-amber-200', data: commoditiesData },
  cash: { label: 'Cash & Equivalents', icon: DollarSign, color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200', data: cashData },
  private_equity: { label: 'Private Equity', icon: Wallet, color: 'text-indigo-600', bgColor: 'bg-indigo-50', borderColor: 'border-indigo-200', data: [] },
  alternatives: { label: 'Alternatives', icon: BarChart3, color: 'text-pink-600', bgColor: 'bg-pink-50', borderColor: 'border-pink-200', data: [] },
};

// Generate personalized recommendations based on portfolio
function generatePersonalizedRecommendations(assets: Asset[]): CategoryRecommendation[] {
  const recommendations: CategoryRecommendation[] = [];
  
  const totalValue = assets.reduce((sum, a) => sum + a.value, 0);
  const categoryTotals: Record<string, number> = {};
  
  // Calculate current allocations
  assets.forEach(asset => {
    categoryTotals[asset.category] = (categoryTotals[asset.category] || 0) + asset.value;
  });
  
  const getPercentage = (cat: string) => totalValue > 0 ? (categoryTotals[cat] || 0) / totalValue * 100 : 0;
  
  // Analyze and recommend based on gaps
  const categories: AssetCategory[] = ['stocks', 'bonds', 'real_estate', 'crypto', 'cash', 'commodities'];
  
  categories.forEach(category => {
    const config = categoryConfig[category];
    const currentPct = getPercentage(category);
    const hasCategory = currentPct > 0;
    
    let priority: 'high' | 'medium' | 'low' = 'low';
    let reason = '';
    let suggestedAllocation = '';
    let shouldRecommend = false;
    
    switch (category) {
      case 'stocks':
        if (currentPct < 20) {
          priority = currentPct === 0 ? 'high' : 'medium';
          reason = currentPct === 0 
            ? 'Stocks are essential for long-term wealth building. Add equity exposure for growth.'
            : `Only ${currentPct.toFixed(1)}% in stocks. Consider increasing for better growth potential.`;
          suggestedAllocation = '30-60% of portfolio';
          shouldRecommend = true;
        }
        break;
        
      case 'bonds':
        if (currentPct === 0 && totalValue > 50000) {
          priority = 'medium';
          reason = 'Bonds provide stability and income. Important for risk management as portfolio grows.';
          suggestedAllocation = '10-30% of portfolio';
          shouldRecommend = true;
        }
        break;
        
      case 'real_estate':
        if (currentPct === 0 && totalValue > 25000) {
          priority = 'low';
          reason = 'Real estate provides income and inflation protection through REITs.';
          suggestedAllocation = '5-15% of portfolio';
          shouldRecommend = true;
        }
        break;
        
      case 'crypto':
        if (currentPct === 0 && totalValue > 10000) {
          priority = 'low';
          reason = 'A small crypto allocation can enhance diversification and growth potential.';
          suggestedAllocation = '2-5% of portfolio';
          shouldRecommend = true;
        } else if (currentPct > 20) {
          // Don't recommend more crypto if already high
          shouldRecommend = false;
        }
        break;
        
      case 'cash':
        if (currentPct < 5 && totalValue > 10000) {
          priority = 'high';
          reason = 'Emergency fund is critical. Keep 3-6 months expenses in liquid savings.';
          suggestedAllocation = '5-15% of portfolio';
          shouldRecommend = true;
        }
        break;
        
      case 'commodities':
        if (currentPct === 0 && totalValue > 100000) {
          priority = 'low';
          reason = 'Gold and commodities can hedge against inflation and market volatility.';
          suggestedAllocation = '3-10% of portfolio';
          shouldRecommend = true;
        }
        break;
    }
    
    if (shouldRecommend && config.data.length > 0) {
      recommendations.push({
        category,
        categoryLabel: config.label,
        icon: config.icon,
        color: config.color,
        bgColor: config.bgColor,
        borderColor: config.borderColor,
        priority,
        reason,
        suggestedAllocation,
        currentAllocation: currentPct,
        assets: config.data.slice(0, 3),
      });
    }
  });
  
  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  
  return recommendations;
}

const priorityBadgeColors = {
  high: 'bg-red-100 text-red-700 border-red-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  low: 'bg-blue-100 text-blue-700 border-blue-200',
};

export default function AssetBrowser({ assets, onAddAsset }: AssetBrowserProps) {
  const recommendations = useMemo(() => generatePersonalizedRecommendations(assets), [assets]);
  
  // Calculate portfolio stats
  const totalValue = assets.reduce((sum, a) => sum + a.value, 0);
  const categoryCount = new Set(assets.map(a => a.category)).size;
  
  // Calculate diversification score
  const diversificationScore = useMemo(() => {
    if (assets.length === 0) return 0;
    const categoryTotals: Record<string, number> = {};
    assets.forEach(a => {
      categoryTotals[a.category] = (categoryTotals[a.category] || 0) + a.value;
    });
    const categories = Object.keys(categoryTotals);
    if (categories.length <= 1) return Math.round(categories.length * 15);
    
    const maxPct = Math.max(...Object.values(categoryTotals).map(v => v / totalValue * 100));
    const baseScore = (categories.length / 6) * 100;
    const concentrationPenalty = Math.max(0, maxPct - 30);
    return Math.round(Math.min(100, baseScore - concentrationPenalty));
  }, [assets, totalValue]);

  if (assets.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-indigo-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Personalized Asset Recommendations</h2>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            Add assets to your portfolio to receive AI-powered recommendations tailored to your holdings and financial goals.
          </p>
          <button
            onClick={onAddAsset}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Your First Asset
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Personalized Recommendations</h2>
            <p className="text-sm text-gray-500">AI-powered suggestions based on your portfolio</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            For You
          </div>
        </div>

        {/* Diversification Explanation */}
        <div className="mb-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
          <h3 className="text-lg font-semibold text-indigo-700 mb-2">What is Diversification?</h3>
          <p className="text-sm text-gray-700 mb-2">
            Diversification measures how well your portfolio is balanced across different asset classes (stocks, crypto, real estate, bonds, etc.).
          </p>
          <div className="text-xs text-gray-500 mb-2">
            <p>
              <strong>How is it calculated?</strong> The score considers:
            </p>
            <ul className="list-disc ml-6 mt-1">
              <li>The number of asset classes you hold</li>
              <li>How much of your portfolio is concentrated in any single category</li>
            </ul>
            <p className="mt-2">
              A higher score means your investments are spread out, reducing risk. A lower score means your portfolio is concentrated, which can increase risk.
            </p>
          </div>
          <p className="text-xs text-gray-400">
            Formula: <code>(Number of asset classes / 6) × 100 - penalty for concentration &gt; 30% in one class</code>
          </p>
        </div>

        {/* Portfolio Summary */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-linear-to-r from-indigo-50 to-purple-50 rounded-xl">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{categoryCount}</div>
            <div className="text-xs text-gray-500">Asset Classes</div>
          </div>
          <div className="text-center border-x border-gray-200">
            <div className="text-2xl font-bold text-indigo-600">{diversificationScore}</div>
            <div className="text-xs text-gray-500">Diversification</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{recommendations.length}</div>
            <div className="text-xs text-gray-500">Suggestions</div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="p-6 max-h-125 overflow-y-auto">
        {recommendations.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Well-Diversified Portfolio!</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              Your portfolio is well-balanced across asset classes. Keep monitoring and rebalancing as needed.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.map((rec) => {
              const Icon = rec.icon;
              
              return (
                <div
                  key={rec.category}
                  className={`p-4 rounded-xl border ${rec.borderColor} ${rec.bgColor}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl bg-white shadow-sm`}>
                      <Icon className={`w-6 h-6 ${rec.color}`} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{rec.categoryLabel}</h3>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${priorityBadgeColors[rec.priority]}`}>
                          {rec.priority} priority
                        </span>
                        {rec.currentAllocation > 0 && (
                          <span className="text-xs text-gray-500">
                            Currently: {rec.currentAllocation.toFixed(1)}%
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{rec.reason}</p>
                      
                      <div className="flex items-center gap-2 text-sm mb-3">
                        <Target className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-500">Suggested:</span>
                        <span className="font-medium text-gray-700">{rec.suggestedAllocation}</span>
                      </div>

                      {/* Recommended Assets */}
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-gray-500">Top Picks:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {rec.assets.map((asset) => (
                            <div
                              key={asset.symbol}
                              className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
                            >
                              {asset.logoUrl ? (
                                <img 
                                  src={asset.logoUrl} 
                                  alt={asset.name}
                                  className="w-6 h-6 rounded-full"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className={`w-6 h-6 rounded-full ${rec.bgColor} flex items-center justify-center`}>
                                  <span className={`text-xs font-bold ${rec.color}`}>{asset.symbol.slice(0, 2)}</span>
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-gray-900 truncate">{asset.symbol}</p>
                                <p className="text-xs text-gray-500 truncate">{asset.type}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
