import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { OnboardingContainer } from '../../components/onboarding/OnboardingContainer';
import { ProgressBar } from '../../components/onboarding/ProgressBar';
import { OnboardingButton } from '../../components/onboarding/OnboardingButton';
import { SelectableChip } from '../../components/onboarding/SelectableChip';
import { useOnboarding } from '../../contexts/OnboardingContext';
import {
    SHORT_TERM_GOAL_OPTIONS,
    MEDIUM_TERM_GOAL_OPTIONS,
    LONG_TERM_GOAL_OPTIONS,
    FINANCIAL_PRIORITY_OPTIONS
} from '../../types/profile';

export const GoalsScreen: React.FC = () => {
    const { profileData, updateProfileData, nextStep, previousStep, currentStep, totalSteps } = useOnboarding();

    const [shortTermGoals, setShortTermGoals] = useState<string[]>(profileData.short_term_goals || []);
    const [mediumTermGoals, setMediumTermGoals] = useState<string[]>(profileData.medium_term_goals || []);
    const [longTermGoals, setLongTermGoals] = useState<string[]>(profileData.long_term_goals || []);
    const [financialPriority, setFinancialPriority] = useState(profileData.financial_priority || '');
    const [customGoal, setCustomGoal] = useState('');

    const toggleGoal = (goal: string, type: 'short' | 'medium' | 'long') => {
        const setter = type === 'short' ? setShortTermGoals : type === 'medium' ? setMediumTermGoals : setLongTermGoals;
        setter(prev =>
            prev.includes(goal)
                ? prev.filter(g => g !== goal)
                : [...prev, goal]
        );
    };

    const addCustomGoal = (type: 'short' | 'medium' | 'long') => {
        if (customGoal.trim()) {
            toggleGoal(customGoal.trim(), type);
            setCustomGoal('');
        }
    };

    const handleNext = () => {
        updateProfileData({
            short_term_goals: shortTermGoals,
            medium_term_goals: mediumTermGoals,
            long_term_goals: longTermGoals,
            financial_priority: financialPriority,
        });
        nextStep();
    };

    return (
        <OnboardingContainer showGradient={false}>
            <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />

            <Text style={styles.title}>What are you saving for?</Text>
            <Text style={styles.subtitle}>
                Select your top priorities
            </Text>

            {/* Short-term Goals */}
            <View style={styles.field}>
                <Text style={styles.label}>Short-term (\u003c 6 months)</Text>
                <View style={styles.chipContainer}>
                    {SHORT_TERM_GOAL_OPTIONS.map((goal) => (
                        <SelectableChip
                            key={goal}
                            label={goal}
                            selected={shortTermGoals.includes(goal)}
                            onPress={() => toggleGoal(goal, 'short')}
                        />
                    ))}
                </View>
            </View>

            {/* Medium-term Goals */}
            <View style={styles.field}>
                <Text style={styles.label}>Medium-term (6-12 months)</Text>
                <View style={styles.chipContainer}>
                    {MEDIUM_TERM_GOAL_OPTIONS.map((goal) => (
                        <SelectableChip
                            key={goal}
                            label={goal}
                            selected={mediumTermGoals.includes(goal)}
                            onPress={() => toggleGoal(goal, 'medium')}
                        />
                    ))}
                </View>
            </View>

            {/* Long-term Goals */}
            <View style={styles.field}>
                <Text style={styles.label}>Long-term (1+ years)</Text>
                <View style={styles.chipContainer}>
                    {LONG_TERM_GOAL_OPTIONS.map((goal) => (
                        <SelectableChip
                            key={goal}
                            label={goal}
                            selected={longTermGoals.includes(goal)}
                            onPress={() => toggleGoal(goal, 'long')}
                        />
                    ))}
                </View>
            </View>

            {/* Financial Priority */}
            <View style={styles.field}>
                <Text style={styles.label}>What's your biggest financial priority?</Text>
                <View style={styles.chipContainer}>
                    {FINANCIAL_PRIORITY_OPTIONS.map((option) => (
                        <SelectableChip
                            key={option.value}
                            label={option.label}
                            selected={financialPriority === option.value}
                            onPress={() => setFinancialPriority(option.value)}
                        />
                    ))}
                </View>
            </View>

            {/* Buttons */}
            <View style={styles.buttons}>
                <OnboardingButton
                    title="Back"
                    onPress={previousStep}
                    variant="outline"
                />
                <OnboardingButton
                    title="Continue"
                    onPress={handleNext}
                    variant="primary"
                />
            </View>
        </OnboardingContainer>
    );
};

const styles = StyleSheet.create({
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#212121',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#757575',
        marginBottom: 24,
    },
    field: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#212121',
        marginBottom: 8,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    buttons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 24,
    },
});
