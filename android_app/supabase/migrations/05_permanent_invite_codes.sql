-- Add permanent invite code to families table
ALTER TABLE public.families 
ADD COLUMN IF NOT EXISTS invite_code TEXT UNIQUE;

-- Generate invite codes for existing families (if any)
UPDATE public.families 
SET invite_code = UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8))
WHERE invite_code IS NULL;

-- Make invite_code NOT NULL after populating existing rows
ALTER TABLE public.families 
ALTER COLUMN invite_code SET NOT NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_families_invite_code ON public.families(invite_code);

-- Update the create_family function to generate permanent invite code
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
