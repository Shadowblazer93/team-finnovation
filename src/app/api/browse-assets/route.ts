import { NextResponse } from 'next/server';

// Helper to generate stock logo URL (using multiple fallback sources)
const getStockLogo = (symbol: string, domain?: string) => {
  // Primary: Use Financial Modeling Prep (free, no auth required)
  return `https://financialmodelingprep.com/image-stock/${symbol}.png`;
};

// Popular stocks with sector info
const popularStocks = [
  { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology', marketCap: 'Large', logoUrl: getStockLogo('AAPL') },
  { symbol: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology', marketCap: 'Large', logoUrl: getStockLogo('MSFT') },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology', marketCap: 'Large', logoUrl: getStockLogo('GOOGL') },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'Consumer Cyclical', marketCap: 'Large', logoUrl: getStockLogo('AMZN') },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', sector: 'Technology', marketCap: 'Large', logoUrl: getStockLogo('NVDA') },
  { symbol: 'TSLA', name: 'Tesla Inc.', sector: 'Consumer Cyclical', marketCap: 'Large', logoUrl: getStockLogo('TSLA') },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', sector: 'Financial Services', marketCap: 'Large', logoUrl: getStockLogo('JPM') },
  { symbol: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare', marketCap: 'Large', logoUrl: getStockLogo('JNJ') },
  { symbol: 'V', name: 'Visa Inc.', sector: 'Financial Services', marketCap: 'Large', logoUrl: getStockLogo('V') },
  { symbol: 'PG', name: 'Procter & Gamble Co.', sector: 'Consumer Defensive', marketCap: 'Large', logoUrl: getStockLogo('PG') },
  { symbol: 'UNH', name: 'UnitedHealth Group', sector: 'Healthcare', marketCap: 'Large', logoUrl: getStockLogo('UNH') },
  { symbol: 'HD', name: 'Home Depot Inc.', sector: 'Consumer Cyclical', marketCap: 'Large', logoUrl: getStockLogo('HD') },
  { symbol: 'DIS', name: 'Walt Disney Co.', sector: 'Communication Services', marketCap: 'Large', logoUrl: getStockLogo('DIS') },
  { symbol: 'NFLX', name: 'Netflix Inc.', sector: 'Communication Services', marketCap: 'Large', logoUrl: getStockLogo('NFLX') },
  { symbol: 'VZ', name: 'Verizon Communications', sector: 'Communication Services', marketCap: 'Large', logoUrl: getStockLogo('VZ') },
  { symbol: 'KO', name: 'Coca-Cola Co.', sector: 'Consumer Defensive', marketCap: 'Large', logoUrl: getStockLogo('KO') },
  { symbol: 'PFE', name: 'Pfizer Inc.', sector: 'Healthcare', marketCap: 'Large', logoUrl: getStockLogo('PFE') },
  { symbol: 'XOM', name: 'Exxon Mobil Corp.', sector: 'Energy', marketCap: 'Large', logoUrl: getStockLogo('XOM') },
  { symbol: 'CVX', name: 'Chevron Corporation', sector: 'Energy', marketCap: 'Large', logoUrl: getStockLogo('CVX') },
  { symbol: 'WMT', name: 'Walmart Inc.', sector: 'Consumer Defensive', marketCap: 'Large', logoUrl: getStockLogo('WMT') },
];

// Popular cryptocurrencies
const popularCrypto = [
  { symbol: 'BTC', name: 'Bitcoin', category: 'Layer 1', logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1.png' },
  { symbol: 'ETH', name: 'Ethereum', category: 'Layer 1', logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png' },
  { symbol: 'BNB', name: 'BNB', category: 'Layer 1', logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png' },
  { symbol: 'SOL', name: 'Solana', category: 'Layer 1', logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5426.png' },
  { symbol: 'XRP', name: 'XRP', category: 'Payment', logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/52.png' },
  { symbol: 'ADA', name: 'Cardano', category: 'Layer 1', logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/2010.png' },
  { symbol: 'AVAX', name: 'Avalanche', category: 'Layer 1', logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5805.png' },
  { symbol: 'DOT', name: 'Polkadot', category: 'Layer 0', logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/6636.png' },
  { symbol: 'MATIC', name: 'Polygon', category: 'Layer 2', logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3890.png' },
  { symbol: 'LINK', name: 'Chainlink', category: 'Oracle', logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1975.png' },
  { symbol: 'UNI', name: 'Uniswap', category: 'DeFi', logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/7083.png' },
  { symbol: 'ATOM', name: 'Cosmos', category: 'Layer 0', logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3794.png' },
];

// Real estate investment options (REITs and recommendations)
const realEstateOptions = [
  { symbol: 'VNQ', name: 'Vanguard Real Estate ETF', type: 'REIT ETF', yield: 4.2, description: 'Diversified real estate exposure' },
  { symbol: 'SCHH', name: 'Schwab U.S. REIT ETF', type: 'REIT ETF', yield: 3.8, description: 'Low-cost REIT exposure' },
  { symbol: 'IYR', name: 'iShares U.S. Real Estate ETF', type: 'REIT ETF', yield: 3.5, description: 'Broad real estate market' },
  { symbol: 'O', name: 'Realty Income Corporation', type: 'Retail REIT', yield: 5.8, description: 'Monthly dividend REIT' },
  { symbol: 'AMT', name: 'American Tower Corp', type: 'Infrastructure REIT', yield: 3.2, description: 'Cell tower infrastructure' },
  { symbol: 'PLD', name: 'Prologis Inc.', type: 'Industrial REIT', yield: 3.0, description: 'Logistics real estate' },
  { symbol: 'EQIX', name: 'Equinix Inc.', type: 'Data Center REIT', yield: 2.1, description: 'Data center infrastructure' },
  { symbol: 'SPG', name: 'Simon Property Group', type: 'Retail REIT', yield: 5.5, description: 'Premium shopping centers' },
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { portfolio } = body;

    // Analyze current portfolio
    const portfolioAnalysis = analyzePortfolio(portfolio || []);
    
    // Generate recommendations based on portfolio gaps
    const recommendations = generateRecommendations(portfolioAnalysis);

    return NextResponse.json({
      success: true,
      data: {
        analysis: portfolioAnalysis,
        recommendations,
        stocks: popularStocks,
        crypto: popularCrypto,
        realEstate: realEstateOptions,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to generate asset recommendations' },
      { status: 500 }
    );
  }
}

interface PortfolioAsset {
  category: string;
  value: number;
  symbol?: string;
  name?: string;
}

interface PortfolioAnalysis {
  totalValue: number;
  categoryBreakdown: Record<string, { value: number; percentage: number }>;
  missingCategories: string[];
  overweightCategories: string[];
  underweightCategories: string[];
  diversificationScore: number;
  suggestions: string[];
}

function analyzePortfolio(assets: PortfolioAsset[]): PortfolioAnalysis {
  const totalValue = assets.reduce((sum, asset) => sum + (asset.value || 0), 0);
  
  const categoryBreakdown: Record<string, { value: number; percentage: number }> = {};
  const allCategories = ['stocks', 'bonds', 'real_estate', 'crypto', 'cash', 'commodities'];
  
  // Initialize all categories
  allCategories.forEach(cat => {
    categoryBreakdown[cat] = { value: 0, percentage: 0 };
  });
  
  // Calculate actual values
  assets.forEach(asset => {
    if (categoryBreakdown[asset.category]) {
      categoryBreakdown[asset.category].value += asset.value || 0;
    }
  });
  
  // Calculate percentages
  Object.keys(categoryBreakdown).forEach(cat => {
    categoryBreakdown[cat].percentage = totalValue > 0 
      ? (categoryBreakdown[cat].value / totalValue) * 100 
      : 0;
  });
  
  // Find missing, overweight, and underweight categories
  const missingCategories = allCategories.filter(cat => categoryBreakdown[cat].value === 0);
  const overweightCategories = allCategories.filter(cat => categoryBreakdown[cat].percentage > 40);
  const underweightCategories = allCategories.filter(
    cat => categoryBreakdown[cat].percentage > 0 && categoryBreakdown[cat].percentage < 10
  );
  
  // Calculate diversification score
  const activeCategories = allCategories.filter(cat => categoryBreakdown[cat].value > 0);
  const diversificationScore = Math.min(100, (activeCategories.length / allCategories.length) * 100 * 
    (1 - Math.max(0, ...Object.values(categoryBreakdown).map(c => c.percentage - 30)) / 100));
  
  // Generate suggestions
  const suggestions: string[] = [];
  
  if (missingCategories.includes('stocks')) {
    suggestions.push('Consider adding stocks for long-term growth potential');
  }
  if (missingCategories.includes('crypto')) {
    suggestions.push('A small crypto allocation (2-5%) could enhance diversification');
  }
  if (missingCategories.includes('real_estate')) {
    suggestions.push('REITs can provide stable income and inflation protection');
  }
  if (missingCategories.includes('bonds')) {
    suggestions.push('Bonds can reduce portfolio volatility and provide steady income');
  }
  if (overweightCategories.length > 0) {
    suggestions.push(`Consider rebalancing: ${overweightCategories.join(', ')} may be overweight`);
  }
  if (categoryBreakdown.cash?.percentage > 20) {
    suggestions.push('High cash allocation may reduce long-term returns');
  }
  
  return {
    totalValue,
    categoryBreakdown,
    missingCategories,
    overweightCategories,
    underweightCategories,
    diversificationScore: Math.round(diversificationScore),
    suggestions,
  };
}

interface AssetRecommendation {
  category: string;
  priority: 'high' | 'medium' | 'low';
  reason: string;
  suggestedAllocation: string;
  assets: Array<{
    symbol: string;
    name: string;
    type?: string;
    logoUrl?: string;
  }>;
}

function generateRecommendations(analysis: PortfolioAnalysis): AssetRecommendation[] {
  const recommendations: AssetRecommendation[] = [];
  
  // Recommend stocks if missing or underweight
  if (analysis.missingCategories.includes('stocks') || 
      (analysis.categoryBreakdown.stocks?.percentage || 0) < 20) {
    recommendations.push({
      category: 'stocks',
      priority: 'high',
      reason: 'Stocks provide long-term growth potential and are essential for wealth building',
      suggestedAllocation: '30-50% of portfolio',
      assets: popularStocks.slice(0, 5).map(s => ({
        symbol: s.symbol,
        name: s.name,
        type: s.sector,
        logoUrl: s.logoUrl,
      })),
    });
  }
  
  // Recommend crypto if missing
  if (analysis.missingCategories.includes('crypto')) {
    recommendations.push({
      category: 'crypto',
      priority: 'medium',
      reason: 'A small crypto allocation can enhance returns and provide portfolio diversification',
      suggestedAllocation: '2-10% of portfolio',
      assets: popularCrypto.slice(0, 4).map(c => ({
        symbol: c.symbol,
        name: c.name,
        type: c.category,
        logoUrl: c.logoUrl,
      })),
    });
  }
  
  // Recommend real estate if missing
  if (analysis.missingCategories.includes('real_estate')) {
    recommendations.push({
      category: 'real_estate',
      priority: 'medium',
      reason: 'Real estate provides income, inflation hedge, and diversification benefits',
      suggestedAllocation: '10-20% of portfolio',
      assets: realEstateOptions.slice(0, 4).map(r => ({
        symbol: r.symbol,
        name: r.name,
        type: r.type,
      })),
    });
  }
  
  // Recommend bonds if missing and portfolio is large
  if (analysis.missingCategories.includes('bonds') && analysis.totalValue > 50000) {
    recommendations.push({
      category: 'bonds',
      priority: 'low',
      reason: 'Bonds reduce volatility and provide stability during market downturns',
      suggestedAllocation: '10-30% of portfolio',
      assets: [
        { symbol: 'BND', name: 'Vanguard Total Bond Market ETF', type: 'Bond ETF' },
        { symbol: 'AGG', name: 'iShares Core U.S. Aggregate Bond ETF', type: 'Bond ETF' },
        { symbol: 'TLT', name: 'iShares 20+ Year Treasury Bond ETF', type: 'Treasury ETF' },
      ],
    });
  }
  
  return recommendations;
}

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      stocks: popularStocks,
      crypto: popularCrypto,
      realEstate: realEstateOptions,
    },
  });
}
