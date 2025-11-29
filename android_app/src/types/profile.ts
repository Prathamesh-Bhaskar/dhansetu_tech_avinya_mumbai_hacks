// ============================================
// USER PROFILE TYPES
// For Personalized Onboarding & AI Features
// ============================================

export interface UserProfile {
    id: string;
    user_id: string;

    // Personal Info
    full_name?: string;
    age?: number;
    occupation?: 'salaried' | 'business' | 'freelancer' | 'student' | 'retired' | 'other';
    city?: string;
    family_size?: number;

    // Financial Profile
    monthly_income?: number;
    income_sources?: string[];
    fixed_expenses?: number;
    disposable_income?: number; // Auto-calculated

    // Spending Behavior
    top_categories?: string[];
    shopping_frequency?: 'daily' | 'weekly' | 'monthly' | 'occasionally';
    typical_purchase_size?: 'small' | 'medium' | 'large';

    // Goals & Priorities
    short_term_goals?: string[];
    medium_term_goals?: string[];
    long_term_goals?: string[];
    financial_priority?: 'saving' | 'debt' | 'investing' | 'spending' | 'wealth';

    // AI Preferences
    ai_personalization_level?: 'maximum' | 'balanced' | 'minimal';
    smart_categorization?: boolean;
    spending_predictions?: boolean;
    budget_recommendations?: boolean;
    goal_optimization?: boolean;
    anomaly_detection?: boolean;
    personalized_insights?: boolean;

    // Metadata
    onboarding_completed?: boolean;
    onboarding_completed_at?: string;
    profile_completeness?: number; // 0-100%

    created_at?: string;
    updated_at?: string;
}

export interface CreateProfileInput {
    // Personal Info
    full_name?: string;
    age?: number;
    occupation?: string;
    city?: string;
    family_size?: number;

    // Financial Profile
    monthly_income?: number;
    income_sources?: string[];
    fixed_expenses?: number;

    // Spending Behavior
    top_categories?: string[];
    shopping_frequency?: string;
    typical_purchase_size?: string;

    // Goals & Priorities
    short_term_goals?: string[];
    medium_term_goals?: string[];
    long_term_goals?: string[];
    financial_priority?: string;

    // AI Preferences
    ai_personalization_level?: string;
    smart_categorization?: boolean;
    spending_predictions?: boolean;
    budget_recommendations?: boolean;
    goal_optimization?: boolean;
    anomaly_detection?: boolean;
    personalized_insights?: boolean;
}

export interface UpdateProfileInput extends Partial<CreateProfileInput> { }

// Occupation options
export const OCCUPATION_OPTIONS = [
    { value: 'salaried', label: 'Salaried Employee' },
    { value: 'business', label: 'Business Owner' },
    { value: 'freelancer', label: 'Freelancer' },
    { value: 'student', label: 'Student' },
    { value: 'retired', label: 'Retired' },
    { value: 'other', label: 'Other' },
];

// Income source options
export const INCOME_SOURCE_OPTIONS = [
    { value: 'salary', label: 'Salary' },
    { value: 'business', label: 'Business' },
    { value: 'investments', label: 'Investments' },
    { value: 'rental', label: 'Rental Income' },
    { value: 'freelance', label: 'Freelance' },
    { value: 'other', label: 'Other' },
];

// Shopping frequency options
export const SHOPPING_FREQUENCY_OPTIONS = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'occasionally', label: 'Occasionally' },
];

// Purchase size options
export const PURCHASE_SIZE_OPTIONS = [
    { value: 'small', label: 'Small (< ₹500)' },
    { value: 'medium', label: 'Medium (₹500 - ₹5,000)' },
    { value: 'large', label: 'Large (> ₹5,000)' },
];

// Financial priority options
export const FINANCIAL_PRIORITY_OPTIONS = [
    { value: 'saving', label: 'Saving More' },
    { value: 'debt', label: 'Reducing Debt' },
    { value: 'investing', label: 'Investing Better' },
    { value: 'spending', label: 'Controlling Spending' },
    { value: 'wealth', label: 'Building Wealth' },
];

// AI personalization level options
export const AI_PERSONALIZATION_OPTIONS = [
    {
        value: 'maximum',
        label: 'Maximum Personalization',
        description: 'AI analyzes all data, proactive suggestions, smart automation',
        icon: '🚀'
    },
    {
        value: 'balanced',
        label: 'Balanced',
        description: 'Basic AI insights, manual confirmations, privacy-first',
        icon: '📊'
    },
    {
        value: 'minimal',
        label: 'Minimal',
        description: 'No AI analysis, manual tracking only, maximum privacy',
        icon: '🔒'
    },
];

// Goal options
export const SHORT_TERM_GOAL_OPTIONS = [
    'Emergency Fund',
    'Gadget/Electronics',
    'Vacation',
    'Debt Repayment',
];

export const MEDIUM_TERM_GOAL_OPTIONS = [
    'Home Appliances',
    'Vehicle',
    'Education',
    'Wedding',
];

export const LONG_TERM_GOAL_OPTIONS = [
    'House/Property',
    'Retirement',
    "Child's Education",
    'Business',
];
