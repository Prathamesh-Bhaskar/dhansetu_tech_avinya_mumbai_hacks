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
import * as GoalsAPI from '../../services/GoalsAPI';

interface Props {
    navigation: any;
}

export const CreatePersonalGoalScreen: React.FC<Props> = ({ navigation }) => {
    const [goalName, setGoalName] = useState('');
    const [description, setDescription] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [deadline, setDeadline] = useState('');
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        // Validation
        if (!goalName.trim()) {
            Alert.alert('Error', 'Please enter a goal name');
            return;
        }

        if (!targetAmount || parseFloat(targetAmount) <= 0) {
            Alert.alert('Error', 'Please enter a valid target amount');
            return;
        }

        try {
            setSaving(true);
            await GoalsAPI.createPersonalGoal({
                goal_name: goalName.trim(),
                description: description.trim() || undefined,
                target_amount: parseFloat(targetAmount),
                deadline: deadline || undefined,
            });

            Alert.alert('Success', 'Goal created successfully!');
            navigation.goBack();
        } catch (error: any) {
            console.error('Error creating goal:', error);
            Alert.alert('Error', error.message || 'Failed to create goal');
        } finally {
            setSaving(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.form}>
                {/* Goal Name */}
                <View style={styles.field}>
                    <Text style={styles.label}>Goal Name *</Text>
                    <TextInput
                        style={styles.input}
                        value={goalName}
                        onChangeText={setGoalName}
                        placeholder="e.g., Buy a Laptop"
                        maxLength={100}
                    />
                </View>

                {/* Description */}
                <View style={styles.field}>
                    <Text style={styles.label}>Description (Optional)</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Add details about your goal..."
                        multiline
                        numberOfLines={3}
                        maxLength={500}
                    />
                </View>

                {/* Target Amount */}
                <View style={styles.field}>
                    <Text style={styles.label}>Target Amount *</Text>
                    <View style={styles.inputContainer}>
                        <Text style={styles.currencySymbol}>₹</Text>
                        <TextInput
                            style={styles.input}
                            value={targetAmount}
                            onChangeText={setTargetAmount}
                            keyboardType="numeric"
                            placeholder="0"
                        />
                    </View>
                </View>

                {/* Deadline */}
                <View style={styles.field}>
                    <Text style={styles.label}>Deadline (Optional)</Text>
                    <TextInput
                        style={styles.input}
                        value={deadline}
                        onChangeText={setDeadline}
                        placeholder="YYYY-MM-DD"
                    />
                    <Text style={styles.hint}>Format: YYYY-MM-DD (e.g., 2025-12-31)</Text>
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
                        <Text style={styles.saveButtonText}>Create Goal</Text>
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
    hint: {
        fontSize: 12,
        color: '#757575',
        marginTop: 4,
    },
    saveButton: {
        backgroundColor: '#6200ee',
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
