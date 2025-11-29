import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { FamilyGoal } from '../../types/goals';

interface Props {
    goal: FamilyGoal;
    userContribution?: number;
    contributorsCount: number;
    onPress: () => void;
}

export const FamilyGoalCard: React.FC<Props> = ({
    goal,
    userContribution = 0,
    contributorsCount,
    onPress,
}) => {
    const progress = goal.target_amount > 0
        ? (goal.total_saved / goal.target_amount) * 100
        : 0;

    const getProgressColor = () => {
        if (progress >= 75) return '#4caf50';
        if (progress >= 50) return '#ff9800';
        return '#2196f3';
    };

    const formatCurrency = (amount: number) => {
        return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
    };

    const progressColor = getProgressColor();

    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <Text style={styles.icon}>🏖️</Text>
                    <Text style={styles.goalName} numberOfLines={1}>
                        {goal.goal_name}
                    </Text>
                </View>
                <View style={styles.contributorsBadge}>
                    <Text style={styles.contributorsText}>👥 {contributorsCount}</Text>
                </View>
            </View>

            {goal.description && (
                <Text style={styles.description} numberOfLines={2}>
                    {goal.description}
                </Text>
            )}

            <View style={styles.amountRow}>
                <Text style={styles.savedAmount}>{formatCurrency(goal.total_saved)}</Text>
                <Text style={styles.separator}>/</Text>
                <Text style={styles.targetAmount}>{formatCurrency(goal.target_amount)}</Text>
            </View>

            <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                    <View
                        style={[
                            styles.progressFill,
                            {
                                width: `${Math.min(progress, 100)}%`,
                                backgroundColor: progressColor,
                            },
                        ]}
                    />
                </View>
                <Text style={[styles.progressText, { color: progressColor }]}>
                    {progress.toFixed(0)}%
                </Text>
            </View>

            {userContribution > 0 && (
                <View style={styles.userContribution}>
                    <Text style={styles.userContributionLabel}>Your contribution:</Text>
                    <Text style={styles.userContributionAmount}>
                        {formatCurrency(userContribution)}
                    </Text>
                </View>
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
    contributorsBadge: {
        backgroundColor: '#e3f2fd',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    contributorsText: {
        color: '#1976d2',
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
    userContribution: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#f5f5f5',
        padding: 8,
        borderRadius: 8,
        marginTop: 8,
    },
    userContributionLabel: {
        fontSize: 12,
        color: '#757575',
    },
    userContributionAmount: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6200ee',
    },
});
