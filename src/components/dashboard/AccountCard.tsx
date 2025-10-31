import React, { useState } from 'react';
import type { LinkedInAccount } from '../../types';
import { CheckOutModal } from './CheckOutModal';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useSchedule } from '../../hooks/useSchedule';
import { canAccessAccount } from '../../utils/scheduleUtils';

interface AccountCardProps {
  account: LinkedInAccount;
  onUpdate?: () => void;
}

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

  // TEMPORARY: Allow check-in even without schedule if no schedules exist yet
  // This allows bootstrapping the system by populating usage_log
  const hasAnySchedules = scheduleBlocks.length > 0;
  const canCheckIn = isAvailable && user && (canAccess || !hasAnySchedules);
  const canCheckOut = account.status === 'in-use' && isCurrentUser;

  const handleCheckIn = async () => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      // Update account status
      const { error: updateError } = await supabase
        .from('linkedin_accounts')
        .update({
          status: 'in-use',
          current_user_name: user.user_metadata.full_name,
          current_user_id: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', account.id);

      if (updateError) throw updateError;

      // Log the check-in action
      const { error: logError } = await supabase.from('usage_log').insert({
        recruiter_name: user.user_metadata.full_name,
        recruiter_id: user.id,
        account_name: account.name,
        account_id: account.id,
        action: 'check-in',
        tokens_used: null,
      });

      if (logError) throw logError;

      // Trigger immediate refetch to update UI
      if (onUpdate) {
        onUpdate();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = () => {
    setShowCheckOutModal(true);
  };

  return (
    <>
      <div className="card hover:shadow-xl transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">{account.name}</h3>
            {isAvailable ? (
              <span className="status-badge-available">Available</span>
            ) : (
              <span className="status-badge-in-use">In Use</span>
            )}
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-royal-400">
              {account.remaining_tokens}
            </div>
            <div className="text-xs text-gray-400">tokens left</div>
          </div>
        </div>

        {!isAvailable && (
          <div className="mb-4 p-3 bg-dark-tertiary rounded-lg border border-dark-border">
            <div className="text-sm text-gray-400">In use by:</div>
            <div className="text-white font-medium">{account.current_user_name}</div>
          </div>
        )}

        {isCurrentUser && canCheckOut && (
          <div className="mb-4 p-4 bg-navy-900/30 rounded-lg border border-navy-700/50">
            <div className="text-sm font-semibold text-navy-300 mb-3">LinkedIn Credentials</div>
            <div className="space-y-2">
              <div>
                <div className="text-xs text-gray-400">Username</div>
                <div className="text-white font-mono text-sm">{account.linkedin_username}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Password</div>
                <div className="text-white font-mono text-sm">{account.linkedin_password}</div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Next Refresh:</span>
            <span className="text-white">
              {new Date(account.next_refresh_date).toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Monthly Tokens:</span>
            <span className="text-white">{account.replenish_amount}</span>
          </div>
        </div>

        {error && (
          <div className="mt-4 bg-red-900/30 border border-red-700/50 text-red-400 px-3 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        {!canAccess && isAvailable && user && hasAnySchedules && (
          <div className="mt-4 bg-yellow-900/30 border border-yellow-700/50 text-yellow-400 px-3 py-2 rounded-lg text-sm">
            You are not scheduled for this account right now.
          </div>
        )}

        {!canAccess && isAvailable && user && !hasAnySchedules && (
          <div className="mt-4 bg-blue-900/30 border border-blue-700/50 text-blue-400 px-3 py-2 rounded-lg text-sm">
            No schedules configured yet. You can check in freely to populate the system.
          </div>
        )}

        <div className="mt-6">
          {canCheckIn && (
            <button
              onClick={handleCheckIn}
              className="btn-success w-full"
              disabled={loading}
            >
              {loading ? 'Checking In...' : 'Check In'}
            </button>
          )}
          {canCheckOut && (
            <button
              onClick={handleCheckOut}
              className="btn-danger w-full"
              disabled={loading}
            >
              Log Usage & Check Out
            </button>
          )}
          {!isAvailable && !isCurrentUser && (
            <button className="btn-secondary w-full cursor-not-allowed" disabled>
              In Use by {account.current_user_name}
            </button>
          )}
        </div>
      </div>

      {showCheckOutModal && (
        <CheckOutModal
          account={account}
          activeBlock={activeBlock}
          onClose={() => setShowCheckOutModal(false)}
          onSuccess={() => {
            setShowCheckOutModal(false);
            if (onUpdate) {
              onUpdate();
            }
          }}
        />
      )}
    </>
  );
};
