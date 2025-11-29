import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    Alert,
} from 'react-native';
import { useFamily } from '../src/contexts/FamilyContext';

interface FamilyModalProps {
    visible: boolean;
    onClose: () => void;
}

export const FamilyModal: React.FC<FamilyModalProps> = ({ visible, onClose }) => {
    const { currentFamily, createFamily, joinFamily, generateInvite, leaveFamily } = useFamily();
    const [familyName, setFamilyName] = useState('');
    const [inviteCode, setInviteCode] = useState('');
    const [generatedCode, setGeneratedCode] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCreateFamily = async () => {
        if (!familyName.trim()) {
            Alert.alert('Error', 'Please enter a family name');
            return;
        }
        setLoading(true);
        try {
            await createFamily(familyName.trim());
            Alert.alert('Success', `Family "${familyName}" created!`);
            setFamilyName('');
            onClose();
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to create family');
        } finally {
            setLoading(false);
        }
    };

    const handleJoinFamily = async () => {
        if (!inviteCode.trim()) {
            Alert.alert('Error', 'Please enter an invite code');
            return;
        }
        setLoading(true);
        try {
            await joinFamily(inviteCode.trim());
            Alert.alert('Success', 'Joined family successfully!');
            setInviteCode('');
            onClose();
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to join family');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateInvite = async () => {
        if (!currentFamily) return;
        setLoading(true);
        try {
            const code = await generateInvite(); // No parameters needed, uses currentFamily from context
            setGeneratedCode(code);
            Alert.alert('Family Invite Code', `Share this code: ${code}`);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to get invite code');
        } finally {
            setLoading(false);
        }
    };

    const handleLeaveFamily = async () => {
        if (!currentFamily) return;
        Alert.alert(
            'Leave Family',
            `Are you sure you want to leave "${currentFamily.family_name}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Leave',
                    style: 'destructive',
                    onPress: async () => {
                        setLoading(true);
                        try {
                            await leaveFamily(); // No parameters needed
                            Alert.alert('Success', 'Left family');
                            onClose();
                        } catch (error: any) {
                            Alert.alert('Error', error.message || 'Failed to leave family');
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Family</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={styles.closeButton}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {currentFamily ? (
                        // Already in a family
                        <View style={styles.content}>
                            <View style={styles.currentFamily}>
                                <Text style={styles.currentFamilyLabel}>Current Family</Text>
                                <Text style={styles.currentFamilyName}>👥 {currentFamily.family_name}</Text>
                            </View>

                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={handleGenerateInvite}
                                disabled={loading}>
                                <Text style={styles.actionButtonText}>
                                    📋 Show Invite Code
                                </Text>
                            </TouchableOpacity>

                            {generatedCode ? (
                                <View style={styles.codeBox}>
                                    <Text style={styles.codeLabel}>Share this code:</Text>
                                    <Text style={styles.code}>{generatedCode}</Text>
                                </View>
                            ) : null}

                            <TouchableOpacity
                                style={[styles.actionButton, styles.dangerButton]}
                                onPress={handleLeaveFamily}
                                disabled={loading}>
                                <Text style={[styles.actionButtonText, styles.dangerText]}>
                                    🚪 Leave Family
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        // Not in a family
                        <View style={styles.content}>
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Create New Family</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Family Name"
                                    value={familyName}
                                    onChangeText={setFamilyName}
                                />
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={handleCreateFamily}
                                    disabled={loading}>
                                    <Text style={styles.actionButtonText}>Create Family</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.divider} />

                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Join Existing Family</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Invite Code"
                                    value={inviteCode}
                                    onChangeText={setInviteCode}
                                />
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={handleJoinFamily}
                                    disabled={loading}>
                                    <Text style={styles.actionButtonText}>Join Family</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        width: '90%',
        maxWidth: 400,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#212121',
    },
    closeButton: {
        fontSize: 24,
        color: '#757575',
    },
    content: {
        padding: 20,
    },
    currentFamily: {
        backgroundColor: '#f3e5f5',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    currentFamilyLabel: {
        fontSize: 12,
        color: '#6200ee',
        fontWeight: '600',
        marginBottom: 4,
    },
    currentFamilyName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#212121',
    },
    section: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#212121',
        marginBottom: 12,
    },
    input: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
        marginBottom: 12,
    },
    actionButton: {
        backgroundColor: '#6200ee',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginBottom: 12,
    },
    actionButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    dangerButton: {
        backgroundColor: '#f5f5f5',
    },
    dangerText: {
        color: '#d32f2f',
    },
    codeBox: {
        backgroundColor: '#e8f5e9',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    codeLabel: {
        fontSize: 12,
        color: '#2e7d32',
        fontWeight: '600',
        marginBottom: 4,
    },
    code: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1b5e20',
        letterSpacing: 2,
    },
    divider: {
        height: 1,
        backgroundColor: '#e0e0e0',
        marginVertical: 16,
    },
});
