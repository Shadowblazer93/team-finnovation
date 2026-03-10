import { 
  Asset, 
  Portfolio, 
  FinancialWellness, 
  Recommendation, 
  Scenario, 
  HistoricalDataPoint,
  UserProfile 
} from '@/types';

export const mockUser: UserProfile = {
  id: '1',
  name: 'Sarah Johnson',
  email: 'sarah.johnson@email.com',
  riskTolerance: 'moderate',
  investmentHorizon: 'long',
  financialGoals: ['Retirement', 'Children Education', 'Wealth Preservation'],
};

export const mockAssets: Asset[] = [
  // Stocks
  { id: '1', name: 'Apple Inc.', category: 'stocks', value: 125000, currency: 'USD', change24h: 2500, changePercent: 2.04, lastUpdated: new Date(), platform: 'Fidelity' },
  { id: '2', name: 'Microsoft Corp.', category: 'stocks', value: 98000, currency: 'USD', change24h: -1200, changePercent: -1.21, lastUpdated: new Date(), platform: 'Fidelity' },
  { id: '3', name: 'S&P 500 ETF', category: 'stocks', value: 250000, currency: 'USD', change24h: 3750, changePercent: 1.52, lastUpdated: new Date(), platform: 'Vanguard' },
  { id: '4', name: 'International Equity Fund', category: 'stocks', value: 75000, currency: 'USD', change24h: 900, changePercent: 1.21, lastUpdated: new Date(), platform: 'Schwab' },
  
  // Bonds
  { id: '5', name: 'US Treasury Bonds', category: 'bonds', value: 150000, currency: 'USD', change24h: 150, changePercent: 0.1, lastUpdated: new Date(), platform: 'Treasury Direct' },
  { id: '6', name: 'Corporate Bond Fund', category: 'bonds', value: 80000, currency: 'USD', change24h: -200, changePercent: -0.25, lastUpdated: new Date(), platform: 'Vanguard' },
  { id: '7', name: 'Municipal Bonds', category: 'bonds', value: 60000, currency: 'USD', change24h: 60, changePercent: 0.1, lastUpdated: new Date(), platform: 'Fidelity' },
  
  // Real Estate
  { id: '8', name: 'Primary Residence', category: 'real_estate', value: 850000, currency: 'USD', change24h: 0, changePercent: 0, lastUpdated: new Date(), platform: 'Direct Ownership' },
  { id: '9', name: 'Rental Property', category: 'real_estate', value: 425000, currency: 'USD', change24h: 0, changePercent: 0, lastUpdated: new Date(), platform: 'Direct Ownership' },
  { id: '10', name: 'REIT Fund', category: 'real_estate', value: 45000, currency: 'USD', change24h: 675, changePercent: 1.52, lastUpdated: new Date(), platform: 'Schwab' },
  
  // Crypto
  { id: '11', name: 'Bitcoin', category: 'crypto', value: 85000, currency: 'USD', change24h: 4250, changePercent: 5.26, lastUpdated: new Date(), platform: 'Coinbase' },
  { id: '12', name: 'Ethereum', category: 'crypto', value: 42000, currency: 'USD', change24h: 2100, changePercent: 5.26, lastUpdated: new Date(), platform: 'Coinbase' },
  { id: '13', name: 'Solana', category: 'crypto', value: 15000, currency: 'USD', change24h: -750, changePercent: -4.76, lastUpdated: new Date(), platform: 'Binance' },
  
  // Cash
  { id: '14', name: 'Savings Account', category: 'cash', value: 75000, currency: 'USD', change24h: 0, changePercent: 0, lastUpdated: new Date(), platform: 'Chase Bank' },
  { id: '15', name: 'Money Market', category: 'cash', value: 50000, currency: 'USD', change24h: 0, changePercent: 0, lastUpdated: new Date(), platform: 'Fidelity' },
  { id: '16', name: 'High-Yield Savings', category: 'cash', value: 35000, currency: 'USD', change24h: 0, changePercent: 0, lastUpdated: new Date(), platform: 'Marcus' },
  
  // Private Equity
  { id: '17', name: 'Startup Investment A', category: 'private_equity', value: 50000, currency: 'USD', change24h: 0, changePercent: 0, lastUpdated: new Date(), platform: 'AngelList' },
  { id: '18', name: 'PE Fund LP', category: 'private_equity', value: 100000, currency: 'USD', change24h: 0, changePercent: 0, lastUpdated: new Date(), platform: 'KKR' },
  
  // Commodities
  { id: '19', name: 'Gold Holdings', category: 'commodities', value: 35000, currency: 'USD', change24h: 350, changePercent: 1.01, lastUpdated: new Date(), platform: 'APMEX' },
  { id: '20', name: 'Silver Holdings', category: 'commodities', value: 8000, currency: 'USD', change24h: -80, changePercent: -0.99, lastUpdated: new Date(), platform: 'APMEX' },
  
  // Alternatives
  { id: '21', name: 'Art Collection', category: 'alternatives', value: 75000, currency: 'USD', change24h: 0, changePercent: 0, lastUpdated: new Date(), platform: 'Masterworks' },
  { id: '22', name: 'Wine Investment', category: 'alternatives', value: 25000, currency: 'USD', change24h: 0, changePercent: 0, lastUpdated: new Date(), platform: 'Vinovest' },
];

export const mockPortfolios: Portfolio[] = [
  {
    id: 'p1',
    name: 'Traditional Investments',
    type: 'traditional',
    assets: mockAssets.filter(a => ['stocks', 'bonds', 'cash'].includes(a.category)),
    totalValue: 998000,
    institution: 'Multiple Brokerages'
  },
  {
    id: 'p2',
    name: 'Real Estate Holdings',
    type: 'private',
    assets: mockAssets.filter(a => a.category === 'real_estate'),
    totalValue: 1320000,
    institution: 'Direct + REITs'
  },
  {
    id: 'p3',
    name: 'Digital Assets',
    type: 'digital',
    assets: mockAssets.filter(a => a.category === 'crypto'),
    totalValue: 142000,
    institution: 'Multiple Exchanges'
  },
  {
    id: 'p4',
    name: 'Alternative Investments',
    type: 'private',
    assets: mockAssets.filter(a => ['private_equity', 'commodities', 'alternatives'].includes(a.category)),
    totalValue: 293000,
    institution: 'Various Platforms'
  }
];

export const mockFinancialWellness: FinancialWellness = {
  overallScore: 78,
  diversification: {
    overallScore: 82,
    assetClassDistribution: [
      { category: 'stocks', percentage: 19.9, value: 548000 },
      { category: 'bonds', percentage: 10.5, value: 290000 },
      { category: 'real_estate', percentage: 47.9, value: 1320000 },
      { category: 'crypto', percentage: 5.2, value: 142000 },
      { category: 'cash', percentage: 5.8, value: 160000 },
      { category: 'private_equity', percentage: 5.4, value: 150000 },
      { category: 'commodities', percentage: 1.6, value: 43000 },
      { category: 'alternatives', percentage: 3.6, value: 100000 },
    ],
    geographicDistribution: [
      { region: 'North America', percentage: 72 },
      { region: 'Europe', percentage: 12 },
      { region: 'Asia Pacific', percentage: 10 },
      { region: 'Emerging Markets', percentage: 6 },
    ],
    sectorDistribution: [
      { sector: 'Technology', percentage: 28 },
      { sector: 'Financial Services', percentage: 18 },
      { sector: 'Healthcare', percentage: 14 },
      { sector: 'Consumer Goods', percentage: 12 },
      { sector: 'Real Estate', percentage: 15 },
      { sector: 'Energy', percentage: 8 },
      { sector: 'Other', percentage: 5 },
    ],
    concentrationRisk: 35,
  },
  liquidity: {
    score: 72,
    liquidAssets: 450000,
    illiquidAssets: 2303000,
    liquidityRatio: 0.16,
    emergencyFundMonths: 18,
    recommendations: [
      'Consider increasing liquid assets to 20% of portfolio',
      'Maintain 6-12 months of expenses in emergency fund',
      'Review illiquid investment lock-up periods'
    ]
  },
  behavioralResilience: {
    score: 75,
    volatilityTolerance: 68,
    rebalancingFrequency: 'Quarterly',
    emotionalBiasScore: 72,
    decisionConsistency: 80,
    recommendations: [
      'Continue systematic rebalancing approach',
      'Consider automated investment strategies',
      'Review investment decisions during market volatility'
    ]
  },
  healthIndicators: [
    {
      name: 'Portfolio Diversification',
      score: 82,
      status: 'good',
      trend: 'up',
      description: 'Well-diversified across asset classes with room for improvement in international exposure',
      recommendations: ['Increase international equity allocation', 'Consider adding emerging market bonds']
    },
    {
      name: 'Risk-Adjusted Returns',
      score: 76,
      status: 'good',
      trend: 'stable',
      description: 'Portfolio delivers solid returns relative to risk taken',
      recommendations: ['Monitor Sharpe ratio quarterly', 'Consider low-correlation alternatives']
    },
    {
      name: 'Liquidity Position',
      score: 72,
      status: 'good',
      trend: 'down',
      description: 'Adequate liquidity but trending lower due to recent private investments',
      recommendations: ['Maintain current cash reserves', 'Plan for upcoming capital calls']
    },
    {
      name: 'Tax Efficiency',
      score: 68,
      status: 'fair',
      trend: 'stable',
      description: 'Opportunities exist to improve tax-loss harvesting and asset location',
      recommendations: ['Implement tax-loss harvesting strategy', 'Review asset location across accounts']
    },
    {
      name: 'Goal Alignment',
      score: 85,
      status: 'excellent',
      trend: 'up',
      description: 'Portfolio is well-aligned with long-term financial goals',
      recommendations: ['Continue current savings rate', 'Review goals annually']
    }
  ],
  lastAssessment: new Date()
};

export const mockRecommendations: Recommendation[] = [
  {
    id: 'r1',
    type: 'opportunity',
    priority: 'high',
    title: 'Rebalancing Opportunity',
    description: 'Real estate allocation has drifted above target. Consider rebalancing to maintain risk profile.',
    impact: 'Potential to reduce portfolio risk by 8% while maintaining expected returns',
    actionItems: [
      'Review current real estate allocation (47.9% vs 40% target)',
      'Consider trimming REIT position',
      'Reallocate proceeds to underweight international equities'
    ],
    relatedMetric: 'Portfolio Diversification'
  },
  {
    id: 'r2',
    type: 'action',
    priority: 'high',
    title: 'Tax-Loss Harvesting Available',
    description: 'Several positions show unrealized losses that could offset gains.',
    impact: 'Estimated tax savings of $3,500 - $5,000',
    actionItems: [
      'Review Solana position (-4.76% today)',
      'Consider harvesting loss and replacing with similar exposure',
      'Document transactions for tax reporting'
    ],
    relatedMetric: 'Tax Efficiency'
  },
  {
    id: 'r3',
    type: 'insight',
    priority: 'medium',
    title: 'Crypto Allocation Above Target',
    description: 'Digital assets now represent 5.2% of portfolio, above the 3% target for moderate risk profile.',
    impact: 'Higher volatility exposure than intended',
    actionItems: [
      'Review crypto allocation strategy',
      'Consider taking profits on recent gains',
      'Evaluate stablecoin alternatives for yield'
    ],
    relatedMetric: 'Behavioral Resilience'
  },
  {
    id: 'r4',
    type: 'warning',
    priority: 'medium',
    title: 'Concentration Risk in Technology',
    description: 'Technology sector represents 28% of equity holdings, creating concentration risk.',
    impact: 'Portfolio vulnerable to tech sector corrections',
    actionItems: [
      'Diversify into defensive sectors',
      'Consider sector-rotation strategy',
      'Add healthcare and consumer staples exposure'
    ],
    relatedMetric: 'Portfolio Diversification'
  },
  {
    id: 'r5',
    type: 'opportunity',
    priority: 'low',
    title: 'International Diversification',
    description: 'Portfolio is underweight international equities relative to global market cap.',
    impact: 'Improved diversification and access to growth markets',
    actionItems: [
      'Research international ETF options',
      'Consider 15-20% allocation to developed international',
      'Evaluate emerging market exposure'
    ],
    relatedMetric: 'Portfolio Diversification'
  }
];

export const mockScenarios: Scenario[] = [
  {
    id: 's1',
    name: 'Market Correction (-20%)',
    description: 'Simulates a moderate market correction affecting equity and crypto assets',
    type: 'market_crash',
    projectedImpact: -312000,
    riskLevel: 'high',
    recommendations: [
      'Current diversification provides partial protection',
      'Bond allocation would help stabilize portfolio',
      'Consider increasing cash position if risk tolerance changes'
    ]
  },
  {
    id: 's2',
    name: 'High Inflation Scenario',
    description: 'Models impact of sustained 6%+ inflation on portfolio purchasing power',
    type: 'inflation',
    projectedImpact: -89000,
    riskLevel: 'medium',
    recommendations: [
      'Real estate holdings provide inflation hedge',
      'Consider TIPS allocation increase',
      'Commodities exposure helpful but limited'
    ]
  },
  {
    id: 's3',
    name: 'Recession Scenario',
    description: 'Economic recession with rising unemployment and reduced consumer spending',
    type: 'recession',
    projectedImpact: -245000,
    riskLevel: 'high',
    recommendations: [
      'Bond allocation provides stability',
      'Review emergency fund adequacy',
      'Consider defensive sector rotation'
    ]
  },
  {
    id: 's4',
    name: 'Bull Market Continuation',
    description: 'Extended bull market with strong equity performance',
    type: 'bull_market',
    projectedImpact: 425000,
    riskLevel: 'low',
    recommendations: [
      'Stay invested and maintain discipline',
      'Consider rebalancing if allocations drift',
      'Take some profits at predetermined targets'
    ]
  }
];

export const mockHistoricalData: HistoricalDataPoint[] = [
  { date: '2025-03', totalValue: 2150000, wellnessScore: 71 },
  { date: '2025-04', totalValue: 2220000, wellnessScore: 72 },
  { date: '2025-05', totalValue: 2180000, wellnessScore: 71 },
  { date: '2025-06', totalValue: 2310000, wellnessScore: 73 },
  { date: '2025-07', totalValue: 2380000, wellnessScore: 74 },
  { date: '2025-08', totalValue: 2420000, wellnessScore: 75 },
  { date: '2025-09', totalValue: 2350000, wellnessScore: 74 },
  { date: '2025-10', totalValue: 2480000, wellnessScore: 76 },
  { date: '2025-11', totalValue: 2550000, wellnessScore: 77 },
  { date: '2025-12', totalValue: 2620000, wellnessScore: 77 },
  { date: '2026-01', totalValue: 2680000, wellnessScore: 78 },
  { date: '2026-02', totalValue: 2720000, wellnessScore: 78 },
  { date: '2026-03', totalValue: 2753000, wellnessScore: 78 },
];

export const getTotalPortfolioValue = (): number => {
  return mockAssets.reduce((sum, asset) => sum + asset.value, 0);
};

export const get24hChange = (): { value: number; percent: number } => {
  const totalChange = mockAssets.reduce((sum, asset) => sum + asset.change24h, 0);
  const totalValue = getTotalPortfolioValue();
  return {
    value: totalChange,
    percent: (totalChange / (totalValue - totalChange)) * 100
  };
};
