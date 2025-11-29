# AI Backend - Postman/cURL Test Commands

## 1. Health Check

### cURL
```bash
curl http://localhost:5000/health
```

### Postman
```
Method: GET
URL: http://localhost:5000/health
```

**Expected Response:**
```json
{
  "status": "OK",
  "message": "AI Backend is running",
  "timestamp": "2025-11-29T03:49:47.000Z"
}
```

---

## 2. Get AI Alerts

### cURL (Windows PowerShell)
```powershell
curl -X POST http://localhost:5000/api/alerts `
  -H "Content-Type: application/json" `
  -d '{
    "userId": "test-user-123",
    "expenses": [
      {
        "id": "1",
        "user_id": "test-user-123",
        "category": "food",
        "amount": 8500,
        "merchant": "Restaurant",
        "date": "2025-11-25",
        "notes": "Dining out"
      },
      {
        "id": "2",
        "user_id": "test-user-123",
        "category": "transport",
        "amount": 3000,
        "merchant": "Uber",
        "date": "2025-11-26",
        "notes": "Cab fare"
      },
      {
        "id": "3",
        "user_id": "test-user-123",
        "category": "shopping",
        "amount": 12000,
        "merchant": "Amazon",
        "date": "2025-11-27",
        "notes": "Electronics"
      }
    ],
    "incomes": [
      {
        "id": "1",
        "user_id": "test-user-123",
        "source": "Salary",
        "amount": 50000,
        "date": "2025-11-01",
        "notes": "Monthly salary"
      }
    ],
    "goals": [
      {
        "id": "1",
        "user_id": "test-user-123",
        "goal_name": "Emergency Fund",
        "target_amount": 100000,
        "saved_amount": 25000,
        "deadline": "2025-12-31",
        "status": "active",
        "progress": 25
      },
      {
        "id": "2",
        "user_id": "test-user-123",
        "goal_name": "Vacation",
        "target_amount": 50000,
        "saved_amount": 10000,
        "deadline": "2025-06-30",
        "status": "active",
        "progress": 20
      }
    ],
    "budgets": [
      {
        "budget": {
          "id": "1",
          "user_id": "test-user-123",
          "category": "food",
          "amount": 10000,
          "month": 11,
          "year": 2025
        },
        "spent": 8500,
        "remaining": 1500,
        "percentage": 85,
        "status": "warning"
      },
      {
        "budget": {
          "id": "2",
          "user_id": "test-user-123",
          "category": "transport",
          "amount": 5000,
          "month": 11,
          "year": 2025
        },
        "spent": 3000,
        "remaining": 2000,
        "percentage": 60,
        "status": "safe"
      },
      {
        "budget": {
          "id": "3",
          "user_id": "test-user-123",
          "category": "shopping",
          "amount": 15000,
          "month": 11,
          "year": 2025
        },
        "spent": 12000,
        "remaining": 3000,
        "percentage": 80,
        "status": "warning"
      }
    ]
  }'
```

### cURL (Linux/Mac)
```bash
curl -X POST http://localhost:5000/api/alerts \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "expenses": [
      {
        "id": "1",
        "user_id": "test-user-123",
        "category": "food",
        "amount": 8500,
        "merchant": "Restaurant",
        "date": "2025-11-25"
      }
    ],
    "incomes": [
      {
        "id": "1",
        "user_id": "test-user-123",
        "source": "Salary",
        "amount": 50000,
        "date": "2025-11-01"
      }
    ],
    "goals": [
      {
        "id": "1",
        "user_id": "test-user-123",
        "goal_name": "Emergency Fund",
        "target_amount": 100000,
        "saved_amount": 25000,
        "status": "active"
      }
    ],
    "budgets": [
      {
        "budget": {
          "category": "food",
          "amount": 10000
        },
        "spent": 8500,
        "percentage": 85,
        "status": "warning"
      }
    ]
  }'
```

### Using test-data.json file
```bash
curl -X POST http://localhost:5000/api/alerts \
  -H "Content-Type: application/json" \
  -d @ai-backend/test-data.json
```

### Postman
```
Method: POST
URL: http://localhost:5000/api/alerts
Headers:
  Content-Type: application/json

Body (raw JSON):
{
  "userId": "test-user-123",
  "expenses": [
    {
      "id": "1",
      "user_id": "test-user-123",
      "category": "food",
      "amount": 8500,
      "merchant": "Restaurant",
      "date": "2025-11-25",
      "notes": "Dining out"
    },
    {
      "id": "2",
      "user_id": "test-user-123",
      "category": "transport",
      "amount": 3000,
      "merchant": "Uber",
      "date": "2025-11-26",
      "notes": "Cab fare"
    }
  ],
  "incomes": [
    {
      "id": "1",
      "user_id": "test-user-123",
      "source": "Salary",
      "amount": 50000,
      "date": "2025-11-01"
    }
  ],
  "goals": [
    {
      "id": "1",
      "user_id": "test-user-123",
      "goal_name": "Emergency Fund",
      "target_amount": 100000,
      "saved_amount": 25000,
      "deadline": "2025-12-31",
      "status": "active"
    }
  ],
  "budgets": [
    {
      "budget": {
        "id": "1",
        "category": "food",
        "amount": 10000,
        "month": 11,
        "year": 2025
      },
      "spent": 8500,
      "remaining": 1500,
      "percentage": 85,
      "status": "warning"
    }
  ]
}
```

**Expected Response:**
```json
{
  "success": true,
  "alerts": [
    {
      "type": "warning",
      "title": "Food Budget Alert",
      "message": "You've used 85% of your food budget this month",
      "icon": "⚠️",
      "priority": "high",
      "category": "budget"
    },
    {
      "type": "info",
      "title": "Emergency Fund Progress",
      "message": "You're 25% towards your Emergency Fund goal. Keep going!",
      "icon": "🎯",
      "priority": "medium",
      "category": "goal"
    }
  ],
  "timestamp": "2025-11-29T03:49:47.000Z"
}
```

---

## 3. Get AI Recommendations

### cURL (Windows PowerShell)
```powershell
curl -X POST http://localhost:5000/api/recommendations `
  -H "Content-Type: application/json" `
  -d '{
    "userId": "test-user-123",
    "expenses": [
      {
        "category": "food",
        "amount": 8500,
        "date": "2025-11-25"
      },
      {
        "category": "transport",
        "amount": 3000,
        "date": "2025-11-26"
      },
      {
        "category": "shopping",
        "amount": 12000,
        "date": "2025-11-27"
      },
      {
        "category": "food",
        "amount": 4500,
        "date": "2025-10-20"
      },
      {
        "category": "bills",
        "amount": 5000,
        "date": "2025-10-15"
      }
    ],
    "incomes": [
      {
        "source": "Salary",
        "amount": 50000,
        "date": "2025-11-01"
      },
      {
        "source": "Salary",
        "amount": 50000,
        "date": "2025-10-01"
      }
    ],
    "goals": [
      {
        "goal_name": "Emergency Fund",
        "target_amount": 100000,
        "saved_amount": 25000,
        "status": "active"
      }
    ],
    "budgets": [
      {
        "budget": {
          "category": "food",
          "amount": 10000
        },
        "spent": 8500,
        "percentage": 85,
        "status": "warning"
      }
    ]
  }'
```

### Postman
```
Method: POST
URL: http://localhost:5000/api/recommendations
Headers:
  Content-Type: application/json

Body (raw JSON):
{
  "userId": "test-user-123",
  "expenses": [
    {
      "category": "food",
      "amount": 8500,
      "date": "2025-11-25"
    },
    {
      "category": "transport",
      "amount": 3000,
      "date": "2025-11-26"
    },
    {
      "category": "shopping",
      "amount": 12000,
      "date": "2025-11-27"
    }
  ],
  "incomes": [
    {
      "source": "Salary",
      "amount": 50000,
      "date": "2025-11-01"
    }
  ],
  "goals": [
    {
      "goal_name": "Emergency Fund",
      "target_amount": 100000,
      "saved_amount": 25000,
      "status": "active"
    }
  ],
  "budgets": [
    {
      "budget": {
        "category": "food",
        "amount": 10000
      },
      "spent": 8500,
      "percentage": 85,
      "status": "warning"
    }
  ]
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalIncome": 50000,
      "totalExpenses": 23500,
      "savingsRate": 53,
      "topSpendingCategory": "shopping",
      "monthlyAverage": 23500
    },
    "recommendations": [
      {
        "category": "spending",
        "title": "Reduce Dining Expenses",
        "description": "Your food spending is at 85% of budget. Consider cooking at home more often to save ₹2,000-3,000 per month.",
        "impact": "high",
        "potentialSavings": 2500,
        "icon": "🍳",
        "actionable": true
      },
      {
        "category": "savings",
        "title": "Increase Emergency Fund Contributions",
        "description": "You're making good progress on your Emergency Fund. Consider increasing monthly contributions by ₹5,000 to reach your goal faster.",
        "impact": "medium",
        "potentialSavings": null,
        "icon": "🛡️",
        "actionable": true
      }
    ],
    "insights": [
      "Your savings rate of 53% is excellent!",
      "Shopping is your highest expense category",
      "Consider setting a budget for shopping to control spending"
    ]
  },
  "timestamp": "2025-11-29T03:49:47.000Z"
}
```

---

## Postman Collection Import

### Create Collection
1. Open Postman
2. Click "Import" → "Raw text"
3. Paste the JSON below:

```json
{
  "info": {
    "name": "AI Backend - Financial Insights",
    "description": "API endpoints for AI-powered financial alerts and recommendations",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://localhost:5000/health",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["health"]
        }
      }
    },
    {
      "name": "Get AI Alerts",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"userId\": \"test-user-123\",\n  \"expenses\": [\n    {\n      \"id\": \"1\",\n      \"user_id\": \"test-user-123\",\n      \"category\": \"food\",\n      \"amount\": 8500,\n      \"merchant\": \"Restaurant\",\n      \"date\": \"2025-11-25\"\n    }\n  ],\n  \"incomes\": [\n    {\n      \"id\": \"1\",\n      \"source\": \"Salary\",\n      \"amount\": 50000,\n      \"date\": \"2025-11-01\"\n    }\n  ],\n  \"goals\": [\n    {\n      \"id\": \"1\",\n      \"goal_name\": \"Emergency Fund\",\n      \"target_amount\": 100000,\n      \"saved_amount\": 25000,\n      \"status\": \"active\"\n    }\n  ],\n  \"budgets\": [\n    {\n      \"budget\": {\n        \"category\": \"food\",\n        \"amount\": 10000\n      },\n      \"spent\": 8500,\n      \"percentage\": 85,\n      \"status\": \"warning\"\n    }\n  ]\n}"
        },
        "url": {
          "raw": "http://localhost:5000/api/alerts",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "alerts"]
        }
      }
    },
    {
      "name": "Get AI Recommendations",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"userId\": \"test-user-123\",\n  \"expenses\": [\n    {\n      \"category\": \"food\",\n      \"amount\": 8500,\n      \"date\": \"2025-11-25\"\n    },\n    {\n      \"category\": \"shopping\",\n      \"amount\": 12000,\n      \"date\": \"2025-11-27\"\n    }\n  ],\n  \"incomes\": [\n    {\n      \"source\": \"Salary\",\n      \"amount\": 50000,\n      \"date\": \"2025-11-01\"\n    }\n  ],\n  \"goals\": [\n    {\n      \"goal_name\": \"Emergency Fund\",\n      \"target_amount\": 100000,\n      \"saved_amount\": 25000,\n      \"status\": \"active\"\n    }\n  ],\n  \"budgets\": [\n    {\n      \"budget\": {\n        \"category\": \"food\",\n        \"amount\": 10000\n      },\n      \"spent\": 8500,\n      \"percentage\": 85,\n      \"status\": \"warning\"\n    }\n  ]\n}"
        },
        "url": {
          "raw": "http://localhost:5000/api/recommendations",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "recommendations"]
        }
      }
    }
  ]
}
```

---

## Quick Test Commands

### Test All Endpoints (Windows)
```powershell
# Health Check
curl http://localhost:5000/health

# Alerts (using test file)
curl -X POST http://localhost:5000/api/alerts -H "Content-Type: application/json" -d "@ai-backend/test-data.json"

# Recommendations (using test file)
curl -X POST http://localhost:5000/api/recommendations -H "Content-Type: application/json" -d "@ai-backend/test-data.json"
```

### Test All Endpoints (Linux/Mac)
```bash
# Health Check
curl http://localhost:5000/health

# Alerts
curl -X POST http://localhost:5000/api/alerts \
  -H "Content-Type: application/json" \
  -d @ai-backend/test-data.json

# Recommendations
curl -X POST http://localhost:5000/api/recommendations \
  -H "Content-Type: application/json" \
  -d @ai-backend/test-data.json
```

---

## Expected Backend Logs

When you run these tests, you should see in the backend terminal:

```
[2025-11-29T03:49:47.123Z] GET /health
[2025-11-29T03:49:50.456Z] POST /api/alerts
[ALERTS] Received request for user: test-user-123
[ALERTS] Data: { expenses: 3, incomes: 1, goals: 2, budgets: 3 }
[ALERTS] Raw Gemini response: [{"type":"warning",...}]
[ALERTS] Generated alerts: 3

[2025-11-29T03:49:55.789Z] POST /api/recommendations
[RECOMMENDATIONS] Received request for user: test-user-123
[RECOMMENDATIONS] Data: { expenses: 3, incomes: 1, goals: 1, budgets: 1 }
[RECOMMENDATIONS] Raw Gemini response: {"summary":{...},...}
[RECOMMENDATIONS] Generated recommendations: 5
```

---

## Troubleshooting

### Error: Connection refused
- Backend not running → Run `node server.js` in ai-backend directory

### Error: 400 Bad Request
- Missing required fields → Check request body has all required fields

### Error: 500 Internal Server Error
- Check backend logs for Gemini API errors
- Verify GEMINI_API_KEY in .env file

### No response / Timeout
- Gemini API might be slow (first call takes 5-10 seconds)
- Check internet connection
- Verify API key is valid
