-- =====================================================
-- LinkedIn Token Tracker - Database Setup Script
-- =====================================================
-- Run this script in your Supabase SQL Editor
-- Make sure to run each section in order

-- =====================================================
-- 1. Create Tables
-- =====================================================

-- Table: linkedin_accounts
-- Stores the 3 LinkedIn accounts with status and credentials
CREATE TABLE IF NOT EXISTS public.linkedin_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    remaining_tokens INTEGER NOT NULL DEFAULT 0,
    next_refresh_date DATE NOT NULL,
    replenish_amount INTEGER NOT NULL DEFAULT 30,
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'in-use')),
    current_user_name TEXT,
    current_user_id UUID,
    linkedin_username TEXT NOT NULL,
    linkedin_password TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: usage_log
-- Complete audit trail of all check-in and check-out actions
CREATE TABLE IF NOT EXISTS public.usage_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    recruiter_name TEXT NOT NULL,
    recruiter_id UUID NOT NULL,
    account_name TEXT NOT NULL,
    account_id UUID NOT NULL REFERENCES public.linkedin_accounts(id),
    action TEXT NOT NULL CHECK (action IN ('check-in', 'check-out')),
    tokens_used INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. Enable Row Level Security (RLS)
-- =====================================================

ALTER TABLE public.linkedin_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_log ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 3. Create RLS Policies for linkedin_accounts
-- =====================================================

-- Allow authenticated users to read all accounts
CREATE POLICY "Allow authenticated users to read accounts"
ON public.linkedin_accounts
FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to update accounts
CREATE POLICY "Allow authenticated users to update accounts"
ON public.linkedin_accounts
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to insert accounts (for admins)
CREATE POLICY "Allow authenticated users to insert accounts"
ON public.linkedin_accounts
FOR INSERT
TO authenticated
WITH CHECK (true);

-- =====================================================
-- 4. Create RLS Policies for usage_log
-- =====================================================

-- Allow authenticated users to read all logs
CREATE POLICY "Allow authenticated users to read logs"
ON public.usage_log
FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to insert logs
CREATE POLICY "Allow authenticated users to insert logs"
ON public.usage_log
FOR INSERT
TO authenticated
WITH CHECK (true);

-- =====================================================
-- 5. Enable Realtime for live updates
-- =====================================================

-- Enable realtime for linkedin_accounts table
ALTER PUBLICATION supabase_realtime ADD TABLE public.linkedin_accounts;

-- Enable realtime for usage_log table (optional)
ALTER PUBLICATION supabase_realtime ADD TABLE public.usage_log;

-- =====================================================
-- 6. Create Function for Monthly Token Replenishment
-- =====================================================

CREATE OR REPLACE FUNCTION replenish_monthly_tokens()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Update accounts where next_refresh_date is today or earlier
    UPDATE public.linkedin_accounts
    SET
        remaining_tokens = remaining_tokens + replenish_amount,
        next_refresh_date = next_refresh_date + INTERVAL '1 month',
        updated_at = NOW()
    WHERE next_refresh_date <= CURRENT_DATE;
END;
$$;

-- =====================================================
-- 7. Create pg_cron Job for Automated Replenishment
-- =====================================================
-- NOTE: pg_cron must be enabled in your Supabase project
-- Go to Database > Extensions and enable "pg_cron" first

-- Schedule the replenishment to run daily at 2 AM UTC
-- This will check if any account needs token replenishment
SELECT cron.schedule(
    'monthly-token-replenishment',
    '0 2 * * *', -- Every day at 2:00 AM UTC
    $$SELECT replenish_monthly_tokens();$$
);

-- =====================================================
-- 8. Insert Sample Data (3 LinkedIn Accounts)
-- =====================================================
-- IMPORTANT: Replace these with your actual LinkedIn credentials
-- Set appropriate token amounts and refresh dates

INSERT INTO public.linkedin_accounts (name, remaining_tokens, next_refresh_date, replenish_amount, linkedin_username, linkedin_password)
VALUES
    ('Tech Sourcing Account', 320, '2025-12-01', 30, 'your_linkedin_email_1@example.com', 'your_password_1'),
    ('Sales Recruiting Account', 285, '2025-12-01', 30, 'your_linkedin_email_2@example.com', 'your_password_2'),
    ('General Recruiting Account', 410, '2025-12-01', 30, 'your_linkedin_email_3@example.com', 'your_password_3')
ON CONFLICT DO NOTHING;

-- =====================================================
-- 9. Create Indexes for Performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_linkedin_accounts_status ON public.linkedin_accounts(status);
CREATE INDEX IF NOT EXISTS idx_usage_log_timestamp ON public.usage_log(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_usage_log_account_id ON public.usage_log(account_id);
CREATE INDEX IF NOT EXISTS idx_usage_log_recruiter_id ON public.usage_log(recruiter_id);

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================
-- Next steps:
-- 1. Update the sample account data with your real LinkedIn credentials
-- 2. Create your first admin user (see SETUP.md for instructions)
-- 3. Test the application
