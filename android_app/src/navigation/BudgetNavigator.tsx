import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { BudgetOverviewScreen } from '../screens/Budget/BudgetOverviewScreen';
import { ManageBudgetScreen } from '../screens/Budget/ManageBudgetScreen';

const Stack = createStackNavigator();

export const BudgetNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="BudgetOverview" component={BudgetOverviewScreen} />
            <Stack.Screen name="ManageBudget" component={ManageBudgetScreen} />
        </Stack.Navigator>
    );
};
