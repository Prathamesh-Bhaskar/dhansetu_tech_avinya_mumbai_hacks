-- ============================================
-- USER PROFILES FOR PERSONALIZED ONBOARDING
-- Migration 18: User Profiles & AI Preferences
-- ============================================

-- Create user_profiles table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,
  
  -- Personal Info
  full_name TEXT,
  age INTEGER,
  occupation TEXT, -- 'salaried', 'business', 'freelancer', 'student', 'retired', 'other'
  city TEXT,
  family_size INTEGER,
  
  -- Financial Profile
  monthly_income DECIMAL(10,2),
  income_sources TEXT[], -- ['salary', 'business', 'investments', 'rental', 'freelance', 'other']
  fixed_expenses DECIMAL(10,2),
  disposable_income DECIMAL(10,2), -- Auto-calculated
  
  -- Spending Behavior
  top_categories TEXT[], -- Top 3 spending categories
  shopping_frequency TEXT, -- 'daily', 'weekly', 'monthly', 'occasionally'
  typical_purchase_size TEXT, -- 'small', 'medium', 'large'
  
  -- Goals & Priorities
  short_term_goals TEXT[],
  medium_term_goals TEXT[],
  long_term_goals TEXT[],
  financial_priority TEXT, -- 'saving', 'debt', 'investing', 'spending', 'wealth'
  
  -- AI Preferences
  ai_personalization_level TEXT DEFAULT 'balanced', -- 'maximum', 'balanced', 'minimal'
  smart_categorization BOOLEAN DEFAULT true,
  spending_predictions BOOLEAN DEFAULT true,
  budget_recommendations BOOLEAN DEFAULT true,
  goal_optimization BOOLEAN DEFAULT true,
  anomaly_detection BOOLEAN DEFAULT true,
  personalized_insights BOOLEAN DEFAULT true,
  
  -- Metadata
  onboarding_completed BOOLEAN DEFAULT false,
  onboarding_completed_at TIMESTAMP,
  profile_completeness INTEGER DEFAULT 0, -- 0-100%
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Auto-calculate disposable income
CREATE OR REPLACE FUNCTION calculate_disposable_income()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.monthly_income IS NOT NULL AND NEW.fixed_expenses IS NOT NULL THEN
    NEW.disposable_income := NEW.monthly_income - NEW.fixed_expenses;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_disposable_income
BEFORE INSERT OR UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION calculate_disposable_income();

-- Auto-calculate profile completeness (0-100%)
CREATE OR REPLACE FUNCTION calculate_profile_completeness()
RETURNS TRIGGER AS $$
BEGIN
  NEW.profile_completeness := (
    CASE WHEN NEW.full_name IS NOT NULL THEN 15 ELSE 0 END +
    CASE WHEN NEW.age IS NOT NULL THEN 10 ELSE 0 END +
    CASE WHEN NEW.occupation IS NOT NULL THEN 10 ELSE 0 END +
    CASE WHEN NEW.monthly_income IS NOT NULL THEN 15 ELSE 0 END +
    CASE WHEN NEW.fixed_expenses IS NOT NULL THEN 10 ELSE 0 END +
    CASE WHEN array_length(NEW.top_categories, 1) > 0 THEN 15 ELSE 0 END +
    CASE WHEN array_length(NEW.short_term_goals, 1) > 0 THEN 10 ELSE 0 END +
    CASE WHEN NEW.financial_priority IS NOT NULL THEN 10 ELSE 0 END +
    CASE WHEN NEW.ai_personalization_level IS NOT NULL THEN 5 ELSE 0 END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_profile_completeness
BEFORE INSERT OR UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION calculate_profile_completeness();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_profiles_updated_at
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- RLS Policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Index for performance
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_onboarding_completed ON user_profiles(onboarding_completed);

-- Comments for documentation
COMMENT ON TABLE user_profiles IS 'User profiles for personalized AI-powered features';
COMMENT ON COLUMN user_profiles.disposable_income IS 'Auto-calculated: monthly_income - fixed_expenses';
COMMENT ON COLUMN user_profiles.profile_completeness IS 'Auto-calculated: 0-100% based on filled fields';
COMMENT ON COLUMN user_profiles.ai_personalization_level IS 'User preference for AI assistance level';

-- Verify migration
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;
