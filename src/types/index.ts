// Asset Types
export type AssetCategory = 
  | 'stocks' 
  | 'bonds' 
  | 'real_estate' 
  | 'crypto' 
  | 'cash' 
  | 'private_equity' 
  | 'commodities'
  | 'alternatives';

export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  value: number;
  currency: string;
  change24h: number;
  changePercent: number;
  lastUpdated: Date;
  icon?: string;
  platform?: string;
  quantity?: number;
  symbol?: string;
  logoUrl?: string;
  unitPrice?: number;
}

export interface Portfolio {
  id: string;
  name: string;
  type: 'traditional' | 'digital' | 'private';
  assets: Asset[];
  totalValue: number;
  institution?: string;
}

// Financial Wellness Metrics
export interface WellnessMetric {
  name: string;
  score: number; // 0-100
  status: 'excellent' | 'good' | 'fair' | 'poor';
  trend: 'up' | 'down' | 'stable';
  description: string;
  recommendations: string[];
}

export interface DiversificationMetrics {
  overallScore: number;
  assetClassDistribution: { category: AssetCategory; percentage: number; value: number }[];
  geographicDistribution: { region: string; percentage: number }[];
  sectorDistribution: { sector: string; percentage: number }[];
  concentrationRisk: number;
}

export interface LiquidityMetrics {
  score: number;
  liquidAssets: number;
  illiquidAssets: number;
  liquidityRatio: number;
  emergencyFundMonths: number;
  recommendations: string[];
}

export interface BehavioralResilience {
  score: number;
  volatilityTolerance: number;
  rebalancingFrequency: string;
  emotionalBiasScore: number;
  decisionConsistency: number;
  recommendations: string[];
}

export interface FinancialWellness {
  overallScore: number;
  diversification: DiversificationMetrics;
  liquidity: LiquidityMetrics;
  behavioralResilience: BehavioralResilience;
  healthIndicators: WellnessMetric[];
  lastAssessment: Date;
}

// Recommendations
export interface Recommendation {
  id: string;
  type: 'action' | 'insight' | 'warning' | 'opportunity';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  actionItems: string[];
  relatedMetric?: string;
}

// Scenario Analysis
export interface Scenario {
  id: string;
  name: string;
  description: string;
  type: 'market_crash' | 'inflation' | 'recession' | 'bull_market' | 'custom';
  projectedImpact: number;
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
}

// Historical Data
export interface HistoricalDataPoint {
  date: string;
  totalValue: number;
  wellnessScore: number;
}

// User Profile
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  investmentHorizon: 'short' | 'medium' | 'long';
  financialGoals: string[];
  avatar?: string;
}
