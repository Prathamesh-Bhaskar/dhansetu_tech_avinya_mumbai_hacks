import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'AI Backend is running',
    timestamp: new Date().toISOString()
  });
});

// ============================================
// ALERTS API - For Home Screen
// ============================================
app.post('/api/alerts', async (req, res) => {
  try {
    const { expenses, incomes, goals, budgets, userId } = req.body;

    console.log('[ALERTS] Received request for user:', userId);
    console.log('[ALERTS] Data:', {
      expenses: expenses?.length || 0,
      incomes: incomes?.length || 0,
      goals: goals?.length || 0,
      budgets: budgets?.length || 0
    });

    // Validate input
    if (!expenses || !incomes || !goals || !budgets) {
      return res.status(400).json({
        success: false,
        error: 'Missing required data: expenses, incomes, goals, budgets'
      });
    }

    // Prepare data summary for Gemini
    const dataSummary = prepareDataSummary(expenses, incomes, goals, budgets);

    // System prompt for alerts
    const systemPrompt = `You are a personal financial advisor AI assistant for an Indian family finance management app. 
Your role is to analyze user's financial data and provide actionable alerts and reminders.

IMPORTANT GUIDELINES:
1. Use Indian Rupee (₹) for all amounts
2. Be concise and actionable
3. Focus on immediate concerns and upcoming deadlines
4. Provide 3-5 most important alerts only
5. Use a friendly but professional tone
6. Consider Indian financial context (school fees, festivals, etc.)

ALERT TYPES:
- "warning": Budget overruns, shortfalls, overspending
- "info": General reminders, tips, patterns
- "success": Achievements, positive trends, savings milestones
- "danger": Critical issues requiring immediate attention

PRIORITY LEVELS:
- "high": Urgent matters (overdue bills, critical shortfalls)
- "medium": Important but not urgent (approaching deadlines)
- "low": General tips and observations

Return ONLY a valid JSON array with this exact structure:
[
  {
    "type": "warning|info|success|danger",
    "title": "Short descriptive title",
    "message": "Clear, actionable message in 1-2 sentences",
    "icon": "appropriate emoji",
    "priority": "high|medium|low",
    "category": "budget|goal|income|expense|general"
  }
]

Do not include any markdown, explanations, or text outside the JSON array.`;

    const userPrompt = `Analyze this financial data and generate 3-5 personalized alerts:

${dataSummary}

Current Date: ${new Date().toLocaleDateString('en-IN')}

Generate alerts focusing on:
1. Budget status and potential overruns
2. Goal progress and deadlines
3. Unusual spending patterns
4. Income changes or opportunities
5. Upcoming financial obligations

Return ONLY the JSON array, nothing else.`;

    // Call Gemini API
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 2048,
      }
    });

    const result = await model.generateContent([
      { text: systemPrompt },
      { text: userPrompt }
    ]);

    const response = await result.response;
    let alertsText = response.text();
    
    console.log('[ALERTS] Raw Gemini response:', alertsText);

    // Clean up response - remove markdown code blocks if present
    alertsText = alertsText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Parse JSON response
    let alerts;
    try {
      alerts = JSON.parse(alertsText);
    } catch (parseError) {
      console.error('[ALERTS] JSON parse error:', parseError);
      console.error('[ALERTS] Failed text:', alertsText);
      
      // Fallback to default alerts
      alerts = generateFallbackAlerts(expenses, budgets, goals);
    }

    // Validate and limit alerts
    if (!Array.isArray(alerts)) {
      alerts = [alerts];
    }
    alerts = alerts.slice(0, 5); // Max 5 alerts

    console.log('[ALERTS] Generated alerts:', alerts.length);

    res.json({
      success: true,
      alerts,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[ALERTS] Error:', error);
    // Fallback to local logic if AI fails (e.g. quota exceeded)
    const fallbackAlerts = generateFallbackAlerts(req.body.expenses, req.body.budgets, req.body.goals);
    
    // Return success with fallback alerts so frontend displays them
    res.json({
      success: true, 
      isFallback: true,
      error: error.message,
      alerts: fallbackAlerts,
      timestamp: new Date().toISOString()
    });
  }
});

// ============================================
// RECOMMENDATIONS API - For Recommendations Tab
// ============================================
app.post('/api/recommendations', async (req, res) => {
  try {
    const { expenses, incomes, goals, budgets, userId, userProfile } = req.body;

    console.log('[RECOMMENDATIONS] Received request for user:', userId);
    console.log('[RECOMMENDATIONS] Data:', {
      expenses: expenses?.length || 0,
      incomes: incomes?.length || 0,
      goals: goals?.length || 0,
      budgets: budgets?.length || 0
    });

    // Validate input
    if (!expenses || !incomes || !goals || !budgets) {
      return res.status(400).json({
        success: false,
        error: 'Missing required data: expenses, incomes, goals, budgets'
      });
    }

    // Prepare comprehensive data summary
    const dataSummary = prepareDataSummary(expenses, incomes, goals, budgets);
    const historicalInsights = analyzeHistoricalData(expenses, incomes);

    // System prompt for recommendations
    const systemPrompt = `You are an expert personal financial advisor AI for an Indian family finance management app.
Your role is to provide personalized, actionable financial recommendations based on historical data and patterns.

IMPORTANT GUIDELINES:
1. Use Indian Rupee (₹) for all amounts
2. Provide specific, actionable recommendations
3. Consider Indian financial context and culture
4. Focus on long-term financial health
5. Be encouraging and supportive
6. Provide 5-8 diverse recommendations

RECOMMENDATION CATEGORIES:
- "savings": Tips to save more money
- "spending": Optimize spending patterns
- "goals": Goal achievement strategies
- "income": Income optimization ideas
- "investment": Safe investment suggestions (keep it simple)
- "budget": Budget optimization

Return ONLY a valid JSON object with this exact structure:
{
  "summary": {
    "totalIncome": number,
    "totalExpenses": number,
    "savingsRate": number,
    "topSpendingCategory": "string",
    "monthlyAverage": number
  },
  "recommendations": [
    {
      "category": "savings|spending|goals|income|investment|budget",
      "title": "Short actionable title",
      "description": "Detailed recommendation in 2-3 sentences",
      "impact": "high|medium|low",
      "potentialSavings": number or null,
      "icon": "appropriate emoji",
      "actionable": true
    }
  ],
  "insights": [
    "Key insight 1",
    "Key insight 2",
    "Key insight 3"
  ]
}

Do not include any markdown, explanations, or text outside the JSON object.`;

    const userPrompt = `Analyze this comprehensive financial data and generate personalized recommendations:

${dataSummary}

HISTORICAL INSIGHTS:
${historicalInsights}

Current Date: ${new Date().toLocaleDateString('en-IN')}

Generate recommendations focusing on:
1. Spending optimization based on patterns
2. Goal achievement strategies
3. Budget improvements
4. Savings opportunities
5. Income diversification ideas
6. Financial habit improvements

Return ONLY the JSON object, nothing else.`;

    // Call Gemini API
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.8,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 4096,
      }
    });

    const result = await model.generateContent([
      { text: systemPrompt },
      { text: userPrompt }
    ]);

    const response = await result.response;
    let recommendationsText = response.text();
    
    console.log('[RECOMMENDATIONS] Raw Gemini response:', recommendationsText.substring(0, 200) + '...');

    // Clean up response
    recommendationsText = recommendationsText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Parse JSON response
    let recommendationsData;
    try {
      recommendationsData = JSON.parse(recommendationsText);
    } catch (parseError) {
      console.error('[RECOMMENDATIONS] JSON parse error:', parseError);
      console.error('[RECOMMENDATIONS] Failed text:', recommendationsText.substring(0, 500));
      
      // Fallback to default recommendations
      recommendationsData = generateFallbackRecommendations(expenses, incomes, goals, budgets);
    }

    console.log('[RECOMMENDATIONS] Generated recommendations:', recommendationsData.recommendations?.length || 0);

    res.json({
      success: true,
      data: recommendationsData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[RECOMMENDATIONS] Error:', error);
    // Fallback to local logic if AI fails
    const fallbackData = generateFallbackRecommendations(req.body.expenses, req.body.incomes, req.body.goals, req.body.budgets);
    
    // Return success with fallback data so frontend displays them
    res.json({
      success: true,
      isFallback: true,
      error: error.message,
      data: fallbackData,
      timestamp: new Date().toISOString()
    });
  }
});

// ============================================
// HELPER FUNCTIONS
// ============================================

function prepareDataSummary(expenses, incomes, goals, budgets) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Calculate totals
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
  const totalBudget = budgets.reduce((sum, b) => sum + b.budget.amount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);

  // Category breakdown
  const categoryTotals = {};
  expenses.forEach(e => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  // Goals summary
  const activeGoals = goals.filter(g => g.status === 'active');
  const goalsSummary = activeGoals.map(g => ({
    name: g.goal_name,
    target: g.target_amount,
    saved: g.saved_amount,
    progress: ((g.saved_amount / g.target_amount) * 100).toFixed(1),
    deadline: g.deadline
  }));

  // Budget status
  const budgetStatus = budgets.map(b => ({
    category: b.budget.category,
    allocated: b.budget.amount,
    spent: b.spent,
    remaining: b.remaining,
    percentage: b.percentage.toFixed(1),
    status: b.status
  }));

  return `
FINANCIAL SUMMARY:
- Total Income (this period): ₹${totalIncome.toLocaleString('en-IN')}
- Total Expenses (this period): ₹${totalExpenses.toLocaleString('en-IN')}
- Net Savings: ₹${(totalIncome - totalExpenses).toLocaleString('en-IN')}
- Savings Rate: ${totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1) : 0}%

EXPENSE BREAKDOWN BY CATEGORY:
${Object.entries(categoryTotals)
  .sort((a, b) => b[1] - a[1])
  .map(([cat, amt]) => `- ${cat}: ₹${amt.toLocaleString('en-IN')} (${totalExpenses > 0 ? ((amt / totalExpenses) * 100).toFixed(1) : 0}%)`)
  .join('\n')}

BUDGET STATUS:
${budgetStatus.map(b => 
  `- ${b.category}: ₹${b.spent.toLocaleString('en-IN')} / ₹${b.allocated.toLocaleString('en-IN')} (${b.percentage}% used) - ${b.status.toUpperCase()}`
).join('\n')}

ACTIVE GOALS (${activeGoals.length}):
${goalsSummary.map(g => 
  `- ${g.name}: ₹${g.saved.toLocaleString('en-IN')} / ₹${g.target.toLocaleString('en-IN')} (${g.progress}% complete)${g.deadline ? ` - Due: ${new Date(g.deadline).toLocaleDateString('en-IN')}` : ''}`
).join('\n')}

RECENT TRANSACTIONS (Last 5):
${expenses.slice(0, 5).map(e => 
  `- ${e.date}: ${e.category} - ₹${e.amount.toLocaleString('en-IN')}${e.merchant ? ` at ${e.merchant}` : ''}`
).join('\n')}
`;
}

function analyzeHistoricalData(expenses, incomes) {
  // Group by month
  const monthlyData = {};
  
  expenses.forEach(e => {
    const month = e.date.substring(0, 7); // YYYY-MM
    if (!monthlyData[month]) {
      monthlyData[month] = { expenses: 0, income: 0, categories: {} };
    }
    monthlyData[month].expenses += e.amount;
    monthlyData[month].categories[e.category] = (monthlyData[month].categories[e.category] || 0) + e.amount;
  });

  incomes.forEach(i => {
    const month = i.date.substring(0, 7);
    if (!monthlyData[month]) {
      monthlyData[month] = { expenses: 0, income: 0, categories: {} };
    }
    monthlyData[month].income += i.amount;
  });

  const months = Object.keys(monthlyData).sort();
  const recentMonths = months.slice(-3); // Last 3 months

  let insights = `HISTORICAL TRENDS (Last ${recentMonths.length} months):\n`;
  
  recentMonths.forEach(month => {
    const data = monthlyData[month];
    const topCategory = Object.entries(data.categories).sort((a, b) => b[1] - a[1])[0];
    insights += `- ${month}: Income ₹${data.income.toLocaleString('en-IN')}, Expenses ₹${data.expenses.toLocaleString('en-IN')}, Top Category: ${topCategory ? topCategory[0] : 'N/A'}\n`;
  });

  return insights;
}

function generateFallbackAlerts(expenses = [], budgets = [], goals = []) {
  const alerts = [];

  // Budget alert
  if (budgets.length > 0) {
    const overBudget = budgets.filter(b => b.percentage > 90);
    if (overBudget.length > 0) {
      alerts.push({
        type: 'warning',
        title: 'Budget Alert',
        message: `You've used ${overBudget[0].percentage.toFixed(0)}% of your ${overBudget[0].budget.category} budget`,
        icon: '⚠️',
        priority: 'high',
        category: 'budget'
      });
    }
  }

  // Goal reminder
  if (goals.length > 0) {
    const activeGoal = goals.find(g => g.status === 'active');
    if (activeGoal) {
      const progress = (activeGoal.saved_amount / activeGoal.target_amount * 100).toFixed(0);
      alerts.push({
        type: 'info',
        title: 'Goal Progress',
        message: `Your ${activeGoal.goal_name} is ${progress}% complete. Keep going!`,
        icon: '🎯',
        priority: 'medium',
        category: 'goal'
      });
    }
  }

  // Spending insight
  if (expenses.length > 0) {
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    alerts.push({
      type: 'info',
      title: 'Spending Summary',
      message: `You've spent ₹${total.toLocaleString('en-IN')} this period`,
      icon: '💰',
      priority: 'low',
      category: 'expense'
    });
  }

  return alerts.length > 0 ? alerts : [{
    type: 'info',
    title: 'Welcome',
    message: 'Start tracking your expenses to get personalized insights',
    icon: '👋',
    priority: 'low',
    category: 'general'
  }];
}

function generateFallbackRecommendations(expenses = [], incomes = [], goals = [], budgets = []) {
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);

  return {
    summary: {
      totalIncome,
      totalExpenses,
      savingsRate: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100) : 0,
      topSpendingCategory: 'general',
      monthlyAverage: totalExpenses
    },
    recommendations: [
      {
        category: 'savings',
        title: 'Start an Emergency Fund',
        description: 'Build an emergency fund covering 3-6 months of expenses for financial security.',
        impact: 'high',
        potentialSavings: null,
        icon: '🛡️',
        actionable: true
      },
      {
        category: 'budget',
        title: 'Track Your Spending',
        description: 'Continue logging all expenses to identify patterns and opportunities to save.',
        impact: 'medium',
        potentialSavings: null,
        icon: '📊',
        actionable: true
      },
      {
        category: 'goals',
        title: 'Set Financial Goals',
        description: 'Define clear financial goals with deadlines to stay motivated and focused.',
        impact: 'medium',
        potentialSavings: null,
        icon: '🎯',
        actionable: true
      }
    ],
    insights: [
      'Keep tracking your expenses regularly',
      'Set up budgets for different categories',
      'Review your spending patterns monthly'
    ]
  };
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AI Backend server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🤖 Gemini API: ${process.env.GEMINI_API_KEY ? 'Configured ✓' : 'Missing ✗'}`);
});
