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
import type { PersonalGoal } from '../../types/goals';

interface Props {
    route: {
        params: {
            goalId: string;
        };
    };
    navigation: any;
}

export const PersonalGoalDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
    const { goalId } = route.params;
    const [goal, setGoal] = useState<PersonalGoal | null>(null);
    const [loading, setLoading] = useState(true);
    const [contributionAmount, setContributionAmount] = useState('');
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        loadGoal();
    }, [goalId]);

    const loadGoal = async () => {
        try {
            setLoading(true);
            const data = await GoalsAPI.getPersonalGoalDetails(goalId);
            setGoal(data);
        } catch (error: any) {
            console.error('Error loading goal:', error);
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
            await GoalsAPI.addPersonalContribution(goalId, parseFloat(contributionAmount));
            setContributionAmount('');
            Alert.alert('Success', 'Contribution added successfully!');
            loadGoal();
        } catch (error: any) {
            console.error('Error adding contribution:', error);
            Alert.alert('Error', error.message || 'Failed to add contribution');
        } finally {
            setAdding(false);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Goal',
            'Are you sure you want to delete this goal? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await GoalsAPI.deletePersonalGoal(goalId);
                            Alert.alert('Success', 'Goal deleted successfully');
                            navigation.goBack();
                        } catch (error: any) {
                            Alert.alert('Error', 'Failed to delete goal');
                        }
                    },
                },
            ]
        );
    };

    const handleMarkComplete = async () => {
        try {
            await GoalsAPI.updatePersonalGoal(goalId, { status: 'completed' });
            Alert.alert('Success', '🎉 Goal completed! Congratulations!');
            loadGoal();
        } catch (error: any) {
            Alert.alert('Error', 'Failed to mark goal as complete');
        }
    };

    const formatCurrency = (amount: number) => {
        return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'No deadline';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    if (loading || !goal) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6200ee" />
            </View>
        );
    }

    const remaining = goal.target_amount - goal.saved_amount;
    const progressColor = goal.progress >= 75 ? '#4caf50' : goal.progress >= 50 ? '#ff9800' : '#2196f3';

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.goalIcon}>🎯</Text>
                <Text style={styles.goalName}>{goal.goal_name}</Text>
                {goal.description && (
                    <Text style={styles.description}>{goal.description}</Text>
                )}
            </View>

            {/* Progress Card */}
            <View style={styles.progressCard}>
                <View style={styles.amountRow}>
                    <View>
                        <Text style={styles.label}>Saved</Text>
                        <Text style={styles.savedAmount}>{formatCurrency(goal.saved_amount)}</Text>
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

                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Remaining</Text>
                        <Text style={styles.statValue}>{formatCurrency(remaining)}</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Deadline</Text>
                        <Text style={styles.statValue}>{formatDate(goal.deadline)}</Text>
                    </View>
                </View>
            </View>

            {/* Add Contribution */}
            {goal.status === 'active' && (
                <View style={styles.contributionCard}>
                    <Text style={styles.cardTitle}>Add Money</Text>
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
                                <Text style={styles.addButtonText}>Add</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Actions */}
            <View style={styles.actions}>
                {goal.status === 'active' && goal.progress >= 100 && (
                    <TouchableOpacity style={styles.completeButton} onPress={handleMarkComplete}>
                        <Text style={styles.completeButtonText}>🎉 Mark as Complete</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                    <Text style={styles.deleteButtonText}>Delete Goal</Text>
                </TouchableOpacity>
            </View>
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
        marginBottom: 20,
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
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 12,
        color: '#757575',
        marginBottom: 4,
    },
    statValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#212121',
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
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#212121',
        marginBottom: 16,
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
    actions: {
        padding: 16,
    },
    completeButton: {
        backgroundColor: '#4caf50',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 12,
    },
    completeButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    deleteButton: {
        backgroundColor: '#ffffff',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#f44336',
    },
    deleteButtonText: {
        color: '#f44336',
        fontSize: 16,
        fontWeight: '600',
    },
});
