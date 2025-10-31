import React from 'react';
import { useAccounts } from '../hooks/useAccounts';
import { AccountCard } from '../components/dashboard/AccountCard';
import { Layout } from '../components/layout/Layout';

export const Dashboard: React.FC = () => {
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
        <h1 className="text-3xl font-bold text-white mb-2">Account Dashboard</h1>
        <p className="text-gray-400">
          Manage your LinkedIn accounts in real-time. Check in to start using an account,
          and check out when you're done.
        </p>
      </div>

      {accounts.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-400 text-lg">
            No accounts configured yet. Contact your administrator.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account) => (
            <AccountCard key={account.id} account={account} onUpdate={refetch} />
          ))}
        </div>
      )}
    </Layout>
  );
};
