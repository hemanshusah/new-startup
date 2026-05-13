export type StartupStage = 'idea' | 'mvp' | 'early-traction' | 'scaling' | 'mature';
export type RevenueStatus = 'pre-revenue' | 'revenue-generating' | 'profitable';
export type FundingStatus = 'bootstrapped' | 'angel-funded' | 'seed-funded' | 'series-a' | 'series-b+';
export type UserRole = 'user' | 'admin';

export type AccountIntent = 'founder' | 'mentor' | 'explorer';

export interface Profile {
  account_intent: AccountIntent | null;
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  phone: string | null;
  startup_name: string | null;
  startup_website: string | null;
  startup_email: string | null;
  startup_sectors: string[] | null;
  startup_stage: StartupStage | null;
  startup_state: string | null;
  startup_city: string | null;
  startup_description: string | null;
  founding_date: string | null;
  team_size: number | null;
  revenue_status: RevenueStatus | null;
  funding_status: FundingStatus | null;
  created_at: string;
}
