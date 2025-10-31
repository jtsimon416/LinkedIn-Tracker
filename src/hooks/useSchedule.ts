import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../utils/supabase';
import type { ScheduleBlock } from '../types';

export const useSchedule = () => {
  const [scheduleBlocks, setScheduleBlocks] = useState<ScheduleBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchScheduleBlocks = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('schedule_blocks')
        .select('*')
        .order('day_of_week')
        .order('start_time');

      if (error) throw error;
      setScheduleBlocks(data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScheduleBlocks();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('schedule_blocks_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'schedule_blocks',
        },
        (payload) => {
          console.log('Schedule real-time change detected:', payload);
          fetchScheduleBlocks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchScheduleBlocks]);

  return { scheduleBlocks, loading, error, refetch: fetchScheduleBlocks };
};
