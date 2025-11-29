import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { getCategoryIcon, getCategoryName } from '../../../utils/categories';
import type { BudgetProgress } from '../../services/SupabaseAPI';

interface Props {
    progress: BudgetProgress;
    onPress?: () => void;
}

export const BudgetProgressCard: React.FC<Props> = ({ progress, onPress }) => {
    console.log('[BudgetProgressCard] Rendering with progress:', JSON.stringify(progress, null, 2));

    try {
        const { budget, spent, remaining, percentage, status } = progress;
        console.log('[BudgetProgressCard] Destructured values:', { budget, spent, remaining, percentage, status });

        const getStatusColor = () => {
            switch (status) {
                case 'safe': return '#4caf50'; // Green
                case 'warning': return '#ff9800'; // Orange
                case 'danger': return '#f44336'; // Red
                case 'over': return '#d32f2f'; // Dark Red
                default: return '#757575';
            }
        };

        const getStatusText = () => {
            if (status === 'over') return 'OVER BUDGET!';
            if (status === 'danger') return 'Almost at limit';
            if (status === 'warning') return 'Approaching limit';
            return 'On track';
        };

        const formatCurrency = (amount: number) => {
            return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
        };

        const progressWidth = Math.min(percentage, 100);

        console.log('[BudgetProgressCard] About to render, category:', budget.category);

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => {
                    console.log('[BudgetProgressCard] Card tapped!');
                    if (onPress) {
                        console.log('[BudgetProgressCard] Calling onPress handler');
                        onPress();
                    }
                }}
                activeOpacity={0.7}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.titleRow}>
                        <Text style={styles.icon}>{getCategoryIcon(budget.category)}</Text>
                        <Text style={styles.category}>{getCategoryName(budget.category)}</Text>
                    </View>
                    <Text style={[styles.statusText, { color: getStatusColor() }]}>
                        {getStatusText()}
                    </Text>
                </View>

                {/* Amount */}
                <View style={styles.amountRow}>
                    <Text style={styles.spent}>{formatCurrency(spent)}</Text>
                    <Text style={styles.separator}> / </Text>
                    <Text style={styles.budget}>{formatCurrency(budget.amount)}</Text>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressBarContainer}>
                    <View
                        style={[
                            styles.progressBar,
                            {
                                width: `${progressWidth}%`,
                                backgroundColor: getStatusColor()
                            }
                        ]}
                    />
                </View>

                {/* Percentage and Remaining */}
                <View style={styles.footer}>
                    <Text style={[styles.percentage, { color: getStatusColor() }]}>
                        {percentage.toFixed(1)}%
                    </Text>
                    <Text style={styles.remaining}>
                        {remaining >= 0
                            ? `${formatCurrency(remaining)} left`
                            : `${formatCurrency(Math.abs(remaining))} over`
                        }
                    </Text>
                </View>
            </TouchableOpacity>
        );
    } catch (error) {
        console.error('[BudgetProgressCard] ERROR:', error);
        return (
            <View style={styles.card}>
                <Text style={{ color: 'red' }}>Error rendering budget card</Text>
            </View>
        );
    }
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        fontSize: 20,
        marginRight: 8,
    },
    category: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#212121',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    amountRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 12,
    },
    spent: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#212121',
    },
    separator: {
        fontSize: 18,
        color: '#9e9e9e',
    },
    budget: {
        fontSize: 18,
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
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    percentage: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    remaining: {
        fontSize: 12,
        color: '#757575',
    },
});
