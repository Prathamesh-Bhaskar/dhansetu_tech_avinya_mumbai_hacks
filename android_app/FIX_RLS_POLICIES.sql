/**
 * CRITICAL: Fix RLS Policy Infinite Recursion
 * 
 * Run this in Supabase SQL Editor to fix the infinite recursion error:
 */

-- First, drop the problematic RLS policies on personal_expenses
DROP POLICY IF EXISTS "Users can view own expenses" ON personal_expenses;
DROP POLICY IF EXISTS "Users can insert own expenses" ON personal_expenses;
DROP POLICY IF EXISTS "Users can update own expenses" ON personal_expenses;
DROP POLICY IF EXISTS "Users can delete own expenses" ON personal_expenses;

-- Create simple, non-recursive RLS policies for personal_expenses
CREATE POLICY "Users can view own expenses" 
ON personal_expenses FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses" 
ON personal_expenses FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses" 
ON personal_expenses FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses" 
ON personal_expenses FOR DELETE 
USING (auth.uid() = user_id);

-- Ensure RLS is enabled
ALTER TABLE personal_expenses ENABLE ROW LEVEL SECURITY;

-- Verify policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'personal_expenses';
