import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, View, ActivityIndicator } from 'react-native';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { FamilyProvider } from './src/contexts/FamilyContext';
import AppContent from './AppContent';
import { LoginScreen } from './src/screens/Auth/LoginScreen';
import { RegisterScreen } from './src/screens/Auth/RegisterScreen';
import { MainTabNavigator } from './src/navigation/MainTabNavigator';
// Onboarding disabled to prevent crashes
// import { OnboardingNavigator } from './src/navigation/OnboardingNavigator';
// import * as ProfileAPI from './src/services/ProfileAPI';

/**
 * Main App Navigator
 * Shows login/register when not authenticated
 * Shows main app when authenticated
 * 
 * NOTE: Onboarding disabled to prevent crashes
 */
function AppNavigator(): React.JSX.Element {
    const { user, loading } = useAuth();
    const [showRegister, setShowRegister] = useState(false);

    // TEMPORARY: Skip auth for UI testing
    const SKIP_AUTH = true; // Set to false to re-enable authentication

    if (loading && !SKIP_AUTH) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6200ee" />
            </View>
        );
    }

    if (!user && !SKIP_AUTH) {
        // Not logged in - show auth screens
        if (showRegister) {
            return <RegisterScreen navigation={{
                navigate: (screen: string) => {
                    if (screen === 'Login') setShowRegister(false);
                }
            }} />;
        }
        return <LoginScreen navigation={{
            navigate: (screen: string) => {
                if (screen === 'Register') setShowRegister(true);
            }
        }} />;
    }

    // Logged in or skipping auth - show main app directly
    return (
        <FamilyProvider>
            <MainTabNavigator />
        </FamilyProvider>
    );
}

/**
 * Root App Component with Supabase Integration
 * Wraps the app with Auth context
 */
function App(): React.JSX.Element {
    return (
        <AuthProvider>
            <SafeAreaView style={styles.container}>
                <AppNavigator />
            </SafeAreaView>
        </AuthProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
});

export default App;
