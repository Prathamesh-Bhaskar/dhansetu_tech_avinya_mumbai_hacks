import React from 'react';
import {
    View,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';

interface Props {
    children: React.ReactNode;
    showGradient?: boolean;
}

export const OnboardingContainer: React.FC<Props> = ({
    children,
    showGradient = true
}) => {
    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor="#6200ee" />
            <View style={[styles.container, showGradient && styles.gradientContainer]}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardAvoid}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {children}
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#6200ee',
    },
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    gradientContainer: {
        backgroundColor: '#6200ee',
    },
    keyboardAvoid: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
    },
});
