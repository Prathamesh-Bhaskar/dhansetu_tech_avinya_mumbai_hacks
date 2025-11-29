import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Switch,
} from 'react-native';
import type { ParsedSMS } from '../utils/smsParser';
import { GoalSelector } from '../src/components/transactions/GoalSelector';

interface CategoryPickerProps {
    visible: boolean;
    transaction: ParsedSMS | null;
    onConfirm: (category: string, shareToFamily: boolean, goalId?: string | null, goalType?: 'personal' | 'family' | null) => void;
    onCancel: () => void;
    hasFamily: boolean; // Whether user is part of a family
}

const CATEGORIES = [
    { value: 'food', label: 'Food & Dining', icon: '🍔' },
    { value: 'shopping', label: 'Shopping', icon: '🛍️' },
    { value: 'transport', label: 'Transport', icon: '🚗' },
    { value: 'bills', label: 'Bills & Utilities', icon: '💡' },
    { value: 'entertainment', label: 'Entertainment', icon: '🎬' },
    { value: 'health', label: 'Healthcare', icon: '🏥' },
    { value: 'education', label: 'Education', icon: '📚' },
    { value: 'investment', label: 'Investment', icon: '📈' },
    { value: 'goal', label: 'Goal', icon: '🎯' },
    { value: 'other', label: 'Other', icon: '📌' },
];

export const CategoryPicker: React.FC<CategoryPickerProps> = ({
    visible,
    transaction,
    onConfirm,
    onCancel,
    hasFamily,
}) => {
    const suggestedCategory = transaction?.parsed.category || 'other';
    const [selectedCategory, setSelectedCategory] = useState(suggestedCategory);
    const [shareToFamily, setShareToFamily] = useState(false);
    const [allocatedGoalId, setAllocatedGoalId] = useState<string | null>(null);
    const [allocatedGoalType, setAllocatedGoalType] = useState<'personal' | 'family' | null>(null);

    // Update selected category when transaction changes
    React.useEffect(() => {
        if (transaction) {
            setSelectedCategory(transaction.parsed.category || 'other');
            setShareToFamily(false); // Reset share toggle for new transaction
            setAllocatedGoalId(null); // Reset goal selection
            setAllocatedGoalType(null);
        }
    }, [transaction]);

    if (!transaction) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onCancel}>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Select Category</Text>
                        <Text style={styles.subtitle}>
                            ₹{transaction.parsed.transaction.amount.toFixed(2)} •{' '}
                            {transaction.parsed.transaction.merchant || 'Unknown'}
                        </Text>
                    </View>

                    {/* AI Suggestion */}
                    <View style={styles.suggestionBox}>
                        <Text style={styles.suggestionLabel}>🤖 AI Suggested:</Text>
                        <Text style={styles.suggestionText}>
                            {CATEGORIES.find(c => c.value === suggestedCategory)?.label ||
                                'Other'}
                        </Text>
                    </View>

                    {/* Category List */}
                    <ScrollView style={styles.categoryList}>
                        {CATEGORIES.map(category => (
                            <TouchableOpacity
                                key={category.value}
                                style={[
                                    styles.categoryItem,
                                    selectedCategory === category.value &&
                                    styles.categoryItemSelected,
                                ]}
                                onPress={() => setSelectedCategory(category.value)}>
                                <Text style={styles.categoryIcon}>{category.icon}</Text>
                                <Text
                                    style={[
                                        styles.categoryLabel,
                                        selectedCategory === category.value &&
                                        styles.categoryLabelSelected,
                                    ]}>
                                    {category.label}
                                </Text>
                                {selectedCategory === category.value && (
                                    <Text style={styles.checkmark}>✓</Text>
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Goal Selector - Only show when Goal category is selected */}
                    {selectedCategory === 'goal' && (
                        <View style={styles.goalSelectorContainer}>
                            <GoalSelector
                                selectedGoalId={allocatedGoalId}
                                selectedGoalType={allocatedGoalType}
                                onSelect={(goalId, goalType) => {
                                    setAllocatedGoalId(goalId);
                                    setAllocatedGoalType(goalType);
                                }}
                            />
                        </View>
                    )}

                    {/* Share to Family Toggle */}
                    {hasFamily && (
                        <View style={styles.shareSection}>
                            <View style={styles.shareContent}>
                                <View>
                                    <Text style={styles.shareTitle}>👥 Share with Family</Text>
                                    <Text style={styles.shareSubtitle}>
                                        Family members will see this transaction
                                    </Text>
                                </View>
                                <Switch
                                    value={shareToFamily}
                                    onValueChange={setShareToFamily}
                                    trackColor={{ false: '#e0e0e0', true: '#b39ddb' }}
                                    thumbColor={shareToFamily ? '#6200ee' : '#f4f3f4'}
                                />
                            </View>
                        </View>
                    )}

                    {/* Action Buttons */}
                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.confirmButton}
                            onPress={() => onConfirm(selectedCategory, shareToFamily, allocatedGoalId, allocatedGoalType)}>
                            <Text style={styles.confirmButtonText}>Save to Cloud ☁️</Text>
                        </TouchableOpacity>
                    </View>          </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 20,
        maxHeight: '80%',
    },
    header: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#212121',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#757575',
    },
    suggestionBox: {
        backgroundColor: '#f3e5f5',
        padding: 12,
        marginHorizontal: 20,
        marginTop: 16,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    suggestionLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6200ee',
        marginRight: 8,
    },
    suggestionText: {
        fontSize: 14,
        color: '#6200ee',
        fontWeight: '500',
    },
    categoryList: {
        marginTop: 16,
        paddingHorizontal: 20,
    },
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        backgroundColor: '#f5f5f5',
    },
    categoryItemSelected: {
        backgroundColor: '#e8def8',
        borderWidth: 2,
        borderColor: '#6200ee',
    },
    categoryIcon: {
        fontSize: 24,
        marginRight: 12,
    },
    categoryLabel: {
        flex: 1,
        fontSize: 16,
        color: '#424242',
        fontWeight: '500',
    },
    categoryLabelSelected: {
        color: '#6200ee',
        fontWeight: '600',
    },
    checkmark: {
        fontSize: 20,
        color: '#6200ee',
        fontWeight: 'bold',
    },
    shareSection: {
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        paddingHorizontal: 20,
        paddingVertical: 16,
        marginTop: 8,
    },
    shareContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    shareTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#212121',
        marginBottom: 4,
    },
    shareSubtitle: {
        fontSize: 13,
        color: '#757575',
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 20,
        marginTop: 20,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#757575',
    },
    confirmButton: {
        flex: 2,
        backgroundColor: '#6200ee',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    confirmButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
    },
    goalSelectorContainer: {
        paddingHorizontal: 20,
        marginTop: 8,
    },
});
