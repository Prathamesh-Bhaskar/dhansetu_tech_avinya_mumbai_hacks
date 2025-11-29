-- ============================================
-- FIX: Generate codes for ALL families and set NOT NULL
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Generate codes for ANY family missing one
DO $$
DECLARE
  family_record RECORD;
  new_code TEXT;
  code_count INTEGER;
BEGIN
  -- Count families without codes
  SELECT COUNT(*) INTO code_count FROM public.families WHERE invite_code IS NULL;
  
  RAISE NOTICE 'Found % families without invite codes', code_count;
  
  -- Generate codes for each
  FOR family_record IN SELECT id FROM public.families WHERE invite_code IS NULL
  LOOP
    -- Generate unique code
    LOOP
      new_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
      EXIT WHEN NOT EXISTS (SELECT 1 FROM public.families WHERE invite_code = new_code);
    END LOOP;
    
    RAISE NOTICE 'Generating code % for family %', new_code, family_record.id;
    UPDATE public.families SET invite_code = new_code WHERE id = family_record.id;
  END LOOP;
  
  -- Verify all have codes now
  SELECT COUNT(*) INTO code_count FROM public.families WHERE invite_code IS NULL;
  RAISE NOTICE 'Families still without codes: %', code_count;
END $$;

-- Step 2: Now set NOT NULL constraint
ALTER TABLE public.families ALTER COLUMN invite_code SET NOT NULL;

-- Step 3: Add unique constraint if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'families_invite_code_unique'
  ) THEN
    ALTER TABLE public.families ADD CONSTRAINT families_invite_code_unique UNIQUE (invite_code);
  END IF;
END $$;

-- Step 4: Verify
SELECT id, family_name, invite_code, created_at FROM public.families;

-- ✅ All families should now have invite codes!
