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
import { usePersonalGoals } from '../../hooks/useGoals';
import { PersonalGoalCard } from '../../components/goals/PersonalGoalCard';
import type { PersonalGoal } from '../../types/goals';

interface Props {
    navigation: any;
}

export const PersonalGoalsScreen: React.FC<Props> = ({ navigation }) => {
    const { goals, loading, error, refresh } = usePersonalGoals();
    const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');
    const [refreshing, setRefreshing] = useState(false);

    useFocusEffect(
        React.useCallback(() => {
            refresh();
        }, [refresh])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await refresh();
        setRefreshing(false);
    };

    const filteredGoals = goals.filter(goal => {
        if (filter === 'all') return true;
        return goal.status === filter;
    });

    const activeGoals = goals.filter(g => g.status === 'active');
    const completedGoals = goals.filter(g => g.status === 'completed');

    const handleGoalPress = (goal: PersonalGoal) => {
        navigation.navigate('PersonalGoalDetails', { goalId: goal.id });
    };

    const renderGoal = ({ item }: { item: PersonalGoal }) => (
        <PersonalGoalCard goal={item} onPress={() => handleGoalPress(item)} />
    );

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={styles.statsRow}>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>{activeGoals.length}</Text>
                    <Text style={styles.statLabel}>Active</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>{completedGoals.length}</Text>
                    <Text style={styles.statLabel}>Completed</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>{goals.length}</Text>
                    <Text style={styles.statLabel}>Total</Text>
                </View>
            </View>

            <View style={styles.filterRow}>
                <TouchableOpacity
                    style={[styles.filterButton, filter === 'active' && styles.filterButtonActive]}
                    onPress={() => setFilter('active')}
                >
                    <Text style={[styles.filterText, filter === 'active' && styles.filterTextActive]}>
                        Active
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterButton, filter === 'completed' && styles.filterButtonActive]}
                    onPress={() => setFilter('completed')}
                >
                    <Text style={[styles.filterText, filter === 'completed' && styles.filterTextActive]}>
                        Completed
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
                    onPress={() => setFilter('all')}
                >
                    <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
                        All
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderEmpty = () => (
        <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎯</Text>
            <Text style={styles.emptyTitle}>
                {filter === 'active' ? 'No Active Goals' : filter === 'completed' ? 'No Completed Goals' : 'No Goals Yet'}
            </Text>
            <Text style={styles.emptyText}>
                {filter === 'active'
                    ? 'Start saving for something special!'
                    : filter === 'completed'
                        ? 'Complete your first goal to see it here'
                        : 'Set your first savings goal and start tracking your progress'}
            </Text>
            <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => navigation.navigate('CreatePersonalGoal')}
            >
                <Text style={styles.emptyButtonText}>+ Create Goal</Text>
            </TouchableOpacity>
        </View>
    );

    if (loading && goals.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6200ee" />
                <Text style={styles.loadingText}>Loading goals...</Text>
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
                data={filteredGoals}
                renderItem={renderGoal}
                keyExtractor={item => item.id}
                ListHeaderComponent={renderHeader}
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

            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('CreatePersonalGoal')}
            >
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>
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
    header: {
        marginBottom: 16,
    },
    statsRow: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 4,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#6200ee',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#757575',
    },
    filterRow: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 4,
    },
    filterButton: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    filterButtonActive: {
        backgroundColor: '#6200ee',
    },
    filterText: {
        fontSize: 14,
        color: '#757575',
        fontWeight: '600',
    },
    filterTextActive: {
        color: '#ffffff',
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
