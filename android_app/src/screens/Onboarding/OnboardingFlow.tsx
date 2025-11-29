import React from 'react';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { WelcomeScreen } from './WelcomeScreen';
import { PersonalInfoScreen } from './PersonalInfoScreen';
import { IncomeScreen } from './IncomeScreen';
import { SpendingScreen } from './SpendingScreen';
import { GoalsScreen } from './GoalsScreen';
import { AIPreferencesScreen } from './AIPreferencesScreen';

export const OnboardingFlow: React.FC = () => {
    const { currentStep } = useOnboarding();

    const screens = [
        <WelcomeScreen key="welcome" />,
        <PersonalInfoScreen key="personal" />,
        <IncomeScreen key="income" />,
        <SpendingScreen key="spending" />,
        <GoalsScreen key="goals" />,
        <AIPreferencesScreen key="ai" />,
    ];

    return screens[currentStep] || screens[0];
};
