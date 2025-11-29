// ============================================
// ONBOARDING CONTEXT
// State Management for Onboarding Flow
// ============================================

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CreateProfileInput } from '../types/profile';
import * as ProfileAPI from '../services/ProfileAPI';

interface OnboardingContextType {
    // Profile data being collected
    profileData: CreateProfileInput;
    updateProfileData: (data: Partial<CreateProfileInput>) => void;
    clearProfileData: () => void;

    // Navigation
    currentStep: number;
    totalSteps: number;
    nextStep: () => void;
    previousStep: () => void;
    goToStep: (step: number) => void;

    // Actions
    saveProfile: () => Promise<void>;
    completeOnboarding: () => Promise<void>;

    // State
    isLoading: boolean;
    error: string | null;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

interface OnboardingProviderProps {
    children: ReactNode;
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({ children }) => {
    const [profileData, setProfileData] = useState<CreateProfileInput>({
        // Default values
        ai_personalization_level: 'balanced',
        smart_categorization: true,
        spending_predictions: true,
        budget_recommendations: true,
        goal_optimization: true,
        anomaly_detection: true,
        personalized_insights: true,
    });

    const [currentStep, setCurrentStep] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const totalSteps = 6; // Welcome, Personal, Income, Spending, Goals, AI Preferences

    /**
     * Update profile data (merge with existing)
     */
    const updateProfileData = (data: Partial<CreateProfileInput>) => {
        setProfileData(prev => ({ ...prev, ...data }));
        setError(null);
    };

    /**
     * Clear all profile data
     */
    const clearProfileData = () => {
        setProfileData({
            ai_personalization_level: 'balanced',
            smart_categorization: true,
            spending_predictions: true,
            budget_recommendations: true,
            goal_optimization: true,
            anomaly_detection: true,
            personalized_insights: true,
        });
        setCurrentStep(0);
        setError(null);
    };

    /**
     * Navigate to next step
     */
    const nextStep = () => {
        if (currentStep < totalSteps - 1) {
            setCurrentStep(prev => prev + 1);
        }
    };

    /**
     * Navigate to previous step
     */
    const previousStep = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    /**
     * Navigate to specific step
     */
    const goToStep = (step: number) => {
        if (step >= 0 && step < totalSteps) {
            setCurrentStep(step);
        }
    };

    /**
     * Save profile to database (without completing onboarding)
     */
    const saveProfile = async () => {
        try {
            setIsLoading(true);
            setError(null);
            await ProfileAPI.upsertUserProfile(profileData);
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to save profile';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Complete onboarding (save profile and mark as completed)
     */
    const completeOnboarding = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Save profile data
            await ProfileAPI.upsertUserProfile(profileData);

            // Mark onboarding as completed
            await ProfileAPI.completeOnboarding();

            // Clear local state
            clearProfileData();
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to complete onboarding';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const value: OnboardingContextType = {
        profileData,
        updateProfileData,
        clearProfileData,
        currentStep,
        totalSteps,
        nextStep,
        previousStep,
        goToStep,
        saveProfile,
        completeOnboarding,
        isLoading,
        error,
    };

    return (
        <OnboardingContext.Provider value={value}>
            {children}
        </OnboardingContext.Provider>
    );
};

/**
 * Hook to use onboarding context
 */
export const useOnboarding = (): OnboardingContextType => {
    const context = useContext(OnboardingContext);
    if (!context) {
        throw new Error('useOnboarding must be used within OnboardingProvider');
    }
    return context;
};
