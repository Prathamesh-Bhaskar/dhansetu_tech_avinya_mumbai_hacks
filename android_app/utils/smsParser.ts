// SMS Parser Utility for DhanSetu
// Extracts structured financial transaction data from bank SMS messages

import { suggestCategory } from './categories';

export interface ParsedSMS {
    id: string;
    rawSMS: string;
    sender: string;
    timestamp: string;

    parsed: {
        category: 'bank_account' | 'credit_card' | 'upi' | 'wallet' | 'unknown';
        provider: string;
        accountType?: string;
        accountNumber?: string;
        userCategory?: string;  // NEW: User-selected category

        transaction: {
            type: 'debit' | 'credit' | 'spent' | 'payment' | 'refund' | 'sent' | 'received' | 'unknown';
            amount: number;
            currency: string;
            merchant?: string;
            date: string;
            time?: string;
            dateSource: 'sms_content' | 'sms_timestamp';
            notes?: string;  // NEW: User notes
        };

        balance?: {
            available: number;
            type: 'current' | 'available_credit';
        };
    };

    metadata: {
        parseSuccess: boolean;
        confidence: number;
        needsReview: boolean;
        missingFields: string[];  // NEW: List of missing fields
        suggestedCategory?: string;  // NEW: AI-suggested category ID
        requiresUserInput: boolean;  // NEW: Whether user input is needed
        isFinancial: boolean;  // NEW: Whether SMS is financial transaction
    };
}

// Bank/Provider identification patterns
const BANK_IDENTIFIERS: { [key: string]: string[] } = {
    'HDFC': ['HDFCBK', 'HD-HDFCBK', 'HDFC'],
    'SBI': ['SBI', 'SBMSMS', 'SBIINB'],
    'ICICI': ['ICICIB', 'ICICI', 'iMobile'],
    'AXIS': ['AXIS', 'AXISBK'],
    'KOTAK': ['KOTAK', 'KMBL'],
    'PNB': ['PNBSMS', 'PNB'],
    'BOB': ['BOBSMS', 'BOB'],
    'PAYTM': ['PYTM', 'PAYTM'],
    'GPAY': ['GPAY', 'Google Pay'],
    'PHONEPE': ['PHONEPE', 'PhonePe'],
    'AMAZONPAY': ['AMAZON', 'AZNPAY'],
};

// Financial keywords that indicate a transaction SMS
const FINANCIAL_KEYWORDS = [
    'debited', 'credited', 'debit', 'credit',
    'spent', 'paid', 'payment', 'received', 'sent',
    'account', 'a/c', 'card',
    'upi', 'transaction', 'txn',
    'balance', 'avl bal', 'available',
    'emi', 'loan', 'refund',
];

// OTP and non-financial keywords to exclude
const NON_FINANCIAL_KEYWORDS = [
    'otp', 'one time password', 'verification code',
    'verify', 'code is', 'pin is',
    'do not share', 'expires in',
    'promotional', 'offer', 'discount',
    'congratulations', 'winner',
];

// Check if SMS is a financial transaction
export function isFinancialSMS(text: string, sender: string): boolean {
    const lowerText = text.toLowerCase();
    const upperSender = sender.toUpperCase();

    // Check 1: Is sender a known bank/financial service?
    const isKnownBank = Object.values(BANK_IDENTIFIERS).some(identifiers =>
        identifiers.some(id => upperSender.includes(id))
    );

    // Check 2: Contains OTP or non-financial keywords?
    const hasNonFinancialKeywords = NON_FINANCIAL_KEYWORDS.some(keyword =>
        lowerText.includes(keyword)
    );

    // If contains OTP keywords, definitely not financial
    if (hasNonFinancialKeywords) {
        return false;
    }

    // Check 3: Contains financial keywords?
    const hasFinancialKeywords = FINANCIAL_KEYWORDS.some(keyword =>
        lowerText.includes(keyword)
    );

    // Check 4: Contains amount (Rs, INR, ₹)?
    const hasAmount = /(?:Rs\.?|INR|₹)\s*\d+/i.test(text);

    // Financial if: (known bank OR has financial keywords) AND has amount
    return (isKnownBank || hasFinancialKeywords) && hasAmount;
}

// Detect bank/provider from sender
function detectProvider(sender: string): string {
    const upperSender = sender.toUpperCase();

    for (const [bank, identifiers] of Object.entries(BANK_IDENTIFIERS)) {
        if (identifiers.some(id => upperSender.includes(id))) {
            return bank;
        }
    }

    return 'UNKNOWN';
}

// Extract amount from text
function extractAmount(text: string): number | null {
    // Patterns: Rs.500, Rs 500.00, INR 500, ₹500
    const amountPatterns = [
        /(?:Rs\.?|INR|₹)\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i,
        /(\d+(?:,\d+)*(?:\.\d{2})?)\s*(?:Rs\.?|INR|₹)/i,
    ];

    for (const pattern of amountPatterns) {
        const match = text.match(pattern);
        if (match) {
            // Remove commas and parse
            return parseFloat(match[1].replace(/,/g, ''));
        }
    }

    return null;
}

// Extract date from text and convert to YYYY-MM-DD format
function extractDate(text: string): { date: string; time?: string } | null {
    const monthMap: { [key: string]: string } = {
        'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04',
        'may': '05', 'jun': '06', 'jul': '07', 'aug': '08',
        'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
    };

    // Pattern 1: 24-Nov-24 or 24-Nov-2024
    const pattern1 = /(\d{1,2})-([A-Za-z]{3})-(\d{2,4})/;
    const match1 = text.match(pattern1);
    if (match1) {
        const day = match1[1].padStart(2, '0');
        const month = monthMap[match1[2].toLowerCase()] || '01';
        let year = match1[3];

        // Convert 2-digit year to 4-digit (assume current century)
        if (year.length === 2) {
            const currentYear = new Date().getFullYear();
            const century = Math.floor(currentYear / 100) * 100;
            year = (century + parseInt(year)).toString();
        }

        return { date: `${year}-${month}-${day}` };
    }

    // Pattern 2: 24/11/2024 or 24/11/24
    const pattern2 = /(\d{1,2})\/(\d{1,2})\/(\d{2,4})/;
    const match2 = text.match(pattern2);
    if (match2) {
        const day = match2[1].padStart(2, '0');
        const month = match2[2].padStart(2, '0');
        let year = match2[3];

        if (year.length === 2) {
            const currentYear = new Date().getFullYear();
            const century = Math.floor(currentYear / 100) * 100;
            year = (century + parseInt(year)).toString();
        }

        return { date: `${year}-${month}-${day}` };
    }

    // Pattern 3: 24-11-24 or 24-11-2024
    const pattern3 = /(\d{1,2})-(\d{1,2})-(\d{2,4})/;
    const match3 = text.match(pattern3);
    if (match3) {
        const day = match3[1].padStart(2, '0');
        const month = match3[2].padStart(2, '0');
        let year = match3[3];

        if (year.length === 2) {
            const currentYear = new Date().getFullYear();
            const century = Math.floor(currentYear / 100) * 100;
            year = (century + parseInt(year)).toString();
        }

        return { date: `${year}-${month}-${day}` };
    }

    // Pattern 4: on 24Nov
    const pattern4 = /on\s+(\d{1,2})([A-Za-z]{3})/i;
    const match4 = text.match(pattern4);
    if (match4) {
        const day = match4[1].padStart(2, '0');
        const month = monthMap[match4[2].toLowerCase()] || '01';
        const year = new Date().getFullYear().toString();

        return { date: `${year}-${month}-${day}` };
    }

    // Try to extract time
    const timeMatch = text.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
    if (timeMatch) {
        // If only time found, use today's date
        const today = new Date();
        const year = today.getFullYear();
        const month = (today.getMonth() + 1).toString().padStart(2, '0');
        const day = today.getDate().toString().padStart(2, '0');
        return { date: `${year}-${month}-${day}`, time: timeMatch[0] };
    }

    return null;
}

// Extract account number
function extractAccount(text: string): string | null {
    // Patterns: A/c XX1234, Card XX1234, a/c xx5678
    const accountPatterns = [
        /(?:A\/c|a\/c|Card|card)\s*[xX]*(\d{4,})/,
        /(?:account|Account)\s*(?:no\.?|number)?\s*[xX]*(\d{4,})/i,
    ];

    for (const pattern of accountPatterns) {
        const match = text.match(pattern);
        if (match) {
            return match[1];
        }
    }

    return null;
}

// Extract balance
function extractBalance(text: string): number | null {
    // Patterns: Avl Bal: Rs.10000, Balance: 5000
    const balancePatterns = [
        /(?:Avl\.?\s*Bal|Balance|bal)[:.]?\s*(?:Rs\.?|INR|₹)?\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i,
    ];

    for (const pattern of balancePatterns) {
        const match = text.match(pattern);
        if (match) {
            return parseFloat(match[1].replace(/,/g, ''));
        }
    }

    return null;
}

// Determine transaction type
function determineTransactionType(text: string): string {
    const lowerText = text.toLowerCase();

    if (lowerText.includes('debited') || lowerText.includes('debit')) return 'debit';
    if (lowerText.includes('credited') || lowerText.includes('credit')) return 'credit';
    if (lowerText.includes('spent')) return 'spent';
    if (lowerText.includes('payment') || lowerText.includes('paid')) return 'payment';
    if (lowerText.includes('refund')) return 'refund';
    if (lowerText.includes('sent')) return 'sent';
    if (lowerText.includes('received')) return 'received';

    return 'unknown';
}

// Determine category
function determineCategory(text: string, provider: string): string {
    const lowerText = text.toLowerCase();

    if (lowerText.includes('card') && (lowerText.includes('spent') || lowerText.includes('payment'))) {
        return 'credit_card';
    }

    if (lowerText.includes('upi') || provider === 'GPAY' || provider === 'PHONEPE') {
        return 'upi';
    }

    if (provider === 'PAYTM' || provider === 'AMAZONPAY') {
        return 'wallet';
    }

    if (lowerText.includes('a/c') || lowerText.includes('account')) {
        return 'bank_account';
    }

    return 'unknown';
}

// Extract merchant name (for credit card transactions)
function extractMerchant(text: string): string | null {
    // Pattern: at MERCHANT_NAME on/at
    const merchantPatterns = [
        /at\s+([A-Z][A-Za-z0-9\s&]+?)(?:\s+on|\s+at|\.|$)/,
        /on\s+([A-Z][A-Za-z0-9\s&]+?)(?:\s+on|\s+at|\.|$)/,
    ];

    for (const pattern of merchantPatterns) {
        const match = text.match(pattern);
        if (match) {
            return match[1].trim();
        }
    }

    return null;
}

// Main parser function
export function parseSMS(
    rawSMS: string,
    sender: string,
    timestamp: number
): ParsedSMS {
    const provider = detectProvider(sender);
    const category = determineCategory(rawSMS, provider);
    const transactionType = determineTransactionType(rawSMS);
    const amount = extractAmount(rawSMS);
    const dateInfo = extractDate(rawSMS);
    const account = extractAccount(rawSMS);
    const balance = extractBalance(rawSMS);
    const merchant = extractMerchant(rawSMS);

    // Determine if parsing was successful
    const parseSuccess = amount !== null && transactionType !== 'unknown';

    // Calculate confidence score
    let confidence = 0;
    if (amount !== null) confidence += 0.4;
    if (transactionType !== 'unknown') confidence += 0.3;
    if (dateInfo !== null) confidence += 0.1;
    if (account !== null) confidence += 0.1;
    if (provider !== 'UNKNOWN') confidence += 0.1;

    // Fallback date to SMS timestamp if not found in message
    const smsDate = new Date(timestamp);
    const finalDate = dateInfo?.date || smsDate.toISOString().split('T')[0];
    const finalTime = dateInfo?.time || smsDate.toTimeString().split(' ')[0];
    const dateSource = dateInfo?.date ? 'sms_content' : 'sms_timestamp';

    // Suggest category based on merchant/content
    const suggestedCategoryId = suggestCategory(rawSMS, merchant || undefined);

    // Detect missing fields
    const missingFields: string[] = [];
    if (!merchant && (category === 'credit_card' || category === 'upi')) {
        missingFields.push('merchant');
    }
    if (!suggestedCategoryId) {
        missingFields.push('category');
    }

    // Determine if user input is required
    const requiresUserInput = confidence < 0.7 || missingFields.length > 0;

    return {
        id: `${timestamp}-${Math.random().toString(36).substr(2, 9)}`,
        rawSMS,
        sender,
        timestamp: smsDate.toISOString(),

        parsed: {
            category: category as any,
            provider,
            accountType: category === 'credit_card' ? 'credit_card' : category === 'bank_account' ? 'savings' : undefined,
            accountNumber: account || undefined,

            transaction: {
                type: transactionType as any,
                amount: amount || 0,
                currency: 'INR',
                merchant: merchant || undefined,
                date: finalDate,
                time: finalTime,
                dateSource: dateSource as any,
            },

            balance: balance !== null ? {
                available: balance,
                type: category === 'credit_card' ? 'available_credit' : 'current',
            } : undefined,
        },

        metadata: {
            parseSuccess,
            confidence: Math.round(confidence * 100) / 100,
            needsReview: confidence < 0.7,
            missingFields,
            suggestedCategory: suggestedCategoryId,
            requiresUserInput,
            isFinancial: isFinancialSMS(rawSMS, sender),
        },
    };
}

// Test cases for validation
export const TEST_SMS_SAMPLES = [
    {
        name: 'HDFC Bank Debit',
        sms: 'Rs.500.00 debited from A/c XX1234 on 24-Nov-24. Avl Bal: Rs.10000.00',
        sender: 'HDFCBK',
    },
    {
        name: 'SBI Credit',
        sms: 'INR 2000 credited to a/c xx5678 on 24-11-2024',
        sender: 'SBIINB',
    },
    {
        name: 'ICICI Credit Card',
        sms: 'Rs 1500 spent on ICICI Card XX9012 at Amazon on 24-Nov-24',
        sender: 'ICICIB',
    },
    {
        name: 'Google Pay UPI',
        sms: 'Rs.300 sent via Google Pay to John on 24-Nov-24',
        sender: 'GPAY',
    },
    {
        name: 'Edge Case - No Date',
        sms: 'Rs.750 debited from A/c XX3456',
        sender: 'HDFCBK',
    },
    {
        name: 'Axis Bank Debit',
        sms: 'Dear Customer, Rs.1200 has been debited from your account XX7890 on 24/11/2024. Available balance: Rs.25000',
        sender: 'AXISBK',
    },
    {
        name: 'PhonePe Payment',
        sms: 'Rs.450 paid to Swiggy via PhonePe UPI on 24-Nov-24',
        sender: 'PHONEPE',
    },
];
