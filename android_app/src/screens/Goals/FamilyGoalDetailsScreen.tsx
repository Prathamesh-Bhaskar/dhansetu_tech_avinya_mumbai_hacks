import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    TextInput,
} from 'react-native';
import * as GoalsAPI from '../../services/GoalsAPI';
import type { FamilyGoalWithContributions } from '../../types/goals';

interface Props {
    route: {
        params: {
            goalId: string;
        };
    };
    navigation: any;
}

export const FamilyGoalDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
    const { goalId } = route.params;
    const [goal, setGoal] = useState<FamilyGoalWithContributions | null>(null);
    const [loading, setLoading] = useState(true);
    const [contributionAmount, setContributionAmount] = useState('');
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        loadGoal();
    }, [goalId]);

    const loadGoal = async () => {
        try {
            setLoading(true);
            const data = await GoalsAPI.getFamilyGoalDetails(goalId);
            setGoal(data);
        } catch (error: any) {
            console.error('Error loading family goal:', error);
            Alert.alert('Error', 'Failed to load goal details');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const handleAddContribution = async () => {
        if (!contributionAmount || parseFloat(contributionAmount) <= 0) {
            Alert.alert('Error', 'Please enter a valid amount');
            return;
        }

        try {
            setAdding(true);
            await GoalsAPI.addFamilyContribution(goalId, parseFloat(contributionAmount));
            setContributionAmount('');
            Alert.alert('Success', 'Your contribution has been added!');
            loadGoal();
        } catch (error: any) {
            console.error('Error adding contribution:', error);
            Alert.alert('Error', error.message || 'Failed to add contribution');
        } finally {
            setAdding(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
    };

    if (loading || !goal) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6200ee" />
            </View>
        );
    }

    const remaining = goal.target_amount - goal.total_saved;
    const progressColor = goal.progress >= 75 ? '#4caf50' : goal.progress >= 50 ? '#ff9800' : '#2196f3';

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.goalIcon}>🏖️</Text>
                <Text style={styles.goalName}>{goal.goal_name}</Text>
                {goal.description && (
                    <Text style={styles.description}>{goal.description}</Text>
                )}
            </View>

            {/* Progress Card */}
            <View style={styles.progressCard}>
                <View style={styles.amountRow}>
                    <View>
                        <Text style={styles.label}>Total Saved</Text>
                        <Text style={styles.savedAmount}>{formatCurrency(goal.total_saved)}</Text>
                    </View>
                    <View style={styles.separator} />
                    <View>
                        <Text style={styles.label}>Target</Text>
                        <Text style={styles.targetAmount}>{formatCurrency(goal.target_amount)}</Text>
                    </View>
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

                <Text style={styles.remaining}>
                    {remaining > 0 ? `${formatCurrency(remaining)} remaining` : '🎉 Goal reached!'}
                </Text>
            </View>

            {/* Contributors */}
            <View style={styles.contributorsCard}>
                <Text style={styles.cardTitle}>Contributors ({goal.contributions.length})</Text>
                {goal.contributions.map((contrib) => (
                    <View key={contrib.id} style={styles.contributorRow}>
                        <View style={styles.contributorInfo}>
                            <Text style={styles.contributorName}>
                                {contrib.user_name}
                                {contrib.user_id === goal.created_by && ' 👑'}
                            </Text>
                            {contrib.notes && (
                                <Text style={styles.contributorNotes}>{contrib.notes}</Text>
                            )}
                        </View>
                        <View style={styles.contributorAmount}>
                            <Text style={styles.amount}>{formatCurrency(contrib.amount)}</Text>
                            <Text style={styles.percentage}>
                                ({((contrib.amount / goal.total_saved) * 100).toFixed(0)}%)
                            </Text>
                        </View>
                    </View>
                ))}
            </View>

            {/* Add Contribution */}
            {goal.status === 'active' && (
                <View style={styles.contributionCard}>
                    <Text style={styles.cardTitle}>
                        {goal.user_contribution && goal.user_contribution > 0
                            ? 'Update Your Contribution'
                            : 'Add Your Contribution'}
                    </Text>
                    {goal.user_contribution && goal.user_contribution > 0 && (
                        <Text style={styles.currentContribution}>
                            Current: {formatCurrency(goal.user_contribution)}
                        </Text>
                    )}
                    <View style={styles.inputRow}>
                        <View style={styles.inputContainer}>
                            <Text style={styles.currencySymbol}>₹</Text>
                            <TextInput
                                style={styles.input}
                                value={contributionAmount}
                                onChangeText={setContributionAmount}
                                keyboardType="numeric"
                                placeholder="0"
                            />
                        </View>
                        <TouchableOpacity
                            style={[styles.addButton, adding && styles.addButtonDisabled]}
                            onPress={handleAddContribution}
                            disabled={adding}
                        >
                            {adding ? (
                                <ActivityIndicator color="#ffffff" size="small" />
                            ) : (
                                <Text style={styles.addButtonText}>
                                    {goal.user_contribution && goal.user_contribution > 0 ? 'Update' : 'Add'}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#ffffff',
        padding: 24,
        alignItems: 'center',
    },
    goalIcon: {
        fontSize: 64,
        marginBottom: 12,
    },
    goalName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#212121',
        textAlign: 'center',
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        color: '#757575',
        textAlign: 'center',
    },
    progressCard: {
        backgroundColor: '#ffffff',
        margin: 16,
        padding: 20,
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    amountRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    label: {
        fontSize: 12,
        color: '#757575',
        marginBottom: 4,
    },
    savedAmount: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#4caf50',
    },
    separator: {
        width: 1,
        backgroundColor: '#e0e0e0',
    },
    targetAmount: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#212121',
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    progressBar: {
        flex: 1,
        height: 12,
        backgroundColor: '#e0e0e0',
        borderRadius: 6,
        overflow: 'hidden',
        marginRight: 12,
    },
    progressFill: {
        height: '100%',
        borderRadius: 6,
    },
    progressText: {
        fontSize: 16,
        fontWeight: 'bold',
        minWidth: 50,
        textAlign: 'right',
    },
    remaining: {
        fontSize: 14,
        color: '#757575',
        textAlign: 'center',
    },
    contributorsCard: {
        backgroundColor: '#ffffff',
        margin: 16,
        marginTop: 0,
        padding: 20,
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#212121',
        marginBottom: 16,
    },
    contributorRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    contributorInfo: {
        flex: 1,
    },
    contributorName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#212121',
        marginBottom: 2,
    },
    contributorNotes: {
        fontSize: 12,
        color: '#757575',
    },
    contributorAmount: {
        alignItems: 'flex-end',
    },
    amount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#6200ee',
    },
    percentage: {
        fontSize: 12,
        color: '#757575',
    },
    contributionCard: {
        backgroundColor: '#ffffff',
        margin: 16,
        marginTop: 0,
        padding: 20,
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    currentContribution: {
        fontSize: 14,
        color: '#6200ee',
        marginBottom: 12,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    inputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        paddingHorizontal: 16,
        marginRight: 12,
    },
    currencySymbol: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#757575',
        marginRight: 8,
    },
    input: {
        flex: 1,
        padding: 16,
        fontSize: 18,
        color: '#212121',
    },
    addButton: {
        backgroundColor: '#6200ee',
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderRadius: 12,
    },
    addButtonDisabled: {
        opacity: 0.6,
    },
    addButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
});
