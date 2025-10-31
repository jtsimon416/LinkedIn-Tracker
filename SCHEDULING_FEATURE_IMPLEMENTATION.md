# Scheduling Feature - Implementation Status & Next Steps

## ✅ COMPLETED Components

### 1. Database Schema
**File**: `database-schedule-table.sql`
- Created `schedule_blocks` table with all required fields
- Added overlap prevention constraint
- Enabled RLS policies for security
- Enabled Realtime for instant updates
- Created indexes for performance

**Run this SQL in Supabase SQL Editor after the main setup**

### 2. TypeScript Types
**File**: `src/types/index.ts`
- Added `ScheduleBlock` interface
- Includes all fields: account, recruiter, day, times, token limit

### 3. Schedule Hook
**File**: `src/hooks/useSchedule.ts`
- Fetches all schedule blocks
- Real-time updates when schedules change
- Similar pattern to `useAccounts`

### 4. Utility Functions
**File**: `src/utils/scheduleUtils.ts`
- `isBlockActive()` - Check if block is currently active
- `getActiveBlock()` - Get user's current active block
- `canAccessAccount()` - Check if user can access account now
- `formatTime()` - Display time in 12-hour format
- `hasScheduleConflict()` - Prevent overlapping blocks
- All time/schedule logic centralized

### 5. Schedule Page (Calendar View)
**File**: `src/pages/Schedule.tsx`
- Weekly calendar grid showing all 7 days
- Color-coded by account (different blue shades)
- Highlights user's own assignments (yellow border)
- Shows active blocks with green indicator
- "Your Upcoming Schedule" section at bottom
- Real-time updates every minute
- Legend for visual clarity

### 6. Admin Schedule Management
**File**: `src/pages/AdminSchedule.tsx`
- Admin-only page for creating/editing/deleting blocks
- Statistics dashboard (total blocks, accounts, recruiters)
- Grouped by day of week
- Create, Edit, Delete buttons
- Integration with modal

### 7. Schedule Block Modal
**File**: `src/components/schedule/ScheduleBlockModal.tsx`
- Create or edit schedule blocks
- Select account, recruiter, day, time range, token limit
- Conflict detection
- Time dropdowns (hours/minutes)
- Validation (end > start, no overlaps)

---

## ⚠️ REMAINING TASKS (Critical)

### Task 1: Update AccountCard with Schedule Enforcement

**File to modify**: `src/components/dashboard/AccountCard.tsx`

Add schedule checking to the component:

```typescript
import { useSchedule } from '../../hooks/useSchedule';
import { canAccessAccount } from '../../utils/scheduleUtils';

// Inside component:
const { scheduleBlocks } = useSchedule();

// Check schedule access
const { canAccess, block: activeBlock } = canAccessAccount(
  scheduleBlocks,
  account.id,
  user?.id || ''
);

// Update canCheckIn logic:
const canCheckIn = isAvailable && user && canAccess;

// Add warning message if not scheduled:
{!canAccess && isAvailable && (
  <div className="mt-4 bg-yellow-900/30 border border-yellow-700/50 text-yellow-400 px-3 py-2 rounded-lg text-sm">
    You are not scheduled for this account right now.
  </div>
)}
```

### Task 2: Update CheckOutModal with Token Limit

**File to modify**: `src/components/dashboard/CheckOutModal.tsx`

Add props and validation:

```typescript
interface CheckOutModalProps {
  account: LinkedInAccount;
  activeBlock: ScheduleBlock | null; // ADD THIS
  onClose: () => void;
  onSuccess?: () => void;
}

// In validation:
if (activeBlock && tokens > activeBlock.token_limit) {
  setError(
    `You cannot use more than ${activeBlock.token_limit} tokens for this session`
  );
  return;
}

// Update AccountCard to pass activeBlock:
<CheckOutModal
  account={account}
  activeBlock={activeBlock}
  onClose={...}
  onSuccess={...}
/>
```

### Task 3: Add Schedule Navigation Links

**File to modify**: `src/components/layout/Navbar.tsx`

Add navigation links:

```typescript
<Link
  to="/schedule"
  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
>
  Schedule
</Link>

{user?.user_metadata.is_admin && (
  <Link
    to="/admin/schedule"
    className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
  >
    Manage Schedule
  </Link>
)}
```

### Task 4: Add Routes

**File to modify**: `src/App.tsx`

```typescript
import { Schedule } from './pages/Schedule';
import { AdminSchedule } from './pages/AdminSchedule';

// Add routes:
<Route
  path="/schedule"
  element={
    <ProtectedRoute>
      <Schedule />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/schedule"
  element={
    <ProtectedRoute requireAdmin>
      <AdminSchedule />
    </ProtectedRoute>
  }
/>
```

---

## 📋 Complete Implementation Checklist

### Database
- [ ] Run `database-schedule-table.sql` in Supabase SQL Editor
- [ ] Verify table created: `select * from schedule_blocks;`
- [ ] Verify realtime enabled in Database > Replication

### Frontend
- [ ] Update AccountCard with schedule checks (Task 1)
- [ ] Update CheckOutModal with token limits (Task 2)
- [ ] Add navigation links to Navbar (Task 3)
- [ ] Add routes to App.tsx (Task 4)
- [ ] Build and test: `npm run build`

### Testing
- [ ] Create a schedule block as admin
- [ ] Verify it appears in Schedule page
- [ ] Verify recruiter can only check in during scheduled time
- [ ] Verify recruiter cannot exceed token limit on checkout
- [ ] Verify real-time updates work
- [ ] Test conflict detection
- [ ] Test edit/delete schedule blocks

---

## 🎨 Design Features

### Color Scheme (Blue Theme)
- **Tech Sourcing Account**: Royal Blue (`bg-royal-600` #2a6aff)
- **Sales Recruiting Account**: Sky Blue (`bg-sky-600` #009fe6)
- **General Recruiting Account**: Navy Blue (`bg-navy-600` #0052b3)
- **User's Assignments**: Yellow border highlight
- **Active Now**: Green with shadow

### Visual Indicators
- **Today**: Royal blue background on day column
- **Active Block**: Green border + "ACTIVE NOW" badge
- **User's Block**: Yellow ring border
- **Current Time**: Displayed at bottom, updates every minute

---

## 🔒 Security & Access Control

### Database Level
- RLS policies enforce authentication
- Overlap constraint prevents conflicts
- CASCADE delete when account deleted

### Application Level
- Admin-only routes for schedule management
- Schedule checks before check-in allowed
- Token limit validation on check-out
- Real-time sync prevents race conditions

---

## 📊 How It Works

### Weekly Recurring Blocks
1. Admin creates block: Account + Recruiter + Day + Time + Token Limit
2. Block repeats every week (e.g., every Monday 9-5)
3. No expiration - runs indefinitely until deleted

### Access Control Flow
1. Recruiter opens Dashboard
2. App fetches schedule blocks via useSchedule hook
3. For each account, check if user has active block NOW
4. If yes: Show "Check In" button
5. If no: Disable button or show warning
6. Real-time updates if schedule changes

### Token Limit Enforcement
1. Recruiter checks in during scheduled time
2. Active block stored in state (with token_limit)
3. On checkout, validate tokens_used <= token_limit
4. If exceeded: Show error, prevent checkout
5. If valid: Allow checkout and log usage

---

## 🚀 Deployment Steps

### 1. Database Setup
```sql
-- In Supabase SQL Editor, run:
-- 1. Main setup (if not done): database-setup.sql
-- 2. Schedule table: database-schedule-table.sql
```

### 2. Enable Realtime
- Go to Database > Replication
- Verify `schedule_blocks` is in publication
- If not: `ALTER PUBLICATION supabase_realtime ADD TABLE public.schedule_blocks;`

### 3. Create Initial Schedule Blocks
- Log in as admin
- Go to "Manage Schedule"
- Click "+ Add Time Block"
- Fill in details and save

### 4. Test Access Control
- Log in as recruiter
- Try to check in outside scheduled time → Should be blocked
- Try to check in during scheduled time → Should work
- Try to exceed token limit on checkout → Should be blocked

---

## 📝 Example Schedule Setup

### Example: 5 Recruiters, 3 Accounts

**Monday:**
- 9-12: John on Tech Account (limit: 30 tokens)
- 13-17: Sarah on Sales Account (limit: 40 tokens)

**Tuesday:**
- 9-13: Mike on General Account (limit: 25 tokens)
- 14-18: Lisa on Tech Account (limit: 35 tokens)

**Wednesday:**
- 10-14: Emma on Sales Account (limit: 30 tokens)

etc...

---

## 🐛 Troubleshooting

### Issue: Can't create schedule block
**Solution**: Make sure table exists and RLS policies are set

### Issue: Schedule not appearing
**Solution**: Check realtime is enabled for schedule_blocks table

### Issue: Can check in anytime (not restricted)
**Solution**: Make sure you updated AccountCard with schedule checks

### Issue: No token limit enforcement
**Solution**: Make sure you updated CheckOutModal with validation

---

## 📚 Files Created

1. `database-schedule-table.sql` - Database schema
2. `src/types/index.ts` - TypeScript types (updated)
3. `src/hooks/useSchedule.ts` - Schedule data hook
4. `src/utils/scheduleUtils.ts` - Helper functions
5. `src/pages/Schedule.tsx` - Calendar view (all users)
6. `src/pages/AdminSchedule.tsx` - Admin management
7. `src/components/schedule/ScheduleBlockModal.tsx` - Create/Edit modal
8. `SCHEDULING_FEATURE_IMPLEMENTATION.md` - This file

---

## ✨ Final Notes

This scheduling system provides:
- ✅ Recurring weekly time blocks
- ✅ Per-account, per-recruiter scheduling
- ✅ Token limit enforcement per session
- ✅ Conflict prevention
- ✅ Real-time updates
- ✅ Visual weekly calendar
- ✅ Admin management interface
- ✅ Beautiful blue color scheme

The system is **95% complete**. You just need to:
1. Run the SQL script
2. Update AccountCard (5-10 lines)
3. Update CheckOutModal (5-10 lines)
4. Add navigation links (2 links)
5. Add routes (2 routes)

Total time to finish: **15-20 minutes**
