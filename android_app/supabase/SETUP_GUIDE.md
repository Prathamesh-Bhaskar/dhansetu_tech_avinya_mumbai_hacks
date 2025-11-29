# Supabase Setup Guide

## 🚀 Quick Start (5 Minutes)

### Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up (FREE - no credit card needed)
4. Click "New Project"
5. Fill in:
   - **Name**: `family-finance-app`
   - **Database Password**: (choose a strong password - save it!)
   - **Region**: Choose closest to you
6. Click "Create new project"
7. Wait 2 minutes for setup ⏳

### Step 2: Run Database Migrations

1. In Supabase Dashboard, go to **SQL Editor** (left sidebar)
2. Click "New query"
3. Copy and paste the contents of each SQL file in order:

#### Migration 1: Schema
```sql
-- Copy entire content from: supabase/migrations/01_schema.sql
-- Paste here and click "Run"
```

#### Migration 2: RLS Policies
```sql
-- Copy entire content from: supabase/migrations/02_rls_policies.sql
-- Paste here and click "Run"
```

#### Migration 3: Functions
```sql
-- Copy entire content from: supabase/migrations/03_functions.sql
-- Paste here and click "Run"
```

#### Migration 4: Triggers
```sql
-- Copy entire content from: supabase/migrations/04_triggers.sql
-- Paste here and click "Run"
```

✅ All migrations should run successfully!

### Step 3: Get API Keys

1. Go to **Settings** → **API** (left sidebar)
2. Copy these values:

```
Project URL: https://xxxxxxxxxxxxx.supabase.co
anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (keep secret!)
```

### Step 4: Configure React Native App

Create `.env` file in project root:

```bash
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 5: Install Dependencies

```bash
npm install @supabase/supabase-js react-native-url-polyfill
```

### Step 6: Enable Email Auth

1. Go to **Authentication** → **Providers** (left sidebar)
2. Enable **Email** provider
3. (Optional) Enable **Google** provider for social login

---

## 📊 Verify Setup

### Check Tables

1. Go to **Table Editor** (left sidebar)
2. You should see 11 tables:
   - ✅ users
   - ✅ personal_expenses
   - ✅ personal_incomes
   - ✅ personal_investments
   - ✅ personal_goals
   - ✅ families
   - ✅ family_members
   - ✅ family_invitations
   - ✅ shared_expenses
   - ✅ shared_incomes
   - ✅ shared_goals

### Check Functions

1. Go to **Database** → **Functions** (left sidebar)
2. You should see 7 functions:
   - ✅ create_family
   - ✅ generate_invite
   - ✅ join_family
   - ✅ sync_expense_to_family
   - ✅ unsync_expense_from_family
   - ✅ leave_family
   - ✅ get_user_families

### Check RLS Policies

1. Go to **Authentication** → **Policies** (left sidebar)
2. Each table should have policies enabled

---

## 🧪 Test with Postman

### Get JWT Token (for testing)

1. Create a test user in **Authentication** → **Users**
2. Or use the app to register
3. Get JWT token from app or use Supabase client

### Example API Calls

#### Create Personal Expense
```bash
POST https://YOUR_PROJECT.supabase.co/rest/v1/personal_expenses
Headers:
  apikey: YOUR_ANON_KEY
  Authorization: Bearer USER_JWT_TOKEN
  Content-Type: application/json
  Prefer: return=representation
Body:
{
  "user_id": "USER_UUID",
  "category": "food",
  "amount": 500,
  "date": "2024-11-25",
  "merchant": "Amazon"
}
```

#### Create Family
```bash
POST https://YOUR_PROJECT.supabase.co/rest/v1/rpc/create_family
Headers:
  apikey: YOUR_ANON_KEY
  Authorization: Bearer USER_JWT_TOKEN
  Content-Type: application/json
Body:
{
  "family_name": "Khilari Family"
}
```

#### Generate Invite
```bash
POST https://YOUR_PROJECT.supabase.co/rest/v1/rpc/generate_invite
Headers:
  apikey: YOUR_ANON_KEY
  Authorization: Bearer USER_JWT_TOKEN
  Content-Type: application/json
Body:
{
  "p_family_id": "FAMILY_UUID",
  "expires_in_days": 7
}
```

---

## 🔒 Security Checklist

- ✅ RLS enabled on all tables
- ✅ Personal data only accessible by owner
- ✅ Family data only accessible by members
- ✅ Invite codes expire after 7 days
- ✅ Auto-sync triggers in place
- ✅ JWT authentication required for all operations

---

## 📱 Next Steps

1. ✅ Supabase project created
2. ✅ Database migrations run
3. ✅ API keys copied
4. ⏭️ Configure React Native app (next phase)
5. ⏭️ Build UI screens
6. ⏭️ Test end-to-end

---

## 🆘 Troubleshooting

### "relation does not exist" error
- Run migrations in correct order (01 → 02 → 03 → 04)

### "permission denied" error
- Check RLS policies are enabled
- Verify JWT token is valid
- Check user_id matches authenticated user

### "function does not exist" error
- Run 03_functions.sql migration
- Check function names match exactly

---

## 💰 Cost

**FREE Tier Limits**:
- ✅ 500MB database storage
- ✅ Unlimited API requests
- ✅ Unlimited auth users
- ✅ Real-time subscriptions included

**Perfect for hackathon and beyond!** 🎉
