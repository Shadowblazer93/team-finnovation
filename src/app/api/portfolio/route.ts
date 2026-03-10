import { NextResponse } from 'next/server';
import { mockAssets, mockPortfolios, getTotalPortfolioValue, get24hChange } from '@/data/mockData';

// GET - Fetch portfolio data
export async function GET() {
  try {
    const totalValue = getTotalPortfolioValue();
    const change = get24hChange();

    return NextResponse.json({
      success: true,
      data: {
        assets: mockAssets,
        portfolios: mockPortfolios,
        summary: {
          totalValue,
          change24h: change.value,
          changePercent: change.percent,
          assetCount: mockAssets.length,
          portfolioCount: mockPortfolios.length,
        }
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch portfolio data' },
      { status: 500 }
    );
  }
}

// POST - Add a new asset
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, category, value, currency, platform } = body;

    // Validate required fields
    if (!name || !category || !value) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, category, value' },
        { status: 400 }
      );
    }

    // Create new asset (in real app, this would save to database)
    const newAsset = {
      id: `asset-${Date.now()}`,
      name,
      category,
      value: Number(value),
      currency: currency || 'USD',
      change24h: 0,
      changePercent: 0,
      lastUpdated: new Date(),
      platform: platform || 'Manual Entry',
    };

    // In a real app, you'd save to database here
    // For now, we return the created asset
    return NextResponse.json({
      success: true,
      message: 'Asset created successfully',
      data: newAsset
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create asset' },
      { status: 500 }
    );
  }
}
