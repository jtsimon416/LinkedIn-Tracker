# Quick Start Guide - LinkedIn Token Tracker

## Step-by-Step Setup (10 minutes)

### 1. Database Setup in Supabase

1. **Go to**: https://supabase.com/dashboard
2. **Select your project**: `sduufemakisrzuzrghdt`
3. **Click**: SQL Editor (left sidebar)
4. **Copy & Paste**: The entire contents of `database-setup.sql`
5. **Click**: Run (or press Ctrl/Cmd + Enter)
6. **Enable pg_cron**:
   - Go to Database > Extensions
   - Search for "pg_cron"
   - Click Enable

### 2. Update LinkedIn Credentials

In the SQL Editor, run this for EACH of your 3 accounts:

```sql
UPDATE public.linkedin_accounts
SET
    linkedin_username = 'your_real_email@example.com',
    linkedin_password = 'your_real_password',
    remaining_tokens = 320,
    next_refresh_date = '2025-12-01'
WHERE name = 'Tech Sourcing Account';
```

### 3. Create Your Admin User

**Method 1: Via Supabase Dashboard (Easiest)**
1. Go to Authentication > Users
2. Click "Add User" > "Create new user"
3. Enter email and password
4. After creation, click on the user
5. Scroll to "User Metadata" > Click Edit
6. Add this JSON:
```json
{
  "full_name": "Your Name",
  "is_admin": true
}
```
7. Save

**Method 2: Via SQL**
```sql
-- First create the user in Authentication > Users, then:
UPDATE auth.users
SET raw_user_meta_data = '{"is_admin": true, "full_name": "Your Name"}'::jsonb
WHERE email = 'your_email@example.com';
```

### 4. Create Regular Users (Recruiters)

Same as above, but use this JSON (no is_admin field):
```json
{
  "full_name": "Recruiter Name"
}
```

### 5. Run the Application

```bash
cd linkedin-token-tracker
npm install
npm run dev
```

Open: http://localhost:5173

### 6. Test It Works

1. **Login** with your admin account
2. **Dashboard**: You should see 3 account cards
3. **Check In**: Click "Check In" on an available account
4. **Credentials**: LinkedIn credentials should appear
5. **Open another browser** (or incognito window)
6. **Login** as a different user
7. **Verify**: The account you checked in shows as "In Use" in the other browser **instantly**

---

## SQL Commands You'll Need

### View All Accounts
```sql
SELECT name, remaining_tokens, status, current_user_name
FROM public.linkedin_accounts;
```

### View Usage Logs
```sql
SELECT timestamp, recruiter_name, account_name, action, tokens_used
FROM public.usage_log
ORDER BY timestamp DESC
LIMIT 20;
```

### Manually Replenish Tokens (Test)
```sql
SELECT replenish_monthly_tokens();
```

### Check Cron Job Status
```sql
SELECT * FROM cron.job WHERE jobname = 'monthly-token-replenishment';
```

### Force Check Out an Account
```sql
UPDATE public.linkedin_accounts
SET status = 'available', current_user_name = NULL, current_user_id = NULL
WHERE name = 'Tech Sourcing Account';
```

---

## Troubleshooting

**Problem**: Can't see the accounts
- **Solution**: Check you ran `database-setup.sql` completely
- **Check**: Run `SELECT * FROM public.linkedin_accounts;` in SQL Editor

**Problem**: Real-time not working
- **Solution**: Go to Database > Replication
- **Enable**: Make sure `linkedin_accounts` is enabled for replication

**Problem**: Not an admin
- **Solution**: Check user metadata has `"is_admin": true`
- **Check**: Authentication > Users > Click user > User Metadata

**Problem**: Can't log out
- **Expected**: This is a feature! Check out from all accounts first

---

## Default Logins

After you create users, you can log in with:
- **Email**: The email you set in Supabase Auth
- **Password**: The password you set in Supabase Auth

---

## What's Next?

1. Read [SETUP.md](./SETUP.md) for detailed configuration
2. Read [README.md](./README.md) for full documentation
3. Deploy to production (see SETUP.md)

---

**Need help?** Check the Troubleshooting section in SETUP.md
