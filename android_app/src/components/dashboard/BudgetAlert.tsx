import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { getCategoryIcon, getCategoryName } from '../../../utils/categories';

interface Props {
    category: string;
    budgetAmount: number;
    spentAmount: number;
    percentage: number;
    severity: 'warning' | 'danger' | 'critical';
    onDismiss: () => void;
    onPress: () => void;
}

export const BudgetAlert: React.FC<Props> = ({
    category,
    budgetAmount,
    spentAmount,
    percentage,
    severity,
    onDismiss,
    onPress,
}) => {
    const getAlertColor = () => {
        switch (severity) {
            case 'warning': return '#ff9800';
            case 'danger': return '#f44336';
            case 'critical': return '#d32f2f';
            default: return '#757575';
        }
    };

    const getAlertIcon = () => {
        switch (severity) {
            case 'warning': return '⚠️';
            case 'danger': return '🔴';
            case 'critical': return '❌';
            default: return '💡';
        }
    };

    const getAlertMessage = () => {
        switch (severity) {
            case 'warning': return "You're approaching your budget limit";
            case 'danger': return "You're close to exceeding your budget!";
            case 'critical': return "Budget exceeded!";
            default: return '';
        }
    };

    const formatCurrency = (amount: number) => {
        return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
    };

    return (
        <TouchableOpacity
            style={[styles.container, { borderLeftColor: getAlertColor() }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.icon}>{getAlertIcon()}</Text>
                    <View style={styles.titleContainer}>
                        <Text style={styles.categoryIcon}>{getCategoryIcon(category)}</Text>
                        <Text style={styles.category}>{getCategoryName(category)}</Text>
                    </View>
                    <TouchableOpacity onPress={onDismiss} style={styles.dismissButton}>
                        <Text style={styles.dismissText}>×</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.details}>
                    <Text style={styles.amount}>
                        {formatCurrency(spentAmount)} / {formatCurrency(budgetAmount)}
                        <Text style={[styles.percentage, { color: getAlertColor() }]}>
                            {' '}({percentage.toFixed(0)}%)
                        </Text>
                    </Text>
                    <Text style={[styles.message, { color: getAlertColor() }]}>
                        {getAlertMessage()}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#ffffff',
        marginHorizontal: 16,
        marginBottom: 8,
        borderRadius: 12,
        borderLeftWidth: 4,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    content: {
        padding: 12,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    icon: {
        fontSize: 20,
        marginRight: 8,
    },
    titleContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    categoryIcon: {
        fontSize: 16,
        marginRight: 6,
    },
    category: {
        fontSize: 15,
        fontWeight: '600',
        color: '#212121',
    },
    dismissButton: {
        padding: 4,
    },
    dismissText: {
        fontSize: 24,
        color: '#757575',
        lineHeight: 24,
    },
    details: {
        marginLeft: 28,
    },
    amount: {
        fontSize: 14,
        color: '#212121',
        marginBottom: 4,
    },
    percentage: {
        fontWeight: '600',
    },
    message: {
        fontSize: 12,
        fontWeight: '500',
    },
});
