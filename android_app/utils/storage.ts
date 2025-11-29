// Storage utility for DhanSetu transactions
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ParsedSMS } from './smsParser';

const STORAGE_KEY = '@dhansetu_transactions';

// Save transactions to AsyncStorage
export const saveTransactions = async (transactions: ParsedSMS[]): Promise<void> => {
    try {
        const jsonValue = JSON.stringify(transactions);
        await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
        console.log('Transactions saved successfully');
    } catch (error) {
        console.error('Error saving transactions:', error);
    }
};

// Load transactions from AsyncStorage
export const loadTransactions = async (): Promise<ParsedSMS[]> => {
    try {
        const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
        if (jsonValue != null) {
            const transactions = JSON.parse(jsonValue);
            console.log(`Loaded ${transactions.length} transactions from storage`);
            return transactions;
        }
        return [];
    } catch (error) {
        console.error('Error loading transactions:', error);
        return [];
    }
};

// Add a single transaction
export const addTransaction = async (transaction: ParsedSMS): Promise<void> => {
    try {
        const existing = await loadTransactions();
        const updated = [transaction, ...existing];
        await saveTransactions(updated);
    } catch (error) {
        console.error('Error adding transaction:', error);
    }
};

// Update a transaction
export const updateTransaction = async (updatedTransaction: ParsedSMS): Promise<void> => {
    try {
        const existing = await loadTransactions();
        const updated = existing.map(t =>
            t.id === updatedTransaction.id ? updatedTransaction : t
        );
        await saveTransactions(updated);
    } catch (error) {
        console.error('Error updating transaction:', error);
    }
};

// Delete a transaction by ID
export const deleteTransaction = async (transactionId: string): Promise<void> => {
    try {
        const existing = await loadTransactions();
        const updated = existing.filter(t => t.id !== transactionId);
        await saveTransactions(updated);
        console.log(`Transaction ${transactionId} deleted from storage`);
    } catch (error) {
        console.error('Error deleting transaction:', error);
    }
};

// Clear all transactions (for testing)
export const clearTransactions = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem(STORAGE_KEY);
        console.log('All transactions cleared');
    } catch (error) {
        console.error('Error clearing transactions:', error);
    }
};
