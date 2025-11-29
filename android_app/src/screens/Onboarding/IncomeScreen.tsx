import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { OnboardingContainer } from '../../components/onboarding/OnboardingContainer';
import { ProgressBar } from '../../components/onboarding/ProgressBar';
import { OnboardingButton } from '../../components/onboarding/OnboardingButton';
import { SelectableChip } from '../../components/onboarding/SelectableChip';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { INCOME_SOURCE_OPTIONS } from '../../types/profile';

export const IncomeScreen: React.FC = () => {
    const { profileData, updateProfileData, nextStep, previousStep, currentStep, totalSteps } = useOnboarding();

    const [monthlyIncome, setMonthlyIncome] = useState(profileData.monthly_income?.toString() || '');
    const [fixedExpenses, setFixedExpenses] = useState(profileData.fixed_expenses?.toString() || '');
    const [incomeSources, setIncomeSources] = useState<string[]>(profileData.income_sources || []);

    const toggleIncomeSource = (source: string) => {
        setIncomeSources(prev =>
            prev.includes(source)
                ? prev.filter(s => s !== source)
                : [...prev, source]
        );
    };

    const handleNext = () => {
        updateProfileData({
            monthly_income: monthlyIncome ? parseFloat(monthlyIncome) : undefined,
            fixed_expenses: fixedExpenses ? parseFloat(fixedExpenses) : undefined,
            income_sources: incomeSources,
        });
        nextStep();
    };

    return (
        <OnboardingContainer showGradient={false}>
            <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />

            <Text style={styles.title}>Let's talk about your income</Text>
            <Text style={styles.subtitle}>
                This helps us suggest realistic budgets and goals
            </Text>

            {/* Monthly Income */}
            <View style={styles.field}>
                <Text style={styles.label}>💵 Monthly Income</Text>
                <View style={styles.inputContainer}>
                    <Text style={styles.currency}>₹</Text>
                    <TextInput
                        style={styles.input}
                        value={monthlyIncome}
                        onChangeText={setMonthlyIncome}
                        placeholder="0"
                        keyboardType="numeric"
                        placeholderTextColor="#999"
                    />
                </View>
            </View>

            {/* Income Sources */}
            <View style={styles.field}>
                <Text style={styles.label}>Income Sources (select all that apply)</Text>
                <View style={styles.chipContainer}>
                    {INCOME_SOURCE_OPTIONS.map((option) => (
                        <SelectableChip
                            key={option.value}
                            label={option.label}
                            selected={incomeSources.includes(option.value)}
                            onPress={() => toggleIncomeSource(option.value)}
                        />
                    ))}
                </View>
            </View>

            {/* Fixed Expenses */}
            <View style={styles.field}>
                <Text style={styles.label}>💳 Fixed Monthly Expenses</Text>
                <Text style={styles.hint}>(Rent, EMI, Subscriptions, etc.)</Text>
                <View style={styles.inputContainer}>
                    <Text style={styles.currency}>₹</Text>
                    <TextInput
                        style={styles.input}
                        value={fixedExpenses}
                        onChangeText={setFixedExpenses}
                        placeholder="0"
                        keyboardType="numeric"
                        placeholderTextColor="#999"
                    />
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
    hint: {
        fontSize: 14,
        color: '#757575',
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        paddingHorizontal: 16,
    },
    currency: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#757575',
        marginRight: 8,
    },
    input: {
        flex: 1,
        padding: 16,
        fontSize: 16,
        color: '#212121',
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
