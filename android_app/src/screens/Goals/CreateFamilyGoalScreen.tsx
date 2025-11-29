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
import { useFamily } from '../../contexts/FamilyContext';
import * as GoalsAPI from '../../services/GoalsAPI';

interface Props {
    navigation: any;
}

export const CreateFamilyGoalScreen: React.FC<Props> = ({ navigation }) => {
    const familyContext = useFamily();
    const currentFamily = familyContext?.currentFamily || null;
    const [goalName, setGoalName] = useState('');
    const [description, setDescription] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [deadline, setDeadline] = useState('');
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!currentFamily) {
            Alert.alert('Error', 'Please create or join a family first');
            return;
        }

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
            await GoalsAPI.createFamilyGoal(currentFamily.id, {
                goal_name: goalName.trim(),
                description: description.trim() || undefined,
                target_amount: parseFloat(targetAmount),
                deadline: deadline || undefined,
            });

            Alert.alert('Success', 'Family goal created! All family members can now contribute.');
            navigation.goBack();
        } catch (error: any) {
            console.error('Error creating family goal:', error);
            Alert.alert('Error', error.message || 'Failed to create family goal');
        } finally {
            setSaving(false);
        }
    };

    if (!currentFamily) {
        return (
            <View style={styles.noFamilyContainer}>
                <Text style={styles.noFamilyIcon}>👨‍👩‍👧‍👦</Text>
                <Text style={styles.noFamilyTitle}>No Family Yet</Text>
                <Text style={styles.noFamilyText}>
                    You need to create or join a family before setting family goals.
                </Text>
                <TouchableOpacity
                    style={styles.noFamilyButton}
                    onPress={() => navigation.navigate('Family')}
                >
                    <Text style={styles.noFamilyButtonText}>Go to Family</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.familyInfo}>
                <Text style={styles.familyLabel}>Creating goal for:</Text>
                <Text style={styles.familyName}>{currentFamily.family_name}</Text>
            </View>

            <View style={styles.form}>
                {/* Goal Name */}
                <View style={styles.field}>
                    <Text style={styles.label}>Goal Name *</Text>
                    <TextInput
                        style={styles.input}
                        value={goalName}
                        onChangeText={setGoalName}
                        placeholder="e.g., Family Vacation"
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
                        placeholder="Add details about this family goal..."
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
                    <Text style={styles.hint}>Format: YYYY-MM-DD (e.g., 2026-03-15)</Text>
                </View>

                {/* Info Box */}
                <View style={styles.infoBox}>
                    <Text style={styles.infoIcon}>ℹ️</Text>
                    <Text style={styles.infoText}>
                        All family members will be able to see this goal and contribute towards it.
                    </Text>
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
                        <Text style={styles.saveButtonText}>Create Family Goal</Text>
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
    noFamilyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        backgroundColor: '#f5f5f5',
    },
    noFamilyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    noFamilyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#212121',
        marginBottom: 8,
    },
    noFamilyText: {
        fontSize: 14,
        color: '#757575',
        textAlign: 'center',
        marginBottom: 24,
    },
    noFamilyButton: {
        backgroundColor: '#6200ee',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 24,
    },
    noFamilyButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    familyInfo: {
        backgroundColor: '#e3f2fd',
        padding: 16,
        alignItems: 'center',
    },
    familyLabel: {
        fontSize: 12,
        color: '#1976d2',
        marginBottom: 4,
    },
    familyName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1976d2',
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
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#fff3e0',
        padding: 12,
        borderRadius: 8,
        marginBottom: 24,
    },
    infoIcon: {
        fontSize: 20,
        marginRight: 8,
    },
    infoText: {
        flex: 1,
        fontSize: 12,
        color: '#e65100',
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
