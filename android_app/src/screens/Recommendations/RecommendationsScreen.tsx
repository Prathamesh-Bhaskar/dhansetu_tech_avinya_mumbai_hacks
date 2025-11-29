import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as SupabaseAPI from '../../services/SupabaseAPI';
import * as GoalsAPI from '../../services/GoalsAPI';
import * as AIService from '../../services/AIService';

export const RecommendationsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [recommendations, setRecommendations] = useState<AIService.RecommendationsResponse | null>(null);

    // Load recommendations
    const loadRecommendations = useCallback(async () => {
        try {
            setLoading(true);

            // Get current user
            const user = await SupabaseAPI.getCurrentUser();
            if (!user) {
                console.error('No user found');
                setLoading(false);
                return;
            }

            // Get current date range
            const now = new Date();
            const thisMonth = now.getMonth() + 1;
            const thisYear = now.getFullYear();
            
            // Get last 3 months for better AI insights
            const threeMonthsAgo = new Date(now);
            threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
            const startOfThreeMonths = threeMonthsAgo.toISOString().split('T')[0];
            const today = now.toISOString().split('T')[0];

            // Fetch all data from Supabase
            const [expenses, incomes, personalGoals, budgets] = await Promise.all([
                SupabaseAPI.getExpensesByDateRange(startOfThreeMonths, today),
                SupabaseAPI.getPersonalIncomes(user.id),
                GoalsAPI.getPersonalGoals(),
                SupabaseAPI.getAllBudgetProgress(thisMonth, thisYear)
            ]);

            // Fetch AI recommendations
            console.log('[RecommendationsScreen] Fetching AI recommendations...');
            const recommendationsData = await AIService.getAIRecommendations({
                expenses,
                incomes,
                goals: personalGoals,
                budgets,
                userId: user.id
            });

            console.log('[RecommendationsScreen] Recommendations received:', recommendationsData.recommendations.length);
            setRecommendations(recommendationsData);

        } catch (error) {
            console.error('Error loading recommendations:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Load data on mount and when screen is focused
    useFocusEffect(
        useCallback(() => {
            loadRecommendations();
        }, [loadRecommendations])
    );

    // Refresh handler
    const onRefresh = async () => {
        setRefreshing(true);
        await loadRecommendations();
        setRefreshing(false);
    };

    // Format currency
    const formatCurrency = (amount: number) => {
        return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
    };

    // Get category color
    const getCategoryColor = (category: string) => {
        const colors: { [key: string]: string } = {
            savings: '#10B981',
            spending: '#F59E0B',
            goals: '#8B5CF6',
            income: '#3B82F6',
            investment: '#EC4899',
            budget: '#6366F1',
        };
        return colors[category] || '#6B7280';
    };

    // Get impact badge style
    const getImpactStyle = (impact: string) => {
        if (impact === 'high') return { bg: '#FEE2E2', text: '#DC2626' };
        if (impact === 'medium') return { bg: '#FEF3C7', text: '#D97706' };
        return { bg: '#DBEAFE', text: '#2563EB' };
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="large" color="#22D3EE" />
                <Text style={styles.loadingText}>Generating personalized recommendations...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#22D3EE']} />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>AI Recommendations</Text>
                    <Text style={styles.headerSubtitle}>
                        Personalized insights based on your financial history
                    </Text>
                </View>

                {/* Summary Cards */}
                {recommendations?.summary && (
                    <View style={styles.summarySection}>
                        <View style={styles.summaryRow}>
                            <View style={styles.summaryCard}>
                                <Text style={styles.summaryLabel}>Total Income</Text>
                                <Text style={styles.summaryValue}>
                                    {formatCurrency(recommendations.summary.totalIncome)}
                                </Text>
                            </View>
                            <View style={styles.summaryCard}>
                                <Text style={styles.summaryLabel}>Total Expenses</Text>
                                <Text style={styles.summaryValue}>
                                    {formatCurrency(recommendations.summary.totalExpenses)}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.summaryRow}>
                            <View style={styles.summaryCard}>
                                <Text style={styles.summaryLabel}>Savings Rate</Text>
                                <Text style={styles.summaryValue}>
                                    {recommendations.summary.savingsRate.toFixed(1)}%
                                </Text>
                            </View>
                            <View style={styles.summaryCard}>
                                <Text style={styles.summaryLabel}>Top Category</Text>
                                <Text style={[styles.summaryValue, { fontSize: 14, textTransform: 'capitalize' }]}>
                                    {recommendations.summary.topSpendingCategory}
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Key Insights */}
                {recommendations?.insights && recommendations.insights.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Key Insights</Text>
                        <View style={styles.insightsContainer}>
                            {recommendations.insights.map((insight, index) => (
                                <View key={index} style={styles.insightCard}>
                                    <Text style={styles.insightIcon}>💡</Text>
                                    <Text style={styles.insightText}>{insight}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Recommendations */}
                {recommendations?.recommendations && recommendations.recommendations.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Personalized Recommendations</Text>
                        {recommendations.recommendations.map((rec, index) => {
                            const impactStyle = getImpactStyle(rec.impact);
                            const categoryColor = getCategoryColor(rec.category);

                            return (
                                <View key={index} style={styles.recommendationCard}>
                                    {/* Header */}
                                    <View style={styles.recHeader}>
                                        <View style={styles.recHeaderLeft}>
                                            <Text style={styles.recIcon}>{rec.icon}</Text>
                                            <View>
                                                <Text style={styles.recTitle}>{rec.title}</Text>
                                                <View style={styles.recBadges}>
                                                    <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '20' }]}>
                                                        <Text style={[styles.categoryBadgeText, { color: categoryColor }]}>
                                                            {rec.category}
                                                        </Text>
                                                    </View>
                                                    <View style={[styles.impactBadge, { backgroundColor: impactStyle.bg }]}>
                                                        <Text style={[styles.impactBadgeText, { color: impactStyle.text }]}>
                                                            {rec.impact} impact
                                                        </Text>
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                    </View>

                                    {/* Description */}
                                    <Text style={styles.recDescription}>{rec.description}</Text>

                                    {/* Potential Savings */}
                                    {rec.potentialSavings && rec.potentialSavings > 0 && (
                                        <View style={styles.savingsContainer}>
                                            <Text style={styles.savingsLabel}>Potential Savings:</Text>
                                            <Text style={styles.savingsAmount}>
                                                {formatCurrency(rec.potentialSavings)}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            );
                        })}
                    </View>
                )}

                {/* Empty State */}
                {(!recommendations || recommendations.recommendations.length === 0) && (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateIcon}>🤖</Text>
                        <Text style={styles.emptyStateTitle}>No Recommendations Yet</Text>
                        <Text style={styles.emptyStateText}>
                            Add more transactions and goals to get personalized AI recommendations
                        </Text>
                    </View>
                )}

                {/* Bottom padding */}
                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        color: '#6B7280',
        fontSize: 14,
    },
    scrollView: {
        flex: 1,
    },
    header: {
        backgroundColor: '#111827',
        paddingHorizontal: 24,
        paddingTop: 48,
        paddingBottom: 32,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#9CA3AF',
    },
    summarySection: {
        paddingHorizontal: 24,
        paddingTop: 24,
        gap: 12,
    },
    summaryRow: {
        flexDirection: 'row',
        gap: 12,
    },
    summaryCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    summaryLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 4,
    },
    summaryValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
    },
    section: {
        paddingHorizontal: 24,
        paddingTop: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 16,
    },
    insightsContainer: {
        gap: 12,
    },
    insightCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#DBEAFE',
        borderRadius: 12,
        padding: 16,
        gap: 12,
    },
    insightIcon: {
        fontSize: 20,
    },
    insightText: {
        flex: 1,
        fontSize: 14,
        color: '#1E40AF',
        lineHeight: 20,
    },
    recommendationCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    recHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    recHeaderLeft: {
        flexDirection: 'row',
        gap: 12,
        flex: 1,
    },
    recIcon: {
        fontSize: 32,
    },
    recTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 8,
    },
    recBadges: {
        flexDirection: 'row',
        gap: 8,
    },
    categoryBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    categoryBadgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'capitalize',
    },
    impactBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    impactBadgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'capitalize',
    },
    recDescription: {
        fontSize: 14,
        color: '#4B5563',
        lineHeight: 20,
        marginBottom: 12,
    },
    savingsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#D1FAE5',
        borderRadius: 8,
        padding: 12,
        gap: 8,
    },
    savingsLabel: {
        fontSize: 12,
        color: '#065F46',
        fontWeight: '600',
    },
    savingsAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#059669',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 64,
        paddingHorizontal: 32,
    },
    emptyStateIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyStateTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 8,
    },
    emptyStateText: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 20,
    },
});
