-- Fix join_family_by_code to allow rejoining after leaving
CREATE OR REPLACE FUNCTION join_family_by_code(p_invite_code TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_family_id UUID;
  v_user_id UUID;
  existing_member RECORD;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Find family by invite code (bypasses RLS)
  SELECT id INTO v_family_id
  FROM families
  WHERE invite_code = UPPER(TRIM(p_invite_code));

  IF v_family_id IS NULL THEN
    RAISE EXCEPTION 'Invalid invite code';
  END IF;

  -- Check if already an ACTIVE member
  SELECT * INTO existing_member
  FROM family_members
  WHERE family_id = v_family_id
    AND user_id = v_user_id
    AND status = 'active';

  IF existing_member.id IS NOT NULL THEN
    RAISE EXCEPTION 'Already a member of this family';
  END IF;

  -- Check if was previously a member (status = 'removed')
  SELECT * INTO existing_member
  FROM family_members
  WHERE family_id = v_family_id
    AND user_id = v_user_id
    AND status = 'removed';

  IF existing_member.id IS NOT NULL THEN
    -- Reactivate membership
    UPDATE family_members
    SET status = 'active', joined_at = NOW()
    WHERE id = existing_member.id;
  ELSE
    -- Add as new member
    INSERT INTO family_members (family_id, user_id, role, status)
    VALUES (v_family_id, v_user_id, 'member', 'active');
  END IF;

  RETURN v_family_id;
END;
$$;
