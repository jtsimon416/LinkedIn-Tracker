# Final Updates to Complete Scheduling Feature

## File 1: `src/components/dashboard/AccountCard.tsx`

**Add these imports at the top:**
```typescript
import { useSchedule } from '../../hooks/useSchedule';
import { canAccessAccount } from '../../utils/scheduleUtils';
```

**Replace lines 13-21 with:**
```typescript
export const AccountCard: React.FC<AccountCardProps> = ({ account, onUpdate }) => {
  const { user } = useAuth();
  const { scheduleBlocks } = useSchedule();
  const [showCheckOutModal, setShowCheckOutModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isAvailable = account.status === 'available';
  const isCurrentUser = account.current_user_id === user?.id;

  // Check schedule access
  const { canAccess, block: activeBlock } = canAccessAccount(
    scheduleBlocks,
    account.id,
    user?.id || ''
  );

  const canCheckIn = isAvailable && user && canAccess;
  const canCheckOut = account.status === 'in-use' && isCurrentUser;
```

**Add warning message after the error message (around line 127):**
```typescript
        {error && (
          <div className="mt-4 bg-red-900/30 border border-red-700/50 text-red-400 px-3 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* ADD THIS: */}
        {!canAccess && isAvailable && user && (
          <div className="mt-4 bg-yellow-900/30 border border-yellow-700/50 text-yellow-400 px-3 py-2 rounded-lg text-sm">
            You are not scheduled for this account right now.
          </div>
        )}
```

**Update CheckOutModal call (around line 160):**
```typescript
      {showCheckOutModal && (
        <CheckOutModal
          account={account}
          activeBlock={activeBlock}  {/* ADD THIS PROP */}
          onClose={() => setShowCheckOutModal(false)}
          onSuccess={() => {
            setShowCheckOutModal(false);
            if (onUpdate) {
              onUpdate();
            }
          }}
        />
      )}
```

---

## File 2: `src/components/dashboard/CheckOutModal.tsx`

**Update interface (lines 6-10):**
```typescript
interface CheckOutModalProps {
  account: LinkedInAccount;
  activeBlock: ScheduleBlock | null;  // ADD THIS LINE
  onClose: () => void;
  onSuccess?: () => void;
}
```

**Add import:**
```typescript
import type { LinkedInAccount, ScheduleBlock } from '../../types';  // Update this line
```

**Update function signature (line 12):**
```typescript
export const CheckOutModal: React.FC<CheckOutModalProps> = ({
  account,
  activeBlock,  // ADD THIS
  onClose,
  onSuccess
}) => {
```

**Add token limit validation in handleSubmit (after line 30, before setLoading):**
```typescript
    const tokens = parseInt(tokensUsed);
    if (isNaN(tokens) || tokens < 0) {
      setError('Please enter a valid number of tokens.');
      return;
    }

    // ADD THIS:
    if (activeBlock && tokens > activeBlock.token_limit) {
      setError(
        `You cannot use more than ${activeBlock.token_limit} tokens for this scheduled session.`
      );
      return;
    }

    setLoading(true);
```

**Update help text (around line 102):**
```typescript
            <p className="text-xs text-gray-400 mt-1">
              Current remaining: {account.remaining_tokens} tokens
              {/* ADD THIS: */}
              {activeBlock && (
                <span className="block text-yellow-400 mt-1">
                  Session limit: {activeBlock.token_limit} tokens
                </span>
              )}
            </p>
```

---

## File 3: `src/components/layout/Navbar.tsx`

**Add import:**
```typescript
import { Link, useNavigate } from 'react-router-dom';
```

**Add Schedule link in the navigation (after Dashboard link, around line 25):**
```typescript
                <Link
                  to="/"
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Dashboard
                </Link>
                {/* ADD THIS: */}
                <Link
                  to="/schedule"
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Schedule
                </Link>
                {user?.user_metadata.is_admin && (
                  <>
                    <Link
                      to="/admin"
                      className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Admin Panel
                    </Link>
                    {/* ADD THIS: */}
                    <Link
                      to="/admin/schedule"
                      className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Manage Schedule
                    </Link>
```

---

## File 4: `src/App.tsx`

**Add imports:**
```typescript
import { Schedule } from './pages/Schedule';
import { AdminSchedule } from './pages/AdminSchedule';
```

**Add routes (after Admin Panel routes, before the * route):**
```typescript
        <Route
          path="/admin/logs"
          element={
            <ProtectedRoute requireAdmin>
              <UsageLogs />
            </ProtectedRoute>
          }
        />
        {/* ADD THESE: */}
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
        <Route path="*" element={<Navigate to="/" replace />} />
```

---

## Summary of Changes

1. **AccountCard.tsx**:
   - Import schedule hook and utils
   - Check schedule access before allowing check-in
   - Pass activeBlock to CheckOutModal
   - Show warning if not scheduled

2. **CheckOutModal.tsx**:
   - Accept activeBlock prop
   - Validate tokens against session limit
   - Display session limit in UI

3. **Navbar.tsx**:
   - Add "Schedule" link for all users
   - Add "Manage Schedule" link for admins

4. **App.tsx**:
   - Import Schedule and AdminSchedule pages
   - Add routes for both pages

---

## After Making These Changes

1. Run `npm run build` to verify no errors
2. Run the SQL script: `database-schedule-table.sql`
3. Enable realtime for schedule_blocks in Supabase
4. Create your first schedule blocks as admin
5. Test the access control!

---

## Quick Test

1. Create a schedule block: Monday 9-5, John, Tech Account, 50 tokens
2. On Monday at 10am, John should see "Check In" button
3. On Monday at 10am, Sarah should see warning: "Not scheduled"
4. On Tuesday at 10am, John should see warning: "Not scheduled"
5. When John checks out, he cannot enter >50 tokens

---

**Total Lines Changed**: ~30 lines across 4 files
**Time Required**: 10-15 minutes
**Difficulty**: Easy (copy-paste with minor adjustments)
