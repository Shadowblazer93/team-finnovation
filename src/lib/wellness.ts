import type { Asset, AssetCategory, WellnessMetric } from '@/types';
import { getScoreStatus } from '@/lib/utils';

type HealthIndicatorResult = {
  overallScore: number;
  healthIndicators: WellnessMetric[];
};

export type NotificationItem = {
  id: string;
  severity: 'alert' | 'suggestion';
  metric: string;
  score: number;
  description: string;
  recommendation?: string;
};

const liquidCategories: AssetCategory[] = ['cash', 'stocks', 'bonds', 'crypto', 'commodities'];

export function buildHealthIndicators(assets: Asset[]): HealthIndicatorResult {
  const hasAssets = assets.length > 0;
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

  const liquidValue = assets
    .filter(asset => liquidCategories.includes(asset.category))
    .reduce((sum, asset) => sum + asset.value, 0);
  const liquidityRatio = totalValue > 0 ? liquidValue / totalValue : 0;
  const liquidityScore = liquidityRatio * 100;

  const maxCategoryShare = totalValue > 0
    ? Math.max(...Object.values(totalsByCategory).map(value => value / totalValue))
    : 0;
  const concentrationScore = Math.max(0, 100 - maxCategoryShare * 100);

  const cashValue = totalsByCategory.cash ?? 0;
  const cashRatio = totalValue > 0 ? cashValue / totalValue : 0;
  const cashScore = Math.min(cashRatio / 0.2, 1) * 100;

  const overallScore = hasAssets
    ? Math.round(
        (diversificationScore + liquidityScore + concentrationScore + cashScore) / 4
      )
    : 0;

  const displayDiversificationScore = hasAssets ? Math.round(diversificationScore) : 0;
  const displayLiquidityScore = hasAssets ? Math.round(liquidityScore) : 0;
  const displayConcentrationScore = hasAssets ? Math.round(concentrationScore) : 0;
  const displayCashScore = hasAssets ? Math.round(cashScore) : 0;

  const healthIndicators: WellnessMetric[] = [
    {
      name: 'Portfolio Diversification',
      score: displayDiversificationScore,
      status: getScoreStatus(displayDiversificationScore),
      trend: 'stable',
      description: hasAssets
        ? `Spread across ${categoryCount} asset class${categoryCount === 1 ? '' : 'es'}.`
        : 'No assets added yet.',
      recommendations:
        !hasAssets
          ? ['Add assets to start tracking your portfolio.']
          : diversificationScore < 70
          ? ['Add exposure to underrepresented asset classes.']
          : ['Maintain current diversification targets.'],
    },
    {
      name: 'Liquidity Position',
      score: displayLiquidityScore,
      status: getScoreStatus(displayLiquidityScore),
      trend: 'stable',
      description: hasAssets
        ? `${(liquidityRatio * 100).toFixed(1)}% of assets are liquid.`
        : 'No assets added yet.',
      recommendations:
        !hasAssets
          ? ['Add assets to analyze your liquidity.']
          : liquidityRatio < 0.2
          ? ['Increase liquid holdings for short-term needs.']
          : ['Keep liquid reserves aligned with spending needs.'],
    },
    {
      name: 'Concentration Risk',
      score: displayConcentrationScore,
      status: getScoreStatus(displayConcentrationScore),
      trend: 'stable',
      description: hasAssets
        ? `${(maxCategoryShare * 100).toFixed(1)}% in the largest asset class.`
        : 'No assets added yet.',
      recommendations:
        !hasAssets
          ? ['Add assets to assess concentration risk.']
          : maxCategoryShare > 0.5
          ? ['Trim the largest allocation to reduce concentration risk.']
          : ['Concentration levels are within a healthy range.'],
    },
    {
      name: 'Cash Reserves',
      score: displayCashScore,
      status: getScoreStatus(displayCashScore),
      trend: 'stable',
      description: hasAssets
        ? `${(cashRatio * 100).toFixed(1)}% held in cash or equivalents.`
        : 'No assets added yet.',
      recommendations:
        !hasAssets
          ? ['Add cash or cash-equivalent assets to track reserves.']
          : cashRatio < 0.05
          ? ['Build an emergency fund in cash-like assets.']
          : cashRatio > 0.3
          ? ['Consider deploying excess cash into long-term growth assets.']
          : ['Cash reserves look balanced for your portfolio size.'],
    },
  ];

  return { overallScore, healthIndicators };
}

export function buildNotificationsFromIndicators(
  healthIndicators: WellnessMetric[]
): NotificationItem[] {
  const alerts = healthIndicators
    .filter(metric => metric.status === 'poor')
    .map(metric => ({
      id: `${metric.name}-alert`,
      severity: 'alert' as const,
      metric: metric.name,
      score: metric.score,
      description: metric.description,
      recommendation: metric.recommendations[0],
    }));

  const suggestions = healthIndicators
    .filter(metric => metric.status === 'fair')
    .map(metric => ({
      id: `${metric.name}-suggestion`,
      severity: 'suggestion' as const,
      metric: metric.name,
      score: metric.score,
      description: metric.description,
      recommendation: metric.recommendations[0],
    }));

  return [...alerts, ...suggestions];
}
