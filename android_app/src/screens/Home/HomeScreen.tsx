import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as SupabaseAPI from '../../services/SupabaseAPI';
import * as GoalsAPI from '../../services/GoalsAPI';
import * as AIService from '../../services/AIService';

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const [showNotifications, setShowNotifications] = useState(false);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    
    // Data states
    const [safeToSpend, setSafeToSpend] = useState({ weekly: 6700, daily: 1200 });
    const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
    const [activeGoals, setActiveGoals] = useState<any[]>([]);
    const [budgetAlerts, setBudgetAlerts] = useState<any[]>([]);
    const [aiAlerts, setAiAlerts] = useState<AIService.Alert[]>([]);

    // Load all data
    const loadData = useCallback(async () => {
        try {
            console.log('[HomeScreen] Starting data load...');
            setLoading(true);

            // Get current user
            const user = await SupabaseAPI.getCurrentUser();
            if (!user) {
                console.error('[HomeScreen] No user found');
                setLoading(false);
                return;
            }
            console.log('[HomeScreen] User found:', user.id);

            // Get current date range
            const now = new Date();
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay());
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);

            // Calculate date ranges for comprehensive data
            const thisMonth = now.getMonth() + 1;
            const thisYear = now.getFullYear();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
            const today = now.toISOString().split('T')[0];
            
            // Get last 3 months for better AI insights
            const threeMonthsAgo = new Date(now);
            threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
            const startOfThreeMonths = threeMonthsAgo.toISOString().split('T')[0];

            console.log('[HomeScreen] Fetching data from Supabase...');
            
            // Fetch all data from Supabase with individual error handling
            let expenses: any[] = [];
            let allExpenses: any[] = [];
            let incomes: any[] = [];
            let personalGoals: any[] = [];
            let budgets: any[] = [];

            try {
                expenses = await SupabaseAPI.getExpensesByDateRange(startOfMonth, today);
                console.log('[HomeScreen] Expenses fetched:', expenses.length);
            } catch (err) {
                console.error('[HomeScreen] Error fetching expenses:', err);
            }

            try {
                allExpenses = await SupabaseAPI.getExpensesByDateRange(startOfThreeMonths, today);
                console.log('[HomeScreen] All expenses fetched:', allExpenses.length);
            } catch (err) {
                console.error('[HomeScreen] Error fetching all expenses:', err);
                allExpenses = expenses; // Fallback to current month
            }

            try {
                incomes = await SupabaseAPI.getPersonalIncomes(user.id);
                console.log('[HomeScreen] Incomes fetched:', incomes.length);
            } catch (err) {
                console.error('[HomeScreen] Error fetching incomes:', err);
            }

            try {
                personalGoals = await GoalsAPI.getPersonalGoals();
                console.log('[HomeScreen] Goals fetched:', personalGoals.length);
            } catch (err) {
                console.error('[HomeScreen] Error fetching goals:', err);
            }

            try {
                budgets = await SupabaseAPI.getAllBudgetProgress(thisMonth, thisYear);
                console.log('[HomeScreen] Budgets fetched:', budgets.length);
            } catch (err) {
                console.error('[HomeScreen] Error fetching budgets:', err);
            }
            
            // Sort by date and take last 5 for display
            const sortedExpenses = expenses.sort((a, b) => 
                new Date(b.date).getTime() - new Date(a.date).getTime()
            ).slice(0, 5);
            
            setRecentTransactions(sortedExpenses);

            // Get active goals
            const activePersonalGoals = personalGoals
                .filter(g => g.status === 'active')
                .slice(0, 1);
            
            setActiveGoals(activePersonalGoals);

            // Calculate safe to spend
            const totalBudget = budgets.reduce((sum, b) => sum + b.budget.amount, 0);
            const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
            const remaining = totalBudget - totalSpent;
            
            const daysInMonth = new Date(thisYear, thisMonth, 0).getDate();
            const daysRemaining = daysInMonth - now.getDate();
            const weeklySafe = Math.max(0, Math.floor(remaining / (daysRemaining / 7)));
            const dailySafe = Math.max(0, Math.floor(remaining / daysRemaining));
            
            setSafeToSpend({
                weekly: weeklySafe || 6700,
                daily: dailySafe || 1200,
            });

            // Get budget alerts (over 75%)
            const alerts = budgets.filter(b => b.percentage >= 75);
            setBudgetAlerts(alerts);

            // ============================================
            // FETCH AI ALERTS FROM BACKEND (OPTIONAL)
            // ============================================
            console.log('[HomeScreen] Fetching AI alerts...');
            try {
                const aiAlertsData = await AIService.getAIAlerts({
                    expenses: allExpenses, // Send 3 months of data for better insights
                    incomes: incomes,
                    goals: personalGoals,
                    budgets: budgets,
                    userId: user.id
                });
                
                console.log('[HomeScreen] AI Alerts received:', aiAlertsData.length);
                setAiAlerts(aiAlertsData);
            } catch (aiError) {
                console.error('[HomeScreen] Error fetching AI alerts:', aiError);
                // Continue without AI alerts - fallback will be shown
                setAiAlerts([]);
            }

        } catch (error) {
            console.error('[HomeScreen] Error loading home data:', error);
        } finally {
            console.log('[HomeScreen] Data load complete');
            setLoading(false);
        }
    }, []);

    // Load data on mount and when screen is focused
    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [loadData])
    );

    // Refresh handler
    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    // Format currency
    const formatCurrency = (amount: number) => {
        return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
    };

    // Get category emoji
    const getCategoryEmoji = (category: string) => {
        const emojiMap: { [key: string]: string } = {
            food: '🍔',
            transport: '🚗',
            shopping: '🛒',
            bills: '💡',
            entertainment: '🎬',
            health: '🏥',
            education: '📚',
            other: '💰',
        };
        return emojiMap[category.toLowerCase()] || '💸';
    };

    // Get goal emoji
    const getGoalEmoji = (category: string) => {
        const emojiMap: { [key: string]: string } = {
            education: '🎓',
            emergency: '🛡️',
            travel: '✈️',
            property: '🏠',
            gadget: '💻',
            other: '🎯',
        };
        return emojiMap[category.toLowerCase()] || '🎯';
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="large" color="#22D3EE" />
                <Text style={styles.loadingText}>Loading your dashboard...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#111827" />
            
            {/* Top Section (Dark) */}
            <View style={styles.topSection}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.profileButton}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>P</Text>
                        </View>
                        <View>
                            <Text style={styles.greeting}>Good Morning</Text>
                            <Text style={styles.userName}>Pradeep</Text>
                        </View>
                    </TouchableOpacity>
                    
                    <View style={styles.headerButtons}>
                        <TouchableOpacity 
                            style={styles.reportsButton}
                            onPress={() => navigation.navigate('Reports')}
                        >
                            <Text style={styles.reportsIcon}>📊</Text>
                            <Text style={styles.reportsText}>Reports</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={styles.notificationButton}
                            onPress={() => setShowNotifications(!showNotifications)}
                        >
                            <Text style={styles.bellIcon}>🔔</Text>
                            {budgetAlerts.length > 0 && <View style={styles.notificationDot} />}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Safe to Spend (Hero) */}
                <View style={styles.heroSection}>
                    <Text style={styles.heroLabel}>Safe to Spend</Text>
                    <Text style={styles.heroAmount}>{formatCurrency(safeToSpend.weekly)}</Text>
                    
                    {/* Breakdown Pills */}
                    <View style={styles.breakdownPills}>
                        <View style={styles.pill}>
                            <Text style={styles.pillLabel}>This Week</Text>
                            <Text style={styles.pillValue}>{formatCurrency(safeToSpend.weekly)}</Text>
                        </View>
                        <View style={styles.pill}>
                            <Text style={styles.pillLabel}>Today</Text>
                            <Text style={styles.pillValue}>{formatCurrency(safeToSpend.daily)}</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Bottom Sheet (Light) */}
            <View style={styles.bottomSheet}>
                <View style={styles.sheetHandle} />
                
                <ScrollView 
                    style={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#22D3EE']} />
                    }
                >
                    {/* Alerts & Reminders - AI Generated */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Alerts & Reminders</Text>
                        <ScrollView 
                            horizontal 
                            showsHorizontalScrollIndicator={false}
                            style={styles.alertsScroll}
                        >
                            {aiAlerts.length > 0 ? (
                                aiAlerts.map((alert, index) => {
                                    // Determine card style based on alert type
                                    const isLight = alert.type === 'warning' || alert.type === 'info';
                                    const cardStyle = isLight ? styles.alertCardLight : styles.alertCardDark;
                                    const iconContainerStyle = isLight ? styles.alertIconContainer : styles.alertIconContainerDark;
                                    const titleStyle = isLight ? styles.alertTitle : styles.alertTitleDark;
                                    const textStyle = isLight ? styles.alertText : styles.alertTextDark;
                                    
                                    // Badge style based on type
                                    let badgeStyle = styles.alertBadge;
                                    let badgeTextStyle = styles.alertBadgeText;
                                    let badgeText: string = alert.category;
                                    
                                    if (alert.type === 'success') {
                                        badgeStyle = styles.alertBadgeDark;
                                        badgeTextStyle = styles.alertBadgeTextDark;
                                        badgeText = 'Good News';
                                    } else if (alert.type === 'danger') {
                                        badgeStyle = styles.alertBadge;
                                        badgeTextStyle = styles.alertBadgeText;
                                        badgeText = 'Urgent';
                                    } else if (alert.type === 'warning') {
                                        badgeStyle = styles.alertBadge;
                                        badgeTextStyle = styles.alertBadgeText;
                                        badgeText = alert.priority === 'high' ? 'Important' : 'Alert';
                                    }

                                    return (
                                        <View key={index} style={[styles.alertCard, cardStyle]}>
                                            <View style={styles.alertHeader}>
                                                <View style={iconContainerStyle}>
                                                    <Text style={styles.alertIcon}>{alert.icon}</Text>
                                                </View>
                                                <View style={badgeStyle}>
                                                    <Text style={badgeTextStyle}>{badgeText}</Text>
                                                </View>
                                            </View>
                                            <Text style={titleStyle}>{alert.title}</Text>
                                            <Text style={textStyle}>{alert.message}</Text>
                                        </View>
                                    );
                                })
                            ) : (
                                <View style={[styles.alertCard, styles.alertCardLight]}>
                                    <View style={styles.alertHeader}>
                                        <View style={styles.alertIconContainer}>
                                            <Text style={styles.alertIcon}>💡</Text>
                                        </View>
                                        <View style={styles.alertBadge}>
                                            <Text style={styles.alertBadgeText}>Info</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.alertTitle}>Loading Insights...</Text>
                                    <Text style={styles.alertText}>AI is analyzing your financial data</Text>
                                </View>
                            )}
                        </ScrollView>
                    </View>

                    {/* Quick Actions */}
                    <View style={styles.section}>
                        <View style={styles.quickActions}>
                            <TouchableOpacity 
                                style={styles.actionButton}
                                onPress={() => navigation.navigate('Goals')}
                            >
                                <View style={styles.actionIcon}>
                                    <Text style={styles.actionIconText}>🎯</Text>
                                </View>
                                <Text style={styles.actionLabel}>Add Goal</Text>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={styles.actionButton}
                                onPress={() => navigation.navigate('Transactions', { screen: 'AddTransaction' })}
                            >
                                <View style={styles.actionIcon}>
                                    <Text style={styles.actionIconText}>💰</Text>
                                </View>
                                <Text style={styles.actionLabel}>Log Cash</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.actionButton, styles.actionDisabled]}>
                                <View style={[styles.actionIcon, styles.actionIconDisabled]}>
                                    <Text style={styles.actionIconText}>🔗</Text>
                                </View>
                                <Text style={styles.actionLabel}>Bank</Text>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={styles.actionButton}
                                onPress={() => navigation.navigate('Dashboard')}
                            >
                                <View style={styles.actionIcon}>
                                    <Text style={styles.actionIconText}>📊</Text>
                                </View>
                                <Text style={styles.actionLabel}>Insights</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Recent Transactions */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Recent Transactions</Text>
                        {recentTransactions.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyStateIcon}>💸</Text>
                                <Text style={styles.emptyStateText}>No transactions yet</Text>
                            </View>
                        ) : (
                            <View style={styles.transactionsList}>
                                {recentTransactions.map((transaction) => (
                                    <TouchableOpacity 
                                        key={transaction.id} 
                                        style={styles.transactionItem}
                                        onPress={() => navigation.navigate('Transactions', {
                                            screen: 'TransactionDetails',
                                            params: { transactionId: transaction.id }
                                        })}
                                    >
                                        <View style={styles.transactionLeft}>
                                            <View style={[styles.transactionIcon, { backgroundColor: '#F3E8FF' }]}>
                                                <Text style={styles.transactionEmoji}>
                                                    {getCategoryEmoji(transaction.category)}
                                                </Text>
                                            </View>
                                            <View>
                                                <Text style={styles.transactionTitle}>
                                                    {transaction.description || transaction.category}
                                                </Text>
                                                <View style={styles.categoryBadge}>
                                                    <Text style={styles.categoryText}>{transaction.category}</Text>
                                                </View>
                                            </View>
                                        </View>
                                        <Text style={styles.transactionAmount}>
                                            -{formatCurrency(transaction.amount)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* Active Goals Preview */}
                    {activeGoals.length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Active Goals</Text>
                                <TouchableOpacity onPress={() => navigation.navigate('Goals')}>
                                    <Text style={styles.viewAllText}>View All</Text>
                                </TouchableOpacity>
                            </View>
                            
                            {activeGoals.map((goal) => {
                                const progress = (goal.saved_amount / goal.target_amount) * 100;
                                const daysLeft = goal.deadline 
                                    ? Math.ceil(
                                        (new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                                    )
                                    : 0;
                                
                                return (
                                    <TouchableOpacity 
                                        key={goal.id}
                                        style={styles.goalCard}
                                        onPress={() => navigation.navigate('Goals', {
                                            screen: 'PersonalGoalDetails',
                                            params: { goalId: goal.id }
                                        })}
                                    >
                                        <View style={styles.goalHeader}>
                                            <View style={styles.goalIconContainer}>
                                                <Text style={styles.goalIcon}>🎯</Text>
                                            </View>
                                            <View>
                                                <Text style={styles.goalTitle}>{goal.goal_name}</Text>
                                                {daysLeft > 0 && (
                                                    <Text style={styles.goalDays}>{daysLeft} days left</Text>
                                                )}
                                            </View>
                                        </View>
                                        <View style={styles.goalProgress}>
                                            <View style={styles.goalProgressLabels}>
                                                <Text style={styles.goalProgressText}>
                                                    {formatCurrency(goal.saved_amount)}
                                                </Text>
                                                <Text style={styles.goalProgressText}>
                                                    Target: {formatCurrency(goal.target_amount)}
                                                </Text>
                                            </View>
                                            <View style={styles.progressBar}>
                                                <View style={[styles.progressFill, { width: `${Math.min(progress, 100)}%` }]} />
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    )}

                    {/* Bottom padding for navigation */}
                    <View style={{ height: 100 }} />
                </ScrollView>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#111827',
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        color: '#9CA3AF',
        fontSize: 14,
    },
    topSection: {
        backgroundColor: '#111827',
        paddingHorizontal: 24,
        paddingTop: 40,
        paddingBottom: 32,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    headerButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    profileButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#374151',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#4B5563',
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    greeting: {
        color: '#9CA3AF',
        fontSize: 12,
    },
    userName: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    reportsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#1F2937',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#374151',
    },
    reportsIcon: {
        fontSize: 14,
    },
    reportsText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
    notificationButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#1F2937',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    bellIcon: {
        fontSize: 18,
    },
    notificationDot: {
        position: 'absolute',
        top: 8,
        right: 12,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#F87171',
    },
    heroSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    heroLabel: {
        color: '#9CA3AF',
        fontSize: 10,
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: 4,
    },
    heroAmount: {
        color: '#FFFFFF',
        fontSize: 48,
        fontWeight: '800',
        letterSpacing: -1,
    },
    breakdownPills: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 16,
    },
    pill: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        backgroundColor: '#1F2937',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#374151',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    pillLabel: {
        color: '#9CA3AF',
        fontSize: 10,
        textTransform: 'uppercase',
    },
    pillValue: {
        color: '#22D3EE',
        fontSize: 14,
        fontWeight: 'bold',
    },
    bottomSheet: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.1,
        shadowRadius: 25,
        elevation: 20,
    },
    sheetHandle: {
        width: 48,
        height: 4,
        backgroundColor: '#E5E7EB',
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: 12,
        marginBottom: 4,
    },
    scrollContent: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 16,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#111827',
    },
    viewAllText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#22D3EE',
    },
    alertsScroll: {
        marginTop: 12,
    },
    alertCard: {
        width: 260,
        borderRadius: 24,
        padding: 16,
        marginRight: 12,
    },
    alertCardLight: {
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    alertCardDark: {
        backgroundColor: '#111827',
    },
    alertHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    alertIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    alertIconContainerDark: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#374151',
        justifyContent: 'center',
        alignItems: 'center',
    },
    alertIcon: {
        fontSize: 16,
    },
    alertBadge: {
        backgroundColor: '#FEE2E2',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    alertBadgeText: {
        color: '#F87171',
        fontSize: 10,
        fontWeight: 'bold',
    },
    alertBadgeDark: {
        backgroundColor: '#374151',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    alertBadgeTextDark: {
        color: '#34D399',
        fontSize: 10,
        fontWeight: 'bold',
    },
    alertTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 4,
        textTransform: 'capitalize',
    },
    alertTitleDark: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    alertText: {
        fontSize: 12,
        color: '#6B7280',
    },
    alertTextDark: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    quickActions: {
        backgroundColor: '#F3F4F6',
        borderRadius: 24,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionButton: {
        flex: 1,
        alignItems: 'center',
        gap: 4,
    },
    actionDisabled: {
        opacity: 0.5,
    },
    actionIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    actionIconDisabled: {
        backgroundColor: '#E5E7EB',
    },
    actionIconText: {
        fontSize: 20,
    },
    actionLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#111827',
    },
    transactionsList: {
        gap: 8,
    },
    transactionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        borderRadius: 16,
        backgroundColor: 'transparent',
    },
    transactionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    transactionIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    transactionEmoji: {
        fontSize: 20,
    },
    transactionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 4,
    },
    categoryBadge: {
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    categoryText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#6B7280',
        textTransform: 'capitalize',
    },
    transactionAmount: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#111827',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    emptyStateIcon: {
        fontSize: 48,
        marginBottom: 8,
    },
    emptyStateText: {
        fontSize: 14,
        color: '#9CA3AF',
    },
    goalCard: {
        backgroundColor: '#F3F4F6',
        borderRadius: 24,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        position: 'relative',
    },
    priorityBadge: {
        position: 'absolute',
        top: 16,
        right: 16,
        backgroundColor: '#111827',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    priorityText: {
        color: '#FFFFFF',
        fontSize: 8,
        fontWeight: 'bold',
    },
    goalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 8,
    },
    goalIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    goalIcon: {
        fontSize: 14,
    },
    goalTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#111827',
    },
    goalDays: {
        fontSize: 10,
        color: '#6B7280',
    },
    goalProgress: {
        marginTop: 8,
    },
    goalProgressLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    goalProgressText: {
        fontSize: 10,
        color: '#6B7280',
    },
    progressBar: {
        height: 6,
        backgroundColor: '#E5E7EB',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#22D3EE',
        borderRadius: 3,
    },
});
