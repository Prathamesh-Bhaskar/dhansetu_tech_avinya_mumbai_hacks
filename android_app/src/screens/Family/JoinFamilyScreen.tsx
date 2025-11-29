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

export const JoinFamilyScreen = ({ navigation }: any) => {
    const { joinFamily, loading } = useFamily();
    const [inviteCode, setInviteCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleJoin = async () => {
        if (!inviteCode.trim()) {
            Alert.alert('Error', 'Please enter an invite code');
            return;
        }

        try {
            setIsLoading(true);
            const familyId = await joinFamily(inviteCode.trim().toUpperCase());
            Alert.alert(
                'Success!',
                'You have joined the family!',
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
                <Text style={styles.title}>Join Family</Text>
                <Text style={styles.subtitle}>
                    Enter the invite code shared by your family
                </Text>

                <TextInput
                    style={styles.input}
                    placeholder="Enter 8-character invite code"
                    value={inviteCode}
                    onChangeText={(text) => setInviteCode(text.toUpperCase())}
                    autoCapitalize="characters"
                    maxLength={8}
                    editable={!isLoading}
                />

                <TouchableOpacity
                    style={[styles.button, isLoading && styles.buttonDisabled]}
                    onPress={handleJoin}
                    disabled={isLoading || loading}>
                    {isLoading || loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Join Family</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.linkButton}
                    onPress={() => navigation.navigate('CreateFamily')}
                    disabled={isLoading}>
                    <Text style={styles.linkText}>
                        Don't have a code?{' '}
                        <Text style={styles.linkTextBold}>Create Family</Text>
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
        fontSize: 20,
        fontWeight: '600',
        textAlign: 'center',
        letterSpacing: 4,
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
