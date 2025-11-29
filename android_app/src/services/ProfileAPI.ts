// ============================================
// PROFILE API
// User Profile Management for Personalization
// ============================================

import { supabase } from '../config/supabase';
import type { UserProfile, CreateProfileInput, UpdateProfileInput } from '../types/profile';

/**
 * Get current user's profile
 */
export const getUserProfile = async (): Promise<UserProfile | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

    if (error) throw error;
    return data;
};

/**
 * Create or update user profile
 */
export const upsertUserProfile = async (
    profileData: CreateProfileInput | UpdateProfileInput
): Promise<UserProfile> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
            user_id: user.id,
            ...profileData,
            updated_at: new Date().toISOString(),
        }, {
            onConflict: 'user_id'
        })
        .select()
        .single();

    if (error) throw error;
    return data;
};

/**
 * Update specific fields in user profile
 */
export const updateUserProfile = async (
    updates: UpdateProfileInput
): Promise<UserProfile> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('user_profiles')
        .update({
            ...updates,
            updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .select()
        .single();

    if (error) throw error;
    return data;
};

/**
 * Mark onboarding as completed
 */
export const completeOnboarding = async (): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
        .from('user_profiles')
        .update({
            onboarding_completed: true,
            onboarding_completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

    if (error) throw error;
};

/**
 * Check if onboarding is completed
 */
export const isOnboardingCompleted = async (): Promise<boolean> => {
    try {
        const profile = await getUserProfile();
        return profile?.onboarding_completed || false;
    } catch (error) {
        console.error('Error checking onboarding status:', error);
        return false;
    }
};

/**
 * Get profile completeness percentage
 */
export const getProfileCompleteness = async (): Promise<number> => {
    const profile = await getUserProfile();
    return profile?.profile_completeness || 0;
};

/**
 * Delete user profile
 */
export const deleteUserProfile = async (): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('user_id', user.id);

    if (error) throw error;
};

/**
 * Reset onboarding (for testing)
 */
export const resetOnboarding = async (): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
        .from('user_profiles')
        .update({
            onboarding_completed: false,
            onboarding_completed_at: null,
            updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

    if (error) throw error;
};
