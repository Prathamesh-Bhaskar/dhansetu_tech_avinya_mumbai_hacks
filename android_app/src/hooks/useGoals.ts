import { useState, useEffect, useCallback } from 'react';
import * as GoalsAPI from '../services/GoalsAPI';
import type {
    PersonalGoal,
    FamilyGoal,
    FamilyGoalWithContributions,
    GoalStats,
} from '../types/goals';

/**
 * Hook for managing personal goals
 */
export const usePersonalGoals = () => {
    const [goals, setGoals] = useState<PersonalGoal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadGoals = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await GoalsAPI.getPersonalGoals();
            setGoals(data);
        } catch (err: any) {
            setError(err.message || 'Failed to load goals');
            console.error('Error loading personal goals:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadGoals();
    }, [loadGoals]);

    const refresh = useCallback(() => {
        loadGoals();
    }, [loadGoals]);

    return {
        goals,
        loading,
        error,
        refresh,
    };
};

/**
 * Hook for managing family goals
 */
export const useFamilyGoals = (familyId: string | null) => {
    const [goals, setGoals] = useState<FamilyGoal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadGoals = useCallback(async () => {
        if (!familyId) {
            setGoals([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const data = await GoalsAPI.getFamilyGoals(familyId);
            setGoals(data);
        } catch (err: any) {
            setError(err.message || 'Failed to load family goals');
            console.error('Error loading family goals:', err);
        } finally {
            setLoading(false);
        }
    }, [familyId]);

    useEffect(() => {
        loadGoals();
    }, [loadGoals]);

    const refresh = useCallback(() => {
        loadGoals();
    }, [loadGoals]);

    return {
        goals,
        loading,
        error,
        refresh,
    };
};

/**
 * Hook for getting goal statistics
 */
export const useGoalStats = (type: 'personal' | 'family', familyId?: string) => {
    const [stats, setStats] = useState<GoalStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadStats = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            if (type === 'personal') {
                const data = await GoalsAPI.getPersonalGoalStats();
                setStats(data);
            } else if (type === 'family' && familyId) {
                const data = await GoalsAPI.getFamilyGoalStats(familyId);
                setStats(data);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load stats');
            console.error('Error loading goal stats:', err);
        } finally {
            setLoading(false);
        }
    }, [type, familyId]);

    useEffect(() => {
        loadStats();
    }, [loadStats]);

    const refresh = useCallback(() => {
        loadStats();
    }, [loadStats]);

    return {
        stats,
        loading,
        error,
        refresh,
    };
};
