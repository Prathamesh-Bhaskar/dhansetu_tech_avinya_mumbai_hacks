import { supabase } from '../config/supabase';
import type {
    PersonalGoal,
    CreatePersonalGoalInput,
    UpdatePersonalGoalInput,
    FamilyGoal,
    CreateFamilyGoalInput,
    UpdateFamilyGoalInput,
    FamilyGoalContribution,
    FamilyGoalWithContributions,
    GoalStats,
} from '../types/goals';

// ============================================
// PERSONAL GOALS API
// ============================================

/**
 * Get all personal goals for current user
 */
export const getPersonalGoals = async (): Promise<PersonalGoal[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('personal_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
};

/**
 * Get personal goal by ID
 */
export const getPersonalGoalDetails = async (id: string): Promise<PersonalGoal> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('personal_goals')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

    if (error) throw error;
    return data;
};

/**
 * Create new personal goal
 */
export const createPersonalGoal = async (input: CreatePersonalGoalInput): Promise<PersonalGoal> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('personal_goals')
        .insert({
            user_id: user.id,
            goal_name: input.goal_name,
            description: input.description,
            target_amount: input.target_amount,
            saved_amount: 0,
            deadline: input.deadline,
            status: 'active',
            progress: 0,
        })
        .select()
        .single();

    if (error) throw error;
    return data;
};

/**
 * Update personal goal
 */
export const updatePersonalGoal = async (
    id: string,
    updates: UpdatePersonalGoalInput
): Promise<PersonalGoal> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('personal_goals')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

    if (error) throw error;
    return data;
};

/**
 * Delete personal goal
 */
export const deletePersonalGoal = async (id: string): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
        .from('personal_goals')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) throw error;
};

/**
 * Add contribution to personal goal
 */
export const addPersonalContribution = async (
    goalId: string,
    amount: number
): Promise<PersonalGoal> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get current goal
    const goal = await getPersonalGoalDetails(goalId);

    // Update saved amount
    const newSavedAmount = goal.saved_amount + amount;

    return updatePersonalGoal(goalId, {
        saved_amount: newSavedAmount,
    });
};

/**
 * Get personal goals statistics
 */
export const getPersonalGoalStats = async (): Promise<GoalStats> => {
    const goals = await getPersonalGoals();

    const activeGoals = goals.filter(g => g.status === 'active');
    const completedGoals = goals.filter(g => g.status === 'completed');

    const totalTarget = goals.reduce((sum, g) => sum + g.target_amount, 0);
    const totalSaved = goals.reduce((sum, g) => sum + g.saved_amount, 0);

    return {
        total_goals: goals.length,
        active_goals: activeGoals.length,
        completed_goals: completedGoals.length,
        total_target: totalTarget,
        total_saved: totalSaved,
        overall_progress: totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0,
    };
};

// ============================================
// FAMILY GOALS API
// ============================================

/**
 * Get all family goals for current user's family
 */
export const getFamilyGoals = async (familyId: string): Promise<FamilyGoal[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('family_goals')
        .select('*')
        .eq('family_id', familyId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
};

/**
 * Get family goal details with all contributions
 */
export const getFamilyGoalDetails = async (id: string): Promise<FamilyGoalWithContributions> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get goal
    const { data: goal, error: goalError } = await supabase
        .from('family_goals')
        .select('*')
        .eq('id', id)
        .single();

    if (goalError) throw goalError;

    // Get contributions with user names
    const { data: contributions, error: contribError } = await supabase
        .from('family_goal_contributions')
        .select(`
      *,
      users:user_id (
        full_name
      )
    `)
        .eq('family_goal_id', id);

    if (contribError) throw contribError;

    // Format contributions
    const formattedContributions: FamilyGoalContribution[] = (contributions || []).map((c: any) => ({
        id: c.id,
        family_goal_id: c.family_goal_id,
        user_id: c.user_id,
        user_name: c.users?.full_name || 'Unknown',
        amount: c.amount,
        notes: c.notes,
        contributed_at: c.contributed_at,
    }));

    // Calculate progress
    const progress = goal.target_amount > 0
        ? (goal.total_saved / goal.target_amount) * 100
        : 0;

    // Get user's contribution
    const userContribution = formattedContributions.find(c => c.user_id === user.id);

    return {
        ...goal,
        contributions: formattedContributions,
        progress,
        user_contribution: userContribution?.amount || 0,
    };
};

/**
 * Create new family goal
 */
export const createFamilyGoal = async (
    familyId: string,
    input: CreateFamilyGoalInput
): Promise<FamilyGoal> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('family_goals')
        .insert({
            family_id: familyId,
            created_by: user.id,
            goal_name: input.goal_name,
            description: input.description,
            target_amount: input.target_amount,
            total_saved: 0,
            deadline: input.deadline,
            status: 'active',
        })
        .select()
        .single();

    if (error) throw error;
    return data;
};

/**
 * Update family goal (only creator can update)
 */
export const updateFamilyGoal = async (
    id: string,
    updates: UpdateFamilyGoalInput
): Promise<FamilyGoal> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('family_goals')
        .update(updates)
        .eq('id', id)
        .eq('created_by', user.id)
        .select()
        .single();

    if (error) throw error;
    return data;
};

/**
 * Delete family goal (only creator can delete)
 */
export const deleteFamilyGoal = async (id: string): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
        .from('family_goals')
        .delete()
        .eq('id', id)
        .eq('created_by', user.id);

    if (error) throw error;
};

/**
 * Add or update user's contribution to family goal
 */
export const addFamilyContribution = async (
    goalId: string,
    amount: number,
    notes?: string
): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Upsert contribution (insert or update if exists)
    const { error } = await supabase
        .from('family_goal_contributions')
        .upsert({
            family_goal_id: goalId,
            user_id: user.id,
            amount,
            notes,
        }, {
            onConflict: 'family_goal_id,user_id'
        });

    if (error) throw error;
};

/**
 * Get user's contribution to a family goal
 */
export const getUserContribution = async (goalId: string): Promise<number> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('family_goal_contributions')
        .select('amount')
        .eq('family_goal_id', goalId)
        .eq('user_id', user.id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return 0; // No contribution yet
        throw error;
    }

    return data?.amount || 0;
};

/**
 * Get family goals statistics
 */
export const getFamilyGoalStats = async (familyId: string): Promise<GoalStats> => {
    const goals = await getFamilyGoals(familyId);

    const activeGoals = goals.filter(g => g.status === 'active');
    const completedGoals = goals.filter(g => g.status === 'completed');

    const totalTarget = goals.reduce((sum, g) => sum + g.target_amount, 0);
    const totalSaved = goals.reduce((sum, g) => sum + g.total_saved, 0);

    return {
        total_goals: goals.length,
        active_goals: activeGoals.length,
        completed_goals: completedGoals.length,
        total_target: totalTarget,
        total_saved: totalSaved,
        overall_progress: totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0,
    };
};

// ============================================
// GOAL SELECTION HELPER
// ============================================

/**
 * Get all goals (personal + family) for selection dropdown
 */
export const getAllGoalsForSelection = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get personal goals
    const personalGoals = await getPersonalGoals();

    // Get family goals
    const { data: familyData } = await supabase
        .from('family_members')
        .select('family_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

    let familyGoals: FamilyGoal[] = [];
    if (familyData?.family_id) {
        familyGoals = await getFamilyGoals(familyData.family_id);
    }

    return {
        personal: personalGoals.filter(g => g.status === 'active'),
        family: familyGoals.filter(g => g.status === 'active'),
    };
};
