import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useFamily } from '../../contexts/FamilyContext';

export const CreateFamilyScreen = ({ navigation }: any) => {
    const { createFamily, loading } = useFamily();
    const [familyName, setFamilyName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleCreate = async () => {
        if (!familyName.trim()) {
            Alert.alert('Error', 'Please enter a family name');
            return;
        }

        try {
            setIsLoading(true);
            const familyId = await createFamily(familyName.trim());
            Alert.alert(
                'Success!',
                `Family "${familyName}" created successfully!`,
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.navigate('FamilyDashboard'),
                    },
                ]
            );
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Create Family</Text>
                <Text style={styles.subtitle}>
                    Start tracking finances together with your family
                </Text>

                <TextInput
                    style={styles.input}
                    placeholder="Enter family name (e.g., Khilari Family)"
                    value={familyName}
                    onChangeText={setFamilyName}
                    editable={!isLoading}
                />

                <TouchableOpacity
                    style={[styles.button, isLoading && styles.buttonDisabled]}
                    onPress={handleCreate}
                    disabled={isLoading || loading}>
                    {isLoading || loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Create Family</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.linkButton}
                    onPress={() => navigation.navigate('JoinFamily')}
                    disabled={isLoading}>
                    <Text style={styles.linkText}>
                        Already have an invite code?{' '}
                        <Text style={styles.linkTextBold}>Join Family</Text>
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2563eb',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 40,
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        padding: 16,
        fontSize: 16,
        marginBottom: 16,
    },
    button: {
        backgroundColor: '#2563eb',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonDisabled: {
        backgroundColor: '#93c5fd',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    linkButton: {
        marginTop: 16,
        alignItems: 'center',
    },
    linkText: {
        color: '#6b7280',
        fontSize: 14,
    },
    linkTextBold: {
        color: '#2563eb',
        fontWeight: '600',
    },
});
