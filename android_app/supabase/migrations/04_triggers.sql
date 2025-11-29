-- ============================================
-- DATABASE TRIGGERS
-- Auto-sync personal data changes to family
-- ============================================

-- Trigger Function: Auto-update shared expense when personal expense updates
CREATE OR REPLACE FUNCTION sync_personal_expense_update()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update all shared expenses linked to this personal expense
  UPDATE public.shared_expenses
  SET
    category = NEW.category,
    amount = NEW.amount,
    merchant = NEW.merchant,
    date = NEW.date,
    notes = NEW.notes,
    updated_at = NOW()
  WHERE personal_expense_id = NEW.id;
  
  RETURN NEW;
END;
$$;

-- Create trigger for personal expense updates
CREATE TRIGGER personal_expense_update_trigger
AFTER UPDATE ON public.personal_expenses
FOR EACH ROW
EXECUTE FUNCTION sync_personal_expense_update();

-- Trigger Function: Auto-delete shared expense when personal expense deleted
CREATE OR REPLACE FUNCTION sync_personal_expense_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Delete all shared expenses linked to this personal expense
  DELETE FROM public.shared_expenses
  WHERE personal_expense_id = OLD.id;
  
  RETURN OLD;
END;
$$;

-- Create trigger for personal expense deletes
CREATE TRIGGER personal_expense_delete_trigger
AFTER DELETE ON public.personal_expenses
FOR EACH ROW
EXECUTE FUNCTION sync_personal_expense_delete();

-- Trigger Function: Auto-update shared income when personal income updates
CREATE OR REPLACE FUNCTION sync_personal_income_update()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.shared_incomes
  SET
    source = NEW.source,
    amount = NEW.amount,
    date = NEW.date,
    notes = NEW.notes,
    updated_at = NOW()
  WHERE personal_income_id = NEW.id;
  
  RETURN NEW;
END;
$$;

-- Create trigger for personal income updates
CREATE TRIGGER personal_income_update_trigger
AFTER UPDATE ON public.personal_incomes
FOR EACH ROW
EXECUTE FUNCTION sync_personal_income_update();

-- Trigger Function: Auto-delete shared income when personal income deleted
CREATE OR REPLACE FUNCTION sync_personal_income_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.shared_incomes
  WHERE personal_income_id = OLD.id;
  
  RETURN OLD;
END;
$$;

-- Create trigger for personal income deletes
CREATE TRIGGER personal_income_delete_trigger
AFTER DELETE ON public.personal_incomes
FOR EACH ROW
EXECUTE FUNCTION sync_personal_income_delete();

-- Trigger Function: Auto-update shared goal when personal goal updates
CREATE OR REPLACE FUNCTION sync_personal_goal_update()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.shared_goals
  SET
    goal_name = NEW.goal_name,
    target_amount = NEW.target_amount,
    saved_amount = NEW.saved_amount,
    deadline = NEW.deadline,
    progress = NEW.progress,
    updated_at = NOW()
  WHERE personal_goal_id = NEW.id;
  
  RETURN NEW;
END;
$$;

-- Create trigger for personal goal updates
CREATE TRIGGER personal_goal_update_trigger
AFTER UPDATE ON public.personal_goals
FOR EACH ROW
EXECUTE FUNCTION sync_personal_goal_update();

-- Trigger Function: Auto-delete shared goal when personal goal deleted
CREATE OR REPLACE FUNCTION sync_personal_goal_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.shared_goals
  WHERE personal_goal_id = OLD.id;
  
  RETURN OLD;
END;
$$;

-- Create trigger for personal goal deletes
CREATE TRIGGER personal_goal_delete_trigger
AFTER DELETE ON public.personal_goals
FOR EACH ROW
EXECUTE FUNCTION sync_personal_goal_delete();

-- Trigger Function: Auto-create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user();
