import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Check if service key is actually configured (not a placeholder)
const hasValidServiceKey = supabaseServiceKey && 
  supabaseServiceKey.length > 50 && 
  !supabaseServiceKey.includes('YOUR_');

// Create a function to get the appropriate Supabase client
function getSupabaseClient(accessToken?: string) {
  // If we have a valid service role key, use it (bypasses RLS)
  if (hasValidServiceKey) {
    return createClient(supabaseUrl, supabaseServiceKey!);
  }
  
  // Otherwise, create a client with the user's access token
  if (accessToken) {
    return createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });
  }
  
  // Fallback to anon client
  return createClient(supabaseUrl, supabaseAnonKey);
}

// GET - Fetch behavioral data for a user
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    const accessToken = request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 });
    }

    const supabase = getSupabaseClient(accessToken);

    // Fetch latest assessment
    const { data: assessment, error: assessmentError } = await supabase
      .from('behavioral_assessments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Fetch recent decisions
    const { data: decisions, error: decisionsError } = await supabase
      .from('investment_decisions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    // Fetch behavioral events
    const { data: events, error: eventsError } = await supabase
      .from('behavioral_events')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    // Fetch recent sentiment
    const { data: sentiment, error: sentimentError } = await supabase
      .from('daily_sentiment')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(30);

    // Calculate behavioral metrics
    const metrics = calculateBehavioralMetrics(decisions || [], events || [], sentiment || []);

    return NextResponse.json({
      success: true,
      data: {
        assessment: assessment || null,
        decisions: decisions || [],
        events: events || [],
        sentiment: sentiment || [],
        metrics,
      }
    });
  } catch (error) {
    console.error('Error fetching behavioral data:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch data' }, { status: 500 });
  }
}

// POST - Save behavioral data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, userId, data, accessToken } = body;

    if (!userId || !type || !data) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = getSupabaseClient(accessToken);

    let result;

    switch (type) {
      case 'assessment':
        result = await supabase
          .from('behavioral_assessments')
          .insert({
            user_id: userId,
            volatility_tolerance: data.volatilityTolerance,
            emotional_bias_score: data.emotionalBiasScore,
            decision_consistency: data.decisionConsistency,
            overall_score: data.overallScore,
            rebalancing_frequency: data.rebalancingFrequency,
          })
          .select()
          .single();
        break;

      case 'decision':
        result = await supabase
          .from('investment_decisions')
          .insert({
            user_id: userId,
            decision_type: data.decisionType,
            asset_id: data.assetId || null,
            asset_name: data.assetName,
            amount: data.amount,
            rationale: data.rationale,
            emotion_at_decision: data.emotion,
            market_condition: data.marketCondition,
            followed_strategy: data.followedStrategy,
          })
          .select()
          .single();
        break;

      case 'event':
        result = await supabase
          .from('behavioral_events')
          .insert({
            user_id: userId,
            event_type: data.eventType,
            severity: data.severity,
            description: data.description,
            market_drop_percent: data.marketDropPercent,
            user_action: data.userAction,
            outcome: data.outcome,
            lesson_learned: data.lessonLearned,
          })
          .select()
          .single();
        break;

      case 'sentiment':
        // Upsert for daily sentiment (one per day)
        result = await supabase
          .from('daily_sentiment')
          .upsert({
            user_id: userId,
            date: data.date || new Date().toISOString().split('T')[0],
            market_sentiment: data.marketSentiment,
            confidence_level: data.confidenceLevel,
            stress_level: data.stressLevel,
            notes: data.notes,
          }, { onConflict: 'user_id,date' })
          .select()
          .single();
        break;

      default:
        return NextResponse.json({ success: false, error: 'Invalid type' }, { status: 400 });
    }

    if (result.error) {
      console.error('Supabase error:', result.error);
      return NextResponse.json({ success: false, error: result.error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error('Error saving behavioral data:', error);
    return NextResponse.json({ success: false, error: 'Failed to save data' }, { status: 500 });
  }
}

// Helper function to calculate behavioral metrics
function calculateBehavioralMetrics(
  decisions: any[],
  events: any[],
  sentiment: any[]
) {
  // Decision consistency score
  const strategyFollowedCount = decisions.filter(d => d.followed_strategy).length;
  const decisionConsistency = decisions.length > 0 
    ? Math.round((strategyFollowedCount / decisions.length) * 100)
    : 75;

  // Emotional bias score (inverse of emotional decisions)
  const emotionalDecisions = decisions.filter(d => 
    ['anxious', 'fearful', 'greedy', 'excited'].includes(d.emotion_at_decision)
  ).length;
  const emotionalBiasScore = decisions.length > 0
    ? Math.round(100 - (emotionalDecisions / decisions.length) * 100)
    : 72;

  // Panic event tracking
  const panicEvents = events.filter(e => 
    ['panic_sell', 'fomo_buy', 'emotional_decision'].includes(e.event_type)
  ).length;
  const disciplinedEvents = events.filter(e =>
    ['disciplined_hold', 'planned_rebalance'].includes(e.event_type)
  ).length;

  // Volatility tolerance based on behavior during market conditions
  const bearMarketDecisions = decisions.filter(d => d.market_condition === 'bear');
  const calmInBear = bearMarketDecisions.filter(d => d.emotion_at_decision === 'calm').length;
  const volatilityTolerance = bearMarketDecisions.length > 0
    ? Math.round((calmInBear / bearMarketDecisions.length) * 100)
    : 68;

  // Sentiment analysis
  const avgStress = sentiment.length > 0
    ? sentiment.reduce((sum, s) => sum + (s.stress_level || 3), 0) / sentiment.length
    : 3;
  const avgConfidence = sentiment.length > 0
    ? sentiment.reduce((sum, s) => sum + (s.confidence_level || 3), 0) / sentiment.length
    : 3;

  // Overall score calculation
  const overallScore = Math.round(
    (decisionConsistency * 0.35) +
    (emotionalBiasScore * 0.30) +
    (volatilityTolerance * 0.25) +
    ((avgConfidence / 5) * 100 * 0.10)
  );

  // Generate dynamic recommendations
  const recommendations = generateRecommendations({
    decisionConsistency,
    emotionalBiasScore,
    volatilityTolerance,
    panicEvents,
    avgStress,
    avgConfidence,
  });

  // Trend analysis
  const recentDecisions = decisions.slice(0, 5);
  const olderDecisions = decisions.slice(5, 10);
  const recentConsistency = recentDecisions.filter(d => d.followed_strategy).length;
  const olderConsistency = olderDecisions.filter(d => d.followed_strategy).length;
  const trend = recentConsistency > olderConsistency ? 'improving' : 
                recentConsistency < olderConsistency ? 'declining' : 'stable';

  return {
    overallScore: Math.min(100, Math.max(0, overallScore)),
    decisionConsistency,
    emotionalBiasScore,
    volatilityTolerance,
    panicEvents,
    disciplinedEvents,
    avgStress: Math.round(avgStress * 20), // Convert to percentage
    avgConfidence: Math.round(avgConfidence * 20),
    trend,
    recommendations,
    totalDecisions: decisions.length,
    totalEvents: events.length,
  };
}

function generateRecommendations(metrics: {
  decisionConsistency: number;
  emotionalBiasScore: number;
  volatilityTolerance: number;
  panicEvents: number;
  avgStress: number;
  avgConfidence: number;
}): string[] {
  const recommendations: string[] = [];

  if (metrics.decisionConsistency < 70) {
    recommendations.push('Consider setting up automated investment rules to improve consistency');
    recommendations.push('Create a written investment policy statement to guide decisions');
  }

  if (metrics.emotionalBiasScore < 65) {
    recommendations.push('Practice waiting 24-48 hours before making significant investment changes');
    recommendations.push('Keep an investment journal to track emotions during decisions');
  }

  if (metrics.volatilityTolerance < 60) {
    recommendations.push('Consider increasing bond allocation to reduce portfolio volatility');
    recommendations.push('Set up dollar-cost averaging to remove timing pressure');
  }

  if (metrics.panicEvents > 3) {
    recommendations.push('Review your risk tolerance - your portfolio may be too aggressive');
    recommendations.push('Consider working with a financial advisor during market volatility');
  }

  if (metrics.avgStress > 60) {
    recommendations.push('Your stress levels are elevated - consider reducing portfolio monitoring frequency');
    recommendations.push('Practice mindfulness or meditation to manage financial anxiety');
  }

  if (metrics.avgConfidence < 50) {
    recommendations.push('Build financial literacy through courses or reading');
    recommendations.push('Start with smaller positions to build confidence gradually');
  }

  // Default recommendations if all metrics are good
  if (recommendations.length === 0) {
    recommendations.push('Continue your disciplined investment approach');
    recommendations.push('Consider mentoring others on behavioral investing');
    recommendations.push('Explore advanced strategies like tax-loss harvesting');
  }

  return recommendations.slice(0, 4);
}
