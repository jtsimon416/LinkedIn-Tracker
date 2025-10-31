import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../utils/supabase';
import type { LinkedInAccount } from '../types';

export const useAccounts = () => {
  const [accounts, setAccounts] = useState<LinkedInAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use useCallback to prevent recreating this function on every render
  const fetchAccounts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('linkedin_accounts')
        .select('*')
        .order('name');

      if (error) throw error;
      setAccounts(data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('linkedin_accounts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'linkedin_accounts',
        },
        (payload) => {
          console.log('Real-time change detected:', payload);
          // Immediately refetch to get the latest data
          fetchAccounts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAccounts]);

  return { accounts, loading, error, refetch: fetchAccounts };
};
