/**
 * Run this migration manually in Supabase SQL Editor:
 * 
 * 1. Go to your Supabase project dashboard
 * 2. Click on "SQL Editor" in the left sidebar
 * 3. Click "New Query"
 * 4. Copy and paste the SQL below
 * 5. Click "Run"
 */

-- Add description and source columns to personal_expenses table
ALTER TABLE personal_expenses 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS source VARCHAR(10) DEFAULT 'sms';

-- Add comments
COMMENT ON COLUMN personal_expenses.source IS 'Source of transaction: sms or manual';
COMMENT ON COLUMN personal_expenses.description IS 'Transaction description';

-- Verify the columns were added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'personal_expenses' 
AND column_name IN ('description', 'source');
