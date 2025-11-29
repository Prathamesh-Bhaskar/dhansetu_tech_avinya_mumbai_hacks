import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { getCategoryIcon, getCategoryName } from '../../../utils/categories';

interface Props {
    category: string;
    totalAmount: number;
    percentage: number;
    transactionCount: number;
    averageAmount: number;
    trend: number;
    onPress?: () => void;
}

export const CategoryInsightCard: React.FC<Props> = ({
    category,
    totalAmount,
    percentage,
    transactionCount,
    averageAmount,
    trend,
    onPress,
}) => {
    const formatCurrency = (amount: number) => {
        return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
    };

    const getTrendColor = () => {
        if (trend > 0) return '#f44336'; // Red for increase
        if (trend < 0) return '#4caf50'; // Green for decrease
        return '#757575'; // Gray for no change
    };

    const getTrendIcon = () => {
        if (trend > 0) return '↑';
        if (trend < 0) return '↓';
        return '→';
    };

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={onPress}
            activeOpacity={0.7}
            disabled={!onPress}
        >
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <Text style={styles.icon}>{getCategoryIcon(category)}</Text>
                    <Text style={styles.categoryName}>{getCategoryName(category)}</Text>
                </View>
                <Text style={styles.percentage}>{percentage.toFixed(1)}%</Text>
            </View>

            {/* Amount */}
            <Text style={styles.amount}>{formatCurrency(totalAmount)}</Text>

            {/* Stats Row */}
            <View style={styles.statsRow}>
                <View style={styles.stat}>
                    <Text style={styles.statLabel}>Transactions</Text>
                    <Text style={styles.statValue}>{transactionCount}</Text>
                </View>
                <View style={styles.stat}>
                    <Text style={styles.statLabel}>Average</Text>
                    <Text style={styles.statValue}>{formatCurrency(averageAmount)}</Text>
                </View>
            </View>

            {/* Trend */}
            {trend !== 0 && (
                <View style={styles.trendRow}>
                    <Text style={[styles.trendText, { color: getTrendColor() }]}>
                        {getTrendIcon()} {Math.abs(trend).toFixed(1)}% vs previous period
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    icon: {
        fontSize: 24,
        marginRight: 8,
    },
    categoryName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#212121',
    },
    percentage: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#6200ee',
    },
    amount: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#212121',
        marginBottom: 12,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        marginBottom: 8,
    },
    stat: {
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 12,
        color: '#757575',
        marginBottom: 4,
    },
    statValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#212121',
    },
    trendRow: {
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    trendText: {
        fontSize: 13,
        fontWeight: '500',
    },
});
