// ============================================
// TRANSACTION MANAGEMENT
// ============================================

import { supabase } from '../config/supabase';

export interface UpdateExpenseInput {
    amount?: number;
    category?: string;
    description?: string;
    date?: string;
    allocated_goal_id?: string | null;
    allocated_goal_type?: 'personal' | 'family' | null;
}

// Update an existing transaction
export const updateTransaction = async (id: string, updates: UpdateExpenseInput): Promise<any> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('personal_expenses')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

    if (error) throw error;
    return data;
};

// Delete a transaction
export const deleteTransaction = async (id: string): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
        .from('personal_expenses')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) throw error;
};

export interface CreateManualTransactionInput {
    amount: number;
    category: string;
    description: string;
    date: string;
    allocated_goal_id?: string;
    allocated_goal_type?: 'personal' | 'family';
}

// Create a manual transaction
export const createManualTransaction = async (input: CreateManualTransactionInput): Promise<any> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('personal_expenses')
        .insert({
            user_id: user.id,
            amount: input.amount,
            category: input.category,
            description: input.description,
            date: input.date,
            source: 'manual',
            allocated_goal_id: input.allocated_goal_id || null,
            allocated_goal_type: input.allocated_goal_type || null,
        })
        .select()
        .single();

    if (error) throw error;
    return data;
};

// Search transactions by description
export const searchTransactions = async (query: string): Promise<any[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('personal_expenses')
        .select('*')
        .eq('user_id', user.id)
        .ilike('description', `%${query}%`)
        .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
};

export interface TransactionFilters {
    category?: string;
    startDate?: string;
    endDate?: string;
    minAmount?: number;
    maxAmount?: number;
}

// Filter transactions
export const filterTransactions = async (filters: TransactionFilters): Promise<any[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    let query = supabase
        .from('personal_expenses')
        .select('*')
        .eq('user_id', user.id);

    if (filters.category) {
        query = query.eq('category', filters.category);
    }

    if (filters.startDate) {
        query = query.gte('date', filters.startDate);
    }

    if (filters.endDate) {
        query = query.lte('date', filters.endDate);
    }

    if (filters.minAmount !== undefined) {
        query = query.gte('amount', filters.minAmount);
    }

    if (filters.maxAmount !== undefined) {
        query = query.lte('amount', filters.maxAmount);
    }

    query = query.order('date', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
};

// Get transactions allocated to a specific goal
export const getTransactionsByGoal = async (
    goalId: string,
    goalType: 'personal' | 'family'
): Promise<any[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('personal_expenses')
        .select('*')
        .eq('user_id', user.id)
        .eq('allocated_goal_id', goalId)
        .eq('allocated_goal_type', goalType)
        .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
};
