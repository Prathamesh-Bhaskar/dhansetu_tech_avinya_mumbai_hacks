-- ============================================
-- COMPLETE RLS POLICY FIX
-- Run this entire script in Supabase SQL Editor
-- ============================================

-- Step 1: Disable RLS temporarily to avoid recursion
ALTER TABLE personal_expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE family_members DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies on both tables
DROP POLICY IF EXISTS "Users can view own expenses" ON personal_expenses;
DROP POLICY IF EXISTS "Users can insert own expenses" ON personal_expenses;
DROP POLICY IF EXISTS "Users can update own expenses" ON personal_expenses;
DROP POLICY IF EXISTS "Users can delete own expenses" ON personal_expenses;
DROP POLICY IF EXISTS "personal_expenses_select_policy" ON personal_expenses;
DROP POLICY IF EXISTS "personal_expenses_insert_policy" ON personal_expenses;
DROP POLICY IF EXISTS "personal_expenses_update_policy" ON personal_expenses;
DROP POLICY IF EXISTS "personal_expenses_delete_policy" ON personal_expenses;

DROP POLICY IF EXISTS "Users can view family members" ON family_members;
DROP POLICY IF EXISTS "Users can insert family members" ON family_members;
DROP POLICY IF EXISTS "Users can update family members" ON family_members;
DROP POLICY IF EXISTS "Users can delete family members" ON family_members;
DROP POLICY IF EXISTS "family_members_select_policy" ON family_members;
DROP POLICY IF EXISTS "family_members_insert_policy" ON family_members;
DROP POLICY IF EXISTS "family_members_update_policy" ON family_members;
DROP POLICY IF EXISTS "family_members_delete_policy" ON family_members;

-- Step 3: Create SIMPLE, NON-RECURSIVE policies for personal_expenses
CREATE POLICY "personal_expenses_select" 
ON personal_expenses FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "personal_expenses_insert" 
ON personal_expenses FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "personal_expenses_update" 
ON personal_expenses FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "personal_expenses_delete" 
ON personal_expenses FOR DELETE 
USING (auth.uid() = user_id);

-- Step 4: Create SIMPLE policies for family_members
CREATE POLICY "family_members_select" 
ON family_members FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "family_members_insert" 
ON family_members FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "family_members_update" 
ON family_members FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "family_members_delete" 
ON family_members FOR DELETE 
USING (auth.uid() = user_id);

-- Step 5: Re-enable RLS
ALTER TABLE personal_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

-- Step 6: Verify the policies
SELECT schemaname, tablename, policyname, permissive, cmd 
FROM pg_policies 
WHERE tablename IN ('personal_expenses', 'family_members')
ORDER BY tablename, policyname;
