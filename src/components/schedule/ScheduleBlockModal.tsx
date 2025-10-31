import React, { useState, useEffect } from 'react';
import type { ScheduleBlock, LinkedInAccount } from '../../types';
import { supabase } from '../../utils/supabase';
import { DAYS_OF_WEEK, formatTimeForDB, hasScheduleConflict } from '../../utils/scheduleUtils';

interface ScheduleBlockModalProps {
  block: ScheduleBlock | null;
  accounts: LinkedInAccount[];
  existingBlocks: ScheduleBlock[];
  onClose: () => void;
  onSuccess: () => void;
}

export const ScheduleBlockModal: React.FC<ScheduleBlockModalProps> = ({
  block,
  accounts,
  existingBlocks,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recruiters, setRecruiters] = useState<Array<{ id: string; name: string }>>([]);

  const [accountId, setAccountId] = useState(block?.account_id || '');
  const [recruiterId, setRecruiterId] = useState(block?.recruiter_id || '');
  const [dayOfWeek, setDayOfWeek] = useState(block?.day_of_week?.toString() || '1');
  const [startHour, setStartHour] = useState(
    block ? parseInt(block.start_time.split(':')[0]) : 9
  );
  const [startMinute, setStartMinute] = useState(
    block ? parseInt(block.start_time.split(':')[1]) : 0
  );
  const [endHour, setEndHour] = useState(
    block ? parseInt(block.end_time.split(':')[0]) : 17
  );
  const [endMinute, setEndMinute] = useState(
    block ? parseInt(block.end_time.split(':')[1]) : 0
  );
  const [tokenLimit, setTokenLimit] = useState(block?.token_limit || 50);

  // Fetch recruiters from multiple sources
  useEffect(() => {
    const fetchRecruiters = async () => {
      let allRecruiters: Array<{ id: string; name: string }> = [];

      try {
        // Method 1: Try profiles table
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, is_admin')
          .order('full_name');

        if (profilesData && !profilesError && profilesData.length > 0) {
          // Filter out admins and map to recruiter format
          allRecruiters = profilesData
            .filter((profile: any) => !profile.is_admin)
            .map((profile: any) => ({
              id: profile.id,
              name: profile.full_name,
            }))
            .filter(recruiter => recruiter.name && recruiter.name.trim() !== '');

          if (allRecruiters.length > 0) {
            setRecruiters(allRecruiters);
            return;
          }
        }

        // Method 2: Try usage_log (filter out admins)
        const { data: logData } = await supabase
          .from('usage_log')
          .select('recruiter_id, recruiter_name');

        if (logData && logData.length > 0) {
          const uniqueRecruiters = Array.from(
            new Map(logData.map((item: any) => [item.recruiter_id, item.recruiter_name])).entries()
          ).map(([id, name]) => ({ id, name: name as string }))
          .filter(recruiter => recruiter.name && recruiter.name.trim() !== '');

          // Filter out admins by checking if their email/name suggests admin role
          const nonAdminRecruiters = uniqueRecruiters.filter(recruiter =>
            !recruiter.name.toLowerCase().includes('admin')
          );

          if (nonAdminRecruiters.length > 0) {
            allRecruiters = nonAdminRecruiters;
            setRecruiters(allRecruiters);
            return;
          }
        }

        // Method 3: Fallback - no recruiters found
        console.warn('No recruiters found in any source');
        setRecruiters([]);
      } catch (err) {
        console.error('Error fetching recruiters:', err);
        setRecruiters([]);
      }
    };
    fetchRecruiters();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!accountId || !recruiterId) {
      setError('Please select an account and recruiter');
      return;
    }

    const startTime = formatTimeForDB(startHour, startMinute);
    const endTime = formatTimeForDB(endHour, endMinute);

    // Validate time range
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    if (endMinutes <= startMinutes) {
      setError('End time must be after start time');
      return;
    }

    // Check for conflicts
    const selectedAccount = accounts.find((a) => a.id === accountId);
    const selectedRecruiter = recruiters.find((r) => r.id === recruiterId);

    const newBlock = {
      account_id: accountId,
      day_of_week: parseInt(dayOfWeek),
      start_time: startTime,
      end_time: endTime,
    };

    if (hasScheduleConflict(existingBlocks, newBlock, block?.id)) {
      setError('This time slot conflicts with an existing block for this account');
      return;
    }

    setLoading(true);

    try {
      const blockData = {
        account_id: accountId,
        account_name: selectedAccount?.name || '',
        recruiter_id: recruiterId,
        recruiter_name: selectedRecruiter?.name || '',
        day_of_week: parseInt(dayOfWeek),
        start_time: startTime,
        end_time: endTime,
        token_limit: tokenLimit,
        updated_at: new Date().toISOString(),
      };

      if (block) {
        // Update existing block
        const { error: updateError } = await supabase
          .from('schedule_blocks')
          .update(blockData)
          .eq('id', block.id);

        if (updateError) throw updateError;
      } else {
        // Create new block
        const { error: insertError } = await supabase
          .from('schedule_blocks')
          .insert(blockData);

        if (insertError) throw insertError;
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
      <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-white mb-6">
          {block ? 'Edit Schedule Block' : 'Create Schedule Block'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-900/30 border border-red-700/50 text-red-400 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">LinkedIn Account</label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="input-field"
                required
              >
                <option value="">Select Account</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Recruiter</label>
              <select
                value={recruiterId}
                onChange={(e) => setRecruiterId(e.target.value)}
                className="input-field"
                required
              >
                <option value="">Select Recruiter</option>
                {recruiters.map((recruiter) => (
                  <option key={recruiter.id} value={recruiter.id}>
                    {recruiter.name}
                  </option>
                ))}
              </select>
              {recruiters.length === 0 && (
                <p className="text-xs text-yellow-400 mt-1">
                  No recruiters found. Please have recruiters check in to an account first, or run the profiles table SQL script.
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="label">Day of Week</label>
            <select
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(e.target.value)}
              className="input-field"
              required
            >
              {DAYS_OF_WEEK.map((day, index) => (
                <option key={day} value={index}>
                  {day}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Start Time</label>
              <div className="flex space-x-2">
                <select
                  value={startHour}
                  onChange={(e) => setStartHour(parseInt(e.target.value))}
                  className="input-field"
                  required
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>
                      {i.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
                <span className="text-white self-center">:</span>
                <select
                  value={startMinute}
                  onChange={(e) => setStartMinute(parseInt(e.target.value))}
                  className="input-field"
                  required
                >
                  {[0, 15, 30, 45].map((min) => (
                    <option key={min} value={min}>
                      {min.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="label">End Time</label>
              <div className="flex space-x-2">
                <select
                  value={endHour}
                  onChange={(e) => setEndHour(parseInt(e.target.value))}
                  className="input-field"
                  required
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>
                      {i.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
                <span className="text-white self-center">:</span>
                <select
                  value={endMinute}
                  onChange={(e) => setEndMinute(parseInt(e.target.value))}
                  className="input-field"
                  required
                >
                  {[0, 15, 30, 45].map((min) => (
                    <option key={min} value={min}>
                      {min.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="label">Token Limit</label>
            <input
              type="number"
              min="1"
              max="1000"
              value={tokenLimit}
              onChange={(e) => setTokenLimit(parseInt(e.target.value))}
              className="input-field"
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              Maximum tokens the recruiter can use during this time block
            </p>
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
              disabled={loading}
            >
              {loading ? 'Saving...' : block ? 'Update Block' : 'Create Block'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
