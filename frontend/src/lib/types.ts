export type UserRole = 'user' | 'operator' | 'accountant' | 'admin' | 'support';

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  balance: number;
  demo_balance: number;
  is_verified: boolean;
  verification_status: 'pending' | 'approved' | 'rejected' | 'not_submitted';
  created_at: string;
  pin?: string;
  pin_enabled?: boolean;
  phone?: string;
  country?: string;
  address?: string;
  kyc_documents?: KYCDocument[];
  two_factor_enabled?: boolean;
}

export interface KYCDocument {
  id: number;
  type: 'id_front' | 'id_back' | 'selfie' | 'proof_address';
  status: 'pending' | 'approved' | 'rejected';
  url?: string;
  uploaded_at: string;
  reviewed_at?: string;
  rejection_reason?: string;
}

export interface TradeHistory {
  id: number;
  symbol: string;
  direction: 'up' | 'down';
  amount: number;
  entry_price: number;
  exit_price: number;
  duration: number;
  status: 'won' | 'lost' | 'draw';
  profit: number;
  payout_rate: number;
  created_at: string;
  closed_at: string;
}

export interface Transaction {
  id: number;
  type: 'deposit' | 'withdrawal';
  method: string;
  amount: number;
  fee: number;
  status: 'pending' | 'processing' | 'completed' | 'rejected' | 'cancelled';
  address?: string;
  txid?: string;
  created_at: string;
  completed_at?: string;
  rejection_reason?: string;
}

export interface PriceData {
  symbol: string;
  price: number;
  bid?: number;
  ask?: number;
  high_24h: number;
  low_24h: number;
  change_24h: number;
  volume?: number;
  volume_24h?: number;
  timestamp: string;
}

export interface Trade {
  id: number;
  user_id: number;
  symbol: string;
  direction: 'up' | 'down';
  amount: number;
  entry_price: number;
  exit_price: number;
  duration?: number;
  status: 'pending' | 'active' | 'won' | 'lost' | 'canceled';
  payout: number;
  profit: number;
  created_at: string;
  expires_at: string;
  closed_at?: string;
}

export interface Tournament {
  id: number;
  name: string;
  description: string;
  entry_fee: number;
  starting_balance: number;
  prize_pool: number;
  max_participants: number;
  status: 'upcoming' | 'active' | 'finished';
  starts_at: string;
  ends_at: string;
}

export interface TournamentParticipant {
  id: number;
  tournament_id: number;
  user_id: number;
  balance: number;
  profit: number;
  trades_count: number;
  wins_count: number;
  rank: number;
}

export interface Market {
  id: string;
  name: string;
  icon?: string;
  pairs: string[];
}

export interface Notification {
  id: number;
  type: 'deposit' | 'withdrawal' | 'trade' | 'tournament' | 'system';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}
