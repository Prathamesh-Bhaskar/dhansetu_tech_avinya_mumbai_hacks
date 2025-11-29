-- ============================================
-- TRANSACTION-TO-GOAL ALLOCATION
-- Migration 17: Link Transactions to Goals
-- ============================================

-- 1. Add columns to personal_expenses table
ALTER TABLE personal_expenses 
ADD COLUMN IF NOT EXISTS allocated_goal_id UUID,
ADD COLUMN IF NOT EXISTS allocated_goal_type TEXT CHECK (allocated_goal_type IN ('personal', 'family'));

-- 2. Add index for performance
CREATE INDEX IF NOT EXISTS idx_personal_expenses_goal 
ON personal_expenses(allocated_goal_id, allocated_goal_type);

-- 3. Add comments for documentation
COMMENT ON COLUMN personal_expenses.allocated_goal_id IS 'ID of the goal this transaction contributes to';
COMMENT ON COLUMN personal_expenses.allocated_goal_type IS 'Type of goal: personal or family';

-- 4. Function to update goal when transaction is allocated
CREATE OR REPLACE FUNCTION update_goal_from_transaction()
RETURNS TRIGGER AS $$
BEGIN
    -- If allocated to personal goal
    IF NEW.allocated_goal_type = 'personal' AND NEW.allocated_goal_id IS NOT NULL THEN
        UPDATE personal_goals
        SET saved_amount = saved_amount + NEW.amount,
            updated_at = NOW()
        WHERE id = NEW.allocated_goal_id;
    END IF;
    
    -- If allocated to family goal
    IF NEW.allocated_goal_type = 'family' AND NEW.allocated_goal_id IS NOT NULL THEN
        -- Update or insert contribution
        INSERT INTO family_goal_contributions (family_goal_id, user_id, amount)
        VALUES (NEW.allocated_goal_id, NEW.user_id, NEW.amount)
        ON CONFLICT (family_goal_id, user_id)
        DO UPDATE SET amount = family_goal_contributions.amount + NEW.amount;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Create trigger for INSERT
DROP TRIGGER IF EXISTS trigger_update_goal_from_transaction ON personal_expenses;
CREATE TRIGGER trigger_update_goal_from_transaction
AFTER INSERT ON personal_expenses
FOR EACH ROW
WHEN (NEW.allocated_goal_id IS NOT NULL)
EXECUTE FUNCTION update_goal_from_transaction();

-- 6. Function to handle transaction updates (changing goal allocation)
CREATE OR REPLACE FUNCTION update_goal_on_transaction_change()
RETURNS TRIGGER AS $$
BEGIN
    -- If goal allocation changed
    IF (OLD.allocated_goal_id IS DISTINCT FROM NEW.allocated_goal_id) 
       OR (OLD.allocated_goal_type IS DISTINCT FROM NEW.allocated_goal_type) THEN
        
        -- Remove from old goal
        IF OLD.allocated_goal_type = 'personal' AND OLD.allocated_goal_id IS NOT NULL THEN
            UPDATE personal_goals
            SET saved_amount = GREATEST(saved_amount - OLD.amount, 0),
                updated_at = NOW()
            WHERE id = OLD.allocated_goal_id;
        END IF;
        
        IF OLD.allocated_goal_type = 'family' AND OLD.allocated_goal_id IS NOT NULL THEN
            UPDATE family_goal_contributions
            SET amount = GREATEST(amount - OLD.amount, 0)
            WHERE family_goal_id = OLD.allocated_goal_id AND user_id = OLD.user_id;
        END IF;
        
        -- Add to new goal
        IF NEW.allocated_goal_type = 'personal' AND NEW.allocated_goal_id IS NOT NULL THEN
            UPDATE personal_goals
            SET saved_amount = saved_amount + NEW.amount,
                updated_at = NOW()
            WHERE id = NEW.allocated_goal_id;
        END IF;
        
        IF NEW.allocated_goal_type = 'family' AND NEW.allocated_goal_id IS NOT NULL THEN
            INSERT INTO family_goal_contributions (family_goal_id, user_id, amount)
            VALUES (NEW.allocated_goal_id, NEW.user_id, NEW.amount)
            ON CONFLICT (family_goal_id, user_id)
            DO UPDATE SET amount = family_goal_contributions.amount + NEW.amount;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Create trigger for UPDATE
DROP TRIGGER IF EXISTS trigger_update_goal_on_transaction_change ON personal_expenses;
CREATE TRIGGER trigger_update_goal_on_transaction_change
AFTER UPDATE ON personal_expenses
FOR EACH ROW
EXECUTE FUNCTION update_goal_on_transaction_change();

-- 8. Function to handle transaction deletion
CREATE OR REPLACE FUNCTION remove_goal_allocation_on_delete()
RETURNS TRIGGER AS $$
BEGIN
    -- Remove from goal when transaction is deleted
    IF OLD.allocated_goal_type = 'personal' AND OLD.allocated_goal_id IS NOT NULL THEN
        UPDATE personal_goals
        SET saved_amount = GREATEST(saved_amount - OLD.amount, 0),
            updated_at = NOW()
        WHERE id = OLD.allocated_goal_id;
    END IF;
    
    IF OLD.allocated_goal_type = 'family' AND OLD.allocated_goal_id IS NOT NULL THEN
        UPDATE family_goal_contributions
        SET amount = GREATEST(amount - OLD.amount, 0)
        WHERE family_goal_id = OLD.allocated_goal_id AND user_id = OLD.user_id;
    END IF;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- 9. Create trigger for DELETE
DROP TRIGGER IF EXISTS trigger_remove_goal_allocation_on_delete ON personal_expenses;
CREATE TRIGGER trigger_remove_goal_allocation_on_delete
AFTER DELETE ON personal_expenses
FOR EACH ROW
WHEN (OLD.allocated_goal_id IS NOT NULL)
EXECUTE FUNCTION remove_goal_allocation_on_delete();

-- 10. Verify migration
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'personal_expenses' 
AND column_name IN ('allocated_goal_id', 'allocated_goal_type');
