# LinkedIn Token Tracker - Complete Setup Guide

This guide will walk you through setting up your LinkedIn Token Tracker application from start to finish.

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works fine)
- Your Supabase project credentials (already configured in this project)

## Step 1: Database Setup in Supabase

### 1.1 Access Supabase SQL Editor

1. Log in to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project: `sduufemakisrzuzrghdt`
3. Click on the **SQL Editor** icon in the left sidebar

### 1.2 Run the Database Setup Script

1. Open the `database-setup.sql` file from this project
2. Copy the **entire contents** of the file
3. Paste it into the Supabase SQL Editor
4. Click **Run** (or press Ctrl/Cmd + Enter)

This script will:
- Create the `linkedin_accounts` table
- Create the `usage_log` table
- Enable Row Level Security (RLS)
- Set up RLS policies
- Enable Realtime subscriptions
- Create the automated token replenishment function
- Schedule the monthly cron job
- Insert 3 sample LinkedIn accounts
- Create performance indexes

### 1.3 Enable pg_cron Extension

The automated monthly token replenishment requires the `pg_cron` extension:

1. Go to **Database** > **Extensions** in your Supabase dashboard
2. Search for "pg_cron"
3. Click **Enable** next to pg_cron
4. Wait for it to activate (takes a few seconds)

### 1.4 Update LinkedIn Account Credentials

**IMPORTANT**: The sample accounts have placeholder credentials. You must update them:

1. In the SQL Editor, run this query to see your accounts:
```sql
SELECT id, name, linkedin_username FROM public.linkedin_accounts;
```

2. Update each account with your real LinkedIn credentials:
```sql
UPDATE public.linkedin_accounts
SET
    linkedin_username = 'your_real_email@example.com',
    linkedin_password = 'your_real_password',
    remaining_tokens = 320,  -- Set your starting token count
    next_refresh_date = '2025-12-01'  -- Set your first refresh date
WHERE name = 'Tech Sourcing Account';
```

Repeat for all 3 accounts with your actual credentials.

## Step 2: Create Your First Admin User

You need at least one admin user to access the Admin Panel.

### 2.1 Create a User via Supabase Auth

1. Go to **Authentication** > **Users** in your Supabase dashboard
2. Click **Add User** > **Create new user**
3. Enter an email and password
4. Click **Create User**

### 2.2 Make the User an Admin

1. After creating the user, click on the user in the list
2. Scroll down to **User Metadata** section
3. Click **Edit** (pencil icon)
4. Add this JSON to the `raw_user_meta_data` field:
```json
{
  "full_name": "Your Name",
  "is_admin": true
}
```
5. Click **Save**

**Alternative Method - Using SQL:**

1. Copy the user's ID from the user list
2. In the SQL Editor, run:
```sql
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"is_admin": true, "full_name": "Your Name"}'::jsonb
WHERE id = 'paste-user-id-here';
```

### 2.3 Create Regular (Non-Admin) Users

Repeat the same process for your 5 recruiters, but **omit** the `is_admin` field or set it to `false`:
```json
{
  "full_name": "Recruiter Name"
}
```

## Step 3: Install and Run the Application

### 3.1 Install Dependencies

```bash
cd linkedin-token-tracker
npm install
```

### 3.2 Start the Development Server

```bash
npm run dev
```

The application will start at `http://localhost:5173`

## Step 4: Test the Application

### 4.1 Test Regular User Flow

1. Open the application in your browser
2. Log in with a **non-admin** user account
3. You should see the **Dashboard** with 3 account cards
4. Click **Check In** on an available account
5. Verify the account credentials are displayed
6. Verify the card turns red and shows "In Use by [Your Name]"

### 4.2 Test Real-Time Synchronization

1. Open the application in **two different browser windows** (or use incognito mode)
2. Log in as **different users** in each window
3. In Window 1: Check in to an account
4. In Window 2: **Immediately** verify the account shows as "In Use"
5. In Window 1: Check out from the account
6. In Window 2: **Immediately** verify the account becomes available again

✅ If both windows update instantly, real-time sync is working!

### 4.3 Test Check-Out Flow

1. Check in to an account
2. Click **Log Usage & Check Out**
3. Enter a number of tokens used (e.g., 15)
4. Check the **confirmation checkbox**
5. Submit the check-out
6. Verify the token count decreased on the dashboard

### 4.4 Test Logout Prevention

1. Check in to an account
2. Try to sign out using the **Sign Out** button
3. You should see an error: "You cannot log out. Please 'Check Out' the account first."
4. Check out from the account
5. Try to sign out again
6. You should see a confirmation checkbox
7. Check the box and sign out successfully

### 4.5 Test Admin Panel

1. Log in with your **admin** user account
2. Click **Admin Panel** in the navigation
3. Click **Edit Account** on any account
4. Change the token count or refresh date
5. Click **Save Changes**
6. Verify the changes appear on the dashboard

### 4.6 Test Force Check Out

1. As a regular user, check in to an account
2. Log out (without checking out - you'll need to use browser dev tools or force-close to simulate forgetting)
3. Log in as an **admin** user
4. Go to **Admin Panel**
5. Click **Force Check Out** on the in-use account
6. Confirm the force check-out
7. Verify the account becomes available again

### 4.7 Test Usage Logs

1. Log in as an admin
2. Click **Usage Logs** in the navigation
3. Verify you see all check-in and check-out events
4. Use the filters to filter by account or action
5. Verify token usage is recorded for check-out events

## Step 5: Test Automated Token Replenishment (Optional)

The token replenishment runs automatically via pg_cron. To test it manually:

### Manual Test

1. In the Supabase SQL Editor, run:
```sql
SELECT replenish_monthly_tokens();
```

2. Check that tokens were added to accounts with a past `next_refresh_date`:
```sql
SELECT name, remaining_tokens, next_refresh_date FROM public.linkedin_accounts;
```

### Verify Cron Job is Scheduled

```sql
SELECT * FROM cron.job WHERE jobname = 'monthly-token-replenishment';
```

You should see the scheduled job with schedule `0 2 * * *` (daily at 2 AM UTC).

## Step 6: Verify Supabase Configuration in Dashboard

### 6.1 Check Realtime is Enabled

1. Go to **Database** > **Replication**
2. Verify `public.linkedin_accounts` is listed
3. If not, click **+ New Replication**, select the table, and enable it

### 6.2 Check RLS Policies

1. Go to **Authentication** > **Policies**
2. Verify you see policies for both `linkedin_accounts` and `usage_log`
3. All policies should be **enabled**

### 6.3 Check Extensions

1. Go to **Database** > **Extensions**
2. Verify `pg_cron` is **enabled**
3. Also verify `uuid-ossp` is enabled (should be by default)

## Troubleshooting

### Issue: "relation public.linkedin_accounts does not exist"
**Solution**: Make sure you ran the entire `database-setup.sql` script in the SQL Editor.

### Issue: Real-time updates not working
**Solution**:
1. Check Database > Replication and make sure `linkedin_accounts` is enabled
2. Verify the table was added to the realtime publication:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.linkedin_accounts;
```

### Issue: "permission denied for table linkedin_accounts"
**Solution**:
1. Make sure you're logged in (check if the user appears in the navbar)
2. Verify RLS policies are created:
```sql
SELECT * FROM pg_policies WHERE tablename IN ('linkedin_accounts', 'usage_log');
```

### Issue: Admin features not showing
**Solution**:
1. Verify the user's metadata includes `"is_admin": true`
2. Check in Supabase Dashboard under Authentication > Users
3. Update the user metadata as shown in Step 2.2

### Issue: Cron job not running
**Solution**:
1. Make sure pg_cron extension is enabled
2. Verify the cron job exists:
```sql
SELECT * FROM cron.job;
```
3. Check cron job logs:
```sql
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
```

### Issue: Cannot log out
**Solution**: This is expected behavior! If you have an account checked in, you must check it out first. This is a safety feature to prevent recruiters from forgetting to log out of LinkedIn.

## Production Deployment

When you're ready to deploy to production:

### Option 1: Vercel (Recommended)

1. Push your code to GitHub
2. Go to https://vercel.com
3. Click **New Project**
4. Import your GitHub repository
5. Vercel will auto-detect the Vite configuration
6. Click **Deploy**
7. Your app will be live at `https://your-app.vercel.app`

### Option 2: Netlify

1. Push your code to GitHub
2. Go to https://netlify.com
3. Click **Add new site** > **Import an existing project**
4. Connect to your GitHub repository
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Click **Deploy**

### Environment Variables

The Supabase credentials are currently hardcoded in `src/utils/supabase.ts`. For production, consider using environment variables:

1. Create a `.env` file:
```env
VITE_SUPABASE_URL=https://sduufemakisrzuzrghdt.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

2. Update `src/utils/supabase.ts`:
```typescript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
```

3. Add environment variables to your deployment platform (Vercel/Netlify)

## Color Palette Reference

The application uses a custom dark theme with blue tones:

### Primary Colors
- **Navy Blue**:
  - `#0a0e1a` - Dark primary background
  - `#121829` - Dark secondary background
  - `#1a2137` - Dark tertiary background
  - `#1e2742` - Card background
  - `#2a3655` - Border color

### Accent Colors
- **Royal Blue**: `#2a6aff` (buttons, highlights)
- **Sky Blue**: `#009fe6` (links, info)
- **Green**: `#059669` (available status)
- **Red**: `#dc2626` (in-use status)

## Support

If you encounter any issues:

1. Check the browser console for errors (F12 > Console tab)
2. Check the Supabase logs in the dashboard
3. Review the troubleshooting section above
4. Verify all setup steps were completed

## Summary Checklist

- [ ] Ran `database-setup.sql` in Supabase SQL Editor
- [ ] Enabled pg_cron extension
- [ ] Updated LinkedIn account credentials
- [ ] Created admin user with correct metadata
- [ ] Created regular user accounts for recruiters
- [ ] Ran `npm install` in the project
- [ ] Started dev server with `npm run dev`
- [ ] Tested check-in/check-out flow
- [ ] Tested real-time synchronization
- [ ] Tested logout prevention
- [ ] Tested admin panel features
- [ ] Verified usage logs are recording
- [ ] (Optional) Tested manual token replenishment

**Congratulations!** Your LinkedIn Token Tracker is now fully set up and ready to use. 🎉
