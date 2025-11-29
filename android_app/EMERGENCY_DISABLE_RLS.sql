-- ============================================
-- EMERGENCY FIX: Completely disable RLS
-- This will allow transactions to work immediately
-- ============================================

-- Disable RLS on all related tables
ALTER TABLE personal_expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE family_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE families DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('personal_expenses', 'family_members', 'families', 'users');

-- You should see rowsecurity = false for all tables
