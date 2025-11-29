import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as SupabaseAPI from '../../services/SupabaseAPI';

interface Props {
    onViewAll: () => void;
}

interface BudgetSummary {
    totalBudget: number;
    totalSpent: number;
    remaining: number;
    percentage: number;
    budgetCount: number;
    onTrackCount: number;
    warningCount: number;
    dangerCount: number;
    overCount: number;
}

export const BudgetSummaryCard: React.FC<Props> = ({ onViewAll }) => {
    const [summary, setSummary] = useState<BudgetSummary | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBudgetSummary();
    }, []);

    const loadBudgetSummary = async () => {
        try {
            setLoading(true);
            const now = new Date();
            const month = now.getMonth() + 1;
            const year = now.getFullYear();

            const progress = await SupabaseAPI.getAllBudgetProgress(month, year);

            if (progress.length === 0) {
                setSummary(null);
                return;
            }

            const totalBudget = progress.reduce((sum, p) => sum + p.budget.amount, 0);
            const totalSpent = progress.reduce((sum, p) => sum + p.spent, 0);
            const remaining = totalBudget - totalSpent;
            const percentage = (totalSpent / totalBudget) * 100;

            const onTrackCount = progress.filter(p => p.status === 'safe').length;
            const warningCount = progress.filter(p => p.status === 'warning').length;
            const dangerCount = progress.filter(p => p.status === 'danger').length;
            const overCount = progress.filter(p => p.status === 'over').length;

            setSummary({
                totalBudget,
                totalSpent,
                remaining,
                percentage,
                budgetCount: progress.length,
                onTrackCount,
                warningCount,
                dangerCount,
                overCount,
            });
        } catch (error) {
            console.error('Error loading budget summary:', error);
            setSummary(null);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
    };

    const getProgressColor = () => {
        if (!summary) return '#757575';
        if (summary.percentage > 100) return '#d32f2f';
        if (summary.percentage > 90) return '#f44336';
        if (summary.percentage > 75) return '#ff9800';
        return '#4caf50';
    };

    if (loading) {
        return (
            <View style={styles.card}>
                <ActivityIndicator size="small" color="#6200ee" />
            </View>
        );
    }

    if (!summary) {
        return (
            <View style={styles.card}>
                <Text style={styles.title}>💰 Budget Tracking</Text>
                <Text style={styles.emptyText}>No budgets set for this month</Text>
                <TouchableOpacity style={styles.button} onPress={onViewAll}>
                    <Text style={styles.buttonText}>Set Your First Budget</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const progressWidth = Math.min(summary.percentage, 100);

    return (
        <View style={styles.card}>
            <Text style={styles.title}>💰 Budget Overview</Text>

            {/* Total Amount */}
            <View style={styles.amountRow}>
                <Text style={styles.spent}>{formatCurrency(summary.totalSpent)}</Text>
                <Text style={styles.separator}> / </Text>
                <Text style={styles.budget}>{formatCurrency(summary.totalBudget)}</Text>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressBarContainer}>
                <View
                    style={[
                        styles.progressBar,
                        {
                            width: `${progressWidth}%`,
                            backgroundColor: getProgressColor()
                        }
                    ]}
                />
            </View>
            <Text style={[styles.percentage, { color: getProgressColor() }]}>
                {summary.percentage.toFixed(1)}% used
            </Text>

            {/* Status Counts */}
            <View style={styles.statusContainer}>
                {summary.onTrackCount > 0 && (
                    <Text style={styles.statusText}>
                        ✅ {summary.onTrackCount} on track
                    </Text>
                )}
                {summary.warningCount > 0 && (
                    <Text style={[styles.statusText, { color: '#ff9800' }]}>
                        ⚠️  {summary.warningCount} approaching limit
                    </Text>
                )}
                {summary.dangerCount > 0 && (
                    <Text style={[styles.statusText, { color: '#f44336' }]}>
                        🔴 {summary.dangerCount} near limit
                    </Text>
                )}
                {summary.overCount > 0 && (
                    <Text style={[styles.statusText, { color: '#d32f2f' }]}>
                        ❌ {summary.overCount} over budget
                    </Text>
                )}
            </View>

            {/* View All Button */}
            <TouchableOpacity style={styles.button} onPress={onViewAll}>
                <Text style={styles.buttonText}>View All Budgets →</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#ffffff',
        margin: 16,
        padding: 16,
        borderRadius: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#212121',
        marginBottom: 12,
    },
    amountRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 12,
    },
    spent: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#212121',
    },
    separator: {
        fontSize: 20,
        color: '#9e9e9e',
    },
    budget: {
        fontSize: 20,
        color: '#757575',
    },
    progressBarContainer: {
        height: 8,
        backgroundColor: '#e0e0e0',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressBar: {
        height: '100%',
        borderRadius: 4,
    },
    percentage: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 12,
    },
    statusContainer: {
        marginBottom: 12,
    },
    statusText: {
        fontSize: 13,
        color: '#4caf50',
        marginBottom: 4,
    },
    button: {
        backgroundColor: '#6200ee',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600',
    },
    emptyText: {
        fontSize: 14,
        color: '#757575',
        marginBottom: 16,
        textAlign: 'center',
    },
});
