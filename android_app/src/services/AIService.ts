/**
 * AI Service - Communicates with Node.js AI Backend
 * Sends user financial data and receives AI-generated insights
 */

const AI_BACKEND_URL = 'http://10.0.2.2:5000'; // Android emulator localhost
// For physical device, use your computer's IP: 'http://192.168.x.x:5000'
const TIMEOUT_MS = 15000; // 15 seconds timeout

export interface Alert {
    type: 'warning' | 'info' | 'success' | 'danger';
    title: string;
    message: string;
    icon: string;
    priority: 'high' | 'medium' | 'low';
    category: 'budget' | 'goal' | 'income' | 'expense' | 'general';
}

export interface Recommendation {
    category: 'savings' | 'spending' | 'goals' | 'income' | 'investment' | 'budget';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    potentialSavings: number | null;
    icon: string;
    actionable: boolean;
}

export interface RecommendationsSummary {
    totalIncome: number;
    totalExpenses: number;
    savingsRate: number;
    topSpendingCategory: string;
    monthlyAverage: number;
}

export interface RecommendationsResponse {
    summary: RecommendationsSummary;
    recommendations: Recommendation[];
    insights: string[];
}

/**
 * Get AI-generated alerts for home screen
 */
export const getAIAlerts = async (data: {
    expenses: any[];
    incomes: any[];
    goals: any[];
    budgets: any[];
    userId: string;
}): Promise<Alert[]> => {
    try {
        console.log('[AIService] Fetching alerts for user:', data.userId);
        console.log('[AIService] Data counts:', {
            expenses: data.expenses.length,
            incomes: data.incomes.length,
            goals: data.goals.length,
            budgets: data.budgets.length
        });

        const response = await Promise.race([
            fetch(`${AI_BACKEND_URL}/api/alerts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            }),
            new Promise<Response>((_, reject) =>
                setTimeout(() => reject(new Error('Request timed out')), TIMEOUT_MS)
            )
        ]);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || 'Failed to fetch alerts');
        }

        console.log('[AIService] Received alerts:', result.alerts.length);
        return result.alerts;

    } catch (error) {
        console.error('[AIService] Error fetching alerts:', error);

        // Return fallback alerts on error
        return [
            {
                type: 'info',
                title: 'AI Service Unavailable',
                message: 'Unable to generate personalized alerts. Please check your connection.',
                icon: '⚠️',
                priority: 'low',
                category: 'general'
            }
        ];
    }
};

/**
 * Get AI-generated recommendations
 */
export const getAIRecommendations = async (data: {
    expenses: any[];
    incomes: any[];
    goals: any[];
    budgets: any[];
    userId: string;
    userProfile?: any;
}): Promise<RecommendationsResponse> => {
    try {
        console.log('[AIService] Fetching recommendations for user:', data.userId);
        console.log('[AIService] Data counts:', {
            expenses: data.expenses.length,
            incomes: data.incomes.length,
            goals: data.goals.length,
            budgets: data.budgets.length
        });

        const response = await Promise.race([
            fetch(`${AI_BACKEND_URL}/api/recommendations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            }),
            new Promise<Response>((_, reject) =>
                setTimeout(() => reject(new Error('Request timed out')), TIMEOUT_MS)
            )
        ]);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || 'Failed to fetch recommendations');
        }

        console.log('[AIService] Received recommendations:', result.data.recommendations.length);
        return result.data;

    } catch (error) {
        console.error('[AIService] Error fetching recommendations:', error);

        // Return fallback recommendations on error
        return {
            summary: {
                totalIncome: 0,
                totalExpenses: 0,
                savingsRate: 0,
                topSpendingCategory: 'N/A',
                monthlyAverage: 0
            },
            recommendations: [
                {
                    category: 'general' as any,
                    title: 'AI Service Unavailable',
                    description: 'Unable to generate personalized recommendations. Please check your connection and try again.',
                    impact: 'low',
                    potentialSavings: null,
                    icon: '⚠️',
                    actionable: false
                }
            ],
            insights: [
                'AI service is currently unavailable',
                'Please check your internet connection',
                'Try again in a few moments'
            ]
        };
    }
};

/**
 * Check if AI backend is available
 */
export const checkAIBackendHealth = async (): Promise<boolean> => {
    try {
        const response = await Promise.race([
            fetch(`${AI_BACKEND_URL}/health`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            }),
            new Promise<Response>((_, reject) =>
                setTimeout(() => reject(new Error('Health check timed out')), 5000)
            )
        ]);

        return response.ok;
    } catch (error) {
        console.error('[AIService] Health check failed:', error);
        return false;
    }
};
