'use client';

import { useMemo } from 'react';
import { AlertTriangle, Lightbulb, TrendingUp, Bell, ChevronRight, Sparkles, Shield } from 'lucide-react';
import { Recommendation, Asset, AssetCategory } from '@/types';

interface RecommendationsProps {
  assets: Asset[];
}

const getTypeConfig = (type: Recommendation['type']) => {
  switch (type) {
    case 'action':
      return { icon: Sparkles, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' };
    case 'insight':
      return { icon: Lightbulb, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' };
    case 'warning':
      return { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
    case 'opportunity':
      return { icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' };
    default:
      return { icon: Bell, color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' };
  }
};

const getPriorityBadge = (priority: Recommendation['priority']) => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-700';
    case 'medium':
      return 'bg-amber-100 text-amber-700';
    case 'low':
      return 'bg-gray-100 text-gray-600';
  }
};

// Generate personalized recommendations based on portfolio analysis
function generatePersonalizedRecommendations(assets: Asset[]): Recommendation[] {
  const recommendations: Recommendation[] = [];
  
  if (assets.length === 0) {
    recommendations.push({
      id: 'start-1',
      type: 'action',
      priority: 'high',
      title: 'Start Building Your Portfolio',
      description: 'Add your first assets to begin tracking your wealth and get personalized insights.',
      impact: 'Foundation for wealth tracking',
      actionItems: ['Add stocks or ETFs', 'Include your savings accounts', 'Track crypto holdings'],
    });
    return recommendations;
  }

  const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);
  const categoryTotals: Record<string, number> = {};
  const allCategories: AssetCategory[] = ['stocks', 'bonds', 'real_estate', 'crypto', 'cash', 'commodities'];
  
  allCategories.forEach(cat => { categoryTotals[cat] = 0; });
  assets.forEach(asset => {
    categoryTotals[asset.category] = (categoryTotals[asset.category] || 0) + asset.value;
  });

  const categoryPercentages: Record<string, number> = {};
  Object.keys(categoryTotals).forEach(cat => {
    categoryPercentages[cat] = totalValue > 0 ? (categoryTotals[cat] / totalValue) * 100 : 0;
  });

  const presentCategories = Object.keys(categoryTotals).filter(cat => categoryTotals[cat] > 0);
  const formatCat = (cat: string) => {
    const f: Record<string, string> = { stocks: 'Stocks', bonds: 'Bonds', real_estate: 'Real Estate', crypto: 'Crypto', cash: 'Cash', commodities: 'Commodities' };
    return f[cat] || cat;
  };

  // Check concentration risk
  Object.entries(categoryPercentages).forEach(([category, pct]) => {
    if (pct > 50) {
      recommendations.push({
        id: `concentration-${category}`,
        type: 'warning',
        priority: 'high',
        title: `High Concentration in ${formatCat(category)}`,
        description: `${pct.toFixed(1)}% of your portfolio is in ${formatCat(category)}. Consider diversifying to reduce risk.`,
        impact: 'Risk reduction',
        actionItems: [`Reduce ${formatCat(category)} to under 40%`, 'Diversify into other assets', 'Review risk tolerance'],
      });
    }
  });

  // Low diversification
  if (presentCategories.length < 3) {
    recommendations.push({
      id: 'diversification-low',
      type: 'action',
      priority: 'high',
      title: 'Improve Portfolio Diversification',
      description: `Your portfolio has only ${presentCategories.length} asset class${presentCategories.length === 1 ? '' : 'es'}. Diversification reduces risk.`,
      impact: 'Better risk-adjusted returns',
      actionItems: allCategories.filter(c => !categoryTotals[c]).slice(0, 3).map(c => `Add ${formatCat(c)}`),
    });
  }

  // Cash checks
  const cashPct = categoryPercentages.cash || 0;
  if (cashPct < 5 && totalValue > 10000) {
    recommendations.push({
      id: 'cash-low',
      type: 'warning',
      priority: 'medium',
      title: 'Low Emergency Fund',
      description: `Only ${cashPct.toFixed(1)}% in cash. Maintain 3-6 months expenses in liquid savings.`,
      impact: 'Financial security',
      actionItems: ['Build emergency fund', 'Target 5-10% cash', 'Use high-yield savings'],
    });
  } else if (cashPct > 25) {
    recommendations.push({
      id: 'cash-high',
      type: 'opportunity',
      priority: 'medium',
      title: 'Excess Cash Holding',
      description: `${cashPct.toFixed(1)}% in cash may be too conservative. Inflation erodes value over time.`,
      impact: 'Potential +3-7% returns',
      actionItems: ['Invest in index funds', 'Consider dividend stocks', 'Explore bond funds'],
    });
  }

  // Missing stocks
  if (!categoryTotals.stocks && totalValue > 10000) {
    recommendations.push({
      id: 'stocks-missing',
      type: 'action',
      priority: 'high',
      title: 'Add Stock Market Exposure',
      description: 'Stocks are essential for long-term wealth building. Consider adding equity investments.',
      impact: 'Long-term growth',
      actionItems: ['Start with ETFs (SPY, VTI)', 'Consider dividend stocks', 'Dollar-cost average'],
    });
  }

  // High crypto
  const cryptoPct = categoryPercentages.crypto || 0;
  if (cryptoPct > 15) {
    recommendations.push({
      id: 'crypto-high',
      type: 'warning',
      priority: 'high',
      title: 'High Crypto Exposure',
      description: `${cryptoPct.toFixed(1)}% in crypto is high risk. Consider rebalancing for stability.`,
      impact: 'Risk management',
      actionItems: ['Take some profits', 'Rebalance to under 10%', 'Diversify into stable assets'],
    });
  }

  // Good diversification
  if (presentCategories.length >= 4 && !recommendations.some(r => r.type === 'warning')) {
    recommendations.push({
      id: 'diversified-good',
      type: 'insight',
      priority: 'low',
      title: 'Well-Diversified Portfolio',
      description: `Great! Your portfolio spans ${presentCategories.length} asset classes with balanced allocation.`,
      impact: 'Risk management ✓',
      actionItems: ['Monitor quarterly', 'Rebalance annually', 'Stay the course'],
    });
  }

  const priorityOrder = { high: 0, medium: 1, low: 2 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  return recommendations.slice(0, 5);
}

export default function Recommendations({ assets }: RecommendationsProps) {
  const recommendations = useMemo(() => generatePersonalizedRecommendations(assets), [assets]);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Smart Recommendations</h2>
          <p className="text-sm text-gray-500">Personalized insights based on your portfolio</p>
        </div>
        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-full">
          {recommendations.length} Active
        </span>
      </div>

      {recommendations.length === 0 ? (
        <div className="text-center py-8">
          <Shield className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-1">All Good!</h3>
          <p className="text-sm text-gray-500">Your portfolio is well-optimized. Keep monitoring!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map((rec) => {
            const config = getTypeConfig(rec.type);
            const Icon = config.icon;

            return (
              <div
                key={rec.id}
                className={`group p-4 rounded-xl border ${config.border} ${config.bg} hover:shadow-md transition-all cursor-pointer`}
              >
                <div className="flex gap-4">
                  <div className={`p-2.5 rounded-xl bg-white shadow-sm`}>
                    <Icon className={`w-5 h-5 ${config.color}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{rec.title}</h3>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getPriorityBadge(rec.priority)}`}>
                            {rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-400 shrink-0" />
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-gray-500">Impact:</span>
                      <span className="font-medium text-gray-700">{rec.impact}</span>
                    </div>

                    {rec.actionItems.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200/50">
                        <p className="text-xs font-medium text-gray-500 mb-2">Quick Actions:</p>
                        <div className="flex flex-wrap gap-2">
                          {rec.actionItems.slice(0, 2).map((item: string, index: number) => (
                            <span 
                              key={index}
                              className="px-2.5 py-1 bg-white rounded-lg text-xs text-gray-600 shadow-sm"
                            >
                              {item.length > 40 ? item.substring(0, 40) + '...' : item}
                            </span>
                          ))}
                          {rec.actionItems.length > 2 && (
                            <span className="px-2.5 py-1 text-xs text-gray-500">
                              +{rec.actionItems.length - 2} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <button className="w-full mt-4 py-3 text-center text-indigo-600 font-medium hover:bg-indigo-50 rounded-xl transition-colors">
        View All Recommendations →
      </button>
    </div>
  );
}
