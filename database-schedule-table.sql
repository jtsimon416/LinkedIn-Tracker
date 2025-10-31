-- =====================================================
-- LinkedIn Token Tracker - Schedule Blocks Table
-- =====================================================
-- Run this script AFTER the main database-setup.sql

-- Table: schedule_blocks
-- Stores recurring weekly time blocks for account scheduling
CREATE TABLE IF NOT EXISTS public.schedule_blocks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    account_id UUID NOT NULL REFERENCES public.linkedin_accounts(id) ON DELETE CASCADE,
    account_name TEXT NOT NULL,
    recruiter_id UUID NOT NULL,
    recruiter_name TEXT NOT NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    token_limit INTEGER NOT NULL DEFAULT 50,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Prevent overlapping blocks for the same account on the same day
    CONSTRAINT no_overlap EXCLUDE USING gist (
        account_id WITH =,
        day_of_week WITH =,
        tsrange(
            (CURRENT_DATE + start_time)::timestamp,
            (CURRENT_DATE + end_time)::timestamp
        ) WITH &&
    )
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_schedule_blocks_account_id ON public.schedule_blocks(account_id);
CREATE INDEX IF NOT EXISTS idx_schedule_blocks_recruiter_id ON public.schedule_blocks(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_schedule_blocks_day_of_week ON public.schedule_blocks(day_of_week);

-- Enable Row Level Security
ALTER TABLE public.schedule_blocks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for schedule_blocks
-- Allow authenticated users to read all schedule blocks
CREATE POLICY "Allow authenticated users to read schedule blocks"
ON public.schedule_blocks
FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to insert schedule blocks (admins will use this)
CREATE POLICY "Allow authenticated users to insert schedule blocks"
ON public.schedule_blocks
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update schedule blocks
CREATE POLICY "Allow authenticated users to update schedule blocks"
ON public.schedule_blocks
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to delete schedule blocks
CREATE POLICY "Allow authenticated users to delete schedule blocks"
ON public.schedule_blocks
FOR DELETE
TO authenticated
USING (true);

-- Enable Realtime for schedule_blocks table
ALTER PUBLICATION supabase_realtime ADD TABLE public.schedule_blocks;

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================
-- The schedule_blocks table is now ready to use.
-- The application will enforce admin-only access in the frontend.
