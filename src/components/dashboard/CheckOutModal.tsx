import React, { useState } from 'react';
import type { LinkedInAccount, ScheduleBlock } from '../../types';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../../hooks/useAuth';

interface CheckOutModalProps {
  account: LinkedInAccount;
  activeBlock: ScheduleBlock | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CheckOutModal: React.FC<CheckOutModalProps> = ({ account, activeBlock, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [tokensUsed, setTokensUsed] = useState<string>('');
  const [confirmedLogout, setConfirmedLogout] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!confirmedLogout) {
      setError('Please confirm that you have logged out of the LinkedIn account.');
      return;
    }

    const tokens = parseInt(tokensUsed);
    if (isNaN(tokens) || tokens < 0) {
      setError('Please enter a valid number of tokens.');
      return;
    }

    // Validate against session token limit
    if (activeBlock && tokens > activeBlock.token_limit) {
      setError(
        `You cannot use more than ${activeBlock.token_limit} tokens for this scheduled session.`
      );
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Calculate new remaining tokens
      const newRemainingTokens = Math.max(0, account.remaining_tokens - tokens);

      // Update account status
      const { error: updateError } = await supabase
        .from('linkedin_accounts')
        .update({
          status: 'available',
          current_user_name: null,
          current_user_id: null,
          remaining_tokens: newRemainingTokens,
          updated_at: new Date().toISOString(),
        })
        .eq('id', account.id);

      if (updateError) throw updateError;

      // Log the check-out action
      const { error: logError } = await supabase.from('usage_log').insert({
        recruiter_name: user?.user_metadata.full_name || 'Unknown',
        recruiter_id: user?.id || '',
        account_name: account.name,
        account_id: account.id,
        action: 'check-out',
        tokens_used: tokens,
      });

      if (logError) throw logError;

      // Call onSuccess to trigger UI update and close modal
      if (onSuccess) {
        onSuccess();
      } else {
        onClose();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
      <div className="card max-w-md w-full">
        <h2 className="text-xl font-bold text-white mb-4">
          Check Out: {account.name}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-900/30 border border-red-700/50 text-red-400 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="tokensUsed" className="label">
              How many tokens did you use?
            </label>
            <input
              id="tokensUsed"
              type="number"
              min="0"
              value={tokensUsed}
              onChange={(e) => setTokensUsed(e.target.value)}
              className="input-field"
              placeholder="Enter number of tokens"
              required
              disabled={loading}
            />
            <p className="text-xs text-gray-400 mt-1">
              Current remaining: {account.remaining_tokens} tokens
              {activeBlock && (
                <span className="block text-yellow-400 mt-1">
                  Session limit: {activeBlock.token_limit} tokens
                </span>
              )}
            </p>
          </div>

          <div>
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmedLogout}
                onChange={(e) => setConfirmedLogout(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-dark-border bg-dark-secondary text-royal-600 focus:ring-royal-500"
                disabled={loading}
              />
              <span className="text-sm text-gray-300">
                I confirm I have logged out of the LinkedIn.com account and closed all browser windows.
              </span>
            </label>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={!tokensUsed || !confirmedLogout || loading}
            >
              {loading ? 'Checking Out...' : 'Submit Check Out'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
