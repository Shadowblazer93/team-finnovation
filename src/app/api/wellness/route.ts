import { NextResponse } from 'next/server';
import { mockFinancialWellness } from '@/data/mockData';

// GET - Fetch wellness metrics
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: {
        overallScore: mockFinancialWellness.overallScore,
        diversification: mockFinancialWellness.diversification,
        liquidity: mockFinancialWellness.liquidity,
        behavioralResilience: mockFinancialWellness.behavioralResilience,
        healthIndicators: mockFinancialWellness.healthIndicators,
        lastAssessment: mockFinancialWellness.lastAssessment,
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch wellness data' },
      { status: 500 }
    );
  }
}

// POST - Recalculate wellness score
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { riskTolerance, investmentHorizon } = body;

    // Simulate recalculation based on user preferences
    let adjustedScore = mockFinancialWellness.overallScore;
    
    if (riskTolerance === 'conservative') {
      adjustedScore = Math.min(100, adjustedScore + 5);
    } else if (riskTolerance === 'aggressive') {
      adjustedScore = Math.max(0, adjustedScore - 3);
    }

    return NextResponse.json({
      success: true,
      message: 'Wellness score recalculated',
      data: {
        previousScore: mockFinancialWellness.overallScore,
        newScore: adjustedScore,
        factors: {
          riskTolerance,
          investmentHorizon,
        }
      }
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to recalculate wellness' },
      { status: 500 }
    );
  }
}
