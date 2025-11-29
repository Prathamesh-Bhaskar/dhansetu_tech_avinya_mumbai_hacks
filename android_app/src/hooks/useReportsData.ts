import { useState, useEffect, useCallback } from 'react';
import * as SupabaseAPI from '../services/SupabaseAPI';

export interface CategoryBreakdown {
    category: string;
    totalAmount: number;
    percentage: number;
    transactionCount: number;
    averageAmount: number;
    trend: number;
}

export interface ReportSummary {
    totalSpent: number;
    transactionCount: number;
    dailyAverage: number;
    highestDay: { date: string; amount: number };
    categoryBreakdown: CategoryBreakdown[];
    topExpenses: any[];
    spendingByDayOfWeek: { day: string; amount: number }[];
}

export type ReportPeriod = 'thisMonth' | 'lastMonth' | 'last3Months' | 'last6Months' | 'thisYear' | 'custom';

export const useReportsData = (period: ReportPeriod = 'thisMonth', customStart?: Date, customEnd?: Date) => {
    const [summary, setSummary] = useState<ReportSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const getDateRange = useCallback(() => {
        const now = new Date();
        let start: Date, end: Date;

        switch (period) {
            case 'thisMonth':
                start = new Date(now.getFullYear(), now.getMonth(), 1);
                end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                break;
            case 'lastMonth':
                start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                end = new Date(now.getFullYear(), now.getMonth(), 0);
                break;
            case 'last3Months':
                start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
                end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                break;
            case 'last6Months':
                start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
                end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                break;
            case 'thisYear':
                start = new Date(now.getFullYear(), 0, 1);
                end = new Date(now.getFullYear(), 11, 31);
                break;
            case 'custom':
                start = customStart || new Date(now.getFullYear(), now.getMonth(), 1);
                end = customEnd || new Date(now.getFullYear(), now.getMonth() + 1, 0);
                break;
            default:
                start = new Date(now.getFullYear(), now.getMonth(), 1);
                end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        }

        return { start, end };
    }, [period, customStart, customEnd]);

    const loadReportData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const { start, end } = getDateRange();

            // Fetch current period expenses
            const expenses = await SupabaseAPI.getExpensesByDateRange(
                start.toISOString().split('T')[0],
                end.toISOString().split('T')[0]
            );

            if (expenses.length === 0) {
                setSummary({
                    totalSpent: 0,
                    transactionCount: 0,
                    dailyAverage: 0,
                    highestDay: { date: '', amount: 0 },
                    categoryBreakdown: [],
                    topExpenses: [],
                    spendingByDayOfWeek: [],
                });
                return;
            }

            // Calculate total spent
            const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
            const transactionCount = expenses.length;

            // Calculate daily average
            const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
            const dailyAverage = totalSpent / daysDiff;

            // Find highest spending day
            const dailyTotals = expenses.reduce((acc, exp) => {
                const date = exp.date.split('T')[0];
                acc[date] = (acc[date] || 0) + exp.amount;
                return acc;
            }, {} as Record<string, number>);

            const highestDay = Object.entries(dailyTotals).reduce(
                (max, [date, amount]) => (amount as number) > max.amount ? { date, amount: amount as number } : max,
                { date: '', amount: 0 }
            );

            // Category breakdown
            const categoryTotals = expenses.reduce((acc, exp) => {
                acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
                return acc;
            }, {} as Record<string, number>);

            const categoryTransactionCounts = expenses.reduce((acc, exp) => {
                acc[exp.category] = (acc[exp.category] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

            // Fetch previous period for trend calculation
            const periodLength = end.getTime() - start.getTime();
            const prevStart = new Date(start.getTime() - periodLength);
            const prevEnd = new Date(start.getTime() - 1);

            const prevExpenses = await SupabaseAPI.getExpensesByDateRange(
                prevStart.toISOString().split('T')[0],
                prevEnd.toISOString().split('T')[0]
            );

            const prevCategoryTotals = prevExpenses.reduce((acc, exp) => {
                acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
                return acc;
            }, {} as Record<string, number>);

            const categoryBreakdown: CategoryBreakdown[] = Object.entries(categoryTotals)
                .map(([category, amount]) => {
                    const numAmount = amount as number;
                    const count = categoryTransactionCounts[category];
                    const prevAmount = prevCategoryTotals[category] || 0;
                    const trend = prevAmount > 0 ? ((numAmount - prevAmount) / prevAmount) * 100 : 0;

                    return {
                        category,
                        totalAmount: numAmount,
                        percentage: (numAmount / totalSpent) * 100,
                        transactionCount: count,
                        averageAmount: numAmount / count,
                        trend,
                    };
                })
                .sort((a, b) => b.totalAmount - a.totalAmount);

            // Top expenses
            const topExpenses = [...expenses]
                .sort((a, b) => b.amount - a.amount)
                .slice(0, 10);

            // Spending by day of week
            const dayOfWeekTotals = expenses.reduce((acc, exp) => {
                const date = new Date(exp.date);
                const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];
                acc[dayName] = (acc[dayName] || 0) + exp.amount;
                return acc;
            }, {} as Record<string, number>);

            const spendingByDayOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
                .map(day => ({
                    day,
                    amount: dayOfWeekTotals[day] || 0,
                }));

            setSummary({
                totalSpent,
                transactionCount,
                dailyAverage,
                highestDay,
                categoryBreakdown,
                topExpenses,
                spendingByDayOfWeek,
            });
        } catch (err) {
            console.error('Error loading report data:', err);
            setError('Failed to load report data');
        } finally {
            setLoading(false);
        }
    }, [getDateRange]);

    useEffect(() => {
        loadReportData();
    }, [loadReportData]);

    return {
        summary,
        loading,
        error,
        refresh: loadReportData,
    };
};
