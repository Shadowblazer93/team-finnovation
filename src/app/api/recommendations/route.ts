import { NextResponse } from 'next/server';
import { mockRecommendations } from '@/data/mockData';

// GET - Fetch recommendations
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const priority = searchParams.get('priority');
    const type = searchParams.get('type');

    let recommendations = [...mockRecommendations];

    // Filter by priority
    if (priority && ['high', 'medium', 'low'].includes(priority)) {
      recommendations = recommendations.filter(r => r.priority === priority);
    }

    // Filter by type
    if (type && ['action', 'insight', 'warning', 'opportunity'].includes(type)) {
      recommendations = recommendations.filter(r => r.type === type);
    }

    return NextResponse.json({
      success: true,
      data: {
        recommendations,
        total: recommendations.length,
        filters: { priority, type }
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}

// POST - Mark recommendation as completed/dismissed
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { recommendationId, action } = body;

    if (!recommendationId || !action) {
      return NextResponse.json(
        { success: false, error: 'Missing recommendationId or action' },
        { status: 400 }
      );
    }

    if (!['completed', 'dismissed', 'snoozed'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Must be: completed, dismissed, or snoozed' },
        { status: 400 }
      );
    }

    // In real app, update database
    return NextResponse.json({
      success: true,
      message: `Recommendation ${action} successfully`,
      data: {
        recommendationId,
        action,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update recommendation' },
      { status: 500 }
    );
  }
}
