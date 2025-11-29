-- ============================================
-- PERMANENT FAMILY INVITE CODES - COMPLETE MIGRATION
-- Run this entire script in Supabase SQL Editor
-- ============================================

-- Step 1: Add invite_code column to families table
ALTER TABLE public.families 
ADD COLUMN IF NOT EXISTS invite_code TEXT;

-- Step 2: Generate invite codes for existing families (if any)
DO $$
DECLARE
  family_record RECORD;
  new_code TEXT;
BEGIN
  FOR family_record IN SELECT id FROM public.families WHERE invite_code IS NULL
  LOOP
    -- Generate unique code
    LOOP
      new_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
      EXIT WHEN NOT EXISTS (SELECT 1 FROM public.families WHERE invite_code = new_code);
    END LOOP;
    
    -- Update family with code
    UPDATE public.families SET invite_code = new_code WHERE id = family_record.id;
  END LOOP;
END $$;

-- Step 3: Make invite_code NOT NULL and UNIQUE
ALTER TABLE public.families 
ALTER COLUMN invite_code SET NOT NULL;

ALTER TABLE public.families
ADD CONSTRAINT families_invite_code_unique UNIQUE (invite_code);

-- Step 4: Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_families_invite_code ON public.families(invite_code);

-- Step 5: Update create_family function to generate permanent invite code
CREATE OR REPLACE FUNCTION create_family(p_family_name TEXT, p_user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_family_id UUID;
  v_invite_code TEXT;
BEGIN
  -- Generate unique 8-character invite code
  LOOP
    v_invite_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM families WHERE invite_code = v_invite_code);
  END LOOP;

  -- Create family with permanent invite code
  INSERT INTO families (family_name, created_by, invite_code)
  VALUES (p_family_name, p_user_id, v_invite_code)
  RETURNING id INTO v_family_id;

  -- Add creator as owner
  INSERT INTO family_members (family_id, user_id, role)
  VALUES (v_family_id, p_user_id, 'owner');

  RETURN v_family_id;
END;
$$;

-- Step 6: Create function to get invite code (bypasses RLS)
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

-- Done! Now families have permanent invite codes.
