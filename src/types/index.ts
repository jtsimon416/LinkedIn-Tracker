export interface LinkedInAccount {
  id: string;
  name: string;
  remaining_tokens: number;
  next_refresh_date: string;
  replenish_amount: number;
  status: 'available' | 'in-use';
  current_user_name: string | null;
  current_user_id: string | null;
  linkedin_username: string;
  linkedin_password: string;
  created_at: string;
  updated_at: string;
}

export interface UsageLog {
  id: string;
  timestamp: string;
  recruiter_name: string;
  recruiter_id: string;
  account_name: string;
  account_id: string;
  action: 'check-in' | 'check-out';
  tokens_used: number | null;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  user_metadata: {
    full_name: string;
    is_admin?: boolean;
  };
}

export interface CheckOutFormData {
  tokensUsed: number;
  confirmedLogout: boolean;
}

export interface ScheduleBlock {
  id: string;
  account_id: string;
  account_name: string;
  recruiter_id: string;
  recruiter_name: string;
  day_of_week: number; // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  start_time: string; // Format: "HH:MM:SS"
  end_time: string; // Format: "HH:MM:SS"
  token_limit: number;
  created_at: string;
  updated_at: string;
}
