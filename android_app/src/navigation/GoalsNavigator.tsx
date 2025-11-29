import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { GoalsOverviewScreen } from '../screens/Goals/GoalsOverviewScreen';
import { PersonalGoalsScreen } from '../screens/Goals/PersonalGoalsScreen';
import { FamilyGoalsScreen } from '../screens/Goals/FamilyGoalsScreen';
import { CreatePersonalGoalScreen } from '../screens/Goals/CreatePersonalGoalScreen';
import { CreateFamilyGoalScreen } from '../screens/Goals/CreateFamilyGoalScreen';
import { PersonalGoalDetailsScreen } from '../screens/Goals/PersonalGoalDetailsScreen';
import { FamilyGoalDetailsScreen } from '../screens/Goals/FamilyGoalDetailsScreen';
import { CreateFamilyScreen } from '../screens/Family/CreateFamilyScreen';
import { JoinFamilyScreen } from '../screens/Family/JoinFamilyScreen';

const Stack = createStackNavigator();

export const GoalsNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#6200ee',
                },
                headerTintColor: '#ffffff',
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
            }}
        >
            <Stack.Screen
                name="GoalsOverview"
                component={GoalsOverviewScreen}
                options={{ title: 'Goals' }}
            />
            <Stack.Screen
                name="PersonalGoals"
                component={PersonalGoalsScreen}
                options={{ title: 'Personal Goals' }}
            />
            <Stack.Screen
                name="FamilyGoals"
                component={FamilyGoalsScreen}
                options={{ title: 'Family Goals' }}
            />
            <Stack.Screen
                name="CreatePersonalGoal"
                component={CreatePersonalGoalScreen}
                options={{ title: 'Create Personal Goal' }}
            />
            <Stack.Screen
                name="CreateFamilyGoal"
                component={CreateFamilyGoalScreen}
                options={{ title: 'Create Family Goal' }}
            />
            <Stack.Screen
                name="PersonalGoalDetails"
                component={PersonalGoalDetailsScreen}
                options={{ title: 'Goal Details' }}
            />
            <Stack.Screen
                name="FamilyGoalDetails"
                component={FamilyGoalDetailsScreen}
                options={{ title: 'Family Goal Details' }}
            />
            <Stack.Screen
                name="CreateFamily"
                component={CreateFamilyScreen}
                options={{ title: 'Create Family' }}
            />
            <Stack.Screen
                name="JoinFamily"
                component={JoinFamilyScreen}
                options={{ title: 'Join Family' }}
            />
        </Stack.Navigator>
    );
};
