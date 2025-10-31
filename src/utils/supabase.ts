import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sduufemakisrzuzrghdt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkdXVmZW1ha2lzcnp1enJnaGR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NTQxMzcsImV4cCI6MjA3NzQzMDEzN30.g0bbMJlx2i2QMAktT58O5l_RL_KOgTprgSpgUty50nw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
