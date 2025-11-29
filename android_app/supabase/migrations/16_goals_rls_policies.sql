-- ============================================
-- GOALS FEATURE - RLS POLICIES
-- Migration 16: Row Level Security for Goals
-- ============================================

-- ============================================
-- PERSONAL GOALS POLICIES
-- ============================================

-- Enable RLS on personal_goals
ALTER TABLE personal_goals ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own personal goals" ON personal_goals;
DROP POLICY IF EXISTS "Users can create own personal goals" ON personal_goals;
DROP POLICY IF EXISTS "Users can update own personal goals" ON personal_goals;
DROP POLICY IF EXISTS "Users can delete own personal goals" ON personal_goals;

-- Create simple, non-recursive policies for personal_goals
CREATE POLICY "Users can view own personal goals" 
ON personal_goals FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own personal goals" 
ON personal_goals FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own personal goals" 
ON personal_goals FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own personal goals" 
ON personal_goals FOR DELETE 
USING (auth.uid() = user_id);

-- ============================================
-- FAMILY GOALS POLICIES
-- ============================================

-- Enable RLS on family_goals
ALTER TABLE family_goals ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Family members can view family goals" ON family_goals;
DROP POLICY IF EXISTS "Family members can create family goals" ON family_goals;
DROP POLICY IF EXISTS "Goal creator can update family goals" ON family_goals;
DROP POLICY IF EXISTS "Goal creator can delete family goals" ON family_goals;

-- Family members can view all goals in their family
CREATE POLICY "Family members can view family goals" 
ON family_goals FOR SELECT 
USING (
  family_id IN (
    SELECT family_id 
    FROM family_members 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

-- Family members can create goals for their family
CREATE POLICY "Family members can create family goals" 
ON family_goals FOR INSERT 
WITH CHECK (
  auth.uid() = created_by
  AND family_id IN (
    SELECT family_id 
    FROM family_members 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

-- Only goal creator can update
CREATE POLICY "Goal creator can update family goals" 
ON family_goals FOR UPDATE 
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

-- Only goal creator can delete
CREATE POLICY "Goal creator can delete family goals" 
ON family_goals FOR DELETE 
USING (auth.uid() = created_by);

-- ============================================
-- FAMILY GOAL CONTRIBUTIONS POLICIES
-- ============================================

-- Enable RLS on family_goal_contributions
ALTER TABLE family_goal_contributions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Family members can view contributions" ON family_goal_contributions;
DROP POLICY IF EXISTS "Family members can add contributions" ON family_goal_contributions;
DROP POLICY IF EXISTS "Users can update own contributions" ON family_goal_contributions;
DROP POLICY IF EXISTS "Users can delete own contributions" ON family_goal_contributions;

-- Family members can view all contributions for their family goals
CREATE POLICY "Family members can view contributions" 
ON family_goal_contributions FOR SELECT 
USING (
  family_goal_id IN (
    SELECT id FROM family_goals 
    WHERE family_id IN (
      SELECT family_id 
      FROM family_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  )
);

-- Family members can add their own contributions
CREATE POLICY "Family members can add contributions" 
ON family_goal_contributions FOR INSERT 
WITH CHECK (
  auth.uid() = user_id
  AND family_goal_id IN (
    SELECT id FROM family_goals 
    WHERE family_id IN (
      SELECT family_id 
      FROM family_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  )
);

-- Users can update only their own contributions
CREATE POLICY "Users can update own contributions" 
ON family_goal_contributions FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete only their own contributions
CREATE POLICY "Users can delete own contributions" 
ON family_goal_contributions FOR DELETE 
USING (auth.uid() = user_id);

-- ============================================
-- VERIFY POLICIES
-- ============================================

-- Check all policies are created
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  cmd 
FROM pg_policies 
WHERE tablename IN ('personal_goals', 'family_goals', 'family_goal_contributions')
ORDER BY tablename, policyname;
