-- Create join_family_by_code function to bypass RLS
CREATE OR REPLACE FUNCTION join_family_by_code(p_invite_code TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_family_id UUID;
  v_user_id UUID;
  existing_member_count INT;
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

  -- Check if already a member
  SELECT COUNT(*) INTO existing_member_count
  FROM family_members
  WHERE family_id = v_family_id
    AND user_id = v_user_id;

  IF existing_member_count > 0 THEN
    RAISE EXCEPTION 'Already a member of this family';
  END IF;

  -- Add user as member
  INSERT INTO family_members (family_id, user_id, role, status)
  VALUES (v_family_id, v_user_id, 'member', 'active');

  RETURN v_family_id;
END;
$$;
