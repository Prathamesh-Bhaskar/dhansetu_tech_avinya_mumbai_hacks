import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TransactionListScreen } from '../screens/Transactions/TransactionListScreen';
import { TransactionDetailsScreen } from '../screens/Transactions/TransactionDetailsScreen';
import { EditTransactionScreen } from '../screens/Transactions/EditTransactionScreen';
import { AddTransactionScreen } from '../screens/Transactions/AddTransactionScreen';

const Stack = createStackNavigator();

const TransactionNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen
                name="TransactionList"
                component={TransactionListScreen}
            />
            <Stack.Screen
                name="TransactionDetails"
                component={TransactionDetailsScreen}
                options={{ headerShown: true, title: 'Transaction Details' }}
            />
            <Stack.Screen
                name="EditTransaction"
                component={EditTransactionScreen}
                options={{ headerShown: true, title: 'Edit Transaction' }}
            />
            <Stack.Screen
                name="AddTransaction"
                component={AddTransactionScreen}
                options={{ headerShown: true, title: 'Add Transaction' }}
            />
        </Stack.Navigator>
    );
};

export default TransactionNavigator;
