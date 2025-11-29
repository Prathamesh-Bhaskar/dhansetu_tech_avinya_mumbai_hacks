import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import * as SupabaseAPI from '../services/SupabaseAPI';

export interface DashboardStats {
    totalThisMonth: number;
    totalLastMonth: number;
    percentageChange: number;
    avgDailySpend: number;
    highestExpense: number;
    transactionCount: number;
    topCategory: string;
}

export const useExpenseStats = (startDate?: Date, endDate?: Date, category?: string) => {
    const { user } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        loadStats();
    }, [user, startDate, endDate, category]);

    const loadStats = async () => {
        try {
            setLoading(true);
            setError(null);

            // Add timeout to prevent infinite loading
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Request timeout')), 10000)
            );

            const loadPromise = (async () => {
                const now = new Date();
                const thisMonthStart = startDate || new Date(now.getFullYear(), now.getMonth(), 1);
                const thisMonthEnd = endDate || new Date(now.getFullYear(), now.getMonth() + 1, 0);
                const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

                // Get expenses for this month
                let thisMonthExpenses = await SupabaseAPI.getExpensesByDateRange(
                    thisMonthStart.toISOString().split('T')[0],
                    thisMonthEnd.toISOString().split('T')[0]
                );

                // Get expenses for last month
                let lastMonthExpenses = await SupabaseAPI.getExpensesByDateRange(
                    lastMonthStart.toISOString().split('T')[0],
                    lastMonthEnd.toISOString().split('T')[0]
                );

                // Apply category filter if specified
                if (category && category !== 'all') {
                    thisMonthExpenses = thisMonthExpenses.filter(exp => exp.category === category);
                    lastMonthExpenses = lastMonthExpenses.filter(exp => exp.category === category);
                }

                // Calculate totals
                const totalThisMonth = thisMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
                const totalLastMonth = lastMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);

                // Calculate percentage change
                const percentageChange = totalLastMonth === 0
                    ? 0
                    : ((totalThisMonth - totalLastMonth) / totalLastMonth) * 100;

                // Calculate average daily spend
                const daysInMonth = thisMonthEnd.getDate();
                const avgDailySpend = totalThisMonth / daysInMonth;

                // Find highest expense
                const highestExpense = thisMonthExpenses.length > 0
                    ? Math.max(...thisMonthExpenses.map(exp => exp.amount))
                    : 0;

                // Count transactions
                const transactionCount = thisMonthExpenses.length;

                // Find top category
                const categoryTotals: { [key: string]: number } = {};
                thisMonthExpenses.forEach(exp => {
                    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
                });

                const topCategory = Object.entries(categoryTotals).length > 0
                    ? Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0][0]
                    : 'None';

                setStats({
                    totalThisMonth,
                    totalLastMonth,
                    percentageChange,
                    avgDailySpend,
                    highestExpense,
                    transactionCount,
                    topCategory,
                });
            })();

            await Promise.race([loadPromise, timeoutPromise]);
        } catch (err: any) {
            console.error('Error loading stats:', err);
            setError(err.message || 'Failed to load statistics');
            // Set empty stats on error so UI doesn't stay loading forever
            setStats({
                totalThisMonth: 0,
                totalLastMonth: 0,
                percentageChange: 0,
                avgDailySpend: 0,
                highestExpense: 0,
                transactionCount: 0,
                topCategory: 'None',
            });
        } finally {
            setLoading(false);
        }
    };

    return { stats, loading, error, refresh: loadStats };
};
