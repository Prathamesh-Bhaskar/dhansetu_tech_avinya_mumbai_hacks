import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { HomeScreen } from '../screens/Home/HomeScreen';
import { DashboardNavigator } from './DashboardNavigator';
import { BudgetNavigator } from './BudgetNavigator';
import { ReportsScreen } from '../screens/Reports/ReportsScreen';
import TransactionNavigator from './TransactionNavigator';
import { GoalsNavigator } from './GoalsNavigator';
import { RecommendationsScreen } from '../screens/Recommendations/RecommendationsScreen';
import AppContent from '../../AppContent';

const Tab = createBottomTabNavigator();

export const MainTabNavigator = () => {
    return (
        <NavigationContainer>
            <Tab.Navigator
                screenOptions={{
                    tabBarActiveTintColor: '#6200ee',
                    tabBarInactiveTintColor: '#757575',
                    tabBarStyle: {
                        backgroundColor: '#ffffff',
                        borderTopWidth: 1,
                        borderTopColor: '#e0e0e0',
                        height: 60,
                        paddingBottom: 8,
                        paddingTop: 8,
                    },
                    tabBarLabelStyle: {
                        fontSize: 12,
                        fontWeight: '600',
                    },
                    headerShown: false,
                }}
            >
                <Tab.Screen
                    name="Home"
                    component={HomeScreen}
                    options={{
                        tabBarLabel: 'Home',
                        tabBarIcon: ({ color }) => (
                            <Text style={{ fontSize: 24 }}>{color === '#6200ee' ? '🏠' : '🏡'}</Text>
                        ),
                    }}
                />
                <Tab.Screen
                    name="Goals"
                    component={GoalsNavigator}
                    options={{
                        tabBarLabel: 'Goals',
                        tabBarIcon: ({ color }) => (
                            <Text style={{ fontSize: 24 }}>{color === '#6200ee' ? '🎯' : '🏁'}</Text>
                        ),
                    }}
                />
                <Tab.Screen
                    name="Budgets"
                    component={BudgetNavigator}
                    options={{
                        tabBarLabel: 'Portfolio',
                        tabBarIcon: ({ color }) => (
                            <Text style={{ fontSize: 24 }}>{color === '#6200ee' ? '💰' : '💵'}</Text>
                        ),
                    }}
                />
                <Tab.Screen
                    name="Dashboard"
                    component={DashboardNavigator}
                    options={{
                        tabBarLabel: 'Insights',
                        tabBarIcon: ({ color }) => (
                            <Text style={{ fontSize: 24 }}>{color === '#6200ee' ? '📊' : '📈'}</Text>
                        ),
                    }}
                />
                <Tab.Screen
                    name="Recommendations"
                    component={RecommendationsScreen}
                    options={{
                        tabBarLabel: 'AI Tips',
                        tabBarIcon: ({ color }) => (
                            <Text style={{ fontSize: 24 }}>{color === '#6200ee' ? '🤖' : '🔮'}</Text>
                        ),
                    }}
                />
                <Tab.Screen
                    name="Reports"
                    component={ReportsScreen}
                    options={{
                        tabBarLabel: 'Reports',
                        tabBarIcon: ({ color }) => (
                            <Text style={{ fontSize: 24 }}>{color === '#6200ee' ? '📑' : '📄'}</Text>
                        ),
                        tabBarButton: () => null, // Hide from tab bar but keep in navigator
                    }}
                />
            </Tab.Navigator>
        </NavigationContainer>
    );
};
