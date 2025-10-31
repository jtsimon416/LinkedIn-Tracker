import React, { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { useSchedule } from '../hooks/useSchedule';
import { useAccounts } from '../hooks/useAccounts';
import { ScheduleBlockModal } from '../components/schedule/ScheduleBlockModal';
import type { ScheduleBlock } from '../types';
import { DAYS_OF_WEEK, formatTime } from '../utils/scheduleUtils';
import { supabase } from '../utils/supabase';

export const AdminSchedule: React.FC = () => {
  const { scheduleBlocks, loading, refetch } = useSchedule();
  const { accounts } = useAccounts();
  const [showModal, setShowModal] = useState(false);
  const [editingBlock, setEditingBlock] = useState<ScheduleBlock | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const handleCreateBlock = () => {
    setEditingBlock(null);
    setShowModal(true);
  };

  const handleEditBlock = (block: ScheduleBlock) => {
    setEditingBlock(block);
    setShowModal(true);
  };

  const handleDeleteBlock = async (blockId: string) => {
    if (!confirm('Are you sure you want to delete this schedule block?')) {
      return;
    }

    setDeleteLoading(blockId);
    try {
      const { error } = await supabase
        .from('schedule_blocks')
        .delete()
        .eq('id', blockId);

      if (error) throw error;
      refetch();
    } catch (err: any) {
      alert(`Error deleting block: ${err.message}`);
    } finally {
      setDeleteLoading(null);
    }
  };

  const getColorForAccount = (accountName: string): string => {
    const colors: Record<string, string> = {
      'Tech Sourcing Account': 'bg-royal-600',
      'Sales Recruiting Account': 'bg-sky-600',
      'General Recruiting Account': 'bg-navy-600',
    };
    return colors[accountName] || 'bg-blue-600';
  };

  const groupedBlocks = DAYS_OF_WEEK.map((day, index) => ({
    day,
    blocks: scheduleBlocks.filter((block) => block.day_of_week === index),
  }));

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-royal-500"></div>
            <p className="mt-4 text-gray-400">Loading schedule...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Manage Schedule
          </h1>
          <p className="text-gray-400">
            Create and manage recurring weekly time blocks for each LinkedIn account.
          </p>
        </div>
        <button onClick={handleCreateBlock} className="btn-primary">
          + Add Time Block
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card">
          <div className="text-sm text-gray-400 mb-1">Total Blocks</div>
          <div className="text-3xl font-bold text-royal-400">{scheduleBlocks.length}</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-400 mb-1">Accounts Scheduled</div>
          <div className="text-3xl font-bold text-sky-400">
            {new Set(scheduleBlocks.map((b) => b.account_id)).size}
          </div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-400 mb-1">Recruiters Assigned</div>
          <div className="text-3xl font-bold text-navy-400">
            {new Set(scheduleBlocks.map((b) => b.recruiter_id)).size}
          </div>
        </div>
      </div>

      {/* Schedule Blocks by Day */}
      <div className="space-y-6">
        {groupedBlocks.map(({ day, blocks }) => (
          <div key={day} className="card">
            <h2 className="text-xl font-bold text-white mb-4">{day}</h2>

            {blocks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No blocks scheduled for {day}
              </div>
            ) : (
              <div className="space-y-3">
                {blocks.map((block) => (
                  <div
                    key={block.id}
                    className="flex items-center justify-between p-4 bg-dark-secondary rounded-lg border border-dark-border hover:border-royal-600 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-4 h-4 rounded ${getColorForAccount(
                          block.account_name
                        )}`}
                      ></div>
                      <div>
                        <div className="font-semibold text-white">
                          {block.account_name}
                        </div>
                        <div className="text-sm text-gray-400">
                          Assigned to: {block.recruiter_name}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <div className="text-white font-medium">
                          {formatTime(block.start_time)} -{' '}
                          {formatTime(block.end_time)}
                        </div>
                        <div className="text-sm text-gray-400">
                          Token Limit: {block.token_limit}
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditBlock(block)}
                          className="btn-secondary text-sm px-3 py-1"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteBlock(block.id)}
                          disabled={deleteLoading === block.id}
                          className="btn-danger text-sm px-3 py-1"
                        >
                          {deleteLoading === block.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <ScheduleBlockModal
          block={editingBlock}
          accounts={accounts}
          existingBlocks={scheduleBlocks}
          onClose={() => {
            setShowModal(false);
            setEditingBlock(null);
          }}
          onSuccess={() => {
            setShowModal(false);
            setEditingBlock(null);
            refetch();
          }}
        />
      )}
    </Layout>
  );
};
