import React from 'react';
import { useAccounts } from '../hooks/useAccounts';
import { AccountEditor } from '../components/admin/AccountEditor';
import { Layout } from '../components/layout/Layout';

export const AdminPanel: React.FC = () => {
  const { accounts, loading, error, refetch } = useAccounts();

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-royal-500"></div>
            <p className="mt-4 text-gray-400">Loading accounts...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-red-900/30 border border-red-700/50 text-red-400 px-4 py-3 rounded-lg">
          Error loading accounts: {error}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Admin Panel</h1>
        <p className="text-gray-400">
          Manage LinkedIn accounts, set token amounts, and force check-outs when needed.
        </p>
      </div>

      <div className="mb-6 card bg-navy-900/30 border-navy-700/50">
        <h2 className="text-lg font-semibold text-navy-300 mb-2">Admin Features</h2>
        <ul className="text-sm text-gray-400 space-y-1">
          <li>• Edit account details and credentials</li>
          <li>• Manually adjust token counts</li>
          <li>• Set monthly replenish amounts and dates</li>
          <li>• Force check-out if a recruiter forgets</li>
        </ul>
      </div>

      {accounts.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-400 text-lg mb-4">
            No accounts configured yet.
          </p>
          <p className="text-sm text-gray-500">
            Accounts need to be created directly in the Supabase database.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account) => (
            <AccountEditor key={account.id} account={account} onUpdate={refetch} />
          ))}
        </div>
      )}
    </Layout>
  );
};
