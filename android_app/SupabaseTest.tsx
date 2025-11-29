import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { supabase } from './src/config/supabase';

/**
 * Simple Test Component to verify Supabase connection
 * This tests authentication and database operations
 */
export default function SupabaseTest() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [testResults, setTestResults] = useState<string[]>([]);

    const addResult = (result: string) => {
        setTestResults(prev => [...prev, `✅ ${result}`]);
    };

    const addError = (error: string) => {
        setTestResults(prev => [...prev, `❌ ${error}`]);
    };

    // Test 1: Sign Up
    const testSignUp = async () => {
        if (!email || !password || !fullName) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        try {
            setLoading(true);
            setTestResults([]);

            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                },
            });

            if (error) throw error;

            addResult(`User created: ${data.user?.email}`);
            addResult(`User ID: ${data.user?.id}`);

            // Auto sign-in after signup to create active session
            if (data.session) {
                addResult(`Session created automatically`);
                setUser(data.user);
                Alert.alert('Success', 'Account created and logged in! You can now test family features.');
            } else {
                addResult(`⚠️ Email confirmation required`);
                Alert.alert('Note', 'Please disable email confirmation in Supabase settings, then click "Sign In"');
            }
        } catch (error: any) {
            addError(error.message);
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    // Test 2: Sign In
    const testSignIn = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter email and password');
            return;
        }

        try {
            setLoading(true);
            setTestResults([]);

            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            addResult(`Logged in: ${data.user?.email}`);
            addResult(`Session token: ${data.session?.access_token?.substring(0, 20)}...`);
            setUser(data.user);
            Alert.alert('Success', 'Logged in successfully!');
        } catch (error: any) {
            addError(error.message);
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    // Test 3: Create Family
    const testCreateFamily = async () => {
        try {
            setLoading(true);
            setTestResults([]);

            const { data, error } = await supabase.rpc('create_family', {
                family_name: 'Test Family',
            });

            if (error) throw error;

            addResult(`Family created with ID: ${data}`);
            Alert.alert('Success', `Family created! ID: ${data}`);
        } catch (error: any) {
            addError(error.message);
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    // Test 4: Generate Invite
    const testGenerateInvite = async () => {
        try {
            setLoading(true);
            setTestResults([]);

            // First get user's families
            const { data: families, error: familiesError } = await supabase.rpc('get_user_families');

            if (familiesError) throw familiesError;

            if (!families || families.length === 0) {
                throw new Error('No families found. Create a family first.');
            }

            const familyId = families[0].family_id;
            addResult(`Using family: ${families[0].family_name}`);

            // Generate invite
            const { data: inviteCode, error } = await supabase.rpc('generate_invite', {
                p_family_id: familyId,
                expires_in_days: 7,
            });

            if (error) throw error;

            addResult(`Invite code generated: ${inviteCode}`);
            Alert.alert('Success', `Invite code: ${inviteCode}`, [
                { text: 'Copy', onPress: () => console.log('Code:', inviteCode) },
                { text: 'OK' },
            ]);
        } catch (error: any) {
            addError(error.message);
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    // Test 5: Add Personal Expense
    const testAddExpense = async () => {
        if (!user) {
            Alert.alert('Error', 'Please sign in first');
            return;
        }

        try {
            setLoading(true);
            setTestResults([]);

            const { data, error } = await supabase
                .from('personal_expenses')
                .insert({
                    user_id: user.id,
                    category: 'food',
                    amount: 500,
                    merchant: 'Test Restaurant',
                    date: new Date().toISOString().split('T')[0],
                })
                .select()
                .single();

            if (error) throw error;

            addResult(`Expense added: ₹${data.amount}`);
            addResult(`Category: ${data.category}`);
            addResult(`Merchant: ${data.merchant}`);
            Alert.alert('Success', 'Expense added to database!');
        } catch (error: any) {
            addError(error.message);
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    // Test 6: Get Personal Expenses
    const testGetExpenses = async () => {
        if (!user) {
            Alert.alert('Error', 'Please sign in first');
            return;
        }

        try {
            setLoading(true);
            setTestResults([]);

            const { data, error } = await supabase
                .from('personal_expenses')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            addResult(`Found ${data.length} expenses`);
            data.forEach((expense, index) => {
                addResult(`${index + 1}. ₹${expense.amount} - ${expense.category} - ${expense.merchant || 'N/A'}`);
            });
            Alert.alert('Success', `Found ${data.length} expenses`);
        } catch (error: any) {
            addError(error.message);
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    // Sign Out
    const handleSignOut = async () => {
        try {
            await supabase.auth.signOut();
            setUser(null);
            setTestResults([]);
            Alert.alert('Success', 'Signed out');
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>🧪 Supabase Test</Text>
                <Text style={styles.subtitle}>Test authentication and database</Text>
            </View>

            {!user ? (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Authentication Test</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Full Name"
                        value={fullName}
                        onChangeText={setFullName}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Password (min 6 chars)"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={[styles.button, styles.buttonPrimary]}
                            onPress={testSignUp}
                            disabled={loading}>
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Sign Up</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.buttonSecondary]}
                            onPress={testSignIn}
                            disabled={loading}>
                            {loading ? (
                                <ActivityIndicator color="#2563eb" />
                            ) : (
                                <Text style={styles.buttonTextSecondary}>Sign In</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Logged in as: {user.email}</Text>

                    <TouchableOpacity
                        style={[styles.button, styles.buttonPrimary]}
                        onPress={testCreateFamily}
                        disabled={loading}>
                        <Text style={styles.buttonText}>1. Create Family</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.buttonPrimary]}
                        onPress={testGenerateInvite}
                        disabled={loading}>
                        <Text style={styles.buttonText}>2. Generate Invite</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.buttonPrimary]}
                        onPress={testAddExpense}
                        disabled={loading}>
                        <Text style={styles.buttonText}>3. Add Expense</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.buttonPrimary]}
                        onPress={testGetExpenses}
                        disabled={loading}>
                        <Text style={styles.buttonText}>4. Get Expenses</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.buttonDanger]}
                        onPress={handleSignOut}>
                        <Text style={styles.buttonText}>Sign Out</Text>
                    </TouchableOpacity>
                </View>
            )}

            {testResults.length > 0 && (
                <View style={styles.resultsSection}>
                    <Text style={styles.resultsTitle}>Test Results:</Text>
                    {testResults.map((result, index) => (
                        <Text key={index} style={styles.resultText}>
                            {result}
                        </Text>
                    ))}
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#2563eb',
        padding: 20,
        paddingTop: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#e0e0e0',
    },
    section: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 16,
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        padding: 16,
        fontSize: 16,
        marginBottom: 12,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
    },
    button: {
        flex: 1,
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        marginBottom: 12,
    },
    buttonPrimary: {
        backgroundColor: '#2563eb',
    },
    buttonSecondary: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#2563eb',
    },
    buttonDanger: {
        backgroundColor: '#dc2626',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    buttonTextSecondary: {
        color: '#2563eb',
        fontSize: 16,
        fontWeight: '600',
    },
    resultsSection: {
        backgroundColor: '#fff',
        margin: 20,
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#d1d5db',
    },
    resultsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 12,
    },
    resultText: {
        fontSize: 14,
        color: '#4b5563',
        marginBottom: 4,
        fontFamily: 'monospace',
    },
});
