# ai-backend

Small Express service that proxies chat messages to OpenAI's Chat Completions API.

Usage:

1. Install dependencies:

```powershell
cd ai-backend; npm install
```

2. Set your OpenAI API key and start the server:

```powershell
$env:OPENAI_API_KEY = 'sk-...'; npm start
```

3. POST to `/chat` with JSON `{ "message": "Hello" }` or `{ "messages": [{"role":"user","content":"Hi"}] }`.

Notes:
- For Android emulator use `http://10.0.2.2:3001/chat` from the app.
- For iOS simulator use `http://localhost:3001/chat`.
# AI Backend Service

AI-powered financial insights backend using Google Gemini Flash 2.5 for the SMSReaderApp2 Android application.

## Features

- **AI Alerts API**: Generates personalized financial alerts and reminders
- **AI Recommendations API**: Provides comprehensive financial recommendations based on user history
- **Gemini Flash 2.5 Integration**: Powered by Google's latest AI model
- **Supabase Data Integration**: Works with user's financial data from Supabase

## Architecture

```
Android App (React Native)
    ↓
Fetch data from Supabase
    ↓
Send to Node.js Backend
    ↓
Process with Gemini AI
    ↓
Return insights to App
```

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

The `.env` file is already configured with:
- Gemini API Key
- Supabase credentials (for reference)
- Server port (5000)

### 3. Start Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server will run on: `http://localhost:5000`

## API Endpoints

### 1. Health Check
```
GET /health
```

Returns server status and configuration.

### 2. Get AI Alerts
```
POST /api/alerts
```

**Request Body:**
```json
{
  "userId": "user-uuid",
  "expenses": [...],
  "incomes": [...],
  "goals": [...],
  "budgets": [...]
}
```

**Response:**
```json
{
  "success": true,
  "alerts": [
    {
      "type": "warning|info|success|danger",
      "title": "Alert Title",
      "message": "Alert message",
      "icon": "emoji",
      "priority": "high|medium|low",
      "category": "budget|goal|income|expense|general"
    }
  ],
  "timestamp": "2025-11-29T..."
}
```

### 3. Get AI Recommendations
```
POST /api/recommendations
```

**Request Body:**
```json
{
  "userId": "user-uuid",
  "expenses": [...],
  "incomes": [...],
  "goals": [...],
  "budgets": [...],
  "userProfile": {...}
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalIncome": 50000,
      "totalExpenses": 35000,
      "savingsRate": 30,
      "topSpendingCategory": "food",
      "monthlyAverage": 35000
    },
    "recommendations": [
      {
        "category": "savings|spending|goals|income|investment|budget",
        "title": "Recommendation Title",
        "description": "Detailed recommendation",
        "impact": "high|medium|low",
        "potentialSavings": 5000,
        "icon": "emoji",
        "actionable": true
      }
    ],
    "insights": [
      "Key insight 1",
      "Key insight 2"
    ]
  },
  "timestamp": "2025-11-29T..."
}
```

## Android App Integration

### Update AIService.ts

For Android Emulator:
```typescript
const AI_BACKEND_URL = 'http://10.0.2.2:5000';
```

For Physical Device:
```typescript
const AI_BACKEND_URL = 'http://YOUR_COMPUTER_IP:5000';
```

Find your IP:
- Windows: `ipconfig` (look for IPv4 Address)
- Mac/Linux: `ifconfig` or `ip addr`

### Usage in Android App

```typescript
import * as AIService from '../../services/AIService';

// Fetch alerts
const alerts = await AIService.getAIAlerts({
  expenses,
  incomes,
  goals,
  budgets,
  userId
});

// Fetch recommendations
const recommendations = await AIService.getAIRecommendations({
  expenses,
  incomes,
  goals,
  budgets,
  userId
});
```

## System Prompts

### Alerts Prompt
- Focuses on immediate concerns and actionable insights
- Considers Indian financial context
- Returns 3-5 most important alerts
- Prioritizes based on urgency

### Recommendations Prompt
- Provides comprehensive financial advice
- Analyzes historical patterns
- Suggests specific, actionable improvements
- Returns 5-8 diverse recommendations

## Error Handling

- Fallback alerts/recommendations on API failure
- Graceful degradation if Gemini API is unavailable
- Comprehensive error logging
- JSON parsing error recovery

## Development

### Testing Endpoints

```bash
# Health check
curl http://localhost:5000/health

# Test alerts (with sample data)
curl -X POST http://localhost:5000/api/alerts \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","expenses":[],"incomes":[],"goals":[],"budgets":[]}'
```

### Logs

Server logs all requests and responses for debugging:
- `[ALERTS]` - Alerts API logs
- `[RECOMMENDATIONS]` - Recommendations API logs

## Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Use a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start server.js --name ai-backend
   ```
3. Configure reverse proxy (nginx/Apache)
4. Enable HTTPS
5. Set up monitoring and logging

## Troubleshooting

### Android can't connect to backend

1. **Emulator**: Use `http://10.0.2.2:5000`
2. **Physical device**: 
   - Ensure device and computer are on same network
   - Use computer's IP address
   - Check firewall settings

### Gemini API errors

- Check API key is valid
- Verify API quota/limits
- Check internet connection
- Review error logs

### JSON parsing errors

- Check Gemini response format
- Fallback mechanisms will activate automatically
- Review system prompts if persistent

## License

ISC
