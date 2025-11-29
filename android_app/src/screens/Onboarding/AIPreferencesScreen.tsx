import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, Alert } from 'react-native';
import { OnboardingContainer } from '../../components/onboarding/OnboardingContainer';
import { ProgressBar } from '../../components/onboarding/ProgressBar';
import { OnboardingButton } from '../../components/onboarding/OnboardingButton';
import { SelectableChip } from '../../components/onboarding/SelectableChip';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { AI_PERSONALIZATION_OPTIONS } from '../../types/profile';

export const AIPreferencesScreen: React.FC = () => {
    const {
        profileData,
        updateProfileData,
        previousStep,
        completeOnboarding,
        currentStep,
        totalSteps,
        isLoading
    } = useOnboarding();

    const [aiLevel, setAiLevel] = useState(profileData.ai_personalization_level || 'balanced');
    const [smartCategorization, setSmartCategorization] = useState(profileData.smart_categorization ?? true);
    const [spendingPredictions, setSpendingPredictions] = useState(profileData.spending_predictions ?? true);
    const [budgetRecommendations, setBudgetRecommendations] = useState(profileData.budget_recommendations ?? true);
    const [goalOptimization, setGoalOptimization] = useState(profileData.goal_optimization ?? true);
    const [anomalyDetection, setAnomalyDetection] = useState(profileData.anomaly_detection ?? true);
    const [personalizedInsights, setPersonalizedInsights] = useState(profileData.personalized_insights ?? true);

    const handleComplete = async () => {
        try {
            updateProfileData({
                ai_personalization_level: aiLevel,
                smart_categorization: smartCategorization,
                spending_predictions: spendingPredictions,
                budget_recommendations: budgetRecommendations,
                goal_optimization: goalOptimization,
                anomaly_detection: anomalyDetection,
                personalized_insights: personalizedInsights,
            });

            await completeOnboarding();

            // Navigation will be handled by root navigator
            Alert.alert('Success!', 'Your profile has been created successfully!');
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to complete onboarding');
        }
    };

    return (
        <OnboardingContainer showGradient={false}>
            <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />

            <Text style={styles.title}>How much AI help do you want?</Text>
            <Text style={styles.subtitle}>
                Choose your personalization level
            </Text>

            {/* AI Personalization Level */}
            <View style={styles.field}>
                <View style={styles.chipContainer}>
                    {AI_PERSONALIZATION_OPTIONS.map((option) => (
                        <View key={option.value} style={styles.aiOption}>
                            <SelectableChip
                                label={`${option.icon} ${option.label}`}
                                selected={aiLevel === option.value}
                                onPress={() => setAiLevel(option.value)}
                            />
                            {aiLevel === option.value && (
                                <Text style={styles.description}>{option.description}</Text>
                            )}
                        </View>
                    ))}
                </View>
            </View>

            {/* Smart Features */}
            <View style={styles.field}>
                <Text style={styles.label}>Enable Smart Features</Text>

                <View style={styles.feature}>
                    <View style={styles.featureInfo}>
                        <Text style={styles.featureName}>Smart Categorization</Text>
                        <Text style={styles.featureDesc}>AI learns from your corrections</Text>
                    </View>
                    <Switch
                        value={smartCategorization}
                        onValueChange={setSmartCategorization}
                        trackColor={{ false: '#e0e0e0', true: '#b39ddb' }}
                        thumbColor={smartCategorization ? '#6200ee' : '#f4f3f4'}
                    />
                </View>

                <View style={styles.feature}>
                    <View style={styles.featureInfo}>
                        <Text style={styles.featureName}>Spending Predictions</Text>
                        <Text style={styles.featureDesc}>Forecast next month's expenses</Text>
                    </View>
                    <Switch
                        value={spendingPredictions}
                        onValueChange={setSpendingPredictions}
                        trackColor={{ false: '#e0e0e0', true: '#b39ddb' }}
                        thumbColor={spendingPredictions ? '#6200ee' : '#f4f3f4'}
                    />
                </View>

                <View style={styles.feature}>
                    <View style={styles.featureInfo}>
                        <Text style={styles.featureName}>Budget Recommendations</Text>
                        <Text style={styles.featureDesc}>AI suggests optimal budgets</Text>
                    </View>
                    <Switch
                        value={budgetRecommendations}
                        onValueChange={setBudgetRecommendations}
                        trackColor={{ false: '#e0e0e0', true: '#b39ddb' }}
                        thumbColor={budgetRecommendations ? '#6200ee' : '#f4f3f4'}
                    />
                </View>

                <View style={styles.feature}>
                    <View style={styles.featureInfo}>
                        <Text style={styles.featureName}>Goal Optimization</Text>
                        <Text style={styles.featureDesc}>Smart timeline adjustments</Text>
                    </View>
                    <Switch
                        value={goalOptimization}
                        onValueChange={setGoalOptimization}
                        trackColor={{ false: '#e0e0e0', true: '#b39ddb' }}
                        thumbColor={goalOptimization ? '#6200ee' : '#f4f3f4'}
                    />
                </View>

                <View style={styles.feature}>
                    <View style={styles.featureInfo}>
                        <Text style={styles.featureName}>Anomaly Detection</Text>
                        <Text style={styles.featureDesc}>Alert on unusual spending</Text>
                    </View>
                    <Switch
                        value={anomalyDetection}
                        onValueChange={setAnomalyDetection}
                        trackColor={{ false: '#e0e0e0', true: '#b39ddb' }}
                        thumbColor={anomalyDetection ? '#6200ee' : '#f4f3f4'}
                    />
                </View>

                <View style={styles.feature}>
                    <View style={styles.featureInfo}>
                        <Text style={styles.featureName}>Personalized Insights</Text>
                        <Text style={styles.featureDesc}>Weekly financial reports</Text>
                    </View>
                    <Switch
                        value={personalizedInsights}
                        onValueChange={setPersonalizedInsights}
                        trackColor={{ false: '#e0e0e0', true: '#b39ddb' }}
                        thumbColor={personalizedInsights ? '#6200ee' : '#f4f3f4'}
                    />
                </View>
            </View>

            {/* Privacy Note */}
            <View style={styles.privacyNote}>
                <Text style={styles.privacyText}>
                    🔒 Your data is encrypted, never sold, and deletable anytime
                </Text>
            </View>

            {/* Buttons */}
            <View style={styles.buttons}>
                <OnboardingButton
                    title="Back"
                    onPress={previousStep}
                    variant="outline"
                    disabled={isLoading}
                />
                <OnboardingButton
                    title="Complete Setup"
                    onPress={handleComplete}
                    variant="primary"
                    loading={isLoading}
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
        marginBottom: 12,
    },
    chipContainer: {
        gap: 12,
    },
    aiOption: {
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        color: '#757575',
        marginTop: 4,
        marginLeft: 16,
    },
    feature: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    featureInfo: {
        flex: 1,
    },
    featureName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#212121',
        marginBottom: 4,
    },
    featureDesc: {
        fontSize: 14,
        color: '#757575',
    },
    privacyNote: {
        backgroundColor: '#f3e5f5',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    privacyText: {
        fontSize: 14,
        color: '#6200ee',
        textAlign: 'center',
    },
    buttons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 24,
    },
});
