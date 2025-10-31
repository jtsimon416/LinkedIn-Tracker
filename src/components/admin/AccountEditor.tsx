import React, { useState } from 'react';
import type { LinkedInAccount } from '../../types';
import { supabase } from '../../utils/supabase';

interface AccountEditorProps {
  account: LinkedInAccount;
  onUpdate: () => void;
}

export const AccountEditor: React.FC<AccountEditorProps> = ({ account, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: account.name,
    remaining_tokens: account.remaining_tokens,
    replenish_amount: account.replenish_amount,
    next_refresh_date: account.next_refresh_date.split('T')[0],
    linkedin_username: account.linkedin_username,
    linkedin_password: account.linkedin_password,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error: updateError } = await supabase
        .from('linkedin_accounts')
        .update({
          name: formData.name,
          remaining_tokens: formData.remaining_tokens,
          replenish_amount: formData.replenish_amount,
          next_refresh_date: formData.next_refresh_date,
          linkedin_username: formData.linkedin_username,
          linkedin_password: formData.linkedin_password,
          updated_at: new Date().toISOString(),
        })
        .eq('id', account.id);

      if (updateError) throw updateError;

      setIsEditing(false);
      onUpdate();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForceCheckout = async () => {
    if (!confirm(`Force check out ${account.name}? This should only be used if a recruiter forgot to check out.`)) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: updateError } = await supabase
        .from('linkedin_accounts')
        .update({
          status: 'available',
          current_user_name: null,
          current_user_id: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', account.id);

      if (updateError) throw updateError;

      onUpdate();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isEditing) {
    return (
      <div className="card">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">{account.name}</h3>
            {account.status === 'available' ? (
              <span className="status-badge-available">Available</span>
            ) : (
              <span className="status-badge-in-use">
                In Use by {account.current_user_name}
              </span>
            )}
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-royal-400">
              {account.remaining_tokens}
            </div>
            <div className="text-xs text-gray-400">tokens</div>
          </div>
        </div>

        <div className="space-y-2 text-sm mb-4">
          <div className="flex justify-between">
            <span className="text-gray-400">Monthly Replenish:</span>
            <span className="text-white">{account.replenish_amount} tokens</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Next Refresh:</span>
            <span className="text-white">
              {new Date(account.next_refresh_date).toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Username:</span>
            <span className="text-white font-mono text-xs">{account.linkedin_username}</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-900/30 border border-red-700/50 text-red-400 px-3 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex space-x-3">
          <button
            onClick={() => setIsEditing(true)}
            className="btn-primary flex-1"
          >
            Edit Account
          </button>
          {account.status === 'in-use' && (
            <button
              onClick={handleForceCheckout}
              className="btn-danger"
              disabled={loading}
            >
              Force Check Out
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-xl font-bold text-white mb-4">Edit Account</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-900/30 border border-red-700/50 text-red-400 px-3 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="label">Account Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="input-field"
            required
          />
        </div>

        <div>
          <label className="label">Remaining Tokens</label>
          <input
            type="number"
            min="0"
            value={formData.remaining_tokens}
            onChange={(e) => setFormData({ ...formData, remaining_tokens: parseInt(e.target.value) })}
            className="input-field"
            required
          />
        </div>

        <div>
          <label className="label">Monthly Replenish Amount</label>
          <input
            type="number"
            min="0"
            value={formData.replenish_amount}
            onChange={(e) => setFormData({ ...formData, replenish_amount: parseInt(e.target.value) })}
            className="input-field"
            required
          />
        </div>

        <div>
          <label className="label">Next Refresh Date</label>
          <input
            type="date"
            value={formData.next_refresh_date}
            onChange={(e) => setFormData({ ...formData, next_refresh_date: e.target.value })}
            className="input-field"
            required
          />
        </div>

        <div>
          <label className="label">LinkedIn Username</label>
          <input
            type="text"
            value={formData.linkedin_username}
            onChange={(e) => setFormData({ ...formData, linkedin_username: e.target.value })}
            className="input-field"
            required
          />
        </div>

        <div>
          <label className="label">LinkedIn Password</label>
          <input
            type="password"
            value={formData.linkedin_password}
            onChange={(e) => setFormData({ ...formData, linkedin_password: e.target.value })}
            className="input-field"
            required
          />
        </div>

        <div className="flex space-x-3">
          <button
            type="button"
            onClick={() => setIsEditing(false)}
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
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};
