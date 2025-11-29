-- ============================================
-- ROW-LEVEL SECURITY POLICIES
-- Privacy & Access Control
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_incomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_incomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_goals ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USERS TABLE POLICIES
-- ============================================
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- PERSONAL EXPENSES POLICIES (Private)
-- ============================================
CREATE POLICY "Users can view own expenses" ON public.personal_expenses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses" ON public.personal_expenses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses" ON public.personal_expenses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses" ON public.personal_expenses
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- PERSONAL INCOMES POLICIES (Private)
-- ============================================
CREATE POLICY "Users can view own incomes" ON public.personal_incomes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own incomes" ON public.personal_incomes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own incomes" ON public.personal_incomes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own incomes" ON public.personal_incomes
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- PERSONAL INVESTMENTS POLICIES (Private)
-- ============================================
CREATE POLICY "Users can view own investments" ON public.personal_investments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own investments" ON public.personal_investments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own investments" ON public.personal_investments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own investments" ON public.personal_investments
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- PERSONAL GOALS POLICIES (Private)
-- ============================================
CREATE POLICY "Users can view own goals" ON public.personal_goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals" ON public.personal_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals" ON public.personal_goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals" ON public.personal_goals
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- FAMILIES POLICIES
-- ============================================
CREATE POLICY "Family members can view family" ON public.families
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.family_members
      WHERE family_id = families.id 
        AND user_id = auth.uid() 
        AND status = 'active'
    )
  );

CREATE POLICY "Family owners can update family" ON public.families
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Anyone can create family" ON public.families
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- ============================================
-- FAMILY MEMBERS POLICIES
-- ============================================
CREATE POLICY "Family members can view members" ON public.family_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.family_members fm
      WHERE fm.family_id = family_members.family_id 
        AND fm.user_id = auth.uid() 
        AND fm.status = 'active'
    )
  );

CREATE POLICY "Family owners can manage members" ON public.family_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.families
      WHERE id = family_members.family_id 
        AND created_by = auth.uid()
    )
  );

-- ============================================
-- FAMILY INVITATIONS POLICIES
-- ============================================
CREATE POLICY "Family owners can create invites" ON public.family_invitations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.families
      WHERE id = family_id AND created_by = auth.uid()
    )
  );

CREATE POLICY "Family owners can view invites" ON public.family_invitations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.families
      WHERE id = family_id AND created_by = auth.uid()
    )
  );

CREATE POLICY "Family owners can update invites" ON public.family_invitations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.families
      WHERE id = family_id AND created_by = auth.uid()
    )
  );

-- ============================================
-- SHARED EXPENSES POLICIES
-- ============================================
CREATE POLICY "Family members can view shared expenses" ON public.shared_expenses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.family_members
      WHERE family_id = shared_expenses.family_id 
        AND user_id = auth.uid() 
        AND status = 'active'
    )
  );

CREATE POLICY "Users can insert own shared expenses" ON public.shared_expenses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own shared expenses" ON public.shared_expenses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own shared expenses" ON public.shared_expenses
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- SHARED INCOMES POLICIES
-- ============================================
CREATE POLICY "Family members can view shared incomes" ON public.shared_incomes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.family_members
      WHERE family_id = shared_incomes.family_id 
        AND user_id = auth.uid() 
        AND status = 'active'
    )
  );

CREATE POLICY "Users can insert own shared incomes" ON public.shared_incomes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own shared incomes" ON public.shared_incomes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own shared incomes" ON public.shared_incomes
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- SHARED GOALS POLICIES
-- ============================================
CREATE POLICY "Family members can view shared goals" ON public.shared_goals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.family_members
      WHERE family_id = shared_goals.family_id 
        AND user_id = auth.uid() 
        AND status = 'active'
    )
  );

CREATE POLICY "Users can insert own shared goals" ON public.shared_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own shared goals" ON public.shared_goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own shared goals" ON public.shared_goals
  FOR DELETE USING (auth.uid() = user_id);
