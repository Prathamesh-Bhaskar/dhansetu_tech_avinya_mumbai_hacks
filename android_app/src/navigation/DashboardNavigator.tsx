import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { DashboardScreen } from '../screens/Dashboard/DashboardScreen';
import { ReportsScreen } from '../screens/Reports/ReportsScreen';

const Stack = createStackNavigator();

export const DashboardNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="DashboardMain" component={DashboardScreen} />
            <Stack.Screen
                name="Reports"
                component={ReportsScreen}
                options={{
                    headerShown: true,
                    headerTitle: 'Reports & Insights',
                    headerStyle: {
                        backgroundColor: '#6200ee',
                    },
                    headerTintColor: '#ffffff',
                    headerTitleStyle: {
                        fontWeight: 'bold',
                    },
                }}
            />
        </Stack.Navigator>
    );
};
