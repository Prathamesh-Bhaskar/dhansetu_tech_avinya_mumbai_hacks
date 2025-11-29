-- ============================================
-- GOALS FEATURE - DATABASE SCHEMA
-- Migration 15: Goals Tables and Policies
-- ============================================

-- 1. Create Family Goals Table
CREATE TABLE IF NOT EXISTS family_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  goal_name TEXT NOT NULL,
  description TEXT,
  target_amount DECIMAL(10,2) NOT NULL CHECK (target_amount > 0),
  total_saved DECIMAL(10,2) DEFAULT 0 CHECK (total_saved >= 0),
  deadline DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Family Goal Contributions Table
CREATE TABLE IF NOT EXISTS family_goal_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_goal_id UUID NOT NULL REFERENCES family_goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  notes TEXT,
  contributed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(family_goal_id, user_id)
);

-- 3. Update Personal Goals Table (add missing columns)
ALTER TABLE personal_goals 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled'));

-- 4. Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_family_goals_family_id ON family_goals(family_id);
CREATE INDEX IF NOT EXISTS idx_family_goals_status ON family_goals(status);
CREATE INDEX IF NOT EXISTS idx_family_goal_contributions_goal_id ON family_goal_contributions(family_goal_id);
CREATE INDEX IF NOT EXISTS idx_family_goal_contributions_user_id ON family_goal_contributions(user_id);
CREATE INDEX IF NOT EXISTS idx_personal_goals_user_id ON personal_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_personal_goals_status ON personal_goals(status);

-- 5. Create Function to Update Goal Progress
CREATE OR REPLACE FUNCTION update_family_goal_progress()
RETURNS TRIGGER AS $$
BEGIN
  -- Update total_saved in family_goals when contribution changes
  UPDATE family_goals
  SET total_saved = (
    SELECT COALESCE(SUM(amount), 0)
    FROM family_goal_contributions
    WHERE family_goal_id = NEW.family_goal_id
  ),
  updated_at = NOW()
  WHERE id = NEW.family_goal_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create Trigger for Auto-Update Progress
DROP TRIGGER IF EXISTS trigger_update_family_goal_progress ON family_goal_contributions;
CREATE TRIGGER trigger_update_family_goal_progress
AFTER INSERT OR UPDATE OR DELETE ON family_goal_contributions
FOR EACH ROW
EXECUTE FUNCTION update_family_goal_progress();

-- 7. Create Function to Update Personal Goal Progress
CREATE OR REPLACE FUNCTION update_personal_goal_progress()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate progress percentage
  NEW.progress = CASE 
    WHEN NEW.target_amount > 0 THEN 
      ROUND((NEW.saved_amount / NEW.target_amount * 100)::numeric, 2)
    ELSE 0
  END;
  
  -- Auto-complete if target reached
  IF NEW.saved_amount >= NEW.target_amount AND NEW.status = 'active' THEN
    NEW.status = 'completed';
  END IF;
  
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Create Trigger for Personal Goal Progress
DROP TRIGGER IF EXISTS trigger_update_personal_goal_progress ON personal_goals;
CREATE TRIGGER trigger_update_personal_goal_progress
BEFORE UPDATE ON personal_goals
FOR EACH ROW
EXECUTE FUNCTION update_personal_goal_progress();

-- 9. Add Comments for Documentation
COMMENT ON TABLE family_goals IS 'Shared savings goals for family members';
COMMENT ON TABLE family_goal_contributions IS 'Individual contributions to family goals';
COMMENT ON COLUMN family_goals.status IS 'Goal status: active, completed, or cancelled';
COMMENT ON COLUMN family_goal_contributions.amount IS 'Amount contributed by user (cumulative)';

-- 10. Verify Tables Created
SELECT 
  table_name, 
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name IN ('family_goals', 'family_goal_contributions', 'personal_goals')
ORDER BY table_name;
