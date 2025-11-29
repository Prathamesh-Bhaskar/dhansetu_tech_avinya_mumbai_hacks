import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { OnboardingContainer } from '../../components/onboarding/OnboardingContainer';
import { ProgressBar } from '../../components/onboarding/ProgressBar';
import { OnboardingButton } from '../../components/onboarding/OnboardingButton';
import { SelectableChip } from '../../components/onboarding/SelectableChip';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { OCCUPATION_OPTIONS } from '../../types/profile';

export const PersonalInfoScreen: React.FC = () => {
    const { profileData, updateProfileData, nextStep, previousStep, currentStep, totalSteps } = useOnboarding();

    const [fullName, setFullName] = useState(profileData.full_name || '');
    const [age, setAge] = useState(profileData.age?.toString() || '');
    const [city, setCity] = useState(profileData.city || '');
    const [familySize, setFamilySize] = useState(profileData.family_size?.toString() || '');
    const [occupation, setOccupation] = useState(profileData.occupation || '');

    const handleNext = () => {
        updateProfileData({
            full_name: fullName,
            age: age ? parseInt(age) : undefined,
            city,
            family_size: familySize ? parseInt(familySize) : undefined,
            occupation,
        });
        nextStep();
    };

    return (
        <OnboardingContainer showGradient={false}>
            <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />

            <Text style={styles.title}>Tell us about yourself</Text>
            <Text style={styles.subtitle}>
                This helps us understand your financial journey better
            </Text>

            {/* Full Name */}
            <View style={styles.field}>
                <Text style={styles.label}>📝 Full Name</Text>
                <TextInput
                    style={styles.input}
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="Enter your name"
                    placeholderTextColor="#999"
                />
            </View>

            {/* Age */}
            <View style={styles.field}>
                <Text style={styles.label}>🎂 Age</Text>
                <TextInput
                    style={styles.input}
                    value={age}
                    onChangeText={setAge}
                    placeholder="Enter your age"
                    keyboardType="number-pad"
                    placeholderTextColor="#999"
                />
            </View>

            {/* Occupation */}
            <View style={styles.field}>
                <Text style={styles.label}>💼 Occupation</Text>
                <View style={styles.chipContainer}>
                    {OCCUPATION_OPTIONS.map((option) => (
                        <SelectableChip
                            key={option.value}
                            label={option.label}
                            selected={occupation === option.value}
                            onPress={() => setOccupation(option.value)}
                        />
                    ))}
                </View>
            </View>

            {/* City */}
            <View style={styles.field}>
                <Text style={styles.label}>📍 City</Text>
                <TextInput
                    style={styles.input}
                    value={city}
                    onChangeText={setCity}
                    placeholder="Enter your city"
                    placeholderTextColor="#999"
                />
            </View>

            {/* Family Size */}
            <View style={styles.field}>
                <Text style={styles.label}>👨‍👩‍👧‍👦 Family Size</Text>
                <TextInput
                    style={styles.input}
                    value={familySize}
                    onChangeText={setFamilySize}
                    placeholder="Number of family members"
                    keyboardType="number-pad"
                    placeholderTextColor="#999"
                />
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
    input: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
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
