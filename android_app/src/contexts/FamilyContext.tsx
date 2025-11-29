import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import * as SupabaseAPI from '../services/SupabaseAPI';
import type { Family, FamilyMember, SharedExpense } from '../config/supabase';

interface FamilyContextType {
    currentFamily: Family | null;
    families: any[];
    familyMembers: any[];
    sharedExpenses: any[];
    loading: boolean;
    createFamily: (familyName: string) => Promise<string>;
    joinFamily: (inviteCode: string) => Promise<string>;
    generateInvite: (expiresInDays?: number) => Promise<string>;
    leaveFamily: () => Promise<void>;
    refreshFamilyData: () => Promise<void>;
    setCurrentFamilyId: (familyId: string | null) => void;
}

export const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

export const FamilyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [currentFamily, setCurrentFamily] = useState<Family | null>(null);
    const [families, setFamilies] = useState<any[]>([]);
    const [familyMembers, setFamilyMembers] = useState<any[]>([]);
    const [sharedExpenses, setSharedExpenses] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Load user's families
    useEffect(() => {
        if (user) {
            loadFamilies();
        } else {
            setFamilies([]);
            setCurrentFamily(null);
        }
    }, [user]);

    // Subscribe to real-time updates when family changes
    useEffect(() => {
        if (!currentFamily) return;

        // Subscribe to shared expenses
        const expensesSubscription = SupabaseAPI.subscribeToSharedExpenses(
            currentFamily.id,
            (payload) => {
                console.log('Shared expense change:', payload);
                loadSharedExpenses();
            }
        );

        // Subscribe to family members
        const membersSubscription = SupabaseAPI.subscribeToFamilyMembers(
            currentFamily.id,
            (payload) => {
                console.log('Family member change:', payload);
                loadFamilyMembers();
            }
        );

        // Load initial data
        loadFamilyMembers();
        loadSharedExpenses();

        return () => {
            expensesSubscription.unsubscribe();
            membersSubscription.unsubscribe();
        };
    }, [currentFamily]);

    const loadFamilies = async () => {
        try {
            setLoading(true);
            const data = await SupabaseAPI.getUserFamilies();
            setFamilies(data || []);

            // Set first family as current if none selected
            if (data && data.length > 0 && !currentFamily) {
                // Get full family data
                const firstFamilyId = data[0].family_id;
                setCurrentFamily({
                    id: firstFamilyId,
                    family_name: data[0].family_name,
                    created_by: user?.id || '',
                    created_at: data[0].created_at,
                });
            }
        } catch (error) {
            console.error('Error loading families:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadFamilyMembers = async () => {
        if (!currentFamily) return;

        try {
            const data = await SupabaseAPI.getFamilyMembers(currentFamily.id);
            setFamilyMembers(data || []);
        } catch (error) {
            console.error('Error loading family members:', error);
        }
    };

    const loadSharedExpenses = async () => {
        if (!currentFamily) return;

        try {
            const data = await SupabaseAPI.getSharedExpenses(currentFamily.id);
            setSharedExpenses(data || []);
        } catch (error) {
            console.error('Error loading shared expenses:', error);
        }
    };

    const createFamily = async (familyName: string): Promise<string> => {
        try {
            setLoading(true);
            const familyId = await SupabaseAPI.createFamily(familyName);
            await loadFamilies();
            return familyId;
        } catch (error: any) {
            throw new Error(error.message || 'Failed to create family');
        } finally {
            setLoading(false);
        }
    };

    const joinFamily = async (inviteCode: string): Promise<string> => {
        try {
            setLoading(true);
            const familyId = await SupabaseAPI.joinFamily(inviteCode);
            await loadFamilies();
            return familyId;
        } catch (error: any) {
            throw new Error(error.message || 'Failed to join family');
        } finally {
            setLoading(false);
        }
    };

    const generateInvite = async (expiresInDays: number = 7): Promise<string> => {
        if (!currentFamily) {
            throw new Error('No family selected');
        }

        try {
            const inviteCode = await SupabaseAPI.generateInvite(currentFamily.id, expiresInDays);
            return inviteCode;
        } catch (error: any) {
            throw new Error(error.message || 'Failed to generate invite');
        }
    };

    const leaveFamily = async (): Promise<void> => {
        if (!currentFamily) {
            throw new Error('No family selected');
        }

        try {
            setLoading(true);
            await SupabaseAPI.leaveFamily(currentFamily.id);
            setCurrentFamily(null);
            await loadFamilies();
        } catch (error: any) {
            throw new Error(error.message || 'Failed to leave family');
        } finally {
            setLoading(false);
        }
    };

    const refreshFamilyData = async () => {
        await loadFamilies();
        await loadFamilyMembers();
        await loadSharedExpenses();
    };

    const setCurrentFamilyId = (familyId: string | null) => {
        if (!familyId) {
            setCurrentFamily(null);
            return;
        }

        const family = families.find(f => f.family_id === familyId);
        if (family) {
            setCurrentFamily({
                id: family.family_id,
                family_name: family.family_name,
                created_by: user?.id || '',
                created_at: family.created_at,
            });
        }
    };

    return (
        <FamilyContext.Provider
            value={{
                currentFamily,
                families,
                familyMembers,
                sharedExpenses,
                loading,
                createFamily,
                joinFamily,
                generateInvite,
                leaveFamily,
                refreshFamilyData,
                setCurrentFamilyId,
            }}>
            {children}
        </FamilyContext.Provider>
    );
};

export const useFamily = () => {
    const context = useContext(FamilyContext);
    if (context === undefined) {
        throw new Error('useFamily must be used within a FamilyProvider');
    }
    return context;
};
