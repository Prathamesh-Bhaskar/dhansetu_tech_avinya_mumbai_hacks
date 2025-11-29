-- ============================================
-- DATABASE FUNCTIONS
-- Business Logic for Family Operations
-- ============================================

-- Function 1: Create Family and Add Owner
CREATE OR REPLACE FUNCTION create_family(family_name TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_family_id UUID;
BEGIN
  -- Verify user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Insert family
  INSERT INTO public.families (family_name, created_by)
  VALUES (family_name, auth.uid())
  RETURNING id INTO new_family_id;
  
  -- Add creator as owner
  INSERT INTO public.family_members (family_id, user_id, role, status)
  VALUES (new_family_id, auth.uid(), 'owner', 'active');
  
  RETURN new_family_id;
END;
$$;

-- Function 2: Generate Invite Code
CREATE OR REPLACE FUNCTION generate_invite(
  p_family_id UUID,
  expires_in_days INT DEFAULT 7
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invite_code TEXT;
  is_owner BOOLEAN;
BEGIN
  -- Verify user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Check if user is owner
  SELECT EXISTS (
    SELECT 1 FROM public.family_members
    WHERE family_id = p_family_id
      AND user_id = auth.uid()
      AND role = 'owner'
      AND status = 'active'
  ) INTO is_owner;
  
  IF NOT is_owner THEN
    RAISE EXCEPTION 'Only family owner can generate invites';
  END IF;
  
  -- Generate 8-character code (uppercase alphanumeric)
  invite_code := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));
  
  -- Insert invitation
  INSERT INTO public.family_invitations (
    family_id,
    invite_code,
    created_by,
    expires_at
  )
  VALUES (
    p_family_id,
    invite_code,
    auth.uid(),
    NOW() + (expires_in_days || ' days')::INTERVAL
  );
  
  RETURN invite_code;
END;
$$;

-- Function 3: Join Family with Invite Code
CREATE OR REPLACE FUNCTION join_family(p_invite_code TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invitation RECORD;
  already_member BOOLEAN;
BEGIN
  -- Verify user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get invitation
  SELECT * FROM public.family_invitations
  WHERE invite_code = p_invite_code
    AND status = 'pending'
    AND expires_at > NOW()
  INTO invitation;
  
  IF invitation IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired invite code';
  END IF;
  
  -- Check if already member
  SELECT EXISTS (
    SELECT 1 FROM public.family_members
    WHERE family_id = invitation.family_id 
      AND user_id = auth.uid()
  ) INTO already_member;
  
  IF already_member THEN
    -- Already a member, just return family_id
    RETURN invitation.family_id;
  END IF;
  
  -- Add as member
  INSERT INTO public.family_members (family_id, user_id, role, status)
  VALUES (invitation.family_id, auth.uid(), 'member', 'active');
  
  -- Mark invitation as used
  UPDATE public.family_invitations
  SET status = 'accepted', used_by = auth.uid()
  WHERE id = invitation.id;
  
  RETURN invitation.family_id;
END;
$$;

-- Function 4: Sync Personal Expense to Family
CREATE OR REPLACE FUNCTION sync_expense_to_family(
  p_expense_id UUID,
  p_family_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  expense RECORD;
  shared_id UUID;
  is_member BOOLEAN;
BEGIN
  -- Verify user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get personal expense (verify ownership)
  SELECT * FROM public.personal_expenses
  WHERE id = p_expense_id AND user_id = auth.uid()
  INTO expense;
  
  IF expense IS NULL THEN
    RAISE EXCEPTION 'Expense not found or unauthorized';
  END IF;
  
  -- Check if user is family member
  SELECT EXISTS (
    SELECT 1 FROM public.family_members
    WHERE family_id = p_family_id
      AND user_id = auth.uid()
      AND status = 'active'
  ) INTO is_member;
  
  IF NOT is_member THEN
    RAISE EXCEPTION 'Not a family member';
  END IF;
  
  -- Insert or update shared expense
  INSERT INTO public.shared_expenses (
    family_id,
    user_id,
    personal_expense_id,
    category,
    amount,
    merchant,
    date,
    notes
  )
  VALUES (
    p_family_id,
    auth.uid(),
    p_expense_id,
    expense.category,
    expense.amount,
    expense.merchant,
    expense.date,
    expense.notes
  )
  ON CONFLICT (family_id, personal_expense_id)
  DO UPDATE SET
    category = EXCLUDED.category,
    amount = EXCLUDED.amount,
    merchant = EXCLUDED.merchant,
    date = EXCLUDED.date,
    notes = EXCLUDED.notes,
    updated_at = NOW()
  RETURNING id INTO shared_id;
  
  RETURN shared_id;
END;
$$;

-- Function 5: Unsync (Remove from Family)
CREATE OR REPLACE FUNCTION unsync_expense_from_family(
  p_expense_id UUID,
  p_family_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Delete shared expense (only if user owns it)
  DELETE FROM public.shared_expenses
  WHERE family_id = p_family_id
    AND personal_expense_id = p_expense_id
    AND user_id = auth.uid();
  
  RETURN TRUE;
END;
$$;

-- Function 6: Leave Family
CREATE OR REPLACE FUNCTION leave_family(p_family_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_owner BOOLEAN;
  member_count INT;
BEGIN
  -- Verify user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Check if user is owner
  SELECT role = 'owner' FROM public.family_members
  WHERE family_id = p_family_id AND user_id = auth.uid()
  INTO is_owner;
  
  -- Count active members
  SELECT COUNT(*) FROM public.family_members
  WHERE family_id = p_family_id AND status = 'active'
  INTO member_count;
  
  -- If owner and other members exist, prevent leaving
  IF is_owner AND member_count > 1 THEN
    RAISE EXCEPTION 'Owner cannot leave while other members exist. Transfer ownership or remove members first.';
  END IF;
  
  -- Remove member (or mark as removed)
  UPDATE public.family_members
  SET status = 'removed'
  WHERE family_id = p_family_id AND user_id = auth.uid();
  
  -- Delete all shared data from this user
  DELETE FROM public.shared_expenses
  WHERE family_id = p_family_id AND user_id = auth.uid();
  
  DELETE FROM public.shared_incomes
  WHERE family_id = p_family_id AND user_id = auth.uid();
  
  DELETE FROM public.shared_goals
  WHERE family_id = p_family_id AND user_id = auth.uid();
  
  RETURN TRUE;
END;
$$;

-- Function 7: Get User's Families
CREATE OR REPLACE FUNCTION get_user_families()
RETURNS TABLE (
  family_id UUID,
  family_name TEXT,
  role TEXT,
  member_count BIGINT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  RETURN QUERY
  SELECT 
    f.id AS family_id,
    f.family_name,
    fm.role,
    (SELECT COUNT(*) FROM public.family_members WHERE family_members.family_id = f.id AND status = 'active') AS member_count,
    f.created_at
  FROM public.families f
  INNER JOIN public.family_members fm ON f.id = fm.family_id
  WHERE fm.user_id = auth.uid() AND fm.status = 'active'
  ORDER BY f.created_at DESC;
END;
$$;
