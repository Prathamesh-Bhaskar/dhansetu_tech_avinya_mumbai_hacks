import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { OnboardingProvider } from '../contexts/OnboardingContext';
import { OnboardingFlow } from '../screens/Onboarding/OnboardingFlow';

const Stack = createStackNavigator();

export const OnboardingNavigator = () => {
    return (
        <OnboardingProvider>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen
                    name="OnboardingFlow"
                    component={OnboardingFlow}
                />
            </Stack.Navigator>
        </OnboardingProvider>
    );
};
