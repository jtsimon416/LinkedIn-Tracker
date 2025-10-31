import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import type { UsageLog } from '../types';
import { Layout } from '../components/layout/Layout';

export const UsageLogs: React.FC = () => {
  const [logs, setLogs] = useState<UsageLog[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterAccount, setFilterAccount] = useState<string>('all');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [filterRecruiter, setFilterRecruiter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  const fetchLogs = async () => {
    try {
      setLoading(true);

      // Build the query with filters
      let query = supabase
        .from('usage_log')
        .select('*', { count: 'exact' })
        .order('timestamp', { ascending: false });

      if (filterAccount !== 'all') {
        query = query.eq('account_name', filterAccount);
      }

      if (filterAction !== 'all') {
        query = query.eq('action', filterAction);
      }

      if (filterRecruiter !== 'all') {
        query = query.eq('recruiter_name', filterRecruiter);
      }

      // Apply pagination
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;
      setLogs(data || []);
      setTotalCount(count || 0);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all logs to get unique values for filters
  const [uniqueAccounts, setUniqueAccounts] = useState<string[]>([]);
  const [uniqueRecruiters, setUniqueRecruiters] = useState<string[]>([]);

  useEffect(() => {
    const fetchAllForFilters = async () => {
      const { data } = await supabase
        .from('usage_log')
        .select('account_name, recruiter_name')
        .limit(1000);

      if (data) {
        const accounts = Array.from(new Set(data.map((log: any) => log.account_name)));
        const recruiters = Array.from(new Set(data.map((log: any) => log.recruiter_name)));
        setUniqueAccounts(accounts);
        setUniqueRecruiters(recruiters);
      }
    };
    fetchAllForFilters();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [filterAccount, filterAction, filterRecruiter, currentPage]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-royal-500"></div>
            <p className="mt-4 text-gray-400">Loading usage logs...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Usage Logs</h1>
        <p className="text-gray-400">
          Complete audit trail of all check-in and check-out activities.
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-900/30 border border-red-700/50 text-red-400 px-4 py-3 rounded-lg">
          Error loading logs: {error}
        </div>
      )}

      <div className="card mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="label">Filter by Account</label>
            <select
              value={filterAccount}
              onChange={(e) => {
                setFilterAccount(e.target.value);
                setCurrentPage(1);
              }}
              className="input-field"
            >
              <option value="all">All Accounts</option>
              {uniqueAccounts.map((account) => (
                <option key={account} value={account}>
                  {account}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="label">Filter by Recruiter</label>
            <select
              value={filterRecruiter}
              onChange={(e) => {
                setFilterRecruiter(e.target.value);
                setCurrentPage(1);
              }}
              className="input-field"
            >
              <option value="all">All Recruiters</option>
              {uniqueRecruiters.map((recruiter) => (
                <option key={recruiter} value={recruiter}>
                  {recruiter}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="label">Filter by Action</label>
            <select
              value={filterAction}
              onChange={(e) => {
                setFilterAction(e.target.value);
                setCurrentPage(1);
              }}
              className="input-field"
            >
              <option value="all">All Actions</option>
              <option value="check-in">Check In</option>
              <option value="check-out">Check Out</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setFilterAccount('all');
                setFilterRecruiter('all');
                setFilterAction('all');
                setCurrentPage(1);
              }}
              className="btn-secondary"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-400 text-lg">No usage logs found.</p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-border">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">
                  Timestamp
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">
                  Recruiter
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">
                  Account
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">
                  Action
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-300">
                  Tokens Used
                </th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-dark-border hover:bg-dark-tertiary/50">
                  <td className="py-3 px-4 text-sm text-gray-300">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-sm text-white">
                    {log.recruiter_name}
                  </td>
                  <td className="py-3 px-4 text-sm text-white">
                    {log.account_name}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    {log.action === 'check-in' ? (
                      <span className="status-badge-available">Check In</span>
                    ) : (
                      <span className="status-badge-in-use">Check Out</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-right text-white">
                    {log.tokens_used !== null ? log.tokens_used : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {logs.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} entries
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="btn-secondary text-sm px-3 py-2"
              >
                Previous
              </button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.ceil(totalCount / itemsPerPage) }, (_, i) => i + 1)
                  .filter((page) => {
                    // Show first page, last page, current page, and pages around current
                    const totalPages = Math.ceil(totalCount / itemsPerPage);
                    return (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    );
                  })
                  .map((page, index, array) => (
                    <React.Fragment key={page}>
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="text-gray-500 px-2">...</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === page
                            ? 'bg-royal-600 text-white'
                            : 'bg-dark-secondary text-gray-300 hover:bg-dark-tertiary'
                        }`}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  ))}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(Math.ceil(totalCount / itemsPerPage), prev + 1)
                  )
                }
                disabled={currentPage >= Math.ceil(totalCount / itemsPerPage)}
                className="btn-secondary text-sm px-3 py-2"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};
