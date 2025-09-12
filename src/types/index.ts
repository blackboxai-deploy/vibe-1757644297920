// Types for the Advanced Key Generator System

export interface KeyData {
  id: string;
  key: string;
  type: 'random' | 'custom';
  credits: number;
  duration: 7 | 14 | 30; // days
  expiryDate: Date;
  status: 'active' | 'paused' | 'expired';
  createdAt: Date;
  lastModified: Date;
}

export interface UserCredits {
  balance: number;
  totalUsed: number;
  totalPurchased: number;
  lastTopUp: Date | null;
}

export interface KeyGenerationRequest {
  type: 'random' | 'custom';
  duration: 7 | 14 | 30;
  customKey?: string;
}

export interface KeyGenerationResponse {
  success: boolean;
  key?: KeyData;
  message: string;
  creditsRemaining?: number;
}

export interface CreditTopUpRequest {
  amount: number;
}

export interface KeyStats {
  totalKeys: number;
  activeKeys: number;
  pausedKeys: number;
  expiredKeys: number;
  totalCreditsUsed: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
  error?: string;
}

// Credit plans configuration
export const CREDIT_PLANS = {
  7: 1,     // 7 days = 1 credit
  14: 2,    // 14 days = 2 credits
  30: 3.5   // 30 days = 3.5 credits
} as const;

// Key prefix constant
export const KEY_PREFIX = 'hg';

// Storage keys
export const STORAGE_KEYS = {
  USER_CREDITS: 'user_credits',
  GENERATED_KEYS: 'generated_keys',
  APP_SETTINGS: 'app_settings'
} as const;