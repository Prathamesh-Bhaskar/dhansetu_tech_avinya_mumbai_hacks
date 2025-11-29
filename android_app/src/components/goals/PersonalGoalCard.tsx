import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { PersonalGoal } from '../../types/goals';

interface Props {
    goal: PersonalGoal;
    onPress: () => void;
}

export const PersonalGoalCard: React.FC<Props> = ({ goal, onPress }) => {
    const getStatusColor = () => {
        if (goal.status === 'completed') return '#4caf50';
        if (goal.status === 'cancelled') return '#9e9e9e';

        // Active goals - color based on progress
        if (goal.progress >= 75) return '#4caf50';
        if (goal.progress >= 50) return '#ff9800';
        return '#2196f3';
    };

    const getStatusIcon = () => {
        if (goal.status === 'completed') return '✅';
        if (goal.status === 'cancelled') return '❌';
        return '🎯';
    };

    const formatCurrency = (amount: number) => {
        return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
    };

    const formatDeadline = (deadline?: string) => {
        if (!deadline) return null;

        const date = new Date(deadline);
        const now = new Date();
        const diffTime = date.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return '⏰ Overdue';
        if (diffDays === 0) return '⏰ Today';
        if (diffDays === 1) return '⏰ Tomorrow';
        if (diffDays <= 7) return `⏰ ${diffDays} days left`;

        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const progressColor = getStatusColor();

    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <Text style={styles.icon}>{getStatusIcon()}</Text>
                    <Text style={styles.goalName} numberOfLines={1}>
                        {goal.goal_name}
                    </Text>
                </View>
                {goal.status !== 'active' && (
                    <View style={[styles.statusBadge, { backgroundColor: progressColor }]}>
                        <Text style={styles.statusText}>
                            {goal.status === 'completed' ? 'Done' : 'Cancelled'}
                        </Text>
                    </View>
                )}
            </View>

            {goal.description && (
                <Text style={styles.description} numberOfLines={2}>
                    {goal.description}
                </Text>
            )}

            <View style={styles.amountRow}>
                <Text style={styles.savedAmount}>{formatCurrency(goal.saved_amount)}</Text>
                <Text style={styles.separator}>/</Text>
                <Text style={styles.targetAmount}>{formatCurrency(goal.target_amount)}</Text>
            </View>

            <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                    <View
                        style={[
                            styles.progressFill,
                            {
                                width: `${Math.min(goal.progress, 100)}%`,
                                backgroundColor: progressColor,
                            },
                        ]}
                    />
                </View>
                <Text style={[styles.progressText, { color: progressColor }]}>
                    {goal.progress.toFixed(0)}%
                </Text>
            </View>

            {goal.deadline && (
                <Text style={styles.deadline}>{formatDeadline(goal.deadline)}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
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
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    icon: {
        fontSize: 24,
        marginRight: 8,
    },
    goalName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#212121',
        flex: 1,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '600',
    },
    description: {
        fontSize: 14,
        color: '#757575',
        marginBottom: 12,
    },
    amountRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 12,
    },
    savedAmount: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#212121',
    },
    separator: {
        fontSize: 18,
        color: '#9e9e9e',
        marginHorizontal: 8,
    },
    targetAmount: {
        fontSize: 18,
        color: '#757575',
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    progressBar: {
        flex: 1,
        height: 8,
        backgroundColor: '#e0e0e0',
        borderRadius: 4,
        overflow: 'hidden',
        marginRight: 12,
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
    },
    progressText: {
        fontSize: 14,
        fontWeight: '600',
        minWidth: 45,
        textAlign: 'right',
    },
    deadline: {
        fontSize: 12,
        color: '#757575',
    },
});
