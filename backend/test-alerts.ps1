# Test AI Backend Alerts Endpoint
# Run this in PowerShell from the ai-backend directory

Write-Host "Testing AI Backend - Alerts API" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "1. Testing Health Check..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:5000/health" -Method GET
    Write-Host "✓ Health Check Passed" -ForegroundColor Green
    Write-Host "  Status: $($health.status)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "✗ Health Check Failed: $_" -ForegroundColor Red
    Write-Host "  Make sure backend is running: node server.js" -ForegroundColor Yellow
    exit 1
}

# Test 2: Alerts API
Write-Host "2. Testing Alerts API..." -ForegroundColor Yellow

$testData = @{
    userId = "test-user-123"
    expenses = @(
        @{
            id = "1"
            user_id = "test-user-123"
            category = "food"
            amount = 8500
            merchant = "Restaurant"
            date = "2025-11-25"
            notes = "Dining out"
        },
        @{
            id = "2"
            user_id = "test-user-123"
            category = "transport"
            amount = 3000
            merchant = "Uber"
            date = "2025-11-26"
            notes = "Cab fare"
        },
        @{
            id = "3"
            user_id = "test-user-123"
            category = "shopping"
            amount = 12000
            merchant = "Amazon"
            date = "2025-11-27"
            notes = "Electronics"
        }
    )
    incomes = @(
        @{
            id = "1"
            user_id = "test-user-123"
            source = "Salary"
            amount = 50000
            date = "2025-11-01"
            notes = "Monthly salary"
        }
    )
    goals = @(
        @{
            id = "1"
            user_id = "test-user-123"
            goal_name = "Emergency Fund"
            target_amount = 100000
            saved_amount = 25000
            deadline = "2025-12-31"
            status = "active"
            progress = 25
        }
    )
    budgets = @(
        @{
            budget = @{
                id = "1"
                user_id = "test-user-123"
                category = "food"
                amount = 10000
                month = 11
                year = 2025
            }
            spent = 8500
            remaining = 1500
            percentage = 85
            status = "warning"
        },
        @{
            budget = @{
                id = "2"
                user_id = "test-user-123"
                category = "transport"
                amount = 5000
                month = 11
                year = 2025
            }
            spent = 3000
            remaining = 2000
            percentage = 60
            status = "safe"
        }
    )
}

$json = $testData | ConvertTo-Json -Depth 10

try {
    Write-Host "  Sending request to /api/alerts..." -ForegroundColor Gray
    Write-Host "  (This may take 5-10 seconds for Gemini AI to respond)" -ForegroundColor Gray
    
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/alerts" `
        -Method POST `
        -ContentType "application/json" `
        -Body $json
    
    Write-Host "✓ Alerts API Passed" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Received $($response.alerts.Count) alerts:" -ForegroundColor Cyan
    
    foreach ($alert in $response.alerts) {
        Write-Host ""
        Write-Host "  $($alert.icon) $($alert.title)" -ForegroundColor White
        Write-Host "     Type: $($alert.type) | Priority: $($alert.priority)" -ForegroundColor Gray
        Write-Host "     Message: $($alert.message)" -ForegroundColor Gray
    }
    
    Write-Host ""
    Write-Host "✓ All tests passed!" -ForegroundColor Green
    
} catch {
    Write-Host "✗ Alerts API Failed: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "  Check backend logs for errors" -ForegroundColor Yellow
    exit 1
}
