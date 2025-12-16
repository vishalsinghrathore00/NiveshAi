-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  risk_level TEXT NOT NULL DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high')),
  investment_horizon TEXT NOT NULL DEFAULT 'long' CHECK (investment_horizon IN ('short', 'long')),
  monthly_sip_amount INTEGER DEFAULT 5000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create watchlist table
CREATE TABLE IF NOT EXISTS watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  asset_id TEXT NOT NULL,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('stock', 'fund')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, asset_id, asset_type)
);

-- Create recommendations table
CREATE TABLE IF NOT EXISTS recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  asset_id TEXT NOT NULL,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('stock', 'fund')),
  score DECIMAL(5,2) NOT NULL,
  ai_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ai_insights_cache table
CREATE TABLE IF NOT EXISTS ai_insights_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id TEXT NOT NULL,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('stock', 'fund')),
  insight_type TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '24 hours',
  UNIQUE(asset_id, asset_type, insight_type)
);

-- Enable Row Level Security
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_preferences
CREATE POLICY "Users can view their own preferences" ON user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own preferences" ON user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own preferences" ON user_preferences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own preferences" ON user_preferences FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for watchlist
CREATE POLICY "Users can view their own watchlist" ON watchlist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert to their own watchlist" ON watchlist FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete from their own watchlist" ON watchlist FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for recommendations
CREATE POLICY "Users can view their own recommendations" ON recommendations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own recommendations" ON recommendations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own recommendations" ON recommendations FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for ai_insights_cache (publicly readable for caching)
CREATE POLICY "Anyone can read cached insights" ON ai_insights_cache FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert insights" ON ai_insights_cache FOR INSERT WITH CHECK (auth.role() = 'authenticated');
