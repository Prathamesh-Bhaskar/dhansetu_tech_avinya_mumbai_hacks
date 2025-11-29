import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

export const LoginScreen = ({ navigation }: any) => {
    const { signIn, loading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter email and password');
            return;
        }

        try {
            setIsLoading(true);
            await signIn(email, password);
            // Navigation will be handled by auth state change
        } catch (error: any) {
            Alert.alert('Login Failed', error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={styles.content}>
                <Text style={styles.title}>DhanSetu</Text>
                <Text style={styles.subtitle}>Family Finance Tracker</Text>

                <View style={styles.form}>
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        editable={!isLoading}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        editable={!isLoading}
                    />

                    <TouchableOpacity
                        style={[styles.button, isLoading && styles.buttonDisabled]}
                        onPress={handleLogin}
                        disabled={isLoading}>
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Login</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.linkButton}
                        onPress={() => navigation.navigate('Register')}
                        disabled={isLoading}>
                        <Text style={styles.linkText}>
                            Don't have an account? <Text style={styles.linkTextBold}>Sign Up</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
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
        fontSize: 36,
        fontWeight: 'bold',
        color: '#2563eb',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 40,
    },
    form: {
        width: '100%',
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
