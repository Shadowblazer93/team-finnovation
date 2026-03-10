'use client';

import { useState, useEffect } from 'react';
import { getScoreColor, getScoreBgColor } from '@/lib/utils';
import { supabase } from '@/lib/supabaseClient';
import { 
  Brain, Activity, RefreshCw, Heart, Gauge, TrendingUp, TrendingDown, 
  AlertTriangle, CheckCircle, Plus, Target,
  Smile, Frown, Meh, Zap, Shield, BookOpen, Calendar, BarChart3
} from 'lucide-react';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';

interface BehavioralResilienceProps {
  userId?: string;
}

interface BehavioralMetrics {
  overallScore: number;
  decisionConsistency: number;
  emotionalBiasScore: number;
  volatilityTolerance: number;
  panicEvents: number;
  disciplinedEvents: number;
  avgStress: number;
  avgConfidence: number;
  trend: 'improving' | 'declining' | 'stable';
  recommendations: string[];
  totalDecisions: number;
  totalEvents: number;
}

interface DailySentiment {
  id: string;
  date: string;
  market_sentiment: number;
  confidence_level: number;
  stress_level: number;
  notes?: string;
}

interface InvestmentDecision {
  id: string;
  decision_type: string;
  asset_name: string;
  amount: number;
  emotion_at_decision: string;
  followed_strategy: boolean;
  created_at: string;
}

const defaultMetrics: BehavioralMetrics = {
  overallScore: 0,
  decisionConsistency: 0,
  emotionalBiasScore: 0,
  volatilityTolerance: 0,
  panicEvents: 0,
  disciplinedEvents: 0,
  avgStress: 0,
  avgConfidence: 0,
  trend: 'stable',
  recommendations: [],
  totalDecisions: 0,
  totalEvents: 0,
};

export default function BehavioralResilience({ userId }: BehavioralResilienceProps) {
  const [metrics, setMetrics] = useState<BehavioralMetrics>(defaultMetrics);
  const [sentiment, setSentiment] = useState<DailySentiment[]>([]);
  const [decisions, setDecisions] = useState<InvestmentDecision[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'tracker' | 'history' | 'quiz'>('overview');
  const [showSentimentForm, setShowSentimentForm] = useState(false);
  const [showDecisionForm, setShowDecisionForm] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Sentiment form state
  const [sentimentForm, setSentimentForm] = useState({
    marketSentiment: 3,
    confidenceLevel: 3,
    stressLevel: 3,
    notes: '',
  });

  // Decision form state
  const [decisionForm, setDecisionForm] = useState({
    decisionType: 'buy' as 'buy' | 'sell' | 'hold' | 'rebalance',
    assetName: '',
    amount: '',
    emotion: 'neutral' as 'calm' | 'anxious' | 'excited' | 'fearful' | 'greedy' | 'neutral',
    marketCondition: 'stable' as 'bull' | 'bear' | 'volatile' | 'stable',
    followedStrategy: true,
    rationale: '',
  });

  // Quiz state
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [showQuizResults, setShowQuizResults] = useState(false);
  const [quizResults, setQuizResults] = useState<{
    volatilityTolerance: number;
    emotionalControl: number;
    decisionConsistency: number;
    riskAwareness: number;
    overallScore: number;
  } | null>(null);
  const [lastAssessment, setLastAssessment] = useState<{
    date: string;
    overall_score: number;
    volatility_tolerance: number;
    emotional_bias_score: number;
    decision_consistency: number;
  } | null>(null);

  // Enhanced quiz questions with categories
  const quizQuestions = [
    // Volatility Tolerance (Questions 0-2)
    {
      category: 'Volatility Tolerance',
      question: "When your portfolio drops 10% in a week, how do you typically react?",
      options: [
        { text: "Panic sell everything", score: 20 },
        { text: "Sell some risky assets", score: 40 },
        { text: "Do nothing and wait", score: 70 },
        { text: "Buy more at lower prices", score: 90 },
      ]
    },
    {
      category: 'Volatility Tolerance',
      question: "How do you feel about market volatility?",
      options: [
        { text: "It keeps me up at night", score: 25 },
        { text: "It makes me uncomfortable", score: 45 },
        { text: "It's normal, I accept it", score: 75 },
        { text: "I see it as opportunity", score: 90 },
      ]
    },
    {
      category: 'Volatility Tolerance',
      question: "If a stock you own drops 30%, what would you do?",
      options: [
        { text: "Sell immediately to prevent more losses", score: 20 },
        { text: "Sell half and keep half", score: 40 },
        { text: "Hold and monitor closely", score: 70 },
        { text: "Research and potentially buy more if fundamentals are solid", score: 95 },
      ]
    },
    // Emotional Control (Questions 3-5)
    {
      category: 'Emotional Control',
      question: "When you hear about a 'hot stock' from friends, what do you do?",
      options: [
        { text: "Immediately buy it", score: 20 },
        { text: "Buy a small amount to not miss out", score: 40 },
        { text: "Research first, then decide", score: 80 },
        { text: "Stick to my investment plan", score: 95 },
      ]
    },
    {
      category: 'Emotional Control',
      question: "After a big win in the market, how do you behave?",
      options: [
        { text: "Feel invincible and take bigger risks", score: 20 },
        { text: "Celebrate and look for the next big opportunity", score: 40 },
        { text: "Stay humble but feel confident", score: 75 },
        { text: "Stick to my strategy regardless of recent wins", score: 95 },
      ]
    },
    {
      category: 'Emotional Control',
      question: "How do you react to financial news headlines?",
      options: [
        { text: "Act immediately based on the news", score: 20 },
        { text: "Feel anxious and check my portfolio", score: 40 },
        { text: "Read more context before deciding", score: 75 },
        { text: "Rarely let news affect my long-term strategy", score: 90 },
      ]
    },
    // Decision Consistency (Questions 6-8)
    {
      category: 'Decision Consistency',
      question: "Do you have a written investment strategy?",
      options: [
        { text: "No, I go with my gut", score: 30 },
        { text: "I have a general idea", score: 50 },
        { text: "Yes, basic guidelines", score: 75 },
        { text: "Yes, detailed with rules", score: 95 },
      ]
    },
    {
      category: 'Decision Consistency',
      question: "How often do you check your investment portfolio?",
      options: [
        { text: "Multiple times daily", score: 30 },
        { text: "Once a day", score: 50 },
        { text: "Weekly", score: 80 },
        { text: "Monthly or less", score: 90 },
      ]
    },
    {
      category: 'Decision Consistency',
      question: "How do you handle rebalancing your portfolio?",
      options: [
        { text: "I don't rebalance", score: 25 },
        { text: "When I remember or feel like it", score: 40 },
        { text: "Periodically (quarterly/annually)", score: 80 },
        { text: "Automatically or on a strict schedule", score: 95 },
      ]
    },
    // Risk Awareness (Question 9)
    {
      category: 'Risk Awareness',
      question: "What percentage of your emergency fund would you invest in stocks?",
      options: [
        { text: "All of it for maximum returns", score: 20 },
        { text: "More than half", score: 35 },
        { text: "A small portion", score: 60 },
        { text: "None - emergency fund stays in cash", score: 95 },
      ]
    },
  ];

  // Calculate category scores from quiz answers
  const calculateCategoryScores = () => {
    if (quizAnswers.length !== quizQuestions.length) return null;
    
    const volatilityScores = [quizAnswers[0], quizAnswers[1], quizAnswers[2]];
    const emotionalScores = [quizAnswers[3], quizAnswers[4], quizAnswers[5]];
    const consistencyScores = [quizAnswers[6], quizAnswers[7], quizAnswers[8]];
    const riskScore = quizAnswers[9];

    const volatilityTolerance = Math.round(volatilityScores.reduce((a, b) => a + b, 0) / 3);
    const emotionalBiasScore = Math.round(emotionalScores.reduce((a, b) => a + b, 0) / 3);
    const decisionConsistency = Math.round(consistencyScores.reduce((a, b) => a + b, 0) / 3);
    
    const overallScore = Math.round(
      (volatilityTolerance * 0.30) +
      (emotionalBiasScore * 0.30) +
      (decisionConsistency * 0.25) +
      (riskScore * 0.15)
    );

    return {
      volatilityTolerance,
      emotionalBiasScore,
      decisionConsistency,
      riskAwareness: riskScore,
      overallScore,
    };
  };

  // Get score interpretation
  const getScoreInterpretation = (score: number) => {
    if (score >= 80) return { label: 'Excellent', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 60) return { label: 'Good', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (score >= 40) return { label: 'Fair', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { label: 'Needs Work', color: 'text-red-600', bg: 'bg-red-100' };
  };

  // Reset all state to defaults (used when user logs out or changes)
  const resetAllState = () => {
    setMetrics(defaultMetrics);
    setSentiment([]);
    setDecisions([]);
    setLastAssessment(null);
    setQuizStep(0);
    setQuizAnswers([]);
    setShowQuizResults(false);
    setQuizResults(null);
    setActiveTab('overview');
    setShowSentimentForm(false);
    setShowDecisionForm(false);
    setSubmitError(null);
    setSubmitSuccess(null);
  };

  // Effect to handle user changes (login/logout/switch)
  useEffect(() => {
    if (userId) {
      // User logged in - fetch their data
      fetchBehavioralData();
      fetchLastAssessment();
    } else {
      // User logged out - reset all state to defaults
      resetAllState();
    }
  }, [userId]);

  const fetchLastAssessment = async () => {
    if (!userId) {
      setLastAssessment(null);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('behavioral_assessments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error || !data) {
        setLastAssessment(null);
        return;
      }
      
      setLastAssessment({
        date: data.created_at,
        overall_score: data.overall_score,
        volatility_tolerance: data.volatility_tolerance,
        emotional_bias_score: data.emotional_bias_score,
        decision_consistency: data.decision_consistency,
      });
    } catch (error) {
      // No previous assessment
      setLastAssessment(null);
    }
  };

  // Auto-dismiss success messages after 3 seconds
  useEffect(() => {
    if (submitSuccess) {
      const timer = setTimeout(() => setSubmitSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [submitSuccess]);

  const fetchBehavioralData = async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      // Fetch directly from Supabase (has auth context)
      const [assessmentRes, decisionsRes, eventsRes, sentimentRes] = await Promise.all([
        supabase
          .from('behavioral_assessments')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single(),
        supabase
          .from('investment_decisions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(20),
        supabase
          .from('behavioral_events')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('daily_sentiment')
          .select('*')
          .eq('user_id', userId)
          .order('date', { ascending: false })
          .limit(30),
      ]);

      const decisions = decisionsRes.data || [];
      const events = eventsRes.data || [];
      const sentimentData = sentimentRes.data || [];

      // Calculate metrics
      const calculatedMetrics = calculateMetrics(decisions, events, sentimentData);
      setMetrics(calculatedMetrics);
      setSentiment(sentimentData);
      setDecisions(decisions);
    } catch (error) {
      console.error('Error fetching behavioral data:', error);
    }
    setIsLoading(false);
  };

  // Calculate behavioral metrics from data
  const calculateMetrics = (
    decisions: any[],
    events: any[],
    sentimentData: any[]
  ): BehavioralMetrics => {
    // If no data, return zeros
    const hasData = decisions.length > 0 || events.length > 0 || sentimentData.length > 0;
    
    if (!hasData) {
      return defaultMetrics;
    }

    const strategyFollowedCount = decisions.filter(d => d.followed_strategy).length;
    const decisionConsistency = decisions.length > 0 
      ? Math.round((strategyFollowedCount / decisions.length) * 100)
      : 0;

    const emotionalDecisions = decisions.filter(d => 
      ['anxious', 'fearful', 'greedy', 'excited'].includes(d.emotion_at_decision)
    ).length;
    const emotionalBiasScore = decisions.length > 0
      ? Math.round(100 - (emotionalDecisions / decisions.length) * 100)
      : 0;

    const panicEvents = events.filter(e => 
      ['panic_sell', 'fomo_buy', 'emotional_decision'].includes(e.event_type)
    ).length;
    const disciplinedEvents = events.filter(e =>
      ['disciplined_hold', 'planned_rebalance'].includes(e.event_type)
    ).length;

    const bearMarketDecisions = decisions.filter(d => d.market_condition === 'bear');
    const calmInBear = bearMarketDecisions.filter(d => d.emotion_at_decision === 'calm').length;
    const volatilityTolerance = bearMarketDecisions.length > 0
      ? Math.round((calmInBear / bearMarketDecisions.length) * 100)
      : (decisions.length > 0 ? 50 : 0);

    const avgStress = sentimentData.length > 0
      ? Math.round((sentimentData.reduce((sum, s) => sum + (s.stress_level || 3), 0) / sentimentData.length) * 20)
      : 0;
    const avgConfidence = sentimentData.length > 0
      ? Math.round((sentimentData.reduce((sum, s) => sum + (s.confidence_level || 3), 0) / sentimentData.length) * 20)
      : 0;

    const overallScore = Math.round(
      (decisionConsistency * 0.35) +
      (emotionalBiasScore * 0.30) +
      (volatilityTolerance * 0.25) +
      ((avgConfidence / 100) * 100 * 0.10)
    );

    const recentDecisions = decisions.slice(0, 5);
    const olderDecisions = decisions.slice(5, 10);
    const recentConsistency = recentDecisions.filter(d => d.followed_strategy).length;
    const olderConsistency = olderDecisions.filter(d => d.followed_strategy).length;
    const trend = recentConsistency > olderConsistency ? 'improving' : 
                  recentConsistency < olderConsistency ? 'declining' : 'stable';

    const recommendations = generateRecommendations({
      decisionConsistency,
      emotionalBiasScore,
      volatilityTolerance,
      panicEvents,
      avgStress,
      avgConfidence,
    });

    return {
      overallScore: Math.min(100, Math.max(0, overallScore)),
      decisionConsistency,
      emotionalBiasScore,
      volatilityTolerance,
      panicEvents,
      disciplinedEvents,
      avgStress,
      avgConfidence,
      trend: trend as 'improving' | 'declining' | 'stable',
      recommendations,
      totalDecisions: decisions.length,
      totalEvents: events.length,
    };
  };

  const generateRecommendations = (metrics: {
    decisionConsistency: number;
    emotionalBiasScore: number;
    volatilityTolerance: number;
    panicEvents: number;
    avgStress: number;
    avgConfidence: number;
  }): string[] => {
    const recommendations: string[] = [];

    if (metrics.decisionConsistency < 70) {
      recommendations.push('Consider setting up automated investment rules to improve consistency');
    }
    if (metrics.emotionalBiasScore < 65) {
      recommendations.push('Practice waiting 24-48 hours before making significant investment changes');
    }
    if (metrics.volatilityTolerance < 60) {
      recommendations.push('Consider increasing bond allocation to reduce portfolio volatility');
    }
    if (metrics.panicEvents > 3) {
      recommendations.push('Review your risk tolerance - your portfolio may be too aggressive');
    }
    if (metrics.avgStress > 60) {
      recommendations.push('Your stress levels are elevated - consider reducing portfolio monitoring');
    }
    if (metrics.avgConfidence < 50) {
      recommendations.push('Build financial literacy through courses or reading');
    }

    if (recommendations.length === 0) {
      recommendations.push('Continue your disciplined investment approach');
      recommendations.push('Consider mentoring others on behavioral investing');
      recommendations.push('Explore advanced strategies like tax-loss harvesting');
    }

    return recommendations.slice(0, 4);
  };

  const submitSentiment = async () => {
    if (!userId) return;
    setSubmitLoading(true);
    setSubmitError(null);
    setSubmitSuccess(null);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { error } = await supabase
        .from('daily_sentiment')
        .upsert({
          user_id: userId,
          date: today,
          market_sentiment: sentimentForm.marketSentiment,
          confidence_level: sentimentForm.confidenceLevel,
          stress_level: sentimentForm.stressLevel,
          notes: sentimentForm.notes || null,
        }, { onConflict: 'user_id,date' });

      if (error) {
        console.error('Supabase error:', error);
        setSubmitError(error.message || 'Failed to log sentiment. Please try again.');
      } else {
        setShowSentimentForm(false);
        fetchBehavioralData();
        setSentimentForm({ marketSentiment: 3, confidenceLevel: 3, stressLevel: 3, notes: '' });
        setSubmitSuccess('Sentiment logged successfully!');
      }
    } catch (error) {
      console.error('Error saving sentiment:', error);
      setSubmitError('An error occurred while saving your sentiment.');
    }
    setSubmitLoading(false);
  };

  const submitDecision = async () => {
    if (!userId || !decisionForm.assetName) return;
    setSubmitLoading(true);
    setSubmitError(null);
    setSubmitSuccess(null);
    try {
      const { error } = await supabase
        .from('investment_decisions')
        .insert({
          user_id: userId,
          decision_type: decisionForm.decisionType,
          asset_name: decisionForm.assetName,
          amount: decisionForm.amount ? parseFloat(decisionForm.amount) : null,
          rationale: decisionForm.rationale || null,
          emotion_at_decision: decisionForm.emotion,
          market_condition: decisionForm.marketCondition,
          followed_strategy: decisionForm.followedStrategy,
        });

      if (error) {
        console.error('Supabase error:', error);
        setSubmitError(error.message || 'Failed to log decision. Please try again.');
      } else {
        setShowDecisionForm(false);
        fetchBehavioralData();
        setDecisionForm({
          decisionType: 'buy',
          assetName: '',
          amount: '',
          emotion: 'neutral',
          marketCondition: 'stable',
          followedStrategy: true,
          rationale: '',
        });
        setSubmitSuccess('Decision logged successfully!');
      }
    } catch (error) {
      console.error('Error saving decision:', error);
      setSubmitError('An error occurred while saving your decision.');
    }
    setSubmitLoading(false);
  };

  const submitQuiz = async () => {
    if (!userId || quizAnswers.length !== quizQuestions.length) return;
    
    // Calculate category scores
    const volatilityScores = [quizAnswers[0], quizAnswers[1], quizAnswers[2]];
    const emotionalScores = [quizAnswers[3], quizAnswers[4], quizAnswers[5]];
    const consistencyScores = [quizAnswers[6], quizAnswers[7], quizAnswers[8]];
    const riskScore = quizAnswers[9];

    const volatilityTolerance = Math.round(volatilityScores.reduce((a, b) => a + b, 0) / 3);
    const emotionalControl = Math.round(emotionalScores.reduce((a, b) => a + b, 0) / 3);
    const decisionConsistency = Math.round(consistencyScores.reduce((a, b) => a + b, 0) / 3);
    
    const overallScore = Math.round(
      (volatilityTolerance * 0.30) +
      (emotionalControl * 0.30) +
      (decisionConsistency * 0.25) +
      (riskScore * 0.15)
    );
    
    // Store results for display
    setQuizResults({
      volatilityTolerance,
      emotionalControl,
      decisionConsistency,
      riskAwareness: riskScore,
      overallScore,
    });
    
    setSubmitLoading(true);
    setSubmitError(null);
    setSubmitSuccess(null);
    
    try {
      const { error } = await supabase
        .from('behavioral_assessments')
        .insert({
          user_id: userId,
          volatility_tolerance: volatilityTolerance,
          emotional_bias_score: emotionalControl,
          decision_consistency: decisionConsistency,
          overall_score: overallScore,
          rebalancing_frequency: 'Quarterly',
        });

      if (error) {
        console.error('Supabase error:', error);
        setSubmitError(error.message || 'Failed to save assessment. Please try again.');
      } else {
        setShowQuizResults(true);
        setSubmitSuccess('Assessment saved successfully!');
        fetchBehavioralData();
        fetchLastAssessment();
      }
    } catch (error) {
      console.error('Error saving assessment:', error);
      setSubmitError('An error occurred while saving your assessment.');
    }
    setSubmitLoading(false);
  };

  // Reset quiz to start over
  const resetQuiz = () => {
    setQuizStep(0);
    setQuizAnswers([]);
    setShowQuizResults(false);
    setQuizResults(null);
  };

  const chartData = [{ value: metrics.overallScore, fill: '#6366F1' }];

  const metricsData = [
    {
      label: 'Volatility Tolerance',
      value: metrics.volatilityTolerance,
      icon: Activity,
      description: 'Your ability to stay calm during market swings',
    },
    {
      label: 'Emotional Control',
      value: metrics.emotionalBiasScore,
      icon: Heart,
      description: 'Resistance to fear and greed-driven decisions',
    },
    {
      label: 'Decision Consistency',
      value: metrics.decisionConsistency,
      icon: Gauge,
      description: 'Following your investment strategy consistently',
    },
  ];

  const getEmotionIcon = (emotion: string) => {
    switch (emotion) {
      case 'calm': case 'neutral': return <Smile className="w-4 h-4 text-green-500" />;
      case 'anxious': case 'fearful': return <Frown className="w-4 h-4 text-red-500" />;
      case 'excited': case 'greedy': return <Zap className="w-4 h-4 text-yellow-500" />;
      default: return <Meh className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendIcon = () => {
    switch (metrics.trend) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'declining': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Behavioral Resilience</h2>
          <p className="text-sm text-gray-500">Your emotional and psychological investment health</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchBehavioralData}
            disabled={isLoading || !userId}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh data"
          >
            <RefreshCw className={`w-4 h-4 text-gray-500 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <div className="flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-700 rounded-lg">
            {getTrendIcon()}
            <span className="text-sm font-medium capitalize">{metrics.trend}</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'tracker', label: 'Daily Tracker', icon: Calendar },
          { id: 'history', label: 'Decisions', icon: BookOpen },
          { id: 'quiz', label: 'Assessment', icon: Target },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Success/Error notifications */}
      {submitSuccess && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          {submitSuccess}
          <button onClick={() => setSubmitSuccess(null)} className="ml-auto text-green-600 hover:text-green-800">×</button>
        </div>
      )}
      {submitError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          {submitError}
          <button onClick={() => setSubmitError(null)} className="ml-auto text-red-600 hover:text-red-800">×</button>
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Radial Chart */}
            <div className="relative shrink-0">
              <div className="w-40 h-40" style={{ minWidth: 0, minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <RadialBarChart
                    cx="50%"
                    cy="50%"
                    innerRadius="70%"
                    outerRadius="100%"
                    barSize={12}
                    data={chartData}
                    startAngle={90}
                    endAngle={-270}
                  >
                    <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                    <RadialBar background={{ fill: '#E5E7EB' }} dataKey="value" cornerRadius={6} />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Brain className={`w-6 h-6 ${metrics.overallScore > 0 ? getScoreColor(metrics.overallScore) : 'text-gray-400'} mb-1`} />
                <span className={`text-2xl font-bold ${metrics.overallScore > 0 ? getScoreColor(metrics.overallScore) : 'text-gray-400'}`}>
                  {metrics.overallScore}
                </span>
                <span className="text-xs text-gray-400">Score</span>
              </div>
            </div>

            {/* Metrics */}
            <div className="flex-1 space-y-4">
              {metricsData.map((metric) => (
                <div key={metric.label} className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${metric.value > 0 ? getScoreBgColor(metric.value) : 'bg-gray-100'} bg-opacity-10`}>
                    <metric.icon className={`w-4 h-4 ${metric.value > 0 ? getScoreColor(metric.value) : 'text-gray-400'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{metric.label}</span>
                      <span className={`text-sm font-bold ${metric.value > 0 ? getScoreColor(metric.value) : 'text-gray-400'}`}>
                        {metric.value}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${metric.value > 0 ? getScoreBgColor(metric.value) : 'bg-gray-300'} transition-all duration-500`}
                        style={{ width: `${metric.value}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{metric.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="bg-green-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-700">On Strategy</span>
              </div>
              <p className="text-2xl font-bold text-green-800">
                {decisions.filter(d => d.followed_strategy).length}
              </p>
              <p className="text-xs text-green-600">decisions</p>
            </div>
            <div className="bg-red-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="text-sm font-medium text-red-700">Emotional</span>
              </div>
              <p className="text-2xl font-bold text-red-800">
                {decisions.filter(d => ['anxious', 'fearful', 'greedy', 'excited'].includes(d.emotion_at_decision)).length}
              </p>
              <p className="text-xs text-red-600">decisions</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Confidence</span>
              </div>
              <p className="text-2xl font-bold text-blue-800">{metrics.avgConfidence}%</p>
              <p className="text-xs text-blue-600">average</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-amber-600" />
                <span className="text-sm font-medium text-amber-700">Stress</span>
              </div>
              <p className="text-2xl font-bold text-amber-800">{metrics.avgStress}%</p>
              <p className="text-xs text-amber-600">average</p>
            </div>
          </div>

          {/* Recommendations - only show if user has data */}
          {metrics.recommendations.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-100">
              <p className="text-sm font-medium text-gray-700 mb-3">Recommendations</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {metrics.recommendations.map((rec, index) => (
                  <div key={index} className="px-3 py-2 bg-linear-to-r from-indigo-50 to-purple-50 rounded-lg text-xs text-gray-600 flex items-start gap-2">
                    <CheckCircle className="w-3 h-3 text-indigo-500 mt-0.5 shrink-0" />
                    {rec}
                  </div>
                ))}
              </div>
            </div>
          )}

          {userId && sentiment.length === 0 && decisions.length === 0 && !lastAssessment && (
            <div className="mt-6 p-4 bg-indigo-50 rounded-xl text-center">
              <Target className="w-10 h-10 text-indigo-400 mx-auto mb-2" />
              <p className="text-sm text-indigo-700 font-medium">Get Started</p>
              <p className="text-xs text-indigo-600 mt-1">
                Log your daily sentiment, track decisions, or take an assessment to see your personalized scores.
              </p>
            </div>
          )}
        </>
      )}

      {/* Daily Tracker Tab */}
      {activeTab === 'tracker' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-700">Track Today&apos;s Sentiment</h3>
            <button
              onClick={() => setShowSentimentForm(!showSentimentForm)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
              disabled={!userId}
            >
              <Plus className="w-4 h-4" />
              Log Sentiment
            </button>
          </div>

          {showSentimentForm && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Market Outlook (1 = Very Bearish, 5 = Very Bullish)
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      onClick={() => setSentimentForm({ ...sentimentForm, marketSentiment: val })}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                        sentimentForm.marketSentiment === val
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confidence Level (1 = Low, 5 = High)
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      onClick={() => setSentimentForm({ ...sentimentForm, confidenceLevel: val })}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                        sentimentForm.confidenceLevel === val
                          ? 'bg-green-600 text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stress Level (1 = Calm, 5 = Very Stressed)
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      onClick={() => setSentimentForm({ ...sentimentForm, stressLevel: val })}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                        sentimentForm.stressLevel === val
                          ? 'bg-red-600 text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                <textarea
                  value={sentimentForm.notes}
                  onChange={(e) => setSentimentForm({ ...sentimentForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  rows={2}
                  placeholder="How are you feeling about your investments today?"
                />
              </div>

              <button
                onClick={submitSentiment}
                className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                disabled={submitLoading}
              >
                {submitLoading ? 'Saving...' : "Save Today's Sentiment"}
              </button>

              {submitError && (
                <div className="text-red-600 text-sm mt-2">
                  <AlertTriangle className="w-4 h-4 inline mr-1" />
                  {submitError}
                </div>
              )}
              {submitSuccess && (
                <div className="text-green-600 text-sm mt-2">
                  <CheckCircle className="w-4 h-4 inline mr-1" />
                  {submitSuccess}
                </div>
              )}
            </div>
          )}

          {/* Recent Sentiment History */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Recent Entries</h4>
            {sentiment.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No sentiment data yet. Start tracking today!</p>
            ) : (
              sentiment.slice(0, 7).map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium text-gray-900">
                      {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-indigo-600">📈 {entry.market_sentiment}/5</span>
                    <span className="text-green-600">💪 {entry.confidence_level}/5</span>
                    <span className="text-red-600">😰 {entry.stress_level}/5</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Decision History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-700">Investment Decision Log</h3>
            <button
              onClick={() => setShowDecisionForm(!showDecisionForm)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
              disabled={!userId}
            >
              <Plus className="w-4 h-4" />
              Log Decision
            </button>
          </div>

          {showDecisionForm && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Decision Type</label>
                  <select
                    value={decisionForm.decisionType}
                    onChange={(e) => setDecisionForm({ ...decisionForm, decisionType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  >
                    <option value="buy">Buy</option>
                    <option value="sell">Sell</option>
                    <option value="hold">Hold</option>
                    <option value="rebalance">Rebalance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Asset Name</label>
                  <input
                    type="text"
                    value={decisionForm.assetName}
                    onChange={(e) => setDecisionForm({ ...decisionForm, assetName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    placeholder="e.g., AAPL, Bitcoin"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount ($)</label>
                  <input
                    type="number"
                    value={decisionForm.amount}
                    onChange={(e) => setDecisionForm({ ...decisionForm, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    placeholder="1000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Emotion</label>
                  <select
                    value={decisionForm.emotion}
                    onChange={(e) => setDecisionForm({ ...decisionForm, emotion: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  >
                    <option value="calm">😌 Calm</option>
                    <option value="neutral">😐 Neutral</option>
                    <option value="excited">😃 Excited</option>
                    <option value="anxious">😟 Anxious</option>
                    <option value="fearful">😨 Fearful</option>
                    <option value="greedy">🤑 Greedy</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Market Condition</label>
                  <select
                    value={decisionForm.marketCondition}
                    onChange={(e) => setDecisionForm({ ...decisionForm, marketCondition: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  >
                    <option value="bull">🐂 Bull Market</option>
                    <option value="bear">🐻 Bear Market</option>
                    <option value="volatile">📊 Volatile</option>
                    <option value="stable">⚖️ Stable</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Followed Strategy?</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDecisionForm({ ...decisionForm, followedStrategy: true })}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                        decisionForm.followedStrategy
                          ? 'bg-green-600 text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      Yes ✓
                    </button>
                    <button
                      onClick={() => setDecisionForm({ ...decisionForm, followedStrategy: false })}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                        !decisionForm.followedStrategy
                          ? 'bg-red-600 text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      No ✗
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rationale</label>
                <textarea
                  value={decisionForm.rationale}
                  onChange={(e) => setDecisionForm({ ...decisionForm, rationale: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  rows={2}
                  placeholder="Why are you making this decision?"
                />
              </div>

              <button
                onClick={submitDecision}
                className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                disabled={submitLoading}
              >
                {submitLoading ? 'Saving...' : 'Log This Decision'}
              </button>

              {submitError && (
                <div className="text-red-600 text-sm mt-2">
                  <AlertTriangle className="w-4 h-4 inline mr-1" />
                  {submitError}
                </div>
              )}
              {submitSuccess && (
                <div className="text-green-600 text-sm mt-2">
                  <CheckCircle className="w-4 h-4 inline mr-1" />
                  {submitSuccess}
                </div>
              )}
            </div>
          )}

          {/* Decision History */}
          <div className="space-y-3">
            {decisions.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No decisions logged yet. Start tracking your investment choices!</p>
            ) : (
              decisions.slice(0, 10).map((decision) => (
                <div key={decision.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getEmotionIcon(decision.emotion_at_decision)}
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        <span className={`uppercase ${
                          decision.decision_type === 'buy' ? 'text-green-600' :
                          decision.decision_type === 'sell' ? 'text-red-600' : 'text-blue-600'
                        }`}>{decision.decision_type}</span> {decision.asset_name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(decision.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {decision.followed_strategy ? (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">On Strategy</span>
                    ) : (
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">Off Strategy</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Quiz/Assessment Tab */}
      {activeTab === 'quiz' && (
        <div className="space-y-6">
          {/* Show Results if quiz completed */}
          {showQuizResults && quizResults ? (
            <div className="space-y-6">
              {/* Header with overall score */}
              <div className="text-center py-4">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <div className="absolute inset-0 rounded-full bg-linear-to-br from-indigo-100 to-purple-100" />
                  <div className="absolute inset-2 rounded-full bg-white flex flex-col items-center justify-center">
                    <span className={`text-4xl font-bold ${getScoreColor(quizResults.overallScore)}`}>
                      {quizResults.overallScore}
                    </span>
                    <span className="text-xs text-gray-500">Overall Score</span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Assessment Complete!</h3>
                <p className={`text-sm mt-1 ${getScoreInterpretation(quizResults.overallScore).color}`}>
                  {getScoreInterpretation(quizResults.overallScore).label} Behavioral Resilience
                </p>
              </div>

              {/* Detailed Category Breakdown */}
              <div className="bg-gray-50 rounded-xl p-5 space-y-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Category Breakdown</h4>
                
                {/* Volatility Tolerance */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className={`w-4 h-4 ${getScoreColor(quizResults.volatilityTolerance)}`} />
                      <span className="text-sm font-medium text-gray-700">Volatility Tolerance</span>
                    </div>
                    <span className={`text-sm font-bold ${getScoreColor(quizResults.volatilityTolerance)}`}>
                      {quizResults.volatilityTolerance}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getScoreBgColor(quizResults.volatilityTolerance)} transition-all duration-500`}
                      style={{ width: `${quizResults.volatilityTolerance}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    {quizResults.volatilityTolerance >= 70 
                      ? "You handle market fluctuations well and can stay calm during downturns."
                      : quizResults.volatilityTolerance >= 50
                      ? "You have moderate tolerance for volatility. Consider building more confidence through education."
                      : "Market volatility causes you stress. Consider a more conservative portfolio allocation."}
                  </p>
                </div>

                {/* Emotional Control */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Heart className={`w-4 h-4 ${getScoreColor(quizResults.emotionalControl)}`} />
                      <span className="text-sm font-medium text-gray-700">Emotional Control</span>
                    </div>
                    <span className={`text-sm font-bold ${getScoreColor(quizResults.emotionalControl)}`}>
                      {quizResults.emotionalControl}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getScoreBgColor(quizResults.emotionalControl)} transition-all duration-500`}
                      style={{ width: `${quizResults.emotionalControl}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    {quizResults.emotionalControl >= 70 
                      ? "You make decisions based on logic rather than emotion. Great discipline!"
                      : quizResults.emotionalControl >= 50
                      ? "You sometimes let emotions influence decisions. Try implementing a 24-hour rule before acting."
                      : "Emotional biases significantly impact your decisions. Consider automated investing strategies."}
                  </p>
                </div>

                {/* Decision Consistency */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Gauge className={`w-4 h-4 ${getScoreColor(quizResults.decisionConsistency)}`} />
                      <span className="text-sm font-medium text-gray-700">Decision Consistency</span>
                    </div>
                    <span className={`text-sm font-bold ${getScoreColor(quizResults.decisionConsistency)}`}>
                      {quizResults.decisionConsistency}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getScoreBgColor(quizResults.decisionConsistency)} transition-all duration-500`}
                      style={{ width: `${quizResults.decisionConsistency}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    {quizResults.decisionConsistency >= 70 
                      ? "You follow a consistent strategy and avoid impulsive changes. Well done!"
                      : quizResults.decisionConsistency >= 50
                      ? "Your strategy adherence is moderate. Document your rules to improve consistency."
                      : "You frequently deviate from your strategy. Creating a written investment plan would help."}
                  </p>
                </div>

                {/* Risk Awareness */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className={`w-4 h-4 ${getScoreColor(quizResults.riskAwareness)}`} />
                      <span className="text-sm font-medium text-gray-700">Risk Awareness</span>
                    </div>
                    <span className={`text-sm font-bold ${getScoreColor(quizResults.riskAwareness)}`}>
                      {quizResults.riskAwareness}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getScoreBgColor(quizResults.riskAwareness)} transition-all duration-500`}
                      style={{ width: `${quizResults.riskAwareness}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    {quizResults.riskAwareness >= 70 
                      ? "You understand the importance of emergency funds and proper risk management."
                      : quizResults.riskAwareness >= 50
                      ? "You have some risk awareness but could benefit from better emergency planning."
                      : "Your risk awareness needs improvement. Always keep 3-6 months expenses in cash."}
                  </p>
                </div>
              </div>

              {/* Personalized Recommendations */}
              <div className="bg-linear-to-br from-indigo-50 to-purple-50 rounded-xl p-5 space-y-3">
                <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Target className="w-4 h-4 text-indigo-600" />
                  Personalized Recommendations
                </h4>
                <div className="space-y-2">
                  {quizResults.volatilityTolerance < 60 && (
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                      <span>Consider increasing bond allocation to 40-50% to reduce portfolio stress</span>
                    </div>
                  )}
                  {quizResults.emotionalControl < 60 && (
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                      <span>Implement a 48-hour cooling off period before making significant trades</span>
                    </div>
                  )}
                  {quizResults.decisionConsistency < 60 && (
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                      <span>Create a written investment policy statement to guide your decisions</span>
                    </div>
                  )}
                  {quizResults.riskAwareness < 60 && (
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                      <span>Build an emergency fund of 3-6 months expenses before increasing investments</span>
                    </div>
                  )}
                  {quizResults.overallScore >= 70 && (
                    <>
                      <div className="flex items-start gap-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                        <span>You have strong behavioral resilience! Continue your disciplined approach</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                        <span>Consider exploring advanced strategies like tax-loss harvesting or factor investing</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={resetQuiz}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Retake Assessment
                </button>
                <button
                  onClick={() => {
                    resetQuiz();
                    setActiveTab('overview');
                  }}
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                  View Dashboard
                </button>
              </div>

              {/* Last Assessment Comparison */}
              {lastAssessment && (
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Previous Assessment Comparison</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-white rounded-lg p-3 border border-gray-100">
                      <p className="text-gray-500 text-xs">Previous Score</p>
                      <p className={`text-xl font-bold ${getScoreColor(lastAssessment.overall_score)}`}>
                        {lastAssessment.overall_score}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(lastAssessment.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-100">
                      <p className="text-gray-500 text-xs">Change</p>
                      <p className={`text-xl font-bold ${
                        quizResults.overallScore > lastAssessment.overall_score 
                          ? 'text-green-600' 
                          : quizResults.overallScore < lastAssessment.overall_score 
                          ? 'text-red-600' 
                          : 'text-gray-600'
                      }`}>
                        {quizResults.overallScore > lastAssessment.overall_score ? '+' : ''}
                        {quizResults.overallScore - lastAssessment.overall_score}
                      </p>
                      <p className="text-xs text-gray-400">
                        {quizResults.overallScore > lastAssessment.overall_score 
                          ? 'Improvement!' 
                          : quizResults.overallScore < lastAssessment.overall_score 
                          ? 'Room for growth' 
                          : 'No change'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : quizStep < quizQuestions.length ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Behavioral Assessment Quiz</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Category: {quizQuestions[quizStep].category}
                  </p>
                </div>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {quizStep + 1} / {quizQuestions.length}
                </span>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <p className="text-lg font-medium text-gray-900 mb-6">{quizQuestions[quizStep].question}</p>
                <div className="space-y-3">
                  {quizQuestions[quizStep].options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        const newAnswers = [...quizAnswers];
                        newAnswers[quizStep] = option.score;
                        setQuizAnswers(newAnswers);
                        if (quizStep < quizQuestions.length - 1) {
                          setQuizStep(quizStep + 1);
                        }
                      }}
                      className={`w-full p-4 text-left bg-white border rounded-lg transition-colors ${
                        quizAnswers[quizStep] === option.score
                          ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                          : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                      }`}
                    >
                      {option.text}
                    </button>
                  ))}
                </div>
              </div>

              {/* Navigation buttons */}
              <div className="flex gap-3">
                {quizStep > 0 && (
                  <button
                    onClick={() => setQuizStep(quizStep - 1)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    Previous
                  </button>
                )}
                <div className="flex-1" />
                {quizAnswers[quizStep] !== undefined && quizStep === quizQuestions.length - 1 && (
                  <button
                    onClick={submitQuiz}
                    disabled={submitLoading || !userId}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    {submitLoading ? 'Saving...' : 'Complete Assessment'}
                  </button>
                )}
              </div>

              {/* Progress bar */}
              <div className="space-y-2">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 transition-all duration-300"
                    style={{ width: `${((quizStep + 1) / quizQuestions.length) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Volatility</span>
                  <span>Emotional</span>
                  <span>Consistency</span>
                  <span>Risk</span>
                </div>
              </div>
            </>
          ) : quizAnswers.length === quizQuestions.length ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Assessment Complete!</h3>
              <p className="text-gray-600 mb-6">Click below to see your detailed results</p>
              <button
                onClick={submitQuiz}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60"
                disabled={!userId || submitLoading}
              >
                {submitLoading ? 'Analyzing...' : 'View My Results'}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Previous Assessment Summary (if exists) */}
              {lastAssessment && (
                <div className="bg-linear-to-br from-indigo-50 to-purple-50 rounded-xl p-5">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Your Last Assessment</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-indigo-600">{lastAssessment.overall_score}</p>
                      <p className="text-xs text-gray-500">Overall</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-blue-600">{lastAssessment.volatility_tolerance}</p>
                      <p className="text-xs text-gray-500">Volatility</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-purple-600">{lastAssessment.emotional_bias_score}</p>
                      <p className="text-xs text-gray-500">Emotional</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-green-600">{lastAssessment.decision_consistency}</p>
                      <p className="text-xs text-gray-500">Consistency</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3 text-center">
                    Taken on {new Date(lastAssessment.date).toLocaleDateString('en-US', { 
                      month: 'long', day: 'numeric', year: 'numeric' 
                    })}
                  </p>
                </div>
              )}

              {/* Start Assessment Card */}
              <div className="text-center py-8 bg-gray-50 rounded-xl">
                <Brain className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {lastAssessment ? 'Ready for a New Assessment?' : 'Assess Your Behavioral Resilience'}
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Answer {quizQuestions.length} questions across 4 categories to understand your investment psychology and get personalized recommendations.
                </p>
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">Volatility Tolerance</span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">Emotional Control</span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">Decision Consistency</span>
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs">Risk Awareness</span>
                </div>
                <button
                  onClick={() => {
                    setQuizStep(0);
                    setQuizAnswers([]);
                    setShowQuizResults(false);
                    setQuizResults(null);
                  }}
                  className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                  disabled={!userId}
                >
                  {lastAssessment ? 'Retake Assessment' : 'Start Assessment'}
                </button>
                <p className="text-xs text-gray-400 mt-3">Takes about 2-3 minutes</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
