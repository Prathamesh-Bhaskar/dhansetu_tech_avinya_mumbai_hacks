import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Supabase configuration
const SUPABASE_URL = 'https://xiucobuwxykbtwhueohy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpdWNvYnV3eHlrYnR3aHVlb2h5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNTIzNjUsImV4cCI6MjA3OTYyODM2NX0.ARUCF0HRptOLQLrmX6GJQETadJNuayM53XLD6yYWmMU';

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});

// Database Types
export interface User {
    id: string;
    full_name: string | null;
    email: string | null;
    created_at: string;
}

export interface PersonalExpense {
    id: string;
    user_id: string;
    category: string;
    amount: number;
    merchant?: string;
    date: string;
    time?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface PersonalIncome {
    id: string;
    user_id: string;
    source: string;
    amount: number;
    date: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface PersonalGoal {
    id: string;
    user_id: string;
    goal_name: string;
    target_amount: number;
    saved_amount: number;
    deadline?: string;
    visibility: 'personal' | 'family';
    progress: number;
    created_at: string;
    updated_at: string;
}

export interface Family {
    id: string;
    family_name: string;
    created_by: string;
    created_at: string;
    invite_code?: string; // Permanent invite code for the family
}

export interface FamilyMember {
    id: string;
    family_id: string;
    user_id: string;
    role: 'owner' | 'member';
    status: 'active' | 'removed';
    joined_at: string;
}

export interface FamilyInvitation {
    id: string;
    family_id: string;
    invite_code: string;
    created_by: string;
    status: 'pending' | 'accepted' | 'cancelled';
    expires_at: string;
    used_by?: string;
    created_at: string;
}

export interface SharedExpense {
    id: string;
    family_id: string;
    user_id: string;
    personal_expense_id?: string;
    category: string;
    amount: number;
    merchant?: string;
    date: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface SharedIncome {
    id: string;
    family_id: string;
    user_id: string;
    personal_income_id?: string;
    source: string;
    amount: number;
    date: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface SharedGoal {
    id: string;
    family_id: string;
    user_id: string;
    personal_goal_id?: string;
    goal_name: string;
    target_amount: number;
    saved_amount: number;
    deadline?: string;
    progress: number;
    created_at: string;
    updated_at: string;
}
