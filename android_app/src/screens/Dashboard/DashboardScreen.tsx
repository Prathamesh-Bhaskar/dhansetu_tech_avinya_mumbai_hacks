import React from 'react';
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
import { useExpenseStats } from '../../hooks/useExpenseStats';
import { useDashboardData } from '../../hooks/useDashboardData';
import { MonthlyTrendChart } from '../../components/charts/MonthlyTrendChart';
import { CategoryPieChart } from '../../components/charts/CategoryPieChart';
import { DailySpendingChart } from '../../components/charts/DailySpendingChart';
import { StatsCard } from '../../components/dashboard/StatsCard';
import { FilterBar, DatePreset } from '../../components/dashboard/FilterBar';
import { StatsSkeleton } from '../../components/dashboard/StatsSkeleton';
import { BudgetSummaryCard } from '../../components/dashboard/BudgetSummaryCard';
import { BudgetAlert } from '../../components/dashboard/BudgetAlert';
import * as SupabaseAPI from '../../services/SupabaseAPI';
import type { BudgetProgress } from '../../services/SupabaseAPI';

export const DashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const [refreshing, setRefreshing] = React.useState(false);
    const [selectedPreset, setSelectedPreset] = React.useState<DatePreset>('thisMonth');
    const [selectedCategory, setSelectedCategory] = React.useState('all');
    const [budgetAlerts, setBudgetAlerts] = React.useState<BudgetProgress[]>([]);
    const [dismissedAlerts, setDismissedAlerts] = React.useState<Set<string>>(new Set());

    // Calculate date range based on preset (memoized to prevent re-renders)
    const dateRange = React.useMemo(() => {
        const now = new Date();
        switch (selectedPreset) {
            case 'thisMonth':
                return {
                    start: new Date(now.getFullYear(), now.getMonth(), 1),
                    end: new Date(now.getFullYear(), now.getMonth() + 1, 0),
                };
            case 'lastMonth':
                return {
                    start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
                    end: new Date(now.getFullYear(), now.getMonth(), 0),
                };
            case 'last3Months':
                return {
                    start: new Date(now.getFullYear(), now.getMonth() - 2, 1),
                    end: new Date(now.getFullYear(), now.getMonth() + 1, 0),
                };
            case 'all':
            default:
                return {
                    start: new Date(2020, 0, 1), // Far past date
                    end: now,
                };
        }
    }, [selectedPreset]); // Only recalculate when preset changes

    const { stats, loading: statsLoading, refresh: refreshStats } = useExpenseStats(dateRange.start, dateRange.end, selectedCategory);
    const { monthlyTrend, categoryBreakdown, loading: dashboardLoading, refresh: refreshData } = useDashboardData();

    const loadBudgetAlerts = React.useCallback(async () => {
        try {
            const now = new Date();
            const month = now.getMonth() + 1;
            const year = now.getFullYear();

            const progress = await SupabaseAPI.getAllBudgetProgress(month, year);

            // Filter for budgets that need alerts (75% or more)
            const alerts = progress.filter(p => p.percentage >= 75);
            setBudgetAlerts(alerts);
        } catch (error) {
            console.error('Error loading budget alerts:', error);
        }
    }, []);

    const onRefresh = async () => {
        console.log('Manual refresh triggered');
        setRefreshing(true);
        await Promise.all([refreshStats(), refreshData(), loadBudgetAlerts()]);
        setRefreshing(false);
    };

    // Load budget alerts only once on mount
    React.useEffect(() => {
        loadBudgetAlerts();
    }, [loadBudgetAlerts]);

    // Show loading skeleton
    if (statsLoading && !stats) {
        return (
            <ScrollView style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Dashboard</Text>
                    <Text style={styles.headerSubtitle}>Loading your expenses...</Text>
                </View>
                <FilterBar
                    selectedPreset={selectedPreset}
                    onPresetChange={setSelectedPreset}
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                />
                <StatsSkeleton />
            </ScrollView>
        );
    }

    // Show error if data failed to load
    if (stats === null) {
        return (
            <ScrollView
                style={styles.container}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6200ee']} />
                }
            >
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Dashboard</Text>
                </View>
                <View style={styles.emptyStateContainer}>
                    <Text style={styles.emptyStateIcon}>📊</Text>
                    <Text style={styles.emptyStateTitle}>No Data Available</Text>
                    <Text style={styles.emptyStateText}>
                        {selectedCategory !== 'all'
                            ? `No expenses found in this category for this period`
                            : 'No expenses found for this period'}
                    </Text>
                    <Text style={styles.emptyStateHint}>Pull down to refresh</Text>
                </View>
            </ScrollView>
        );
    }

    const formatCurrency = (amount: number) => {
        return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
    };

    const getChangeIndicator = (percentage: number) => {
        if (percentage > 0) return { text: `↑ ${percentage.toFixed(1)}%`, color: '#f44336' };
        if (percentage < 0) return { text: `↓ ${Math.abs(percentage).toFixed(1)}%`, color: '#4caf50' };
        return { text: '→ 0%', color: '#757575' };
    };

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6200ee']} />
            }
        >
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.headerTitle}>Dashboard</Text>
                        <Text style={styles.headerSubtitle}>
                            Your Expense Overview ({stats?.transactionCount || 0} transactions)
                        </Text>
                        <Text style={styles.headerDebug}>
                            Showing: Nov 1-30, 2025
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={styles.reportsButton}
                        onPress={() => navigation.navigate('Reports')}
                    >
                        <Text style={styles.reportsButtonIcon}>📊</Text>
                        <Text style={styles.reportsButtonText}>Reports</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Filter Bar */}
            <FilterBar
                selectedPreset={selectedPreset}
                onPresetChange={setSelectedPreset}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
            />

            {/* Enhanced Statistics Grid */}
            <View style={styles.statsSection}>
                <Text style={styles.sectionTitle}>Statistics</Text>

                {/* Row 1: Total Spent & Month Comparison */}
                <View style={styles.statsRow}>
                    <View style={styles.statsCol}>
                        <StatsCard
                            title="Total Spent"
                            value={formatCurrency(stats?.totalThisMonth || 0)}
                            subtitle="This Month"
                            color="#000000"
                        />
                    </View>
                    <View style={styles.statsCol}>
                        <StatsCard
                            title="vs Last Month"
                            value={formatCurrency(stats?.totalLastMonth || 0)}
                            change={stats?.percentageChange || 0}
                            trend={
                                stats?.percentageChange > 0 ? 'up' :
                                    stats?.percentageChange < 0 ? 'down' : 'neutral'
                            }
                            color="#000000"
                        />
                    </View>
                </View>

                {/* Row 2: Avg Daily & Highest */}
                <View style={styles.statsRow}>
                    <View style={styles.statsCol}>
                        <StatsCard
                            title="Avg/Day"
                            value={formatCurrency(stats?.avgDailySpend || 0)}
                            subtitle="Daily Average"
                            color="#000000"
                        />
                    </View>
                    <View style={styles.statsCol}>
                        <StatsCard
                            title="Highest"
                            value={formatCurrency(stats?.highestExpense || 0)}
                            subtitle="Single Expense"
                            color="#f44336"
                        />
                    </View>
                </View>

                {/* Row 3: Transactions & Top Category */}
                <View style={styles.statsRow}>
                    <View style={styles.statsCol}>
                        <StatsCard
                            title="Transactions"
                            value={`${stats?.transactionCount || 0}`}
                            subtitle="This Month"
                            color="#000000"
                        />
                    </View>
                    <View style={styles.statsCol}>
                        <StatsCard
                            title="Top Category"
                            value={stats?.topCategory || 'None'}
                            subtitle="Most Spent"
                            color="#000000"
                        />
                    </View>
                </View>
            </View>

            {/* Budget Summary Card */}
            <BudgetSummaryCard
                onViewAll={() => navigation.navigate('Budgets')}
            />

            {/* Budget Alerts */}
            {budgetAlerts
                .filter(alert => !dismissedAlerts.has(alert.budget.id))
                .map((alert) => {
                    const severity =
                        alert.percentage > 100 ? 'critical' :
                            alert.percentage > 90 ? 'danger' : 'warning';

                    return (
                        <BudgetAlert
                            key={alert.budget.id}
                            category={alert.budget.category}
                            budgetAmount={alert.budget.amount}
                            spentAmount={alert.spent}
                            percentage={alert.percentage}
                            severity={severity}
                            onDismiss={() => {
                                setDismissedAlerts(prev => new Set(prev).add(alert.budget.id));
                            }}
                            onPress={() => {
                                navigation.navigate('Budgets', {
                                    screen: 'ManageBudget',
                                    params: {
                                        budgetId: alert.budget.id,
                                        category: alert.budget.category,
                                        amount: alert.budget.amount,
                                        month: alert.budget.month,
                                        year: alert.budget.year,
                                    }
                                });
                            }}
                        />
                    );
                })}

            {/* Charts */}
            <MonthlyTrendChart data={monthlyTrend} />

            {/* Only show pie chart when viewing all categories */}
            {selectedCategory === 'all' && (
                <CategoryPieChart data={categoryBreakdown} />
            )}

            <DailySpendingChart />
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
        fontSize: 16,
        color: '#757575',
    },
    errorText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#d32f2f',
        marginBottom: 8,
    },
    errorSubtext: {
        fontSize: 14,
        color: '#757575',
    },
    header: {
        backgroundColor: '#6200ee',
        padding: 24,
        paddingTop: 48,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#e1bee7',
        marginTop: 4,
    },
    reportsButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    reportsButtonIcon: {
        fontSize: 16,
    },
    reportsButtonText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600',
    },
    emptyStateContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
        paddingHorizontal: 32,
    },
    emptyStateIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyStateTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#212121',
        marginBottom: 8,
    },
    emptyStateText: {
        fontSize: 14,
        color: '#757575',
        textAlign: 'center',
        marginBottom: 8,
    },
    emptyStateHint: {
        fontSize: 12,
        color: '#9e9e9e',
        fontStyle: 'italic',
    },
    statsSection: {
        padding: 16,
        paddingTop: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#212121',
        marginBottom: 12,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 0,
    },
    statsCol: {
        flex: 1,
    },
    headerDebug: {
        fontSize: 12,
        color: '#ce93d8',
        marginTop: 4,
        fontStyle: 'italic',
    },
    card: {
        backgroundColor: '#ffffff',
        margin: 16,
        padding: 24,
        borderRadius: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardLabel: {
        fontSize: 14,
        color: '#757575',
        fontWeight: '600',
        marginBottom: 8,
    },
    cardAmount: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#212121',
    },
    changeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    changeText: {
        fontSize: 16,
        fontWeight: '600',
    },
    changeLabel: {
        fontSize: 14,
        color: '#757575',
    },
    statsGrid: {
        flexDirection: 'row',
        marginHorizontal: 16,
        marginBottom: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#ffffff',
        padding: 16,
        borderRadius: 12,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    statCardLeft: {
        marginRight: 6,
    },
    statCardRight: {
        marginLeft: 6,
    },
    statLabel: {
        fontSize: 12,
        color: '#757575',
        fontWeight: '600',
        marginBottom: 4,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#212121',
    },
    placeholderCard: {
        backgroundColor: '#e8eaf6',
        margin: 16,
        padding: 32,
        borderRadius: 16,
        alignItems: 'center',
    },
    placeholderText: {
        fontSize: 18,
        color: '#6200ee',
        fontWeight: '600',
    },
});
