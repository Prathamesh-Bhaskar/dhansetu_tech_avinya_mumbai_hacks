import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator
} from 'react-native';
import { TRANSACTION_CATEGORIES } from '../../../utils/categories';
import * as SupabaseAPI from '../../services/SupabaseAPI';
import type { Budget } from '../../services/SupabaseAPI';

interface Props {
    navigation: any;
    route?: {
        params?: {
            budgetId?: string;
            category?: string;
            amount?: number;
            month?: number;
            year?: number;
        };
    };
}

export const ManageBudgetScreen: React.FC<Props> = ({ navigation, route }) => {
    const params = route?.params;
    const isEditing = !!params?.budgetId;

    const now = new Date();
    const [selectedCategory, setSelectedCategory] = useState(params?.category || '');
    const [amount, setAmount] = useState(params?.amount?.toString() || '');
    const [month] = useState(params?.month || now.getMonth() + 1);
    const [year] = useState(params?.year || now.getFullYear());
    const [saving, setSaving] = useState(false);
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);

    const handleSave = async () => {
        // Validation
        if (!selectedCategory) {
            Alert.alert('Error', 'Please select a category');
            return;
        }

        const budgetAmount = parseFloat(amount);
        if (!budgetAmount || budgetAmount <= 0) {
            Alert.alert('Error', 'Please enter a valid amount');
            return;
        }

        try {
            setSaving(true);

            if (isEditing && params?.budgetId) {
                // Update existing budget
                await SupabaseAPI.updateBudget(params.budgetId, budgetAmount);
                Alert.alert('Success', 'Budget updated successfully!');
            } else {
                // Create new budget
                await SupabaseAPI.createBudget({
                    category: selectedCategory,
                    amount: budgetAmount,
                    month,
                    year,
                });
                Alert.alert('Success', 'Budget created successfully!');
            }

            navigation.goBack();
        } catch (error: any) {
            console.error('Error saving budget:', error);
            if (error.message?.includes('duplicate')) {
                Alert.alert('Error', 'A budget already exists for this category this month');
            } else {
                Alert.alert('Error', 'Failed to save budget. Please try again.');
            }
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!params?.budgetId) return;

        Alert.alert(
            'Delete Budget',
            'Are you sure you want to delete this budget?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setSaving(true);
                            await SupabaseAPI.deleteBudget(params.budgetId!);
                            Alert.alert('Success', 'Budget deleted successfully!');
                            navigation.goBack();
                        } catch (error) {
                            console.error('Error deleting budget:', error);
                            Alert.alert('Error', 'Failed to delete budget');
                        } finally {
                            setSaving(false);
                        }
                    },
                },
            ]
        );
    };

    const getCategoryIcon = (categoryId: string) => {
        const category = TRANSACTION_CATEGORIES.find(c => c.id === categoryId);
        return category?.icon || '📝';
    };

    const getCategoryName = (categoryId: string) => {
        const category = TRANSACTION_CATEGORIES.find(c => c.id === categoryId);
        return category?.name || categoryId;
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    {isEditing ? 'Edit Budget' : 'Add Budget'}
                </Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.content}>
                {/* Month/Year Display */}
                <View style={styles.periodCard}>
                    <Text style={styles.periodLabel}>Budget Period</Text>
                    <Text style={styles.periodValue}>
                        {new Date(year, month - 1).toLocaleDateString('en-US', {
                            month: 'long',
                            year: 'numeric'
                        })}
                    </Text>
                </View>

                {/* Category Selector */}
                <View style={styles.section}>
                    <Text style={styles.label}>Category</Text>
                    <TouchableOpacity
                        style={styles.categoryButton}
                        onPress={() => !isEditing && setShowCategoryPicker(!showCategoryPicker)}
                        disabled={isEditing}
                    >
                        <View style={styles.categoryButtonContent}>
                            {selectedCategory ? (
                                <>
                                    <Text style={styles.categoryIcon}>
                                        {getCategoryIcon(selectedCategory)}
                                    </Text>
                                    <Text style={styles.categoryText}>
                                        {getCategoryName(selectedCategory)}
                                    </Text>
                                </>
                            ) : (
                                <Text style={styles.placeholderText}>Select a category</Text>
                            )}
                        </View>
                        {!isEditing && <Text style={styles.chevron}>▼</Text>}
                    </TouchableOpacity>

                    {showCategoryPicker && !isEditing && (
                        <View style={styles.categoryPicker}>
                            {TRANSACTION_CATEGORIES.map((category) => (
                                <TouchableOpacity
                                    key={category.id}
                                    style={[
                                        styles.categoryOption,
                                        selectedCategory === category.id && styles.categoryOptionSelected
                                    ]}
                                    onPress={() => {
                                        setSelectedCategory(category.id);
                                        setShowCategoryPicker(false);
                                    }}
                                >
                                    <Text style={styles.categoryIcon}>{category.icon}</Text>
                                    <Text style={styles.categoryOptionText}>{category.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>

                {/* Amount Input */}
                <View style={styles.section}>
                    <Text style={styles.label}>Budget Amount</Text>
                    <View style={styles.amountInputContainer}>
                        <Text style={styles.currencySymbol}>₹</Text>
                        <TextInput
                            style={styles.amountInput}
                            value={amount}
                            onChangeText={setAmount}
                            keyboardType="numeric"
                            placeholder="0"
                            placeholderTextColor="#9e9e9e"
                        />
                    </View>
                    <Text style={styles.hint}>
                        Set a monthly spending limit for this category
                    </Text>
                </View>

                {/* Action Buttons */}
                <TouchableOpacity
                    style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator color="#ffffff" />
                    ) : (
                        <Text style={styles.saveButtonText}>
                            {isEditing ? 'Update Budget' : 'Create Budget'}
                        </Text>
                    )}
                </TouchableOpacity>

                {isEditing && (
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={handleDelete}
                        disabled={saving}
                    >
                        <Text style={styles.deleteButtonText}>Delete Budget</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#6200ee',
    },
    backButton: {
        padding: 8,
    },
    backButtonText: {
        color: '#ffffff',
        fontSize: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    placeholder: {
        width: 60,
    },
    content: {
        flex: 1,
    },
    periodCard: {
        backgroundColor: '#ffffff',
        margin: 16,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    periodLabel: {
        fontSize: 12,
        color: '#757575',
        marginBottom: 4,
    },
    periodValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#212121',
    },
    section: {
        marginHorizontal: 16,
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#212121',
        marginBottom: 8,
    },
    categoryButton: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    categoryButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    categoryIcon: {
        fontSize: 24,
        marginRight: 12,
    },
    categoryText: {
        fontSize: 16,
        color: '#212121',
    },
    placeholderText: {
        fontSize: 16,
        color: '#9e9e9e',
    },
    chevron: {
        fontSize: 12,
        color: '#757575',
    },
    categoryPicker: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        marginTop: 8,
        maxHeight: 300,
    },
    categoryOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    categoryOptionSelected: {
        backgroundColor: '#f3e5f5',
    },
    categoryOptionText: {
        fontSize: 16,
        color: '#212121',
    },
    amountInputContainer: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    currencySymbol: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#212121',
        marginRight: 8,
    },
    amountInput: {
        flex: 1,
        fontSize: 24,
        fontWeight: 'bold',
        color: '#212121',
    },
    hint: {
        fontSize: 12,
        color: '#757575',
        marginTop: 8,
    },
    saveButton: {
        backgroundColor: '#6200ee',
        margin: 16,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    saveButtonDisabled: {
        opacity: 0.6,
    },
    saveButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    deleteButton: {
        backgroundColor: '#ffffff',
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#f44336',
    },
    deleteButtonText: {
        color: '#f44336',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
