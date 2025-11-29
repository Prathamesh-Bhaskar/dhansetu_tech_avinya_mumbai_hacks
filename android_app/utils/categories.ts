// Transaction Categories System for DhanSetu

export interface Category {
    id: string;
    name: string;
    icon: string;
    keywords: string[];
}

export const TRANSACTION_CATEGORIES: Category[] = [
    {
        id: 'food',
        name: 'Food & Dining',
        icon: '🍔',
        keywords: ['swiggy', 'zomato', 'dominos', 'pizza', 'restaurant', 'food', 'cafe', 'starbucks', 'mcdonald'],
    },
    {
        id: 'shopping',
        name: 'Shopping',
        icon: '🛒',
        keywords: ['amazon', 'flipkart', 'myntra', 'ajio', 'shopping', 'mall', 'store', 'retail'],
    },
    {
        id: 'healthcare',
        name: 'Healthcare',
        icon: '💊',
        keywords: ['hospital', 'doctor', 'pharmacy', 'medical', 'health', 'clinic', 'apollo', 'medicine'],
    },
    {
        id: 'transport',
        name: 'Transportation',
        icon: '🚗',
        keywords: ['uber', 'ola', 'rapido', 'fuel', 'petrol', 'diesel', 'taxi', 'auto', 'metro', 'bus'],
    },
    {
        id: 'cash',
        name: 'Cash/ATM',
        icon: '💵',
        keywords: ['atm', 'cash', 'withdrawal'],
    },
    {
        id: 'bills',
        name: 'Bills & Utilities',
        icon: '🏦',
        keywords: ['electricity', 'water', 'gas', 'bill', 'utility', 'broadband', 'internet', 'wifi'],
    },
    {
        id: 'entertainment',
        name: 'Entertainment',
        icon: '🎬',
        keywords: ['movie', 'cinema', 'netflix', 'prime', 'hotstar', 'spotify', 'game', 'entertainment'],
    },
    {
        id: 'rent',
        name: 'Rent/EMI',
        icon: '🏠',
        keywords: ['rent', 'emi', 'loan', 'mortgage', 'housing'],
    },
    {
        id: 'education',
        name: 'Education',
        icon: '📚',
        keywords: ['school', 'college', 'university', 'course', 'education', 'tuition', 'fees'],
    },
    {
        id: 'travel',
        name: 'Travel',
        icon: '✈️',
        keywords: ['flight', 'hotel', 'booking', 'travel', 'vacation', 'trip', 'makemytrip', 'goibibo'],
    },
    {
        id: 'business',
        name: 'Business',
        icon: '💼',
        keywords: ['business', 'office', 'work', 'professional'],
    },
    {
        id: 'gifts',
        name: 'Gifts',
        icon: '🎁',
        keywords: ['gift', 'present', 'donation'],
    },
    {
        id: 'recharge',
        name: 'Recharge',
        icon: '📱',
        keywords: ['recharge', 'mobile', 'prepaid', 'postpaid', 'dth'],
    },
    {
        id: 'investment',
        name: 'Investment',
        icon: '💰',
        keywords: ['investment', 'mutual fund', 'stock', 'sip', 'trading', 'zerodha', 'groww'],
    },
    {
        id: 'transfer',
        name: 'Transfer',
        icon: '🔄',
        keywords: ['transfer', 'sent', 'received', 'upi'],
    },
    {
        id: 'goal',
        name: 'Goal',
        icon: '🎯',
        keywords: ['goal', 'saving', 'savings'],
    },
    {
        id: 'other',
        name: 'Other',
        icon: '📝',
        keywords: [],
    },
];

// Suggest category based on merchant name or SMS content
export function suggestCategory(text: string, merchant?: string): string | undefined {
    const searchText = `${text} ${merchant || ''}`.toLowerCase();

    for (const category of TRANSACTION_CATEGORIES) {
        for (const keyword of category.keywords) {
            if (searchText.includes(keyword)) {
                return category.id;
            }
        }
    }

    return undefined;
}

// Get category by ID
export function getCategoryById(id: string): Category | undefined {
    return TRANSACTION_CATEGORIES.find(cat => cat.id === id);
}

// Get category name
export function getCategoryName(id: string): string {
    const category = getCategoryById(id);
    return category ? category.name : 'Other';
}

// Get category icon
export function getCategoryIcon(id: string): string {
    const category = getCategoryById(id);
    return category ? category.icon : '📝';
}
