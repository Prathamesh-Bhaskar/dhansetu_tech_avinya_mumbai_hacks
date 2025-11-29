import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { useReportsData, ReportPeriod } from '../../hooks/useReportsData';
import { CategoryInsightCard } from '../../components/reports/CategoryInsightCard';
import { SpendingPatternCard } from '../../components/reports/SpendingPatternCard';

const PERIOD_OPTIONS: { value: ReportPeriod; label: string }[] = [
    { value: 'thisMonth', label: 'This Month' },
    { value: 'lastMonth', label: 'Last Month' },
    { value: 'last3Months', label: 'Last 3 Months' },
    { value: 'last6Months', label: 'Last 6 Months' },
    { value: 'thisYear', label: 'This Year' },
];

export const ReportsScreen: React.FC = () => {
    const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod>('thisMonth');
    const [refreshing, setRefreshing] = useState(false);
    const { summary, loading, refresh } = useReportsData(selectedPeriod);

    const onRefresh = async () => {
        setRefreshing(true);
        await refresh();
        setRefreshing(false);
    };

    const formatCurrency = (amount: number) => {
        return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
    };

    const getSpendingPatterns = () => {
        if (!summary || summary.spendingByDayOfWeek.length === 0) return [];

        const patterns = [];

        // Find highest spending day of week
        const highestDayOfWeek = summary.spendingByDayOfWeek.reduce((max, day) =>
            day.amount > max.amount ? day : max
        );

        if (highestDayOfWeek.amount > 0) {
            patterns.push({
                icon: '📅',
                title: 'Weekly Pattern',
                insight: `You spend most on ${highestDayOfWeek.day}s`,
                color: '#2196f3',
            });
        }

        // Check if spending is concentrated at end of month
        if (summary.highestDay.date) {
            const day = parseInt(summary.highestDay.date.split('-')[2]);
            if (day > 25) {
                patterns.push({
                    icon: '📆',
                    title: 'Monthly Pattern',
                    insight: 'Highest spending at end of month',
                    color: '#ff9800',
                });
            }
        }

        // Check top category
        if (summary.categoryBreakdown.length > 0) {
            const topCategory = summary.categoryBreakdown[0];
            patterns.push({
                icon: '🎯',
                title: 'Top Category',
                insight: `${topCategory.category} is ${topCategory.percentage.toFixed(0)}% of spending`,
                color: '#9c27b0',
            });
        }

        return patterns;
    };

    if (loading && !summary) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6200ee" />
                <Text style={styles.loadingText}>Loading reports...</Text>
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
                <Text style={styles.headerTitle}>📊 Reports & Insights</Text>
                <Text style={styles.headerSubtitle}>Analyze your spending patterns</Text>
            </View>

            {/* Period Selector */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.periodSelector}
                contentContainerStyle={styles.periodSelectorContent}
            >
                {PERIOD_OPTIONS.map((option) => (
                    <TouchableOpacity
                        key={option.value}
                        style={[
                            styles.periodButton,
                            selectedPeriod === option.value && styles.periodButtonActive,
                        ]}
                        onPress={() => setSelectedPeriod(option.value)}
                    >
                        <Text
                            style={[
                                styles.periodButtonText,
                                selectedPeriod === option.value && styles.periodButtonTextActive,
                            ]}
                        >
                            {option.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {summary && summary.transactionCount > 0 ? (
                <>
                    {/* Summary Card */}
                    <View style={styles.summaryCard}>
                        <Text style={styles.sectionTitle}>Summary</Text>
                        <Text style={styles.totalAmount}>{formatCurrency(summary.totalSpent)}</Text>
                        <Text style={styles.totalLabel}>Total Spent</Text>

                        <View style={styles.summaryStats}>
                            <View style={styles.summaryStat}>
                                <Text style={styles.summaryStatValue}>{summary.transactionCount}</Text>
                                <Text style={styles.summaryStatLabel}>Transactions</Text>
                            </View>
                            <View style={styles.summaryStat}>
                                <Text style={styles.summaryStatValue}>
                                    {formatCurrency(summary.dailyAverage)}
                                </Text>
                                <Text style={styles.summaryStatLabel}>Daily Avg</Text>
                            </View>
                            <View style={styles.summaryStat}>
                                <Text style={styles.summaryStatValue}>
                                    {formatCurrency(summary.highestDay.amount)}
                                </Text>
                                <Text style={styles.summaryStatLabel}>Highest Day</Text>
                            </View>
                        </View>
                    </View>

                    {/* Spending Patterns */}
                    {getSpendingPatterns().length > 0 && (
                        <>
                            <Text style={styles.sectionTitleWithMargin}>💡 Insights</Text>
                            {getSpendingPatterns().map((pattern, index) => (
                                <SpendingPatternCard
                                    key={index}
                                    icon={pattern.icon}
                                    title={pattern.title}
                                    insight={pattern.insight}
                                    color={pattern.color}
                                />
                            ))}
                        </>
                    )}

                    {/* Category Breakdown */}
                    <Text style={styles.sectionTitleWithMargin}>📂 Category Breakdown</Text>
                    {summary.categoryBreakdown.map((category) => (
                        <CategoryInsightCard
                            key={category.category}
                            category={category.category}
                            totalAmount={category.totalAmount}
                            percentage={category.percentage}
                            transactionCount={category.transactionCount}
                            averageAmount={category.averageAmount}
                            trend={category.trend}
                        />
                    ))}

                    {/* Top Expenses */}
                    {summary.topExpenses.length > 0 && (
                        <>
                            <Text style={styles.sectionTitleWithMargin}>🏆 Top Expenses</Text>
                            <View style={styles.topExpensesCard}>
                                {summary.topExpenses.map((expense, index) => (
                                    <View key={expense.id} style={styles.topExpenseRow}>
                                        <View style={styles.topExpenseRank}>
                                            <Text style={styles.topExpenseRankText}>{index + 1}</Text>
                                        </View>
                                        <View style={styles.topExpenseDetails}>
                                            <Text style={styles.topExpenseDescription}>
                                                {expense.description || 'No description'}
                                            </Text>
                                            <Text style={styles.topExpenseCategory}>{expense.category}</Text>
                                        </View>
                                        <Text style={styles.topExpenseAmount}>
                                            {formatCurrency(expense.amount)}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </>
                    )}
                </>
            ) : (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyStateIcon}>📊</Text>
                    <Text style={styles.emptyStateTitle}>No Data Available</Text>
                    <Text style={styles.emptyStateText}>
                        No expenses found for this period
                    </Text>
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
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#757575',
    },
    header: {
        padding: 20,
        paddingTop: 24,
        backgroundColor: '#ffffff',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#212121',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#757575',
    },
    periodSelector: {
        backgroundColor: '#ffffff',
        paddingVertical: 12,
    },
    periodSelectorContent: {
        paddingHorizontal: 16,
    },
    periodButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f5f5f5',
        marginRight: 8,
    },
    periodButtonActive: {
        backgroundColor: '#6200ee',
    },
    periodButtonText: {
        fontSize: 14,
        color: '#757575',
        fontWeight: '500',
    },
    periodButtonTextActive: {
        color: '#ffffff',
    },
    summaryCard: {
        backgroundColor: '#ffffff',
        margin: 16,
        padding: 20,
        borderRadius: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#757575',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    sectionTitleWithMargin: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#212121',
        marginHorizontal: 16,
        marginTop: 24,
        marginBottom: 12,
    },
    totalAmount: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#212121',
        marginBottom: 4,
    },
    totalLabel: {
        fontSize: 14,
        color: '#757575',
        marginBottom: 20,
    },
    summaryStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    summaryStat: {
        alignItems: 'center',
    },
    summaryStatValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#212121',
        marginBottom: 4,
    },
    summaryStatLabel: {
        fontSize: 12,
        color: '#757575',
    },
    topExpensesCard: {
        backgroundColor: '#ffffff',
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 12,
        padding: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    topExpenseRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    topExpenseRank: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#6200ee',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    topExpenseRankText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    topExpenseDetails: {
        flex: 1,
    },
    topExpenseDescription: {
        fontSize: 14,
        fontWeight: '500',
        color: '#212121',
        marginBottom: 2,
    },
    topExpenseCategory: {
        fontSize: 12,
        color: '#757575',
    },
    topExpenseAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#212121',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        marginTop: 60,
    },
    emptyStateIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyStateTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#212121',
        marginBottom: 8,
    },
    emptyStateText: {
        fontSize: 14,
        color: '#757575',
        textAlign: 'center',
    },
});
