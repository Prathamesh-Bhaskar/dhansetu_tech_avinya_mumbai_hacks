import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { OnboardingContainer } from '../../components/onboarding/OnboardingContainer';
import { OnboardingButton } from '../../components/onboarding/OnboardingButton';
import { useOnboarding } from '../../contexts/OnboardingContext';

export const WelcomeScreen: React.FC = () => {
    const { nextStep } = useOnboarding();

    return (
        <OnboardingContainer>
            <View style={styles.content}>
                {/* Logo/Icon */}
                <View style={styles.iconContainer}>
                    <Text style={styles.icon}>💰</Text>
                </View>

                {/* Title */}
                <Text style={styles.title}>Welcome to DhanSetu!</Text>

                {/* Subtitle */}
                <Text style={styles.subtitle}>
                    Your Smart Family Finance Manager
                </Text>

                {/* Description */}
                <Text style={styles.description}>
                    We'll ask you a few questions to personalize your experience and provide AI-powered insights tailored just for you.
                </Text>

                <Text style={styles.time}>This takes ~3 minutes</Text>
            </View>

            {/* Buttons */}
            <View style={styles.buttons}>
                <OnboardingButton
                    title="Get Started"
                    onPress={nextStep}
                    variant="primary"
                />
                <OnboardingButton
                    title="Skip - Use Default Settings"
                    onPress={() => {/* TODO: Skip to main app */ }}
                    variant="outline"
                    style={styles.skipButton}
                />
            </View>
        </OnboardingContainer>
    );
};

const styles = StyleSheet.create({
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconContainer: {
        marginBottom: 32,
    },
    icon: {
        fontSize: 80,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#ffffff',
        textAlign: 'center',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 18,
        color: 'rgba(255, 255, 255, 0.9)',
        textAlign: 'center',
        marginBottom: 24,
    },
    description: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    time: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.7)',
        textAlign: 'center',
    },
    buttons: {
        gap: 12,
    },
    skipButton: {
        marginTop: 8,
    },
});
