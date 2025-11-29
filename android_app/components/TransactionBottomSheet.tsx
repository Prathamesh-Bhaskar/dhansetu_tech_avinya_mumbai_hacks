import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Modal,
    StyleSheet,
    Animated,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { ParsedSMS } from '../utils/smsParser';
import CategoryPicker from './CategoryPicker';
import { getCategoryName } from '../utils/categories';

interface TransactionBottomSheetProps {
    visible: boolean;
    transaction: ParsedSMS | null;
    onClose: () => void;
    onSave: (updatedTransaction: ParsedSMS) => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const TransactionBottomSheet: React.FC<TransactionBottomSheetProps> = ({
    visible,
    transaction,
    onClose,
    onSave,
}) => {
    const [slideAnim] = useState(new Animated.Value(SCREEN_HEIGHT));
    const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (visible) {
            // Reset state when opening
            setSelectedCategory(transaction?.parsed.userCategory || transaction?.metadata.suggestedCategory);
            setNotes(transaction?.parsed.transaction.notes || '');

            // Slide up animation
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                tension: 65,
                friction: 11,
            }).start();
        } else {
            // Slide down animation
            Animated.timing(slideAnim, {
                toValue: SCREEN_HEIGHT,
                duration: 250,
                useNativeDriver: true,
            }).start();
        }
    }, [visible]);

    const handleSave = () => {
        if (!transaction) return;

        const updatedTransaction: ParsedSMS = {
            ...transaction,
            parsed: {
                ...transaction.parsed,
                userCategory: selectedCategory,
                transaction: {
                    ...transaction.parsed.transaction,
                    notes: notes.trim() || undefined,
                },
            },
            metadata: {
                ...transaction.metadata,
                requiresUserInput: false,
                needsReview: false,
            },
        };

        onSave(updatedTransaction);
        onClose();
    };

    const handleSkip = () => {
        if (!transaction) return;

        // Save with partial data
        onSave(transaction);
        onClose();
    };

    if (!transaction) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={onClose}>
            <View style={styles.overlay}>
                <TouchableOpacity
                    style={styles.backdrop}
                    activeOpacity={1}
                    onPress={onClose}
                />

                <Animated.View
                    style={[
                        styles.bottomSheet,
                        {
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.container}>
                        {/* Handle Bar */}
                        <View style={styles.handleBar} />

                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={styles.headerTitle}>Complete Transaction Details</Text>
                            <Text style={styles.headerSubtitle}>
                                Add missing information to categorize this transaction
                            </Text>
                        </View>

                        {/* Auto-filled Fields */}
                        <View style={styles.section}>
                            <View style={styles.fieldRow}>
                                <Text style={styles.fieldLabel}>Amount:</Text>
                                <Text style={styles.fieldValue}>
                                    ₹{transaction.parsed.transaction.amount.toFixed(2)} ✓
                                </Text>
                            </View>

                            <View style={styles.fieldRow}>
                                <Text style={styles.fieldLabel}>Type:</Text>
                                <Text style={styles.fieldValue}>
                                    {transaction.parsed.transaction.type.toUpperCase()} ✓
                                </Text>
                            </View>

                            <View style={styles.fieldRow}>
                                <Text style={styles.fieldLabel}>Bank:</Text>
                                <Text style={styles.fieldValue}>
                                    {transaction.parsed.provider} ✓
                                </Text>
                            </View>

                            {transaction.parsed.accountNumber && (
                                <View style={styles.fieldRow}>
                                    <Text style={styles.fieldLabel}>Account:</Text>
                                    <Text style={styles.fieldValue}>
                                        XX{transaction.parsed.accountNumber} ✓
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Category Picker */}
                        {transaction.metadata.missingFields.includes('category') && (
                            <View style={styles.section}>
                                <CategoryPicker
                                    selectedCategory={selectedCategory}
                                    suggestedCategory={transaction.metadata.suggestedCategory}
                                    onSelectCategory={setSelectedCategory}
                                />
                            </View>
                        )}

                        {/* Notes Input */}
                        <View style={styles.section}>
                            <Text style={styles.inputLabel}>Notes (Optional):</Text>
                            <TextInput
                                style={styles.notesInput}
                                value={notes}
                                onChangeText={setNotes}
                                placeholder="Add any additional notes..."
                                placeholderTextColor="#999"
                                multiline
                                numberOfLines={3}
                            />
                        </View>

                        {/* Action Buttons */}
                        <View style={styles.actions}>
                            <TouchableOpacity
                                style={styles.skipButton}
                                onPress={handleSkip}>
                                <Text style={styles.skipButtonText}>Skip for now</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.saveButton,
                                    !selectedCategory && styles.saveButtonDisabled,
                                ]}
                                onPress={handleSave}
                                disabled={!selectedCategory}>
                                <Text style={styles.saveButtonText}>✓ Save</Text>
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    bottomSheet: {
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: SCREEN_HEIGHT * 0.85,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 10,
    },
    container: {
        padding: 20,
    },
    handleBar: {
        width: 40,
        height: 4,
        backgroundColor: '#e0e0e0',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 16,
    },
    header: {
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#212121',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#757575',
    },
    section: {
        marginBottom: 20,
    },
    fieldRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    fieldLabel: {
        fontSize: 14,
        color: '#757575',
        fontWeight: '500',
    },
    fieldValue: {
        fontSize: 14,
        color: '#212121',
        fontWeight: '600',
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#424242',
        marginBottom: 8,
    },
    notesInput: {
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        color: '#212121',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        textAlignVertical: 'top',
        minHeight: 80,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    skipButton: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    skipButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#757575',
    },
    saveButton: {
        flex: 1,
        backgroundColor: '#6200ee',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    saveButtonDisabled: {
        backgroundColor: '#e0e0e0',
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
    },
});

export default TransactionBottomSheet;
