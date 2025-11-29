import React, { useState, useCallback } from 'react';
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
import * as SupabaseAPI from '../../services/SupabaseAPI';
import { getCategoryIcon, getCategoryName } from '../../../utils/categories';

interface Props {
    navigation: any;
}

export const TransactionListScreen: React.FC<Props> = ({ navigation }) => {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadTransactions = async () => {
        try {
            setLoading(true);
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

            const expenses = await SupabaseAPI.getExpensesByDateRange(
                startOfMonth.toISOString().split('T')[0],
                endOfMonth.toISOString().split('T')[0]
            );

            setTransactions(expenses);
        } catch (error) {
            console.error('Error loading transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadTransactions();
        setRefreshing(false);
    };

    useFocusEffect(
        useCallback(() => {
            loadTransactions();
        }, [])
    );

    const formatCurrency = (amount: number) => {
        return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
        });
    };

    const renderTransaction = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.transactionCard}
            onPress={() => navigation.navigate('TransactionDetails', { transaction: item })}
            activeOpacity={0.7}
        >
            <View style={styles.iconContainer}>
                <Text style={styles.categoryIcon}>{getCategoryIcon(item.category)}</Text>
            </View>
            <View style={styles.detailsContainer}>
                <Text style={styles.categoryName}>{getCategoryName(item.category)}</Text>
                <Text style={styles.description} numberOfLines={1}>
                    {item.description || 'No description'}
                </Text>
                <Text style={styles.date}>{formatDate(item.date)}</Text>
            </View>
            <View style={styles.amountContainer}>
                <Text style={styles.amount}>{formatCurrency(item.amount)}</Text>
                {item.source === 'manual' && (
                    <Text style={styles.sourceTag}>✍️ Manual</Text>
                )}
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6200ee" />
                <Text style={styles.loadingText}>Loading transactions...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Transactions</Text>
                    <Text style={styles.headerSubtitle}>
                        {transactions.length} transactions this month
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => navigation.navigate('AddTransaction')}
                >
                    <Text style={styles.addButtonText}>+ Add</Text>
                </TouchableOpacity>
            </View>

            {transactions.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyIcon}>💳</Text>
                    <Text style={styles.emptyTitle}>No Transactions</Text>
                    <Text style={styles.emptyText}>
                        Your transactions will appear here
                    </Text>
                    <TouchableOpacity
                        style={styles.emptyButton}
                        onPress={() => navigation.navigate('AddTransaction')}
                    >
                        <Text style={styles.emptyButtonText}>+ Add Transaction</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={transactions}
                    renderItem={renderTransaction}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContainer}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#6200ee']}
                        />
                    }
                />
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#212121',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#757575',
        marginTop: 4,
    },
    addButton: {
        backgroundColor: '#6200ee',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    addButtonText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600',
    },
    listContainer: {
        padding: 16,
    },
    transactionCard: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    categoryIcon: {
        fontSize: 24,
    },
    detailsContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    categoryName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#212121',
        marginBottom: 2,
    },
    description: {
        fontSize: 14,
        color: '#757575',
        marginBottom: 2,
    },
    date: {
        fontSize: 12,
        color: '#9e9e9e',
    },
    amountContainer: {
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    amount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#212121',
        marginBottom: 4,
    },
    sourceTag: {
        fontSize: 10,
        color: '#1976d2',
        backgroundColor: '#e3f2fd',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
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
});
