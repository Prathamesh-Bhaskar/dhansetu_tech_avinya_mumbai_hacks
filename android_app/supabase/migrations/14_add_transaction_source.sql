-- Add description and source columns to personal_expenses table
ALTER TABLE personal_expenses 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS source VARCHAR(10) DEFAULT 'sms';

-- Add comment
COMMENT ON COLUMN personal_expenses.source IS 'Source of transaction: sms or manual';
COMMENT ON COLUMN personal_expenses.description IS 'Transaction description';
