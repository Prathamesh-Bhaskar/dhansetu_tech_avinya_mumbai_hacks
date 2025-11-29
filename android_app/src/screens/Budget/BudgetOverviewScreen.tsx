import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as SupabaseAPI from '../../services/SupabaseAPI';
import { BudgetProgressCard } from '../../components/budget/BudgetProgressCard';
import type { BudgetProgress } from '../../services/SupabaseAPI';

export const BudgetOverviewScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const [budgets, setBudgets] = useState<BudgetProgress[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const loadBudgets = async () => {
        try {
            console.log('[BudgetOverview] Loading budgets for:', currentMonth, currentYear);
            setLoading(true);
            const progress = await SupabaseAPI.getAllBudgetProgress(currentMonth, currentYear);
            console.log('[BudgetOverview] Loaded budgets:', progress.length);
            console.log('[BudgetOverview] Budget data:', JSON.stringify(progress, null, 2));
            setBudgets(progress);
        } catch (error) {
            console.error('[BudgetOverview] Error loading budgets:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBudgets();
    }, []);

    // Auto-refresh when screen is focused
    useFocusEffect(
        React.useCallback(() => {
            loadBudgets();
        }, [])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadBudgets();
        setRefreshing(false);
    };

    const formatCurrency = (amount: number) => {
        return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
    };

    // Calculate totals
    const totalBudget = budgets.reduce((sum, b) => sum + b.budget.amount, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
    const totalRemaining = totalBudget - totalSpent;
    const overBudgetCount = budgets.filter(b => b.status === 'over').length;

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6200ee" />
                <Text style={styles.loadingText}>Loading budgets...</Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6200ee']} />
            }
        >
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Budgets</Text>
                <Text style={styles.headerSubtitle}>
                    {new Date(currentYear, currentMonth - 1).toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric'
                    })}
                </Text>
            </View>

            {budgets.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>💰</Text>
                    <Text style={styles.emptyTitle}>No Budgets Set</Text>
                    <Text style={styles.emptyText}>
                        Start tracking your spending by setting budgets for different categories
                    </Text>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => navigation.navigate('ManageBudget')}
                    >
                        <Text style={styles.addButtonText}>+ Add Your First Budget</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <>
                    {/* Summary Card */}
                    <View style={styles.summaryCard}>
                        <View style={styles.summaryRow}>
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryLabel}>Total Budget</Text>
                                <Text style={styles.summaryValue}>{formatCurrency(totalBudget)}</Text>
                            </View>
                            <View style={styles.summaryDivider} />
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryLabel}>Total Spent</Text>
                                <Text style={[
                                    styles.summaryValue,
                                    { color: totalSpent > totalBudget ? '#f44336' : '#212121' }
                                ]}>
                                    {formatCurrency(totalSpent)}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.summaryFooter}>
                            <Text style={styles.summaryRemaining}>
                                {totalRemaining >= 0
                                    ? `${formatCurrency(totalRemaining)} remaining`
                                    : `${formatCurrency(Math.abs(totalRemaining))} over budget`
                                }
                            </Text>
                            {overBudgetCount > 0 && (
                                <Text style={styles.warningText}>
                                    ⚠️ {overBudgetCount} {overBudgetCount === 1 ? 'budget' : 'budgets'} exceeded
                                </Text>
                            )}
                        </View>
                    </View>

                    {/* Budget List */}
                    <View style={styles.listHeader}>
                        <Text style={styles.listTitle}>Your Budgets</Text>
                    </View>

                    {budgets.map((progress) => (
                        <BudgetProgressCard
                            key={progress.budget.id}
                            progress={progress}
                            onPress={() => {
                                // Temporarily disabled to debug
                                console.log('Budget tapped:', progress.budget.id);
                            }}
                        />
                    ))}

                    {/* Add Budget Button */}
                    <TouchableOpacity
                        style={styles.addBudgetButton}
                        onPress={() => navigation.navigate('ManageBudget')}
                    >
                        <Text style={styles.addBudgetText}>+ Add Budget</Text>
                    </TouchableOpacity>
                </>
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
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#757575',
    },
    header: {
        padding: 20,
        backgroundColor: '#6200ee',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#e1bee7',
    },
    summaryCard: {
        backgroundColor: '#ffffff',
        margin: 16,
        padding: 16,
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    summaryRow: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    summaryItem: {
        flex: 1,
    },
    summaryDivider: {
        width: 1,
        backgroundColor: '#e0e0e0',
        marginHorizontal: 16,
    },
    summaryLabel: {
        fontSize: 12,
        color: '#757575',
        marginBottom: 4,
    },
    summaryValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#212121',
    },
    summaryFooter: {
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        paddingTop: 12,
    },
    summaryRemaining: {
        fontSize: 14,
        color: '#212121',
        marginBottom: 4,
    },
    warningText: {
        fontSize: 12,
        color: '#f44336',
        fontWeight: '600',
    },
    listHeader: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    listTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#212121',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
        paddingHorizontal: 32,
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
    },
    addButton: {
        backgroundColor: '#6200ee',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 24,
    },
    addButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    addBudgetButton: {
        backgroundColor: '#ffffff',
        margin: 16,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#6200ee',
        borderStyle: 'dashed',
    },
    addBudgetText: {
        color: '#6200ee',
        fontSize: 16,
        fontWeight: '600',
    },
});
