-- Fix for infinite recursion in families RLS policy
-- Add a function to get family invite code that bypasses RLS

CREATE OR REPLACE FUNCTION get_family_invite_code(p_family_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_invite_code TEXT;
  v_is_member BOOLEAN;
BEGIN
  -- Check if user is a member of this family
  SELECT EXISTS (
    SELECT 1 FROM family_members
    WHERE family_id = p_family_id
      AND user_id = auth.uid()
      AND status = 'active'
  ) INTO v_is_member;

  IF NOT v_is_member THEN
    RAISE EXCEPTION 'Not a member of this family';
  END IF;

  -- Get invite code
  SELECT invite_code INTO v_invite_code
  FROM families
  WHERE id = p_family_id;

  RETURN v_invite_code;
END;
$$;
