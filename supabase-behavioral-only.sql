-- ============================================
-- BEHAVIORAL RESILIENCE TRACKING TABLES
-- Run this in Supabase SQL Editor
-- ============================================

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own assessments" ON public.behavioral_assessments;
DROP POLICY IF EXISTS "Users can insert their own assessments" ON public.behavioral_assessments;
DROP POLICY IF EXISTS "Users can update their own assessments" ON public.behavioral_assessments;
DROP POLICY IF EXISTS "Users can delete their own assessments" ON public.behavioral_assessments;

DROP POLICY IF EXISTS "Users can view their own decisions" ON public.investment_decisions;
DROP POLICY IF EXISTS "Users can insert their own decisions" ON public.investment_decisions;
DROP POLICY IF EXISTS "Users can update their own decisions" ON public.investment_decisions;
DROP POLICY IF EXISTS "Users can delete their own decisions" ON public.investment_decisions;

DROP POLICY IF EXISTS "Users can view their own events" ON public.behavioral_events;
DROP POLICY IF EXISTS "Users can insert their own events" ON public.behavioral_events;
DROP POLICY IF EXISTS "Users can update their own events" ON public.behavioral_events;
DROP POLICY IF EXISTS "Users can delete their own events" ON public.behavioral_events;

DROP POLICY IF EXISTS "Users can view their own sentiment" ON public.daily_sentiment;
DROP POLICY IF EXISTS "Users can insert their own sentiment" ON public.daily_sentiment;
DROP POLICY IF EXISTS "Users can update their own sentiment" ON public.daily_sentiment;
DROP POLICY IF EXISTS "Users can delete their own sentiment" ON public.daily_sentiment;

-- Table for tracking user behavioral assessments
CREATE TABLE IF NOT EXISTS public.behavioral_assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  volatility_tolerance INTEGER CHECK (volatility_tolerance >= 0 AND volatility_tolerance <= 100),
  emotional_bias_score INTEGER CHECK (emotional_bias_score >= 0 AND emotional_bias_score <= 100),
  decision_consistency INTEGER CHECK (decision_consistency >= 0 AND decision_consistency <= 100),
  overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
  rebalancing_frequency TEXT DEFAULT 'Quarterly',
  assessment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for tracking individual investment decisions
CREATE TABLE IF NOT EXISTS public.investment_decisions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  decision_type TEXT NOT NULL CHECK (decision_type IN ('buy', 'sell', 'hold', 'rebalance')),
  asset_id UUID REFERENCES public.assets(id) ON DELETE SET NULL,
  asset_name TEXT,
  amount DECIMAL(20, 2),
  rationale TEXT,
  emotion_at_decision TEXT CHECK (emotion_at_decision IN ('calm', 'anxious', 'excited', 'fearful', 'greedy', 'neutral')),
  market_condition TEXT CHECK (market_condition IN ('bull', 'bear', 'volatile', 'stable')),
  followed_strategy BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for tracking panic/emotional events
CREATE TABLE IF NOT EXISTS public.behavioral_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('panic_sell', 'fomo_buy', 'strategy_deviation', 'emotional_decision', 'disciplined_hold', 'planned_rebalance')),
  severity TEXT CHECK (severity IN ('low', 'medium', 'high')),
  description TEXT,
  market_drop_percent DECIMAL(10, 4),
  user_action TEXT,
  outcome TEXT,
  lesson_learned TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for daily mood/sentiment tracking
CREATE TABLE IF NOT EXISTS public.daily_sentiment (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  market_sentiment INTEGER CHECK (market_sentiment >= 1 AND market_sentiment <= 5),
  confidence_level INTEGER CHECK (confidence_level >= 1 AND confidence_level <= 5),
  stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 5),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_behavioral_assessments_user_id ON public.behavioral_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_investment_decisions_user_id ON public.investment_decisions(user_id);
CREATE INDEX IF NOT EXISTS idx_behavioral_events_user_id ON public.behavioral_events(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_sentiment_user_id ON public.daily_sentiment(user_id);

-- Enable RLS
ALTER TABLE public.behavioral_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.behavioral_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_sentiment ENABLE ROW LEVEL SECURITY;

-- RLS Policies for behavioral_assessments
CREATE POLICY "Users can view their own assessments"
  ON public.behavioral_assessments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own assessments"
  ON public.behavioral_assessments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own assessments"
  ON public.behavioral_assessments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own assessments"
  ON public.behavioral_assessments FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for investment_decisions
CREATE POLICY "Users can view their own decisions"
  ON public.investment_decisions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own decisions"
  ON public.investment_decisions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own decisions"
  ON public.investment_decisions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own decisions"
  ON public.investment_decisions FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for behavioral_events
CREATE POLICY "Users can view their own events"
  ON public.behavioral_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own events"
  ON public.behavioral_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own events"
  ON public.behavioral_events FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own events"
  ON public.behavioral_events FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for daily_sentiment
CREATE POLICY "Users can view their own sentiment"
  ON public.daily_sentiment FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own sentiment"
  ON public.daily_sentiment FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own sentiment"
  ON public.daily_sentiment FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own sentiment"
  ON public.daily_sentiment FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.behavioral_assessments TO authenticated;
GRANT ALL ON public.investment_decisions TO authenticated;
GRANT ALL ON public.behavioral_events TO authenticated;
GRANT ALL ON public.daily_sentiment TO authenticated;
