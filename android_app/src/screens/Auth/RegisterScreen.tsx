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
    ScrollView,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

export const RegisterScreen = ({ navigation }: any) => {
    const { signUp } = useAuth();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async () => {
        if (!fullName || !email || !password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }

        try {
            setIsLoading(true);
            await signUp(email, password, fullName);
            Alert.alert(
                'Success',
                'Account created! Please check your email to verify your account.',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.navigate('Login'),
                    },
                ]
            );
        } catch (error: any) {
            Alert.alert('Registration Failed', error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.content}>
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Join DhanSetu Family Finance</Text>

                    <View style={styles.form}>
                        <TextInput
                            style={styles.input}
                            placeholder="Full Name"
                            value={fullName}
                            onChangeText={setFullName}
                            editable={!isLoading}
                        />

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
                            placeholder="Password (min 6 characters)"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            editable={!isLoading}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                            editable={!isLoading}
                        />

                        <TouchableOpacity
                            style={[styles.button, isLoading && styles.buttonDisabled]}
                            onPress={handleRegister}
                            disabled={isLoading}>
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Sign Up</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.linkButton}
                            onPress={() => navigation.navigate('Login')}
                            disabled={isLoading}>
                            <Text style={styles.linkText}>
                                Already have an account? <Text style={styles.linkTextBold}>Login</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollContent: {
        flexGrow: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 32,
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
