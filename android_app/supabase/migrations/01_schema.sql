-- ============================================
-- SUPABASE DATABASE SCHEMA
-- Multi-User Family Finance App
-- ============================================

-- 1. Users Table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Personal Expenses
CREATE TABLE IF NOT EXISTS public.personal_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  merchant TEXT,
  description TEXT, -- Added for compatibility
  date DATE NOT NULL,
  time TIME,
  notes TEXT,
  source TEXT DEFAULT 'sms', -- 'sms' or 'manual'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Personal Incomes
CREATE TABLE IF NOT EXISTS public.personal_incomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Personal Investments
CREATE TABLE IF NOT EXISTS public.personal_investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  asset_name TEXT NOT NULL,
  invested_amount DECIMAL(10,2) NOT NULL,
  current_value DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Personal Goals
CREATE TABLE IF NOT EXISTS public.personal_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  goal_name TEXT NOT NULL,
  target_amount DECIMAL(10,2) NOT NULL,
  saved_amount DECIMAL(10,2) DEFAULT 0,
  deadline DATE,
  visibility TEXT DEFAULT 'personal', -- 'personal' or 'family'
  progress DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Families
CREATE TABLE IF NOT EXISTS public.families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_name TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Family Members
CREATE TABLE IF NOT EXISTS public.family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'member')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'removed')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(family_id, user_id)
);

-- 8. Family Invitations
CREATE TABLE IF NOT EXISTS public.family_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  invite_code TEXT UNIQUE NOT NULL,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'cancelled')),
  expires_at TIMESTAMPTZ NOT NULL,
  used_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Shared Expenses (Family)
CREATE TABLE IF NOT EXISTS public.shared_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  personal_expense_id UUID, -- Link to original personal expense
  category TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  merchant TEXT,
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(family_id, personal_expense_id)
);

-- 10. Shared Incomes (Family)
CREATE TABLE IF NOT EXISTS public.shared_incomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  personal_income_id UUID,
  source TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(family_id, personal_income_id)
);

-- 11. Shared Goals (Family)
CREATE TABLE IF NOT EXISTS public.shared_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  personal_goal_id UUID,
  goal_name TEXT NOT NULL,
  target_amount DECIMAL(10,2) NOT NULL,
  saved_amount DECIMAL(10,2) DEFAULT 0,
  deadline DATE,
  progress DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(family_id, personal_goal_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_personal_expenses_user_id ON public.personal_expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_personal_expenses_date ON public.personal_expenses(date DESC);
CREATE INDEX IF NOT EXISTS idx_personal_incomes_user_id ON public.personal_incomes(user_id);
CREATE INDEX IF NOT EXISTS idx_family_members_family_id ON public.family_members(family_id);
CREATE INDEX IF NOT EXISTS idx_family_members_user_id ON public.family_members(user_id);
CREATE INDEX IF NOT EXISTS idx_shared_expenses_family_id ON public.shared_expenses(family_id);
CREATE INDEX IF NOT EXISTS idx_shared_expenses_date ON public.shared_expenses(date DESC);
CREATE INDEX IF NOT EXISTS idx_family_invitations_code ON public.family_invitations(invite_code);
CREATE INDEX IF NOT EXISTS idx_family_invitations_status ON public.family_invitations(status);
