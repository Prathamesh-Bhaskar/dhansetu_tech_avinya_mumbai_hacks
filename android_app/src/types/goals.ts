// ============================================
// GOALS TYPES & INTERFACES
// ============================================

export interface PersonalGoal {
    id: string;
    user_id: string;
    goal_name: string;
    description?: string;
    target_amount: number;
    saved_amount: number;
    deadline?: string;
    status: 'active' | 'completed' | 'cancelled';
    progress: number;
    created_at: string;
    updated_at: string;
}

export interface CreatePersonalGoalInput {
    goal_name: string;
    description?: string;
    target_amount: number;
    deadline?: string;
}

export interface UpdatePersonalGoalInput {
    goal_name?: string;
    description?: string;
    target_amount?: number;
    saved_amount?: number;
    deadline?: string;
    status?: 'active' | 'completed' | 'cancelled';
}

export interface FamilyGoal {
    id: string;
    family_id: string;
    goal_name: string;
    description?: string;
    target_amount: number;
    total_saved: number;
    deadline?: string;
    status: 'active' | 'completed' | 'cancelled';
    created_by: string;
    created_at: string;
    updated_at: string;
}

export interface CreateFamilyGoalInput {
    goal_name: string;
    description?: string;
    target_amount: number;
    deadline?: string;
}

export interface UpdateFamilyGoalInput {
    goal_name?: string;
    description?: string;
    target_amount?: number;
    deadline?: string;
    status?: 'active' | 'completed' | 'cancelled';
}

export interface FamilyGoalContribution {
    id: string;
    family_goal_id: string;
    user_id: string;
    user_name?: string;
    amount: number;
    notes?: string;
    contributed_at: string;
}

export interface FamilyGoalWithContributions extends FamilyGoal {
    contributions: FamilyGoalContribution[];
    progress: number;
    user_contribution?: number;
}

export interface GoalStats {
    total_goals: number;
    active_goals: number;
    completed_goals: number;
    total_target: number;
    total_saved: number;
    overall_progress: number;
}
