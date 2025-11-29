-- Fix infinite recursion in budgets RLS policies
-- Drop the problematic family budget policies
DROP POLICY IF EXISTS "Users can view family budgets" ON budgets;

-- The personal budget policies are sufficient for now
-- Users can only see and manage their own budgets
