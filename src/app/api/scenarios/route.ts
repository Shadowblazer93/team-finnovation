import { NextResponse } from 'next/server';
import { mockScenarios, getTotalPortfolioValue } from '@/data/mockData';

// GET - Fetch all scenarios
export async function GET() {
  try {
    const totalValue = getTotalPortfolioValue();
    
    const scenariosWithPercentage = mockScenarios.map(scenario => ({
      ...scenario,
      impactPercentage: ((scenario.projectedImpact / totalValue) * 100).toFixed(2),
      currentPortfolioValue: totalValue,
      projectedPortfolioValue: totalValue + scenario.projectedImpact,
    }));

    return NextResponse.json({
      success: true,
      data: {
        scenarios: scenariosWithPercentage,
        currentPortfolioValue: totalValue,
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch scenarios' },
      { status: 500 }
    );
  }
}

// POST - Run custom scenario analysis
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { scenarioType, parameters } = body;

    const totalValue = getTotalPortfolioValue();
    let projectedImpact = 0;
    let recommendations: string[] = [];

    // Calculate impact based on scenario type
    switch (scenarioType) {
      case 'market_drop':
        const dropPercent = parameters?.dropPercent || 20;
        projectedImpact = -totalValue * (dropPercent / 100) * 0.6; // 60% exposure
        recommendations = [
          'Consider increasing bond allocation',
          'Review stop-loss orders',
          'Maintain emergency fund'
        ];
        break;

      case 'interest_rate_rise':
        const rateIncrease = parameters?.rateIncrease || 1;
        projectedImpact = -totalValue * (rateIncrease * 0.02);
        recommendations = [
          'Reduce duration of bond holdings',
          'Consider floating-rate instruments',
          'Review mortgage and debt exposure'
        ];
        break;

      case 'crypto_volatility':
        const cryptoChange = parameters?.changePercent || -30;
        projectedImpact = totalValue * 0.05 * (cryptoChange / 100); // 5% crypto allocation
        recommendations = [
          'Maintain crypto allocation within risk tolerance',
          'Consider stablecoin alternatives',
          'Set up regular rebalancing'
        ];
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid scenario type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: {
        scenarioType,
        parameters,
        currentValue: totalValue,
        projectedImpact,
        projectedValue: totalValue + projectedImpact,
        impactPercentage: ((projectedImpact / totalValue) * 100).toFixed(2),
        recommendations,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to run scenario analysis' },
      { status: 500 }
    );
  }
}
