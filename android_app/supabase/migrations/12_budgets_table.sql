-- Create budgets table for budget tracking
CREATE TABLE IF NOT EXISTS budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    family_id UUID REFERENCES families(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL CHECK (year >= 2020 AND year <= 2100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_budget UNIQUE(user_id, family_id, category, month, year)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_budgets_user_month ON budgets(user_id, month, year);
CREATE INDEX IF NOT EXISTS idx_budgets_family_month ON budgets(family_id, month, year);

-- Enable RLS
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can view their own budgets
CREATE POLICY "Users can view own budgets"
    ON budgets FOR SELECT
    USING (auth.uid() = user_id);

-- Users can view family budgets if they're in the family
CREATE POLICY "Users can view family budgets"
    ON budgets FOR SELECT
    USING (
        family_id IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM family_members
            WHERE family_members.family_id = budgets.family_id
            AND family_members.user_id = auth.uid()
        )
    );

-- Users can insert their own budgets
CREATE POLICY "Users can insert own budgets"
    ON budgets FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own budgets
CREATE POLICY "Users can update own budgets"
    ON budgets FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own budgets
CREATE POLICY "Users can delete own budgets"
    ON budgets FOR DELETE
    USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_budgets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_budgets_updated_at_trigger
    BEFORE UPDATE ON budgets
    FOR EACH ROW
    EXECUTE FUNCTION update_budgets_updated_at();
