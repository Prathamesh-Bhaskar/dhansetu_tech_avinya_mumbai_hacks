import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { OnboardingContainer } from '../../components/onboarding/OnboardingContainer';
import { ProgressBar } from '../../components/onboarding/ProgressBar';
import { OnboardingButton } from '../../components/onboarding/OnboardingButton';
import { SelectableChip } from '../../components/onboarding/SelectableChip';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { TRANSACTION_CATEGORIES } from '../../../utils/categories';
import { SHOPPING_FREQUENCY_OPTIONS, PURCHASE_SIZE_OPTIONS } from '../../types/profile';

export const SpendingScreen: React.FC = () => {
    const { profileData, updateProfileData, nextStep, previousStep, currentStep, totalSteps } = useOnboarding();

    const [topCategories, setTopCategories] = useState<string[]>(profileData.top_categories || []);
    const [shoppingFrequency, setShoppingFrequency] = useState(profileData.shopping_frequency || '');
    const [purchaseSize, setPurchaseSize] = useState(profileData.typical_purchase_size || '');

    const toggleCategory = (category: string) => {
        setTopCategories(prev => {
            if (prev.includes(category)) {
                return prev.filter(c => c !== category);
            } else if (prev.length < 3) {
                return [...prev, category];
            }
            return prev;
        });
    };

    const handleNext = () => {
        updateProfileData({
            top_categories: topCategories,
            shopping_frequency: shoppingFrequency,
            typical_purchase_size: purchaseSize,
        });
        nextStep();
    };

    return (
        <OnboardingContainer showGradient={false}>
            <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />

            <Text style={styles.title}>How do you usually spend?</Text>
            <Text style={styles.subtitle}>
                This helps us categorize transactions better
            </Text>

            {/* Top Categories */}
            <View style={styles.field}>
                <Text style={styles.label}>What do you spend most on? (Top 3)</Text>
                <Text style={styles.hint}>Selected: {topCategories.length}/3</Text>
                <View style={styles.chipContainer}>
                    {TRANSACTION_CATEGORIES.slice(0, 10).map((cat) => (
                        <SelectableChip
                            key={cat.id}
                            label={cat.name}
                            icon={cat.icon}
                            selected={topCategories.includes(cat.id)}
                            onPress={() => toggleCategory(cat.id)}
                        />
                    ))}
                </View>
            </View>

            {/* Shopping Frequency */}
            <View style={styles.field}>
                <Text style={styles.label}>How often do you shop?</Text>
                <View style={styles.chipContainer}>
                    {SHOPPING_FREQUENCY_OPTIONS.map((option) => (
                        <SelectableChip
                            key={option.value}
                            label={option.label}
                            selected={shoppingFrequency === option.value}
                            onPress={() => setShoppingFrequency(option.value)}
                        />
                    ))}
                </View>
            </View>

            {/* Purchase Size */}
            <View style={styles.field}>
                <Text style={styles.label}>Typical purchase size</Text>
                <View style={styles.chipContainer}>
                    {PURCHASE_SIZE_OPTIONS.map((option) => (
                        <SelectableChip
                            key={option.value}
                            label={option.label}
                            selected={purchaseSize === option.value}
                            onPress={() => setPurchaseSize(option.value)}
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
    hint: {
        fontSize: 14,
        color: '#757575',
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
