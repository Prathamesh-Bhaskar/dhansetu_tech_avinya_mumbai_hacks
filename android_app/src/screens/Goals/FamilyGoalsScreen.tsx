import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useFamily } from '../../contexts/FamilyContext';
import { useFamilyGoals } from '../../hooks/useGoals';
import { FamilyGoalCard } from '../../components/goals/FamilyGoalCard';
import * as GoalsAPI from '../../services/GoalsAPI';
import type { FamilyGoal } from '../../types/goals';

interface Props {
    navigation: any;
}

export const FamilyGoalsScreen: React.FC<Props> = ({ navigation }) => {
    const familyContext = useFamily();
    const currentFamily = familyContext?.currentFamily || null;
    const { goals, loading, error, refresh } = useFamilyGoals(currentFamily?.id || null);
    const [refreshing, setRefreshing] = useState(false);
    const [contributions, setContributions] = useState<Record<string, number>>({});
    const [contributorCounts, setContributorCounts] = useState<Record<string, number>>({});

    useFocusEffect(
        React.useCallback(() => {
            refresh();
            loadContributions();
        }, [refresh, currentFamily])
    );

    const loadContributions = async () => {
        if (!goals.length) return;

        const contribs: Record<string, number> = {};
        const counts: Record<string, number> = {};

        for (const goal of goals) {
            try {
                // Get user's contribution
                const amount = await GoalsAPI.getUserContribution(goal.id);
                contribs[goal.id] = amount;

                // Get full goal details to count contributors
                const details = await GoalsAPI.getFamilyGoalDetails(goal.id);
                counts[goal.id] = details.contributions.length;
            } catch (error) {
                contribs[goal.id] = 0;
                counts[goal.id] = 0;
            }
        }
        setContributions(contribs);
        setContributorCounts(counts);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await refresh();
        await loadContributions();
        setRefreshing(false);
    };

    const handleGoalPress = (goal: FamilyGoal) => {
        navigation.navigate('FamilyGoalDetails', { goalId: goal.id });
    };

    const renderGoal = ({ item }: { item: FamilyGoal }) => (
        <FamilyGoalCard
            goal={item}
            userContribution={contributions[item.id] || 0}
            contributorsCount={contributorCounts[item.id] || 0}
            onPress={() => handleGoalPress(item)}
        />
    );

    const renderEmpty = () => {
        if (!currentFamily) {
            return (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyIcon}>👨‍👩‍👧‍👦</Text>
                    <Text style={styles.emptyTitle}>No Family Yet</Text>
                    <Text style={styles.emptyText}>
                        Create or join a family to start setting shared savings goals together!
                    </Text>
                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={[styles.emptyButton, styles.primaryButton]}
                            onPress={() => navigation.navigate('CreateFamily')}
                        >
                            <Text style={styles.emptyButtonText}>Create Family</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.emptyButton, styles.secondaryButton]}
                            onPress={() => navigation.navigate('JoinFamily')}
                        >
                            <Text style={styles.secondaryButtonText}>Join Family</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }

        return (
            <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>🏖️</Text>
                <Text style={styles.emptyTitle}>No Family Goals Yet</Text>
                <Text style={styles.emptyText}>
                    Create a shared goal and work together with your family to achieve it!
                </Text>
                <TouchableOpacity
                    style={styles.emptyButton}
                    onPress={() => navigation.navigate('CreateFamilyGoal')}
                >
                    <Text style={styles.emptyButtonText}>+ Create Family Goal</Text>
                </TouchableOpacity>
            </View>
        );
    };

    if (loading && goals.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6200ee" />
                <Text style={styles.loadingText}>Loading family goals...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={refresh}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={goals}
                renderItem={renderGoal}
                keyExtractor={item => item.id}
                ListEmptyComponent={renderEmpty}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#6200ee']}
                    />
                }
            />

            {currentFamily && (
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => navigation.navigate('CreateFamilyGoal')}
                >
                    <Text style={styles.fabText}>+</Text>
                </TouchableOpacity>
            )}
        </View>
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
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#757575',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        backgroundColor: '#f5f5f5',
    },
    errorIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    errorText: {
        fontSize: 16,
        color: '#757575',
        textAlign: 'center',
        marginBottom: 24,
    },
    retryButton: {
        backgroundColor: '#6200ee',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 24,
    },
    retryButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    listContent: {
        padding: 16,
        paddingBottom: 80,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#212121',
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: '#757575',
        textAlign: 'center',
        marginBottom: 24,
        paddingHorizontal: 40,
    },
    emptyButton: {
        backgroundColor: '#6200ee',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 24,
        flex: 1,
        marginHorizontal: 4,
    },
    buttonRow: {
        flexDirection: 'row',
        width: '100%',
        paddingHorizontal: 20,
    },
    primaryButton: {
        backgroundColor: '#6200ee',
    },
    secondaryButton: {
        backgroundColor: '#ffffff',
        borderWidth: 2,
        borderColor: '#6200ee',
    },
    secondaryButtonText: {
        color: '#6200ee',
        fontSize: 16,
        fontWeight: '600',
    },
    emptyButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    fab: {
        position: 'absolute',
        right: 16,
        bottom: 16,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#6200ee',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    fabText: {
        fontSize: 32,
        color: '#ffffff',
        fontWeight: '300',
    },
});
