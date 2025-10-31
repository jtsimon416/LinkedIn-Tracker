import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { useSchedule } from '../hooks/useSchedule';
import { useAccounts } from '../hooks/useAccounts';
import { useAuth } from '../hooks/useAuth';
import type { ScheduleBlock } from '../types';
import { DAYS_OF_WEEK, formatTime, isBlockActive } from '../utils/scheduleUtils';

export const Schedule: React.FC = () => {
  const { user } = useAuth();
  const { scheduleBlocks, loading } = useSchedule();
  const { accounts } = useAccounts();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const getBlocksForDay = (dayIndex: number): ScheduleBlock[] => {
    return scheduleBlocks.filter((block) => block.day_of_week === dayIndex);
  };

  const getColorForAccount = (accountName: string): string => {
    // Assign different blue shades to different accounts
    const colors: Record<string, string> = {
      'Tech Sourcing Account': 'bg-royal-600',
      'Sales Recruiting Account': 'bg-sky-600',
      'General Recruiting Account': 'bg-navy-600',
    };
    return colors[accountName] || 'bg-blue-600';
  };

  const isMyBlock = (block: ScheduleBlock): boolean => {
    return block.recruiter_id === user?.id;
  };

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

  const currentDay = currentTime.getDay();

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Weekly Schedule</h1>
        <p className="text-gray-400">
          View all scheduled time blocks for LinkedIn accounts. Your assigned blocks are highlighted.
        </p>
      </div>

      {/* Legend */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Legend</h2>
        <div className="flex flex-wrap gap-4">
          {accounts.map((account) => (
            <div key={account.id} className="flex items-center space-x-2">
              <div className={`w-4 h-4 rounded ${getColorForAccount(account.name)}`}></div>
              <span className="text-sm text-gray-300">{account.name}</span>
            </div>
          ))}
          <div className="flex items-center space-x-2 ml-4">
            <div className="w-4 h-4 rounded border-2 border-yellow-400"></div>
            <span className="text-sm text-gray-300">Your Assignments</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded bg-green-600/30 border border-green-500"></div>
            <span className="text-sm text-gray-300">Active Now</span>
          </div>
        </div>
      </div>

      {/* Weekly Calendar Grid */}
      <div className="card overflow-x-auto">
        <div className="grid grid-cols-7 gap-2 min-w-[900px]">
          {DAYS_OF_WEEK.map((day, dayIndex) => {
            const dayBlocks = getBlocksForDay(dayIndex);
            const isToday = dayIndex === currentDay;

            return (
              <div
                key={day}
                className={`border border-dark-border rounded-lg p-3 ${
                  isToday ? 'bg-royal-900/20 border-royal-600' : ''
                }`}
              >
                <div className="text-center mb-3">
                  <div
                    className={`font-semibold ${
                      isToday ? 'text-royal-400' : 'text-gray-300'
                    }`}
                  >
                    {day}
                  </div>
                  {isToday && (
                    <div className="text-xs text-royal-400 mt-1">Today</div>
                  )}
                </div>

                <div className="space-y-2">
                  {dayBlocks.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 text-xs">
                      No blocks scheduled
                    </div>
                  ) : (
                    dayBlocks.map((block) => {
                      const active = isBlockActive(block);
                      const myBlock = isMyBlock(block);

                      return (
                        <div
                          key={block.id}
                          className={`p-2 rounded-lg text-xs transition-all ${
                            getColorForAccount(block.account_name)
                          } ${myBlock ? 'ring-2 ring-yellow-400 ring-offset-1 ring-offset-dark-card' : ''} ${
                            active ? 'shadow-lg shadow-green-500/50 ring-2 ring-green-500' : ''
                          }`}
                        >
                          <div className="font-semibold text-white mb-1">
                            {block.account_name.replace(' Account', '')}
                          </div>
                          <div className="text-white/90 mb-1">
                            {formatTime(block.start_time)} - {formatTime(block.end_time)}
                          </div>
                          <div className="text-white/80 mb-1">
                            {block.recruiter_name}
                          </div>
                          <div className="text-white/70 text-[10px]">
                            Limit: {block.token_limit} tokens
                          </div>
                          {active && (
                            <div className="mt-1 bg-green-600/30 border border-green-500 rounded px-1 py-0.5 text-center">
                              <span className="text-green-300 font-semibold text-[10px]">
                                ACTIVE NOW
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Time Indicator */}
      <div className="mt-4 text-center text-sm text-gray-400">
        Current time: {currentTime.toLocaleTimeString()} ({DAYS_OF_WEEK[currentDay]})
      </div>

      {/* User's Upcoming Blocks */}
      {user && (
        <div className="mt-8 card">
          <h2 className="text-lg font-semibold text-white mb-4">
            Your Upcoming Schedule
          </h2>
          {scheduleBlocks.filter(isMyBlock).length === 0 ? (
            <p className="text-gray-400">
              You have no scheduled blocks. Contact your admin to get scheduled.
            </p>
          ) : (
            <div className="space-y-2">
              {scheduleBlocks
                .filter(isMyBlock)
                .map((block) => (
                  <div
                    key={block.id}
                    className="flex items-center justify-between p-3 bg-dark-secondary rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded ${getColorForAccount(block.account_name)}`}></div>
                      <div>
                        <div className="font-medium text-white">
                          {DAYS_OF_WEEK[block.day_of_week]}s
                        </div>
                        <div className="text-sm text-gray-400">
                          {block.account_name}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white">
                        {formatTime(block.start_time)} - {formatTime(block.end_time)}
                      </div>
                      <div className="text-xs text-gray-400">
                        Max {block.token_limit} tokens
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </Layout>
  );
};
