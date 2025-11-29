import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import * as SupabaseAPI from '../services/SupabaseAPI';
import { addTransaction, loadTransactions } from '../../utils/storage';
import type { ParsedSMS } from '../../utils/smsParser';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

const QUEUE_STORAGE_KEY = '@offline_queue';

interface OfflineQueueItem {
    id: string;
    action: 'addExpense';
    payload: any;
    retries: number;
    timestamp: number;
    familyId?: string;
}

export const useSupabaseSync = () => {
    const { user } = useAuth();
    const [syncing, setSyncing] = useState(false);
    const [offlineQueue, setOfflineQueue] = useState<OfflineQueueItem[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    // Load queue from AsyncStorage on mount
    useEffect(() => {
        loadQueue();
    }, []);

    // Save queue to AsyncStorage whenever it changes
    useEffect(() => {
        saveQueue();
    }, [offlineQueue]);

    const loadQueue = async () => {
        try {
            const stored = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
            if (stored) {
                const queue = JSON.parse(stored);
                setOfflineQueue(queue);
            }
        } catch (error) {
            console.error('Error loading queue:', error);
        }
    };

    const saveQueue = async () => {
        try {
            await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(offlineQueue));
        } catch (error) {
            console.error('Error saving queue:', error);
        }
    };

    // Save transaction to Supabase
    const saveToSupabase = async (transaction: ParsedSMS, shareToFamily?: string) => {
        if (!user) {
            console.log('User not logged in, saving locally only');
            return { success: false, local: true };
        }

        try {
            setSyncing(true);

            // Sanitize data (remove sensitive info)
            const sanitizedData = {
                user_id: user.id,
                category: transaction.parsed.userCategory || transaction.parsed.category,
                amount: transaction.parsed.transaction.amount,
                merchant: transaction.parsed.transaction.merchant || 'Unknown',
                date: transaction.parsed.transaction.date || new Date().toISOString().split('T')[0],
                time: transaction.parsed.transaction.time,
                notes: transaction.parsed.transaction.notes,
            };

            // Save to personal_expenses
            const expense = await SupabaseAPI.addPersonalExpense(sanitizedData);

            // If user wants to share with family
            if (shareToFamily && expense) {
                await SupabaseAPI.syncExpenseToFamily(expense.id, shareToFamily);
            }

            return { success: true, data: expense };
        } catch (error: any) {
            // Differentiate between network errors and database errors
            const errorMessage = error.message || '';

            // Check if it's a network error (should queue for offline sync)
            const isNetworkError =
                errorMessage.includes('fetch') ||
                errorMessage.includes('network') ||
                errorMessage.includes('Failed to fetch') ||
                errorMessage.includes('NetworkError') ||
                error.code === 'NETWORK_ERROR';

            if (isNetworkError) {
                // Network error - add to offline queue silently
                await addToOfflineQueue({
                    id: transaction.id,
                    action: 'addExpense',
                    payload: transaction,
                    retries: 0,
                    timestamp: Date.now(),
                    familyId: shareToFamily,
                });

                return { success: false, error: 'Saved to offline queue', offline: true };
            } else {
                // Database/validation error - throw it so user sees the real error
                console.error('Database error:', error);
                throw error;
            }
        } finally {
            setSyncing(false);
        }
    };

    // Add to offline queue
    const addToOfflineQueue = async (item: OfflineQueueItem) => {
        setOfflineQueue(prev => [...prev, item]);
        // Also persist transaction to AsyncStorage
        await addTransaction(item.payload);
    };

    // Process offline queue when connection restored
    const processOfflineQueue = async () => {
        if (offlineQueue.length === 0 || !user || isProcessing) return;

        setIsProcessing(true);
        setSyncing(true);

        // Get current queue and clear it immediately to prevent re-processing
        const queueToProcess = [...offlineQueue];
        setOfflineQueue([]);

        for (const item of queueToProcess) {
            try {
                // Call Supabase API directly (don't use saveToSupabase to avoid re-queuing)
                const sanitizedData = {
                    user_id: user.id,
                    category: item.payload.parsed.userCategory || item.payload.parsed.category,
                    amount: item.payload.parsed.transaction.amount,
                    merchant: item.payload.parsed.transaction.merchant || 'Unknown',
                    date: item.payload.parsed.transaction.date || new Date().toISOString().split('T')[0],
                    time: item.payload.parsed.transaction.time,
                    notes: item.payload.parsed.transaction.notes,
                };

                const expense = await SupabaseAPI.addPersonalExpense(sanitizedData);

                // If family sharing was requested
                if (item.familyId && expense) {
                    await SupabaseAPI.syncExpenseToFamily(expense.id, item.familyId);
                }
            } catch (error) {
                console.error('Error processing queue item:', error);
                // Add back to queue if failed
                setOfflineQueue(prev => [...prev, item]);
            }
        }

        setSyncing(false);
        setIsProcessing(false);
    };

    // Monitor network changes
    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            if (state.isConnected && offlineQueue.length > 0 && !isProcessing) {
                processOfflineQueue();
            }
        });

        return () => unsubscribe();
    }, [offlineQueue, user, isProcessing]);

    return {
        saveToSupabase,
        syncing,
        offlineQueue,
        processOfflineQueue,
    };
};
