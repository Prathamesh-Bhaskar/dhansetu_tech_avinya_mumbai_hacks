import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { getCategoryIcon, getCategoryName } from '../../../utils/categories';
import * as TransactionAPI from '../../services/TransactionAPI';

interface Props {
    route: {
        params: {
            transaction: any;
        };
    };
    navigation: any;
}

export const TransactionDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
    const { transaction } = route.params;

    const formatCurrency = (amount: number) => {
        return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleEdit = () => {
        console.log('Edit button clicked, transaction:', transaction);
        try {
            navigation.navigate('EditTransaction', { transaction });
        } catch (error) {
            console.error('Navigation error:', error);
            Alert.alert('Error', 'Failed to open edit screen');
        }
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Transaction',
            'Are you sure you want to delete this transaction? This action cannot be undone.',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await TransactionAPI.deleteTransaction(transaction.id);
                            Alert.alert('Success', 'Transaction deleted successfully');
                            navigation.goBack();
                        } catch (error) {
                            console.error('Error deleting transaction:', error);
                            Alert.alert('Error', 'Failed to delete transaction');
                        }
                    },
                },
            ]
        );
    };

    return (
        <ScrollView style={styles.container}>
            {/* Category Icon */}
            <View style={styles.iconContainer}>
                <Text style={styles.categoryIcon}>{getCategoryIcon(transaction.category)}</Text>
                <Text style={styles.categoryName}>{getCategoryName(transaction.category)}</Text>
            </View>

            {/* Amount */}
            <View style={styles.amountContainer}>
                <Text style={styles.amount}>{formatCurrency(transaction.amount)}</Text>
                <Text style={styles.type}>Expense</Text>
            </View>

            {/* Details Card */}
            <View style={styles.detailsCard}>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Description</Text>
                    <Text style={styles.detailValue}>
                        {transaction.description || 'No description'}
                    </Text>
                </View>

                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Date</Text>
                    <Text style={styles.detailValue}>{formatDate(transaction.date)}</Text>
                </View>

                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Time</Text>
                    <Text style={styles.detailValue}>{formatTime(transaction.date)}</Text>
                </View>

                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Source</Text>
                    <View style={styles.sourceTag}>
                        <Text style={styles.sourceText}>
                            {transaction.source === 'manual' ? '✍️ Manual' : '📱 SMS'}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actions}>
                <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                    <Text style={styles.editButtonText}>✏️ Edit Transaction</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                    <Text style={styles.deleteButtonText}>🗑️ Delete Transaction</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    iconContainer: {
        alignItems: 'center',
        paddingVertical: 32,
        backgroundColor: '#ffffff',
    },
    categoryIcon: {
        fontSize: 64,
        marginBottom: 12,
    },
    categoryName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#212121',
    },
    amountContainer: {
        alignItems: 'center',
        paddingVertical: 24,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    amount: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#212121',
        marginBottom: 4,
    },
    type: {
        fontSize: 14,
        color: '#757575',
    },
    detailsCard: {
        backgroundColor: '#ffffff',
        margin: 16,
        borderRadius: 12,
        padding: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    detailRow: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    detailLabel: {
        fontSize: 12,
        color: '#757575',
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    detailValue: {
        fontSize: 16,
        color: '#212121',
    },
    sourceTag: {
        alignSelf: 'flex-start',
        backgroundColor: '#e3f2fd',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    sourceText: {
        fontSize: 14,
        color: '#1976d2',
        fontWeight: '500',
    },
    actions: {
        padding: 16,
    },
    editButton: {
        backgroundColor: '#6200ee',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 12,
    },
    editButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    deleteButton: {
        backgroundColor: '#ffffff',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#f44336',
    },
    deleteButtonText: {
        color: '#f44336',
        fontSize: 16,
        fontWeight: '600',
    },
});
