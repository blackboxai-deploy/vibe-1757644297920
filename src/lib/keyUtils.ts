import { KeyData, KEY_PREFIX, CREDIT_PLANS } from '@/types';

/**
 * Generate a random string for key generation
 */
export function generateRandomString(length: number = 12): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate a random key with hg prefix
 */
export function generateRandomKey(): string {
  const randomPart = generateRandomString(16);
  return `${KEY_PREFIX}-${randomPart}`;
}

/**
 * Format custom key with hg prefix
 */
export function formatCustomKey(customKey: string): string {
  // Remove any existing prefix and clean the key
  let cleanKey = customKey.replace(/^hg-?/i, '').trim();
  
  // Replace spaces and special characters with hyphens
  cleanKey = cleanKey.replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-');
  
  // Remove leading/trailing hyphens
  cleanKey = cleanKey.replace(/^-+|-+$/g, '');
  
  return `${KEY_PREFIX}-${cleanKey}`;
}

/**
 * Validate custom key format
 */
export function validateCustomKey(customKey: string): { valid: boolean; message: string } {
  if (!customKey.trim()) {
    return { valid: false, message: 'Custom key cannot be empty' };
  }

  if (customKey.length < 3) {
    return { valid: false, message: 'Custom key must be at least 3 characters long' };
  }

  if (customKey.length > 50) {
    return { valid: false, message: 'Custom key must be less than 50 characters long' };
  }

  // Check for valid characters (letters, numbers, spaces, hyphens, underscores)
  const validPattern = /^[a-zA-Z0-9\s\-_]+$/;
  if (!validPattern.test(customKey)) {
    return { valid: false, message: 'Custom key can only contain letters, numbers, spaces, hyphens, and underscores' };
  }

  return { valid: true, message: 'Valid custom key' };
}

/**
 * Calculate expiry date based on duration
 */
export function calculateExpiryDate(duration: 7 | 14 | 30): Date {
  const now = new Date();
  const expiryDate = new Date(now);
  expiryDate.setDate(now.getDate() + duration);
  return expiryDate;
}

/**
 * Get credits required for duration
 */
export function getCreditsForDuration(duration: 7 | 14 | 30): number {
  return CREDIT_PLANS[duration];
}

/**
 * Check if key is expired
 */
export function isKeyExpired(key: KeyData): boolean {
  return new Date() > new Date(key.expiryDate);
}

/**
 * Get remaining days for a key
 */
export function getRemainingDays(expiryDate: Date): number {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Format key status for display
 */
export function getKeyStatusDisplay(key: KeyData): {
  status: string;
  color: string;
  remainingDays: number;
} {
  const remainingDays = getRemainingDays(key.expiryDate);
  
  if (key.status === 'paused') {
    return {
      status: 'Paused',
      color: 'text-yellow-600',
      remainingDays
    };
  }
  
  if (remainingDays <= 0 || key.status === 'expired') {
    return {
      status: 'Expired',
      color: 'text-red-600',
      remainingDays: 0
    };
  }
  
  return {
    status: 'Active',
    color: 'text-green-600',
    remainingDays
  };
}

/**
 * Generate unique key ID
 */
export function generateKeyId(): string {
  return `key_${Date.now()}_${generateRandomString(8)}`;
}

/**
 * Check if a key already exists
 */
export function checkKeyExists(keyValue: string, existingKeys: KeyData[]): boolean {
  return existingKeys.some(key => key.key.toLowerCase() === keyValue.toLowerCase());
}