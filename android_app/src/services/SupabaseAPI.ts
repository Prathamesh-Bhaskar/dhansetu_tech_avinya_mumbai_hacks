import { supabase } from '../config/supabase';
import type {
    PersonalExpense,
    PersonalIncome,
    PersonalGoal,
    SharedExpense,
    SharedIncome,
    SharedGoal,
} from '../config/supabase';

/**
 * Supabase API Service
 * All database operations for the app
 */

// ============================================
// AUTHENTICATION
// ============================================

export const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
            },
        },
    });

    if (error) throw error;
    return data;
};

export const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) throw error;
    return data;
};

export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
};

export const getCurrentUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
};

export const getSession = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
};

// ============================================
// PERSONAL EXPENSES
// ============================================

export const addPersonalExpense = async (expense: Omit<PersonalExpense, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
        .from('personal_expenses')
        .insert(expense)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const getPersonalExpenses = async (userId: string) => {
    const { data, error } = await supabase
        .from('personal_expenses')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

    if (error) throw error;
    return data;
};

export const updatePersonalExpense = async (id: string, updates: Partial<PersonalExpense>) => {
    const { data, error } = await supabase
        .from('personal_expenses')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const deletePersonalExpense = async (id: string) => {
    const { error } = await supabase
        .from('personal_expenses')
        .delete()
        .eq('id', id);

    if (error) throw error;
};

// ============================================
// PERSONAL INCOMES
// ============================================

export const addPersonalIncome = async (income: Omit<PersonalIncome, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
        .from('personal_incomes')
        .insert(income)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const getPersonalIncomes = async (userId: string) => {
    const { data, error } = await supabase
        .from('personal_incomes')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

    if (error) throw error;
    return data;
};

// ============================================
// PERSONAL GOALS
// ============================================

export const addPersonalGoal = async (goal: Omit<PersonalGoal, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
        .from('personal_goals')
        .insert(goal)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const getPersonalGoals = async (userId: string) => {
    const { data, error } = await supabase
        .from('personal_goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
};

// ============================================
// FAMILY OPERATIONS (RPC Functions)
// ============================================

export const createFamily = async (familyName: string) => {
    const { data, error } = await supabase
        .rpc('create_family', { family_name: familyName });

    if (error) throw error;
    return data; // Returns family_id
};

export const generateInvite = async (familyId: string, expiresInDays: number = 7) => {
    // Use RPC function to bypass RLS and avoid infinite recursion
    const { data, error } = await supabase
        .rpc('get_family_invite_code', { p_family_id: familyId });

    if (error) throw error;
    if (!data) throw new Error('Family invite code not found');

    return data; // Returns permanent invite_code
};

export const joinFamily = async (inviteCode: string) => {
    // Use RPC function to bypass RLS
    const { data, error } = await supabase
        .rpc('join_family_by_code', { p_invite_code: inviteCode.trim().toUpperCase() });

    if (error) throw new Error(error.message || 'Failed to join family');
    if (!data) throw new Error('Failed to join family');

    return data; // Returns family_id
};

export const leaveFamily = async (familyId: string) => {
    const { data, error } = await supabase
        .rpc('leave_family', { p_family_id: familyId });

    if (error) throw error;
    return data;
};

export const getUserFamilies = async () => {
    const { data, error } = await supabase
        .rpc('get_user_families');

    if (error) throw error;
    return data;
};

// ============================================
// FAMILY MEMBERS
// ============================================

export const getFamilyMembers = async (familyId: string) => {
    const { data, error } = await supabase
        .from('family_members')
        .select(`
      *,
      users (
        id,
        full_name,
        email
      )
    `)
        .eq('family_id', familyId)
        .eq('status', 'active');

    if (error) throw error;
    return data;
};

// ============================================
// SYNC OPERATIONS
// ============================================

export const syncExpenseToFamily = async (expenseId: string, familyId: string) => {
    const { data, error } = await supabase
        .rpc('sync_expense_to_family', {
            p_expense_id: expenseId,
            p_family_id: familyId,
        });

    if (error) throw error;
    return data; // Returns shared_expense_id
};

export const unsyncExpenseFromFamily = async (expenseId: string, familyId: string) => {
    const { data, error } = await supabase
        .rpc('unsync_expense_from_family', {
            p_expense_id: expenseId,
            p_family_id: familyId,
        });

    if (error) throw error;
    return data;
};

// ============================================
// SHARED DATA (Family)
// ============================================

export const getSharedExpenses = async (familyId: string) => {
    const { data, error } = await supabase
        .from('shared_expenses')
        .select(`
      *,
      users (
        id,
        full_name,
        email
      )
    `)
        .eq('family_id', familyId)
        .order('date', { ascending: false });

    if (error) throw error;
    return data;
};

export const getSharedIncomes = async (familyId: string) => {
    const { data, error } = await supabase
        .from('shared_incomes')
        .select(`
      *,
      users (
        id,
        full_name,
        email
      )
    `)
        .eq('family_id', familyId)
        .order('date', { ascending: false });

    if (error) throw error;
    return data;
};

export const getSharedGoals = async (familyId: string) => {
    const { data, error } = await supabase
        .from('shared_goals')
        .select(`
      *,
      users (
        id,
        full_name,
        email
      )
    `)
        .eq('family_id', familyId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
};

// ============================================
// REAL-TIME SUBSCRIPTIONS
// ============================================

export const subscribeToSharedExpenses = (
    familyId: string,
    callback: (payload: any) => void
) => {
    return supabase
        .channel(`shared_expenses:${familyId}`)
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'shared_expenses',
                filter: `family_id=eq.${familyId}`,
            },
            callback
        )
        .subscribe();
};

export const subscribeToFamilyMembers = (
    familyId: string,
    callback: (payload: any) => void
) => {
    return supabase
        .channel(`family_members:${familyId}`)
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'family_members',
                filter: `family_id=eq.${familyId}`,
            },
            callback
        )
        .subscribe();
};

// ============================================
// DASHBOARD DATA
// ============================================

export const getExpensesByDateRange = async (startDate: string, endDate: string) => {
    console.log('[API] getExpensesByDateRange called:', { startDate, endDate });

    try {
        const { data: { user } } = await supabase.auth.getUser();
        console.log('[API] User:', user?.id);

        if (!user) throw new Error('Not authenticated');

        console.log('[API] Querying personal_expenses...');
        const { data, error } = await supabase
            .from('personal_expenses')
            .select('*')
            .eq('user_id', user.id)
            .gte('date', startDate)
            .lte('date', endDate)
            .order('date', { ascending: false });

        console.log('[API] Query result:', { count: data?.length, error: error?.message });

        if (error) throw error;
        return data || [];
    } catch (err) {
        console.error('[API] getExpensesByDateRange error:', err);
        throw err;
    }
};

export const getMonthlyTrend = async (monthsOrYear: number = 6) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const expenses = await getPersonalExpenses(user.id);

    // Group by month
    const monthlyTotals: { [key: string]: number } = {};
    expenses.forEach(exp => {
        const month = exp.date.substring(0, 7); // YYYY-MM
        monthlyTotals[month] = (monthlyTotals[month] || 0) + exp.amount;
    });

    // Check if parameter is a year (>= 2000) or number of months
    const isYear = monthsOrYear >= 2000;

    if (isYear) {
        // Return all 12 months for the specified year
        const year = monthsOrYear;
        const result = [];

        console.log('[getMonthlyTrend] Fetching all months for year:', year);

        for (let month = 1; month <= 12; month++) {
            const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
            const total = monthlyTotals[monthKey] || 0;

            console.log(`[getMonthlyTrend] ${monthKey}: ₹${total}`);

            result.push({
                month: monthKey,
                total
            });
        }

        console.log('[getMonthlyTrend] Returning', result.length, 'months for year', year);
        return result;
    } else {
        // Return last N months (original behavior)
        const months = monthsOrYear;
        const result = [];
        const now = new Date();

        console.log('[getMonthlyTrend] Current month:', now.toISOString().substring(0, 7));
        console.log('[getMonthlyTrend] Requesting last', months, 'months');

        for (let i = months - 1; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthKey = d.toISOString().substring(0, 7);
            const total = monthlyTotals[monthKey] || 0;

            console.log(`[getMonthlyTrend] Month ${monthKey}: ₹${total}`);

            result.push({
                month: monthKey,
                total
            });
        }

        console.log('[getMonthlyTrend] Returning', result.length, 'months');
        return result;
    }
};

export const getCategoryBreakdown = async (startDate: string, endDate: string) => {
    const expenses = await getExpensesByDateRange(startDate, endDate);

    // Group by category
    const categoryTotals: { [key: string]: { total: number; count: number } } = {};
    expenses.forEach(exp => {
        if (!categoryTotals[exp.category]) {
            categoryTotals[exp.category] = { total: 0, count: 0 };
        }
        categoryTotals[exp.category].total += exp.amount;
        categoryTotals[exp.category].count += 1;
    });

    // Calculate total for percentages
    const grandTotal = Object.values(categoryTotals).reduce((sum, cat) => sum + cat.total, 0);

    // Convert to array with percentages
    return Object.entries(categoryTotals).map(([category, data]) => ({
        category,
        total: data.total,
        count: data.count,
        percentage: grandTotal > 0 ? (data.total / grandTotal) * 100 : 0
    })).sort((a, b) => b.total - a.total);
};

export const getDailySpending = async (days: number = 30) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const expenses = await getExpensesByDateRange(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
    );

    // Group by date
    const dailyTotals: { [key: string]: number } = {};
    expenses.forEach(exp => {
        dailyTotals[exp.date] = (dailyTotals[exp.date] || 0) + exp.amount;
    });

    // Fill in missing dates with 0
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateKey = d.toISOString().split('T')[0];
        result.push({
            date: dateKey,
            total: dailyTotals[dateKey] || 0
        });
    }

    return result;
};

// ============================================
// BUDGETS
// ============================================

export interface Budget {
    id: string;
    user_id: string;
    family_id: string | null;
    category: string;
    amount: number;
    month: number;
    year: number;
    created_at: string;
    updated_at: string;
}

export interface CreateBudgetInput {
    category: string;
    amount: number;
    month: number;
    year: number;
    family_id?: string | null;
}

export interface BudgetProgress {
    budget: Budget;
    spent: number;
    remaining: number;
    percentage: number;
    status: 'safe' | 'warning' | 'danger' | 'over';
}

// Get all budgets for a specific month/year
export const getBudgets = async (month: number, year: number): Promise<Budget[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .eq('month', month)
        .eq('year', year)
        .order('category');

    if (error) throw error;
    return data || [];
};

// Get budget for specific category
export const getBudgetByCategory = async (
    category: string,
    month: number,
    year: number
): Promise<Budget | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .eq('category', category)
        .eq('month', month)
        .eq('year', year)
        .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    return data;
};

// Create new budget
export const createBudget = async (input: CreateBudgetInput): Promise<Budget> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    console.log('[createBudget] Creating budget:', input);
    console.log('[createBudget] User ID:', user.id);

    const { data, error } = await supabase
        .from('budgets')
        .insert({
            user_id: user.id,
            category: input.category,
            amount: input.amount,
            month: input.month,
            year: input.year,
            family_id: input.family_id || null,
        })
        .select()
        .single();

    if (error) {
        console.error('[createBudget] Error:', error);
        console.error('[createBudget] Error details:', JSON.stringify(error, null, 2));
        throw error;
    }

    console.log('[createBudget] Success:', data);
    return data;
};

// Update budget amount
export const updateBudget = async (id: string, amount: number): Promise<Budget> => {
    const { data, error } = await supabase
        .from('budgets')
        .update({ amount })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
};

// Delete budget
export const deleteBudget = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id);

    if (error) throw error;
};

// Get budget progress (budget vs actual spending)
export const getBudgetProgress = async (
    category: string,
    month: number,
    year: number
): Promise<BudgetProgress | null> => {
    // Get budget
    const budget = await getBudgetByCategory(category, month, year);
    if (!budget) return null;

    // Get actual spending for the category
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const expenses = await getExpensesByDateRange(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
    );

    const spent = expenses
        .filter(exp => exp.category === category)
        .reduce((sum, exp) => sum + exp.amount, 0);

    const remaining = budget.amount - spent;
    const percentage = (spent / budget.amount) * 100;

    let status: 'safe' | 'warning' | 'danger' | 'over';
    if (percentage > 100) status = 'over';
    else if (percentage > 90) status = 'danger';
    else if (percentage > 75) status = 'warning';
    else status = 'safe';

    return {
        budget,
        spent,
        remaining,
        percentage,
        status,
    };
};

// Get all budget progress for a month
export const getAllBudgetProgress = async (
    month: number,
    year: number
): Promise<BudgetProgress[]> => {
    const budgets = await getBudgets(month, year);
    const progress: BudgetProgress[] = [];

    for (const budget of budgets) {
        const budgetProgress = await getBudgetProgress(budget.category, month, year);
        if (budgetProgress) {
            progress.push(budgetProgress);
        }
    }

    return progress;
};
