import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import * as GoalsAPI from '../../services/GoalsAPI';
import type { PersonalGoal, FamilyGoal } from '../../types/goals';

interface Props {
    selectedGoalId: string | null;
    selectedGoalType: 'personal' | 'family' | null;
    onSelect: (goalId: string | null, goalType: 'personal' | 'family' | null, goalName?: string) => void;
}

export const GoalSelector: React.FC<Props> = ({
    selectedGoalId,
    selectedGoalType,
    onSelect,
}) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [personalGoals, setPersonalGoals] = useState<PersonalGoal[]>([]);
    const [familyGoals, setFamilyGoals] = useState<FamilyGoal[]>([]);
    const [selectedGoalName, setSelectedGoalName] = useState<string>('');

    useEffect(() => {
        if (modalVisible) {
            loadGoals();
        }
    }, [modalVisible]);

    useEffect(() => {
        // Update selected goal name when selection changes
        if (selectedGoalId && selectedGoalType) {
            const goal = selectedGoalType === 'personal'
                ? personalGoals.find(g => g.id === selectedGoalId)
                : familyGoals.find(g => g.id === selectedGoalId);
            setSelectedGoalName(goal?.goal_name || '');
        } else {
            setSelectedGoalName('');
        }
    }, [selectedGoalId, selectedGoalType, personalGoals, familyGoals]);

    const loadGoals = async () => {
        try {
            setLoading(true);
            const goals = await GoalsAPI.getAllGoalsForSelection();
            setPersonalGoals(goals.personal);
            setFamilyGoals(goals.family);
        } catch (error) {
            console.error('Error loading goals:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (goalId: string | null, goalType: 'personal' | 'family' | null, goalName?: string) => {
        onSelect(goalId, goalType, goalName);
        setModalVisible(false);
    };

    const formatCurrency = (amount: number) => {
        return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Allocate to Goal (Optional)</Text>
            <TouchableOpacity
                style={styles.selector}
                onPress={() => setModalVisible(true)}
            >
                <Text style={selectedGoalId ? styles.selectedText : styles.placeholderText}>
                    {selectedGoalId ? `🎯 ${selectedGoalName}` : 'Select a goal...'}
                </Text>
                <Text style={styles.arrow}>▼</Text>
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Goal</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Text style={styles.closeButton}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        {loading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color="#6200ee" />
                            </View>
                        ) : (
                            <ScrollView style={styles.goalsList}>
                                {/* None Option */}
                                <TouchableOpacity
                                    style={[
                                        styles.goalItem,
                                        !selectedGoalId && styles.goalItemSelected,
                                    ]}
                                    onPress={() => handleSelect(null, null)}
                                >
                                    <Text style={styles.goalIcon}>⊘</Text>
                                    <View style={styles.goalInfo}>
                                        <Text style={styles.goalName}>No Goal</Text>
                                        <Text style={styles.goalSubtext}>Don't allocate to any goal</Text>
                                    </View>
                                </TouchableOpacity>

                                {/* Personal Goals */}
                                {personalGoals.length > 0 && (
                                    <>
                                        <Text style={styles.sectionHeader}>Personal Goals</Text>
                                        {personalGoals.map((goal) => (
                                            <TouchableOpacity
                                                key={goal.id}
                                                style={[
                                                    styles.goalItem,
                                                    selectedGoalId === goal.id && selectedGoalType === 'personal' && styles.goalItemSelected,
                                                ]}
                                                onPress={() => handleSelect(goal.id, 'personal', goal.goal_name)}
                                            >
                                                <Text style={styles.goalIcon}>🎯</Text>
                                                <View style={styles.goalInfo}>
                                                    <Text style={styles.goalName}>{goal.goal_name}</Text>
                                                    <Text style={styles.goalSubtext}>
                                                        {formatCurrency(goal.saved_amount)} / {formatCurrency(goal.target_amount)} ({goal.progress.toFixed(0)}%)
                                                    </Text>
                                                </View>
                                                {selectedGoalId === goal.id && selectedGoalType === 'personal' && (
                                                    <Text style={styles.checkmark}>✓</Text>
                                                )}
                                            </TouchableOpacity>
                                        ))}
                                    </>
                                )}

                                {/* Family Goals */}
                                {familyGoals.length > 0 && (
                                    <>
                                        <Text style={styles.sectionHeader}>Family Goals</Text>
                                        {familyGoals.map((goal) => {
                                            const progress = goal.target_amount > 0
                                                ? (goal.total_saved / goal.target_amount) * 100
                                                : 0;
                                            return (
                                                <TouchableOpacity
                                                    key={goal.id}
                                                    style={[
                                                        styles.goalItem,
                                                        selectedGoalId === goal.id && selectedGoalType === 'family' && styles.goalItemSelected,
                                                    ]}
                                                    onPress={() => handleSelect(goal.id, 'family', goal.goal_name)}
                                                >
                                                    <Text style={styles.goalIcon}>👨‍👩‍👧‍👦</Text>
                                                    <View style={styles.goalInfo}>
                                                        <Text style={styles.goalName}>{goal.goal_name}</Text>
                                                        <Text style={styles.goalSubtext}>
                                                            {formatCurrency(goal.total_saved)} / {formatCurrency(goal.target_amount)} ({progress.toFixed(0)}%)
                                                        </Text>
                                                    </View>
                                                    {selectedGoalId === goal.id && selectedGoalType === 'family' && (
                                                        <Text style={styles.checkmark}>✓</Text>
                                                    )}
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </>
                                )}

                                {personalGoals.length === 0 && familyGoals.length === 0 && (
                                    <View style={styles.emptyState}>
                                        <Text style={styles.emptyIcon}>🎯</Text>
                                        <Text style={styles.emptyText}>No active goals</Text>
                                        <Text style={styles.emptySubtext}>Create a goal first to allocate transactions</Text>
                                    </View>
                                )}
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#212121',
        marginBottom: 8,
    },
    selector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        padding: 16,
    },
    placeholderText: {
        fontSize: 16,
        color: '#9e9e9e',
    },
    selectedText: {
        fontSize: 16,
        color: '#212121',
        fontWeight: '500',
    },
    arrow: {
        fontSize: 12,
        color: '#757575',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#212121',
    },
    closeButton: {
        fontSize: 24,
        color: '#757575',
    },
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
    },
    goalsList: {
        padding: 16,
    },
    sectionHeader: {
        fontSize: 12,
        fontWeight: '600',
        color: '#757575',
        textTransform: 'uppercase',
        marginTop: 16,
        marginBottom: 8,
        paddingLeft: 4,
    },
    goalItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        backgroundColor: '#f5f5f5',
    },
    goalItemSelected: {
        backgroundColor: '#e8eaf6',
        borderWidth: 2,
        borderColor: '#6200ee',
    },
    goalIcon: {
        fontSize: 24,
        marginRight: 12,
    },
    goalInfo: {
        flex: 1,
    },
    goalName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#212121',
        marginBottom: 4,
    },
    goalSubtext: {
        fontSize: 12,
        color: '#757575',
    },
    checkmark: {
        fontSize: 20,
        color: '#6200ee',
        fontWeight: 'bold',
    },
    emptyState: {
        alignItems: 'center',
        padding: 40,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 12,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#212121',
        marginBottom: 4,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#757575',
        textAlign: 'center',
    },
});
