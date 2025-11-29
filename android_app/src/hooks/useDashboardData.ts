import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import * as SupabaseAPI from '../services/SupabaseAPI';

export interface MonthlyData {
    month: string;
    total: number;
}

export interface CategoryData {
    category: string;
    total: number;
    count: number;
    percentage: number;
}

export interface DailyData {
    date: string;
    total: number;
}

export const useDashboardData = () => {
    const { user } = useAuth();
    const [monthlyTrend, setMonthlyTrend] = useState<MonthlyData[]>([]);
    const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryData[]>([]);
    const [dailySpending, setDailySpending] = useState<DailyData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        loadDashboardData();
    }, [user]);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Add timeout to prevent infinite loading
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Request timeout')), 10000)
            );

            const loadPromise = (async () => {
                // Load monthly trend (last 6 months)
                const monthlyData = await SupabaseAPI.getMonthlyTrend(6);

                // Load category breakdown (this month)
                const now = new Date();
                const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

                const categoryData = await SupabaseAPI.getCategoryBreakdown(
                    monthStart.toISOString().split('T')[0],
                    monthEnd.toISOString().split('T')[0]
                );

                // Load daily spending (last 30 days)
                const dailyData = await SupabaseAPI.getDailySpending(30);

                return { monthlyData, categoryData, dailyData };
            })();

            const result = await Promise.race([loadPromise, timeoutPromise]) as any;

            setMonthlyTrend(result.monthlyData);
            setCategoryBreakdown(result.categoryData);
            setDailySpending(result.dailyData);

        } catch (err: any) {
            console.error('Error loading dashboard data:', err);
            setError(err.message || 'Failed to load dashboard data');
            // Set empty arrays on error
            setMonthlyTrend([]);
            setCategoryBreakdown([]);
            setDailySpending([]);
        } finally {
            setLoading(false);
        }
    };

    return {
        monthlyTrend,
        categoryBreakdown,
        dailySpending,
        loading,
        error,
        refresh: loadDashboardData
    };
};
