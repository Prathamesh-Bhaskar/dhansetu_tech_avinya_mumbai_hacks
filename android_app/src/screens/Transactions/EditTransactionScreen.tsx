import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { TRANSACTION_CATEGORIES } from '../../../utils/categories';
import * as TransactionAPI from '../../services/TransactionAPI';
import { GoalSelector } from '../../components/transactions/GoalSelector';

interface Props {
    route: {
        params: {
            transaction: any;
        };
    };
    navigation: any;
}

export const EditTransactionScreen: React.FC<Props> = ({ route, navigation }) => {
    const { transaction } = route.params;

    const [amount, setAmount] = useState(transaction.amount.toString());
    const [category, setCategory] = useState(transaction.category);
    const [description, setDescription] = useState(transaction.description || '');
    const [date, setDate] = useState(transaction.date.split('T')[0]);
    const [saving, setSaving] = useState(false);
    const [allocatedGoalId, setAllocatedGoalId] = useState<string | null>(transaction.allocated_goal_id || null);
    const [allocatedGoalType, setAllocatedGoalType] = useState<'personal' | 'family' | null>(transaction.allocated_goal_type || null);

    const handleSave = async () => {
        // Validation
        if (!amount || parseFloat(amount) <= 0) {
            Alert.alert('Error', 'Please enter a valid amount');
            return;
        }

        if (!category) {
            Alert.alert('Error', 'Please select a category');
            return;
        }

        try {
            setSaving(true);
            await TransactionAPI.updateTransaction(transaction.id, {
                amount: parseFloat(amount),
                category,
                description,
                date,
                allocated_goal_id: allocatedGoalId,
                allocated_goal_type: allocatedGoalType,
            });

            Alert.alert('Success', 'Transaction updated successfully');
            navigation.goBack();
        } catch (error) {
            console.error('Error updating transaction:', error);
            Alert.alert('Error', 'Failed to update transaction');
        } finally {
            setSaving(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.form}>
                {/* Amount */}
                <View style={styles.field}>
                    <Text style={styles.label}>Amount *</Text>
                    <View style={styles.inputContainer}>
                        <Text style={styles.currencySymbol}>₹</Text>
                        <TextInput
                            style={styles.input}
                            value={amount}
                            onChangeText={setAmount}
                            keyboardType="numeric"
                            placeholder="0"
                        />
                    </View>
                </View>

                {/* Category */}
                <View style={styles.field}>
                    <Text style={styles.label}>Category *</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {TRANSACTION_CATEGORIES.map((cat) => (
                            <TouchableOpacity
                                key={cat.id}
                                style={[
                                    styles.categoryChip,
                                    category === cat.id && styles.categoryChipSelected,
                                ]}
                                onPress={() => setCategory(cat.id)}
                            >
                                <Text style={styles.categoryIcon}>{cat.icon}</Text>
                                <Text
                                    style={[
                                        styles.categoryText,
                                        category === cat.id && styles.categoryTextSelected,
                                    ]}
                                >
                                    {cat.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Goal Selector - Only show when Goal category is selected */}
                {category === 'goal' && (
                    <GoalSelector
                        selectedGoalId={allocatedGoalId}
                        selectedGoalType={allocatedGoalType}
                        onSelect={(goalId, goalType) => {
                            setAllocatedGoalId(goalId);
                            setAllocatedGoalType(goalType);
                        }}
                    />
                )}

                {/* Description */}
                <View style={styles.field}>
                    <Text style={styles.label}>Description</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Enter description"
                        multiline
                        numberOfLines={3}
                    />
                </View>

                {/* Date */}
                <View style={styles.field}>
                    <Text style={styles.label}>Date *</Text>
                    <TextInput
                        style={styles.input}
                        value={date}
                        onChangeText={setDate}
                        placeholder="YYYY-MM-DD"
                    />
                </View>

                {/* Save Button */}
                <TouchableOpacity
                    style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator color="#ffffff" />
                    ) : (
                        <Text style={styles.saveButtonText}>Save Changes</Text>
                    )}
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
    form: {
        padding: 16,
    },
    field: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#212121',
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        paddingHorizontal: 16,
    },
    currencySymbol: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#757575',
        marginRight: 8,
    },
    input: {
        flex: 1,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        padding: 16,
        fontSize: 16,
        color: '#212121',
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 8,
    },
    categoryChipSelected: {
        backgroundColor: '#6200ee',
        borderColor: '#6200ee',
    },
    categoryIcon: {
        fontSize: 20,
        marginRight: 6,
    },
    categoryText: {
        fontSize: 14,
        color: '#212121',
    },
    categoryTextSelected: {
        color: '#ffffff',
    },
    saveButton: {
        backgroundColor: '#4caf50',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 16,
    },
    saveButtonDisabled: {
        opacity: 0.6,
    },
    saveButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
});
